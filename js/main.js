/* =========================================================
   main.js — タブ・全体のキー操作・起動
   ========================================================= */

/* ---------- タブ ---------- */

/** cur: 'swipe' | 'oshi' | 'me'。null ならタブバーを隠す */
function setTabs(cur) {
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

/* ---------- 起動 ---------- */
showStart();
