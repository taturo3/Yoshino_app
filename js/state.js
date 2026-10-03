/* =========================================================
   state.js — アプリの状態と保存（localStorage）
   ========================================================= */

const KEY = 'oshigi-sample-v1';

/**
 * S: アプリ全体の状態
 *   entry     … どこから探すか（'tree' | 'use' | 'product'）
 *   answers   … 診断の回答 { rings: 0〜1（5段階: 0, .25, .5, .75, 1）, ..., use: 'furniture' など }
 *   matches   … 推した木の id 一覧
 *   passed    … パスした木の id 一覧
 *   feelings  … 木ごとの「次にしたいこと」 { [treeId]: string[] }
 *   last      … 直前のスワイプ { id, liked }（「もどす」に使う）
 *   inquiries … 送った相談（モック） { subject, kind, at }[]
 */
const INITIAL = () => ({ entry: null, answers: {}, matches: [], passed: [], feelings: {}, last: null, inquiries: [] });

let S = INITIAL();

try {
  const raw = localStorage.getItem(KEY);
  if (raw) S = Object.assign(S, JSON.parse(raw));
} catch (e) {}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(S));
  } catch (e) {}
}

/** すべてのデータを消して最初の状態に戻す */
function resetAll() {
  S = INITIAL();
  save();
}

/** スワイプのアニメーション中は操作を受け付けない */
let busy = false;
