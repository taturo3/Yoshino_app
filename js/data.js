/* =========================================================
   data.js — 木のデータと表示用の定数（サンプル・架空）
   ========================================================= */

/** 使いみちの表示名 */
const USES = {
  furniture: '家具',
  house: '家・内装',
  small: '小物',
  shop: 'お店',
};

/**
 * 木の一覧
 * rings / knots / color / grain / scent / story は 0〜1 の特徴値
 * price は 1〜5 の価格帯
 */
const TREES = [
  {
    id: 'hiyori', name: 'ひより', age: 85, place: '川上村', tint: '#FFE2EB',
    rings: .9, knots: .1, color: .35, grain: .1, scent: .6, story: .6,
    uses: ['furniture', 'house'], price: 4,
    feature: '端正で、すっと揃った木目',
    bio: '急な斜面に密に植えられ、ゆっくり育った一本。枝打ちを重ねてきたので節がほとんどなく、年輪は指でなぞれないほど細かい。',
    material: '無節の柾目板・テーブル天板材',
    products: ['一枚板のローテーブル', '柾目のまな板', '壁の腰板'],
    maker: '川上村の製材所と家具工房',
    exp: '吉野杉の家で、同じ柾目にさわる',
  },
  {
    id: 'koharu', name: 'こはる', age: 60, place: '吉野町', tint: '#FFF3D6',
    rings: .6, knots: .2, color: .1, grain: .3, scent: .4, story: .3,
    uses: ['small', 'furniture'], price: 2,
    feature: '白くてやさしい、ミルク色の肌',
    bio: '外側の白太（しらた）がきれいに出る木。明るい色なので、北欧風の部屋やキッチンまわりにもなじみやすい。',
    material: '白太の多い板材',
    products: ['コースター', 'ブレッドトレー', '子ども椅子'],
    maker: '吉野町の木工作家',
    exp: '木工体験でコースターをつくる',
  },
  {
    id: 'akane', name: 'あかね', age: 120, place: '川上村', tint: '#FFD9CF',
    rings: .95, knots: .05, color: .9, grain: .2, scent: .8, story: .8,
    uses: ['furniture', 'shop'], price: 5,
    feature: '深い赤身と、上品な香り',
    bio: '樹齢120年。中心の赤身が濃く、切った瞬間にふわっと甘い香りが立つ。百年以上、何代もの山守に手入れされてきた。',
    material: '赤身の厚板・カウンター材',
    products: ['カウンター天板', '銘木の飾り棚', '酒器トレー'],
    maker: '吉野の銘木店と家具職人',
    exp: '製材所で丸太から板になる瞬間を見る',
  },
  {
    id: 'morio', name: 'もりお', age: 45, place: '東吉野村', tint: '#DDF0D9',
    rings: .4, knots: .85, color: .5, grain: .8, scent: .7, story: .4,
    uses: ['house', 'shop'], price: 2,
    feature: '節が生きた、山の表情',
    bio: '節も木目のゆらぎも、そのまま魅力にした元気な一本。床や壁に張ると、山小屋のようなおおらかな空間になる。',
    material: '節ありの床板・羽目板',
    products: ['無垢フローリング', 'カフェの壁板', 'ベンチ'],
    maker: '東吉野村の工務店',
    exp: '節ありの床を裸足で歩く',
  },
  {
    id: 'shizuku', name: 'しずく', age: 100, place: '黒滝村', tint: '#DCEBF5',
    rings: .85, knots: .3, color: .6, grain: .6, scent: .3, story: .7,
    uses: ['small', 'house'], price: 3,
    feature: '桜色と白のグラデーション',
    bio: '赤身と白太の境目がやわらかく、ほんのり桜色に見える。香りは控えめで、毎日使う器や道具に向いている。',
    material: '源平（赤白まじり）の板材',
    products: ['お椀', 'ペン皿', '間接照明のシェード'],
    maker: '黒滝村の木地師',
    exp: 'ろくろで器を削る工房見学',
  },
  {
    id: 'taiga', name: 'たいが', age: 200, place: '川上村', tint: '#EAE0F7',
    rings: 1, knots: 0, color: .8, grain: .4, scent: .9, story: 1,
    uses: ['shop', 'furniture'], price: 5,
    feature: '樹齢200年、特別な一本',
    bio: '江戸時代の終わりごろに植えられた大木。年輪を数えると、村の歴史と重なる。一本まるごとオーダーして、家具や空間をつくれる。',
    material: '大径木の一枚板',
    products: ['大テーブル', '店舗のカウンター', 'オーダー家具'],
    maker: '山主さんと銘木職人',
    exp: '山に入って、生えている姿に会いに行く',
  },
  {
    id: 'popuri', name: 'ぽぷり', age: 50, place: '下市町', tint: '#E4F5E0',
    rings: .5, knots: .6, color: .25, grain: .9, scent: 1, // story は未設定 → 下で .5 を補う
    uses: ['small'], price: 1,
    feature: '香りがふわっと広がる',
    bio: '製材のときに出る端材まで大切にする木。香りがとくに強く、手に取るたびに森の空気を思い出させてくれる。',
    material: '端材・小割り材',
    products: ['お箸', '香り袋', '木のキーホルダー'],
    maker: '下市町の割り箸職人',
    exp: '端材でつくる香り袋ワークショップ',
  },
  {
    id: 'yuzuha', name: 'ゆずは', age: 70, place: '天川村', tint: '#FFF0DA',
    rings: .7, knots: .4, color: .45, grain: .5, scent: .5, story: .5,
    uses: ['house', 'furniture', 'small'], price: 3,
    feature: 'ちょうどいい、バランス型',
    bio: '色も木目も節も、どれもほどよい。家具にも内装にも小物にも使いやすく、はじめての吉野杉にもおすすめ。',
    material: '一般材（上小節）',
    products: ['本棚', '室内ドア', 'ティッシュケース'],
    maker: '天川村の家具工房',
    exp: 'モデルハウスで木の家に泊まる',
  },
];

// story が未設定の木はまんなか（.5）にしておく
TREES.forEach(t => {
  if (t.story == null) t.story = .5;
});

/** 好みの軸（プロフィールのメーターと相性計算に使う） */
const DIMS = [
  { k: 'rings', label: '年輪', ends: ['広め', '細かい'] },
  { k: 'knots', label: '節',   ends: ['少なめ', '多め'] },
  { k: 'color', label: '色',   ends: ['明るい', '赤み'] },
  { k: 'grain', label: '木目', ends: ['まっすぐ', 'ゆらゆら'] },
  { k: 'scent', label: '香り', ends: ['ほのか', 'しっかり'] },
  { k: 'story', label: '物語', ends: ['見た目', '物語'] },
];

/** 相性の理由に使う言い回し */
const REASON = {
  rings: '年輪の細かさ',
  knots: '節の入り方',
  color: '色あい',
  grain: '木目の表情',
  scent: '香りの強さ',
  story: '物語の深さ',
};

/** 推し木の詳細で選べる「次にしたいこと」 */
const FEELINGS = [
  'もっと知りたい',
  '商品を見たい',
  '実物にさわりたい',
  '吉野へ行きたい',
  '買いたい・相談したい',
];
