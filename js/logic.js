/* =========================================================
   logic.js — 診断の質問・相性スコア・材木の選び方・表示用テキスト
   ========================================================= */

/* ---------- 診断の質問 ---------- */

/** 選択肢のイラストで、比べる項目以外をそろえるための値 */
const neutral = { knots: 0, color: .4, grain: .1 };
const qStump = (id, rings) => stumpSVG({ id, rings, ...neutral }, { face: false, sprout: false, ground: false });

/** 5段階の位置（0〜4）と、その名前 */
const SCALE = [0, 1, 2, 3, 4];
const scaleWord = (pos, left, right) =>
  ['とても「' + left + '」', 'やや「' + left + '」', 'どっちでもいい', 'やや「' + right + '」', 'とても「' + right + '」'][pos];

/**
 * 入口（S.entry）に合わせて並び替えた質問リストを返す
 * ふつうの質問は opts[0]（左）と opts[1]（右）を5段階で比べる。four: true は4択
 */
function questions() {
  const product = S.entry === 'product';

  const Q = {
    rings: {
      hint: '年輪', title: 'どっちの切り株に<br>キュンとする？',
      opts: [
        { v: 1, label: 'ぎゅっと細かい', art: () => qStump('qa', 1) },
        { v: 0, label: 'のびのび広め',   art: () => qStump('qb', 0) },
      ],
    },
    knots: {
      hint: '節（ふし）', title: '節は、ある方が好き？',
      opts: [
        { v: 0, label: 'すっきり節なし', art: () => plankSVG({ knots: 0, color: .3, grain: 1 }) },
        { v: 1, label: '節も味わい',     art: () => plankSVG({ knots: 1, color: .3, grain: 1 }) },
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
        { v: 1, label: '深呼吸したい', art: () => scentSVG(true) },
        { v: 0, label: 'ほのかでいい', art: () => scentSVG(false) },
      ],
    },
    use: {
      hint: product ? '欲しいもの' : '使いみち',
      title: product ? 'いま、欲しいものは？' : '木を使うなら、どこに？',
      four: true,
      opts: [
        { v: 'furniture', label: product ? 'テーブルや椅子' : '家具' },
        { v: 'house',     label: product ? '床や壁の内装'   : '家・内装' },
        { v: 'small',     label: product ? '小物・ギフト'   : '小物' },
        { v: 'shop',      label: product ? 'お店の什器'     : 'お店' },
      ].map(o => ({ ...o, art: () => useSVG(o.v) })),
    },
    story: {
      hint: '物語', title: '木を選ぶとき、<br>大事なのは？',
      opts: [
        { v: 1, label: '育った場所や物語', art: () => storySVG('story') },
        { v: 0, label: '見た目と使い心地', art: () => storySVG('look') },
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

/** 5段階の位置 → 回答値（左の v から右の v へ 4 等分） */
const posToValue = (q, pos) => q.opts[0].v + (q.opts[1].v - q.opts[0].v) * pos / 4;

/** 回答値 → 5段階の位置（未回答なら null） */
function valueToPos(q, v) {
  if (v == null) return null;
  return Math.round((v - q.opts[0].v) / (q.opts[1].v - q.opts[0].v) * 4);
}

/* ---------- 相性 ---------- */

/** 好みの強さ（どっちでもいい = .4 〜 とても = 1）を重みにする */
const weightOf = p => .4 + 1.2 * Math.abs(p - .5);

/** 木 t との相性（40〜99%） */
function score(t) {
  const a = S.answers;
  let sum = 0, w = 0;
  DIMS.forEach(({ k }) => {
    const p = a[k] ?? .5;
    const wt = weightOf(p);
    sum += wt * (1 - Math.abs(p - t[k]));
    w += wt;
  });
  const sim = sum / w;
  const useOk = t.uses.includes(a.use);
  return Math.min(99, Math.round(40 + sim * 50 + (useOk ? 9 : 0)));
}

/** 相性がいい理由（最大4つ。好みが強い項目から） */
function reasons(t) {
  const a = S.answers;
  const r = DIMS
    .filter(({ k }) => a[k] != null && a[k] !== .5 && Math.abs(a[k] - t[k]) < .3)
    .sort((x, y) => Math.abs(a[y.k] - .5) - Math.abs(a[x.k] - .5))
    .map(({ k }) => REASON[k] + 'が、あなたの好みにぴったり');
  if (t.uses.includes(a.use)) r.unshift(USES[a.use] + 'に使いやすい木');
  if (!r.length) r.push('好みとはちょっと違う、意外な出会いかも');
  return r.slice(0, 4);
}

/** 「もどす」で戻した木。次はこの木をいちばん上に出す */
let frontId = null;

/** まだ推しても・パスしてもいない木を、相性の高い順に */
function queue() {
  return TREES
    .filter(t => !S.matches.includes(t.id) && !S.passed.includes(t.id))
    .sort((a, b) => (b.id === frontId) - (a.id === frontId) || score(b) - score(a));
}

/* ---------- 材木 ---------- */

/**
 * 特徴 p（木、または好み）と材木 m の近さ（0〜1）
 * 節と木目は材木の等級が決めている項目だけを比べ、色は樹種で比べる（重みは半分）
 */
function materialFit(p, m) {
  let d = 0, w = 0;
  if (m.knots != null) { d += Math.abs((p.knots ?? .5) - m.knots); w += 1; }
  if (m.grain != null) { d += Math.abs((p.grain ?? .5) - m.grain); w += 1; }
  d += .5 * Math.abs((p.color ?? .5) - m.color);
  w += .5;
  return 1 - d / w;
}

/** 特徴 p に近い材木を n 件。species を渡すとその樹種だけ */
function materialsFor(p, n, species) {
  return MATERIALS
    .filter(m => !species || m.species === species)
    .map(m => ({ ...m, fit: materialFit(p, m) }))
    .sort((a, b) => b.fit - a.fit)
    .slice(0, n);
}

/** 好みと材木の相性（%表示用。40〜99） */
const materialScore = m => Math.min(99, Math.round(40 + materialFit(me(), m) * 59));

/** 材木のイラスト（節の等級は板目、柾目はまっすぐな木目で描く） */
function materialSVG(m) {
  return plankSVG({ knots: m.knots ?? 0, color: m.color, grain: m.grain ?? 1 });
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

/** 回答値（5段階）を言葉にする（例：とても細かい / どっちでもいい） */
function answerText(d, v) {
  if (v == null || v === .5) return 'どっちでもいい';
  const words = d.say || d.ends;
  return v < .5
    ? (v <= .125 ? 'とても' : 'やや') + words[0]
    : (v >= .875 ? 'とても' : 'やや') + words[1];
}

/** 好みがはっきりしている項目（強い順に最大 n 個） */
function strongPrefs(n) {
  const a = S.answers;
  return DIMS
    .filter(d => a[d.k] != null && a[d.k] !== .5)
    .sort((x, y) => Math.abs(a[y.k] - .5) - Math.abs(a[x.k] - .5))
    .slice(0, n)
    .map(d => ({ label: d.label, text: answerText(d, a[d.k]) }));
}

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
