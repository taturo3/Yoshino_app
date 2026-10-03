/* =========================================================
   screens/sheet.js — 下から出るシート（共通）と、木の詳細シート
   ========================================================= */

/** シートを開く。html はシートの中身 */
function openOverlay(html, label) {
  const ov = $('#overlay');
  ov.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="${label}">${html}</div>`;
  ov.hidden = false;
  ov.onclick = e => {
    if (e.target === ov) closeSheet();
  };
  const close = ov.querySelector('.close');
  if (close) {
    close.onclick = closeSheet;
    close.focus();
  }
  return ov;
}

function closeSheet() {
  $('#overlay').hidden = true;
  $('#overlay').innerHTML = '';
}

/** 今のタブの画面を描き直す（シートで状態が変わったとき用） */
function refreshScreen() {
  if (currentTab === 'oshi') showOshi();
  else if (currentTab === 'mat') showMaterials();
  else if (currentTab === 'swipe') showSwipe();
}

/* ---------- 木の詳細 ---------- */

function openSheet(t) {
  const matched = S.matches.includes(t.id);
  const isTop = queue()[0]?.id === t.id; // いまスワイプ中のカードか
  const feelings = S.feelings[t.id] || [];
  const sp = SPECIES[t.species].name;
  const mats = materialsFor(t, 2, t.species);

  // 推した木だけに出る「つながり」と「次にしたいこと」
  const matchedHTML = matched ? `
    <div class="sec">
      <h3>${t.name}から、つながる</h3>
      <ol class="chain">
        <li><small>推し木</small><b>${sp}「${t.name}」</b></li>
        <li><small>同じ特徴の材</small><b>${t.material}</b>
          <div class="items">${mats.map(m => `<button class="chip link" data-mat="${m.id}">${m.name} ›</button>`).join('')}</div></li>
        <li><small>この材でできた商品</small><div class="items">${t.products.map(p => `<span class="chip">${p}</span>`).join('')}</div></li>
        <li><small>つくる人</small><b>${t.maker}</b></li>
        <li><small>体験する</small><b>${t.exp}</b></li>
      </ol>
    </div>
    <div class="sec">
      <h3>${t.name}と、次にしたいことは？</h3>
      <div class="feel">${FEELINGS.map(x => `<button aria-pressed="${feelings.includes(x)}" data-f="${x}">${x}</button>`).join('')}</div>
      <div class="sheet-actions">
        <button class="btn soft" id="saveFeel">気持ちを残す</button>
        <button class="btn primary" id="ask">${ICON.chat} 相談する</button>
      </div>
      <button class="btn link" id="unmatch">推し木から外す</button>
    </div>` : `
    <div class="sec">
      <h3>この木から、つくれるもの</h3>
      <div class="items">${t.products.map(p => `<span class="chip">${p}</span>`).join('')}</div>
      <p class="hint">推し木にすると、材・つくり手・体験までたどれます。</p>
    </div>`;

  // スワイプ中のカードなら、シートから推す／また今度を選べる
  const actionsHTML = !matched && isTop ? `
    <div class="sheet-actions">
      <button class="btn soft" id="shNope">また今度</button>
      <button class="btn primary" id="shLike">${ICON.heart} 推す</button>
    </div>` : '';

  const ov = openOverlay(`
    <div class="sheet-art" style="background:${t.tint}">
      ${treeArt(t)}
      <button class="close" aria-label="閉じる">${ICON.x}</button>
      <span class="badge">相性 <b>${score(t)}%</b></span>
    </div>
    <div class="sheet-body">
      <div class="name-row">
        <span class="kind ${t.species}">${sp}</span><h2 id="shName">${t.name}</h2><span class="age">樹齢${t.age}年・${t.place}育ち</span>
      </div>
      <p class="feature">${t.feature}</p>
      <dl class="specs">
        <div><dt>年輪</dt><dd>${txt.rings(t.rings)}</dd></div>
        <div><dt>節</dt><dd>${txt.knots(t.knots)}</dd></div>
        <div><dt>色</dt><dd>${txt.color(t.color)}</dd></div>
        <div><dt>木目</dt><dd>${txt.grain(t.grain)}</dd></div>
        <div><dt>香り</dt><dd>${txt.scent(t.scent)}</dd></div>
        <div><dt>価格帯</dt><dd class="stars">${stars(t.price)}</dd></div>
      </dl>
      <div class="sec"><h3>相性がいい理由</h3><ul class="reasons">${reasons(t).map(r => `<li>${r}</li>`).join('')}</ul></div>
      <div class="sec"><h3>この木のおはなし</h3><p class="bio">${t.bio}</p></div>
      ${matchedHTML}
      ${actionsHTML}
    </div>`, 'shName');

  // 「次にしたいこと」のトグル
  ov.querySelectorAll('[data-f]').forEach(b => {
    b.onclick = () => b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true');
  });

  ov.querySelectorAll('[data-mat]').forEach(b => {
    b.onclick = () => openMaterialSheet(MATERIALS.find(m => m.id === b.dataset.mat));
  });

  const saveFeel = $('#saveFeel');
  if (saveFeel) {
    saveFeel.onclick = () => {
      S.feelings[t.id] = [...ov.querySelectorAll('[data-f][aria-pressed="true"]')].map(b => b.dataset.f);
      save();
      toast(S.feelings[t.id].length ? '気持ちを残しました' : '選ぶと、あとで見返せます');
      if (currentTab === 'oshi') showOshi();
    };
  }

  const ask = $('#ask');
  if (ask) ask.onclick = () => openInquiry(`${sp}「${t.name}」`, t.maker);

  const unmatch = $('#unmatch');
  if (unmatch) {
    unmatch.onclick = () => {
      S.matches = S.matches.filter(x => x !== t.id);
      S.passed.push(t.id);
      if (S.last?.id === t.id) S.last = null;
      save();
      updateCount();
      closeSheet();
      refreshScreen();
      toast(`${t.name}を推し木から外しました`);
    };
  }

  const like = $('#shLike');
  const nope = $('#shNope');
  if (like) like.onclick = () => { closeSheet(); decide(t, true); };
  if (nope) nope.onclick = () => { closeSheet(); decide(t, false); };
}
