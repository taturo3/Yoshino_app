/* =========================================================
   state.js — アプリの状態と保存（localStorage）
   ========================================================= */

const KEY = 'oshigi-sample-v1';

/**
 * S: アプリ全体の状態
 *   entry    … どこから探すか（'tree' | 'use' | 'product'）
 *   answers  … 診断の回答 { rings: 0|.5|1, ..., use: 'furniture' など }
 *   matches  … 推した木の id 一覧
 *   passed   … パスした木の id 一覧
 *   feelings … 木ごとの「次にしたいこと」 { [treeId]: string[] }
 */
let S = { entry: null, answers: {}, matches: [], passed: [], feelings: {} };

try {
  const raw = localStorage.getItem(KEY);
  if (raw) S = Object.assign(S, JSON.parse(raw));
} catch (e) {}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(S));
  } catch (e) {}
}

/** スワイプのアニメーション中は操作を受け付けない */
let busy = false;
