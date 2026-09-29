/* =========================================================
   utils.js — 汎用の小さな関数とアイコン
   ========================================================= */

const $ = s => document.querySelector(s);
const main = $('#main');

/** 文字列から数値のハッシュをつくる（SVG の乱数シードに使う） */
function hash(s) {
  let h = 7;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

/** シード付きの疑似乱数（同じ木なら毎回同じ模様になる） */
function rng(seed) {
  let s = seed % 2147483647 || 1;
  return () => (s = s * 16807 % 2147483647) / 2147483647;
}

/** 2つの色 #RRGGBB を t（0〜1）の割合で混ぜる */
function mix(a, b, t) {
  const parse = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  const A = parse(a);
  const B = parse(b);
  return '#' + A.map((v, i) =>
    Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')
  ).join('');
}

const clamp = v => Math.max(0, Math.min(1, v));

/** 画面下に短いメッセージを出す */
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('show'), 1800);
}

/** 価格帯の星（n 個が塗り、残りは薄色） */
const stars = n => '★'.repeat(n) + '<span>' + '★'.repeat(5 - n) + '</span>';

const ICON = {
  heart: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.3 3 4.5 6.6 4.5c2.1 0 3.6 1.2 5.4 3.3 1.8-2.1 3.3-3.3 5.4-3.3 3.6 0 5.7 3.8 4.2 7.3C19.5 16.4 12 21 12 21z"/></svg>',
  x:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  info:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M12 11v6"/><circle cx="12" cy="7" r=".8" fill="currentColor"/></svg>',
  back:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
};
