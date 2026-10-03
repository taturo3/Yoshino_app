/* =========================================================
   screens/swipe.js — スワイプで木をさがす画面
   ========================================================= */

/** 木のイラスト（背景の山並み + 切り株キャラ） */
function treeArt(t, opts) {
  return `<div class="scene">${sceneSVG(t.tint, t.id)}</div><div class="char">${stumpSVG(t, opts)}</div>`;
}

/** 木のカード（cls: 'front' = いちばん上 / 'next' = その下） */
function cardHTML(t, cls) {
  const sp = SPECIES[t.species].name;
  const a11y = cls === 'front'
    ? `tabindex="0" aria-label="${sp} ${t.name}、相性${score(t)}%。右で推す、左でまた今度、Enterでくわしく"`
    : 'aria-hidden="true"';

  return `
    <article class="card ${cls}" data-id="${t.id}" ${a11y}>
      <div class="card-art" style="background:${t.tint}">
        ${treeArt(t)}
        <span class="badge">相性 <b>${score(t)}%</b></span>
        <span class="place">${t.place}育ち</span>
        <span class="stamp like">推し！</span>
        <span class="stamp nope">また今度</span>
      </div>
      <div class="card-body">
        <div class="name-row">
          <span class="kind ${t.species}">${sp}</span><h2>${t.name}</h2><span class="age">樹齢${t.age}年</span>
        </div>
        <p class="feature">${t.feature}</p>
        <dl class="specs">
          <div><dt>年輪</dt><dd>${txt.rings(t.rings)}</dd></div>
          <div><dt>節</dt><dd>${txt.knots(t.knots)}</dd></div>
          <div><dt>色</dt><dd>${txt.color(t.color)}</dd></div>
        </dl>
        <div class="card-foot">
          <span class="uses">${t.uses.map(u => `<span class="chip">${USES[u]}</span>`).join('')}</span>
          <span class="stars" aria-label="価格帯${t.price}">${stars(t.price)}</span>
        </div>
      </div>
    </article>`;
}

function showSwipe() {
  setTabs('swipe');
  $('#topMeta').textContent = typeName();
  const q = queue();

  // 全部の木に会い終わったとき
  if (!q.length) {
    paint(`
      <section class="empty">
        ${stumpSVG({ id: 'end', rings: .7, knots: .3, color: .5, grain: .4 }, { mood: 'wink' })}
        <h2>吉野の木、ぜんぶに会いました</h2>
        <p>気になった木は「推し木」にいます。<br>パスした木にも、もう一度会えます。</p>
        <div class="stack-btns" style="width:100%;max-width:300px">
          ${S.matches.length ? '<button class="btn primary" id="toOshi">推し木を見る</button>' : ''}
          <button class="btn soft" id="again">パスした木にもう一度会う</button>
          <button class="btn link" id="toMat">材木をさがす</button>
        </div>
      </section>`, 'swipe-empty');

    const toOshi = $('#toOshi');
    if (toOshi) toOshi.onclick = () => showOshi();
    $('#toMat').onclick = () => showMaterials();
    $('#again').onclick = () => {
      S.passed = [];
      S.last = null;
      save();
      showSwipe();
    };
    return;
  }

  const seen = TREES.length - q.length;
  paint(`
    <section class="swipe">
      <div class="swipe-head">
        <p class="swipe-tip">右にスワイプで推す、左でまた今度</p>
        <span class="left-count">のこり <b>${q.length}</b> / ${TREES.length}本</span>
      </div>
      <div class="dots" aria-hidden="true">${TREES.map((_, i) => `<i class="${i < seen ? 'seen' : i === seen ? 'now' : ''}"></i>`).join('')}</div>
      <div class="deck">${q[1] ? cardHTML(q[1], 'next') : ''}${cardHTML(q[0], 'front')}</div>
      <div class="actions">
        <button class="act undo" id="bUndo" aria-label="ひとつもどす" ${S.last ? '' : 'disabled'}>${ICON.undo}</button>
        <button class="act nope" id="bNope" aria-label="また今度">${ICON.x}</button>
        <button class="act like" id="bLike" aria-label="推す">${ICON.heart}</button>
        <button class="act info" id="bInfo" aria-label="くわしく見る">${ICON.info}</button>
      </div>
      <div class="act-lbl" aria-hidden="true"><span>もどす</span><span>また今度</span><span>推す</span><span>くわしく</span></div>
    </section>`, 'swipe');

  const t = q[0];
  const card = main.querySelector('.card.front');
  bindDrag(card, t);

  $('#bUndo').onclick = undo;
  $('#bNope').onclick = () => decide(t, false);
  $('#bLike').onclick = () => decide(t, true);
  $('#bInfo').onclick = () => openSheet(t);
}

