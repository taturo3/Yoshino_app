/* =========================================================
   main.js — タブ・全体のキー操作・ステータスバー・起動
   ========================================================= */

/* ---------- タブ ---------- */

/** いま選ばれているタブ（'swipe' | 'oshi' | 'mat' | 'me' | null） */
let currentTab = null;

/** cur: タブ名。null ならタブバーを隠す */
function setTabs(cur) {
  currentTab = cur;
  const tabs = $('#tabs');
  tabs.hidden = !cur;
  tabs.querySelectorAll('.tab').forEach(b => {
    if (b.dataset.tab === cur) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
  updateCount();
  main.scrollTop = 0;
}

/** 「推し木」タブの数字バッジ */
function updateCount() {
  const c = $('#oshiCount');
  c.hidden = !S.matches.length;
  c.textContent = S.matches.length;
}

const TAB_SCREENS = {
  swipe: showSwipe,
  oshi: showOshi,
  mat: showMaterials,
  me: () => showProfile(false),
};

$('#tabs').querySelectorAll('.tab').forEach(b => {
  b.onclick = () => TAB_SCREENS[b.dataset.tab]();
});

/* ---------- Esc でマッチ演出／シートを閉じる ---------- */
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (!$('#match').hidden) $('#match').hidden = true;
  else if (!$('#overlay').hidden) closeSheet();
});

/* ---------- ステータスバーの時計（PC のスマホ枠表示用） ---------- */
function tick() {
  const d = new Date();
  $('#clock').textContent = d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
}
tick();
setInterval(tick, 30000);

/* ---------- 起動 ---------- */
showStart();
