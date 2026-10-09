/* =========================================================
   screens/stamps.js — デジタルスタンプラリー
     現地に掲示されたパスワードを入れると、そのスポットのスタンプが押せる
   ========================================================= */

/** 直前に押したスタンプ（台紙でポンと押すアニメーションに使う） */
let justStamped = null;

/** パスワードを比べやすい形にそろえる（全角→半角、カタカナ→ひらがな、空白と大文字小文字を無視） */
function normalizePass(s) {
  return String(s)
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\s/g, '')
    .replace(/[ァ-ヶ]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

/** 日付を「10.09」の形に */
const shortDate = at => {
  const d = new Date(at);
  return `${d.getMonth() + 1}.${String(d.getDate()).padStart(2, '0')}`;
};

/** はんこ風のスタンプ */
function stampMarkSVG(spot, at) {
  const tilt = (hash(spot.id) % 25) - 12;
  const size = spot.mark.length === 1 ? 34 : spot.mark.length === 2 ? 27 : 20;
  const ink = '#D24B5A';
  return `<svg viewBox="0 0 100 100" role="img" aria-label="${spot.name}のスタンプ">
    <g transform="rotate(${tilt} 50 50)" fill="${ink}" stroke="${ink}" opacity=".9">
      <circle cx="50" cy="50" r="44" fill="none" stroke-width="4"/>
      <circle cx="50" cy="50" r="37" fill="none" stroke-width="1.5"/>
      <text x="50" y="30" text-anchor="middle" font-size="10" stroke="none" font-weight="700">推し木</text>
      <text x="50" y="${53 + size * .35}" text-anchor="middle" font-size="${size}" stroke="none" font-family="Mochiy Pop One, Zen Maru Gothic, sans-serif">${spot.mark}</text>
      <text x="50" y="79" text-anchor="middle" font-size="10" stroke="none" font-weight="700">${shortDate(at)}</text>
    </g>
  </svg>`;
}

function showStamps() {
  setTabs('stamp');
  $('#topMeta').textContent = 'スタンプラリー';

  const got = SPOTS.filter(s => S.stamps[s.id]).length;
  const complete = got === SPOTS.length;

  // 台紙（スタンプを押す枠）
  const slotsHTML = SPOTS.map((s, i) => {
    const at = S.stamps[s.id];
    return `
      <button class="sr-slot ${at ? 'got' : ''} ${s.id === justStamped ? 'new' : ''}" data-spot="${s.id}"
              aria-label="${s.name}${at ? '（スタンプ済み）' : '（まだ）'}">
        ${at ? stampMarkSVG(s, at) : `<span class="sr-empty"><span aria-hidden="true">${s.emoji}</span><small>${i + 1}</small></span>`}
      </button>`;
  }).join('');

  // スポット一覧
  const spotsHTML = SPOTS.map(s => {
    const at = S.stamps[s.id];
    return `
      <button class="sr-spot" data-spot="${s.id}">
        <span class="sr-ic" aria-hidden="true">${s.emoji}</span>
        <span class="sr-txt"><b>${s.name}</b><small>${s.kind}・${s.place}</small></span>
        ${at
          ? `<span class="sr-done">${ICON.check}${shortDate(at)}</span>`
          : `<span class="sr-go">パスワード${ICON.arrow}</span>`}
      </button>`;
  }).join('');

  paint(`
    <section class="pad">
      <h2 class="list-title">スタンプラリー</h2>
      <p class="list-sub">吉野の木の現場をめぐって、スタンプを集めよう。現地に掲示されたパスワードを入れると押せます。</p>
      <div class="sr-card">
        <div class="sr-head">
          <b>スタンプ帳</b>
          <span><b class="sr-num">${got}</b> / ${SPOTS.length}</span>
        </div>
        <div class="sr-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${SPOTS.length}" aria-valuenow="${got}">
          <i style="width:${got / SPOTS.length * 100}%"></i>
        </div>
        <div class="sr-slots">${slotsHTML}</div>
        ${complete ? '<p class="sr-complete">🎉 コンプリート！ 吉野の木の現場をぜんぶめぐりました</p>' : ''}
      </div>
      <h3 class="sr-h">スポット</h3>
      <div class="sr-spots">${spotsHTML}</div>
      <p class="fine">スポットとパスワードはサンプルです。</p>
    </section>`, 'stamp');

  justStamped = null;

  main.querySelectorAll('[data-spot]').forEach(b => {
    b.onclick = () => openSpotSheet(SPOTS.find(s => s.id === b.dataset.spot));
  });
}

/** スポットの詳細と、パスワード入力 */
function openSpotSheet(spot) {
  const at = S.stamps[spot.id];

  const formHTML = at ? `
    <div class="sr-got">
      <div class="sr-big">${stampMarkSVG(spot, at)}</div>
      <p>${new Date(at).toLocaleDateString('ja-JP')} にスタンプを押しました</p>
    </div>` : `
    <form id="srForm" class="sr-form" novalidate>
      <label class="field">
        <span>パスワード</span>
        <input name="pass" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="現地の掲示を見て入力">
      </label>
      <p class="form-err" id="srErr" role="alert"></p>
      <button class="btn primary" type="submit">スタンプを押す</button>
    </form>`;

  const ov = openOverlay(`
    <div class="sheet-body form-body">
      <button class="close" aria-label="閉じる">${ICON.x}</button>
      <div class="sr-spot-head">
        <span class="sr-ic big" aria-hidden="true">${spot.emoji}</span>
        <div>
          <p class="form-kick">${spot.kind}・${spot.place}</p>
          <h2 class="form-title" id="srTitle">${spot.name}</h2>
        </div>
      </div>
      <p class="bio">${spot.desc}</p>
      <div class="sec">${formHTML}</div>
    </div>`, 'srTitle');

  const form = ov.querySelector('#srForm');
  if (!form) return;

  const input = form.querySelector('input');
  input.focus({ preventScroll: true }); // スクロールさせると .app ごと画面がずれる

  form.onsubmit = e => {
    e.preventDefault();
    const err = ov.querySelector('#srErr');
    if (!input.value.trim()) {
      err.textContent = 'パスワードを入れてください';
      return;
    }
    if (normalizePass(input.value) !== normalizePass(spot.pass)) {
      err.textContent = 'パスワードがちがうみたい。現地の掲示をもう一度見てね';
      input.classList.remove('shake');
      void input.offsetWidth; // アニメーションをやり直すため
      input.classList.add('shake');
      return;
    }

    // 正解：スタンプを押す
    S.stamps[spot.id] = Date.now();
    save();
    showStamps(); // 後ろの台紙も更新しておく
    justStamped = spot.id;
    const got = SPOTS.filter(s => S.stamps[s.id]).length;
    const complete = got === SPOTS.length;

    ov.querySelector('.form-body').innerHTML = `
      <button class="close" aria-label="閉じる">${ICON.x}</button>
      <div class="done sr-pressed">
        <div class="sr-big new">${stampMarkSVG(spot, S.stamps[spot.id])}</div>
        <h2 id="srTitle">${complete ? 'コンプリート！' : 'スタンプゲット！'}</h2>
        <p>${spot.name}のスタンプを押しました。<br>${complete ? 'すべてのスポットをめぐりました🎉' : `あと ${SPOTS.length - got} か所でコンプリート`}</p>
        <button class="btn soft" id="srDone">スタンプ帳を見る</button>
      </div>`;
    const close = () => { closeSheet(); showStamps(); };
    ov.querySelector('.close').onclick = close;
    ov.querySelector('#srDone').onclick = close;
    ov.querySelector('#srDone').focus();
    ov.onclick = e => { if (e.target === ov) close(); };
  };
}
