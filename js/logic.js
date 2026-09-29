/* =========================================================
   logic.js — 診断の質問・相性スコア・表示用テキスト
   ========================================================= */

/* ---------- 診断の質問 ---------- */

/** 選択肢のイラストで、比べる項目以外をそろえるための値 */
const neutral = { knots: 0, color: .4, grain: .1 };

/** 入口（S.entry）に合わせて並び替えた質問リストを返す */
function questions() {
  const product = S.entry === 'product';

  const Q = {
    rings: {
      hint: '年輪', title: 'どっちの切り株に<br>キュンとする？',
      opts: [
        { v: 1, label: 'ぎゅっと細かい', art: () => stumpSVG({ id: 'qa', rings: 1, ...neutral }, { face: false, sprout: false }) },
        { v: 0, label: 'のびのび広め',   art: () => stumpSVG({ id: 'qa', rings: 0, ...neutral }, { face: false, sprout: false }) },
      ],
    },
    knots: {
      hint: '節（ふし）', title: '節は、ある方が好き？',
      opts: [
        { v: 0, label: 'すっきり節なし', art: () => plankSVG({ knots: 0, color: .3, grain: 0 }) },
        { v: 1, label: '節も味わい',     art: () => plankSVG({ knots: 1, color: .3, grain: 0 }) },
      ],
    },
    color: {
      hint: '色', title: '好きな色あいは？',
      opts: [
        { v: 0, label: '白っぽく明るい', art: () => plankSVG({ color: 0, grain: 0 }) },
        { v: 1, label: '赤みで落ちつく', art: () => plankSVG({ color: 1, grain: 0 }) },
      ],
    },
    grain: {
      hint: '木目', title: '木目はどっち派？',
      opts: [
        { v: 0, label: 'まっすぐ整列', art: () => plankSVG({ grain: 0, color: .35 }) },
        { v: 1, label: 'ゆらゆら山形', art: () => plankSVG({ grain: 1, color: .35 }) },
      ],
    },
    scent: {
      hint: '香り', title: '木の香りは？',
      opts: [
        { v: 1, label: '深呼吸したいくらい', emo: '🌲' },
        { v: 0, label: 'ほのかでいい',       emo: '🍃' },
      ],
    },
    use: {
      hint: product ? '欲しいもの' : '使いみち',
      title: product ? 'いま、欲しいものは？' : '木を使うなら、どこに？',
      four: true,
      opts: [
        { v: 'furniture', label: product ? 'テーブルや椅子' : '家具',     emo: '🪑' },
        { v: 'house',     label: product ? '床や壁の内装'   : '家・内装', emo: '🏠' },
        { v: 'small',     label: product ? '小物・ギフト'   : '小物',     emo: '🎁' },
        { v: 'shop',      label: product ? 'お店の什器'     : 'お店',     emo: '🏪' },
      ],
    },
    story: {
      hint: '物語', title: '木を選ぶとき、<br>大事なのは？',
      opts: [
        { v: 1, label: '育った場所や物語', emo: '📜' },
        { v: 0, label: '見た目と使い心地', emo: '✨' },
      ],
    },
  };

  let order = ['rings', 'knots', 'color', 'grain', 'scent', 'use', 'story'];
  if (S.entry === 'use' || S.entry === 'product') {
    order = ['use', ...order.filter(k => k !== 'use')];
  }
  if (S.entry === 'tree') {
    order = ['rings', 'story', ...order.filter(k => k !== 'rings' && k !== 'story')];
  }
  return order.map(k => ({ key: k, ...Q[k] }));
}

/* ---------- 相性 ---------- */

/** 木 t との相性（40〜99%） */
function score(t) {
  const a = S.answers;
  let sum = 0, w = 0;
  DIMS.forEach(({ k }) => {
    const p = a[k] ?? .5;
    const wt = p === .5 ? .4 : 1; // 「どっちも好き」は重みを下げる
    sum += wt * (1 - Math.abs(p - t[k]));
    w += wt;
  });
  const sim = sum / w;
  const useOk = t.uses.includes(a.use);
  return Math.min(99, Math.round(40 + sim * 50 + (useOk ? 9 : 0)));
}

/** 相性がいい理由（最大4つ） */
function reasons(t) {
  const a = S.answers;
  const r = [];
  DIMS.forEach(({ k }) => {
    const p = a[k];
    if (p != null && p !== .5 && Math.abs(p - t[k]) < .3) {
      r.push(REASON[k] + 'が、あなたの好みにぴったり');
    }
  });
  if (t.uses.includes(a.use)) r.unshift(USES[a.use] + 'に使いやすい木');
  if (!r.length) r.push('好みとはちょっと違う、意外な出会いかも');
  return r.slice(0, 4);
}

/** まだ推しても・パスしてもいない木を、相性の高い順に */
function queue() {
  return TREES
    .filter(t => !S.matches.includes(t.id) && !S.passed.includes(t.id))
    .sort((a, b) => score(b) - score(a));
}

/* ---------- 表示用テキスト ---------- */

/** 特徴値（0〜1）を言葉にする */
const txt = {
  rings: v => v >= .7 ? '細かい'     : v >= .45 ? 'ふつう'       : '広め',
  knots: v => v < .3  ? '少なめ'     : v < .6   ? 'ほどほど'     : '多め',
  color: v => v < .35 ? '白く明るい' : v < .65  ? 'ほんのり桜色' : '深い赤身',
  grain: v => v < .4  ? 'まっすぐ'   : v < .7   ? 'ややゆらぎ'   : 'ゆらゆら',
  scent: v => v < .4  ? 'ほのか'     : v < .7   ? 'ほどよく'     : 'しっかり',
};

/** 回答から「あなたの切り株」をつくる */
function me() {
  const a = S.answers;
  return {
    id: 'me-' + Object.values(a).join(''),
    rings: a.rings ?? .5,
    knots: a.knots ?? .5,
    color: a.color ?? .5,
    grain: a.grain ?? .5,
    name: 'あなた',
  };
}

/** 診断結果のタイプ名（例：朝日みたいな端正さん） */
function typeName() {
  const a = S.answers;
  const c = a.color ?? .5;
  const colorWord = c === .5 ? '木もれ日みたいな' : c < .5 ? '朝日みたいな' : '夕焼けみたいな';
  const neat = (1 - (a.grain ?? .5)) + (1 - (a.knots ?? .5));
  const typeWord = neat > 1.4 ? '端正さん' : neat < .6 ? 'おおらかさん' : 'バランスさん';
  return colorWord + typeWord;
}
