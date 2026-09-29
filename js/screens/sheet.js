/* =========================================================
   screens/sheet.js — 木の詳細シート
   ========================================================= */

function openSheet(t) {
  const ov = $('#overlay');
  const matched = S.matches.includes(t.id);
  const isTop = queue()[0]?.id === t.id; // いまスワイプ中のカードか
  const feelings = S.feelings[t.id] || [];

  // 推した木だけに出る「つながり」と「次にしたいこと」
  const matchedHTML = matched ? `
    <div class="sec">
      <h3>${t.name}から、つながる</h3>
      <ol class="chain">
        <li><small>推し木</small><b>吉野杉「${t.name}」</b></li>
        <li><small>同じ特徴の材</small><b>${t.material}</b></li>
        <li><small>この材でできた商品</small><div class="items">${t.products.map(p => `<span class="chip">${p}</span>`).join('')}</div></li>
        <li><small>つくる人</small><b>${t.maker}</b></li>
        <li><small>体験する</small><b>${t.exp}</b></li>
      </ol>
    </div>
    <div class="sec">
      <h3>${t.name}と、次にしたいことは？</h3>
      <div class="feel">${FEELINGS.map(x => `<button aria-pressed="${feelings.includes(x)}" data-f="${x}">${x}</button>`).join('')}</div>
      <div style="margin-top:14px"><button class="btn primary" id="saveFeel">この気持ちを残す</button></div>
    </div>` : '';

  // スワイプ中のカードなら、シートから推す／また今度を選べる
  const actionsHTML = !matched && isTop ? `
    <div class="sheet-actions">
      <button class="btn soft" id="shNope">また今度</button>
      <button class="btn primary" id="shLike">${ICON.heart} 推す</button>
    </div>` : '';

  ov.innerHTML = `
    <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="shName">
      <div class="sheet-art" style="background:${t.tint}">
        ${stumpSVG(t)}
        <button class="close" id="shClose" aria-label="閉じる">${ICON.x}</button>
        <span class="badge">相性 <b>${score(t)}%</b></span>
      </div>
      <div class="sheet-body">
        <div class="name-row">
          <span class="kind">吉野杉</span><h2 id="shName">${t.name}</h2><span class="age">樹齢${t.age}年・${t.place}育ち</span>
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
      </div>
    </div>`;

  ov.hidden = false;
  $('#shClose').onclick = closeSheet;
  $('#shClose').focus();

  // 背景をタップしたら閉じる
  ov.onclick = e => {
    if (e.target === ov) closeSheet();
  };

  // 「次にしたいこと」のトグル
  ov.querySelectorAll('[data-f]').forEach(b => {
    b.onclick = () => b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true');
  });

  const saveFeel = $('#saveFeel');
  if (saveFeel) {
    saveFeel.onclick = () => {
      S.feelings[t.id] = [...ov.querySelectorAll('[data-f][aria-pressed="true"]')].map(b => b.dataset.f);
      save();
      toast(S.feelings[t.id].length ? '気持ちを残しました' : '選ぶと、あとで見返せます');
    };
  }

  const like = $('#shLike');
  const nope = $('#shNope');
  if (like) like.onclick = () => { closeSheet(); decide(t, true); };
  if (nope) nope.onclick = () => { closeSheet(); decide(t, false); };
}

function closeSheet() {
  $('#overlay').hidden = true;
  $('#overlay').innerHTML = '';
}