/** カードのドラッグ・タップ・キーボード操作 */
function bindDrag(card, t) {
  const like = card.querySelector('.stamp.like');
  const nope = card.querySelector('.stamp.nope');
  let sx = 0, sy = 0, dx = 0, dy = 0;
  let down = false, moved = false;

  card.addEventListener('pointerdown', e => {
    if (busy) return;
    down = true;
    moved = false;
    dx = dy = 0;
    sx = e.clientX;
    sy = e.clientY;
    card.setPointerCapture(e.pointerId);
    card.style.transition = 'none';
    card.style.animation = 'none';
  });

  card.addEventListener('pointermove', e => {
    if (!down) return;
    dx = e.clientX - sx;
    dy = e.clientY - sy;
    if (Math.abs(dx) + Math.abs(dy) > 6) moved = true;
    card.style.transform = `translate(${dx}px,${dy * .25}px) rotate(${dx / 18}deg)`;
    like.style.opacity = clamp(dx / 90);
    nope.style.opacity = clamp(-dx / 90);
  });

  const end = (e, cancel) => {
    if (!down) return;
    down = false;
    card.style.transition = '';
    if (dx > 100) {
      decide(t, true);
    } else if (dx < -100) {
      decide(t, false);
    } else {
      // しきい値に届かなければ元に戻す。動かさずに離したらタップ扱い
      card.style.transform = '';
      like.style.opacity = nope.style.opacity = 0;
      if (!moved && !cancel) openSheet(t);
    }
  };

  card.addEventListener('pointerup', e => end(e, false));
  card.addEventListener('pointercancel', e => end(e, true));

  card.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') decide(t, true);
    else if (e.key === 'ArrowLeft') decide(t, false);
    else if (e.key === 'Enter') openSheet(t);
  });
}

/** 推す（liked = true）/ また今度（false）を決めてカードを飛ばす */
function decide(t, liked) {
  if (busy) return;
  busy = true;

  const card = main.querySelector('.card.front');
  if (card) {
    const stamp = card.querySelector(liked ? '.stamp.like' : '.stamp.nope');
    if (stamp) stamp.style.opacity = 1;
    card.style.animation = 'none';
    card.style.transition = 'transform .38s ease-in, opacity .38s';
    card.style.transform = `translate(${liked ? 520 : -520}px,40px) rotate(${liked ? 24 : -24}deg)`;
    card.style.opacity = '0';
  }

  setTimeout(() => {
    if (liked) {
      if (!S.matches.includes(t.id)) S.matches.push(t.id);
    } else {
      S.passed.push(t.id);
    }
    S.last = { id: t.id, liked };
    frontId = null;
    save();
    busy = false;
    updateCount();
    if (!$('#overlay').hidden) closeSheet();
    showSwipe();
    if (liked) showMatch(t);
  }, 300);
}

/** 直前のスワイプを取り消す */
function undo() {
  if (!S.last || busy) return;
  const { id, liked } = S.last;
  if (liked) S.matches = S.matches.filter(x => x !== id);
  else S.passed = S.passed.filter(x => x !== id);
  S.last = null;
  frontId = id;
  save();
  updateCount();
  showSwipe();
  toast(`${TREES.find(t => t.id === id).name}にもう一度会えます`);
}
