/* =========================================================
   svg.js — イラスト（すべて特徴値から自動で描く）
     stumpSVG  … 切り株キャラ
     plankSVG  … 立体の板（節・色・木目）
     sceneSVG  … 吉野の山並みの背景
     scentSVG / storySVG / useSVG … 診断の選択肢の絵
   ========================================================= */

/** gradient / clipPath の id を重複させないための連番 */
let uid = 0;
const nextId = prefix => prefix + (uid++);

/** 杉のシルエット（x: 中心, b: 根元の y, h: 高さ） */
function cedarPath(x, b, h) {
  const p = (dx, dy) => `${(x + dx * h).toFixed(1)} ${(b - dy * h).toFixed(1)}`;
  return `M${p(0, 1)} L${p(.18, .62)} L${p(.1, .62)} L${p(.28, .3)} L${p(.15, .3)} L${p(.36, 0)}`
       + ` L${p(-.36, 0)} L${p(-.15, .3)} L${p(-.28, .3)} L${p(-.1, .62)} L${p(-.18, .62)} Z`;
}

/** 葉っぱ1枚（葉脈つき） */
function leafPath(x, y, len, angle, fill, vein) {
  const tf = `translate(${x} ${y}) rotate(${angle})`;
  return `<path d="M0 0 C${len * .3} ${-len * .38} ${len * .75} ${-len * .32} ${len} 0 C${len * .75} ${len * .32} ${len * .3} ${len * .38} 0 0Z" fill="${fill}" transform="${tf}"/>`
       + `<path d="M1 0 L${len * .85} 0" stroke="${vein}" stroke-width="1.1" stroke-linecap="round" opacity=".7" transform="${tf}"/>`;
}

/* ---------------------------------------------------------
   切り株キャラ
   t: 木（rings / knots / color / grain / species を使う）
   opts: face 顔 / sprout 芽 / mood 'smile'|'wink'|'joy' / ground 地面と影
   --------------------------------------------------------- */
function stumpSVG(t, { face = true, sprout = true, mood = 'smile', ground = true } = {}) {
  const R = 80, cx = 100, cy = 94, ry = .7, H = 30;
  const rand = rng(hash(t.id || 'x'));
  const id = nextId('st');

  const rings = t.rings ?? .5;
  const color = t.color ?? .5;
  const grain = t.grain ?? .5;
  const knots = t.knots ?? .3;
  const hinoki = t.species === 'hinoki';

  const sap   = mix('#FCF1DB', '#F8E5C6', color);   // 白太
  const heart = mix('#F3D7A8', '#DC8466', color);   // 赤身
  const line  = mix('#D6AE7E', '#A4553F', color);   // 年輪の線
  const barkTop  = hinoki ? '#A0603F' : '#8C5D3C';
  const barkSide = hinoki ? '#844A31' : '#714B31';
  const barkDark = hinoki ? '#5F3322' : '#4E3422';
  const off = grain * 8;        // 芯のずれ
  const r0 = R - 7;             // 木口の半径
  const ringCount = Math.round(4 + rings * 16);

  const defs = `<defs>`
    + `<linearGradient id="${id}b" x1="0" x2="1"><stop offset="0" stop-color="${barkDark}"/><stop offset=".22" stop-color="${barkSide}"/><stop offset=".7" stop-color="${barkSide}"/><stop offset="1" stop-color="${barkDark}"/></linearGradient>`
    + `<radialGradient id="${id}h"><stop offset="0" stop-color="${heart}"/><stop offset=".72" stop-color="${heart}"/><stop offset="1" stop-color="${sap}"/></radialGradient>`
    + `<radialGradient id="${id}g" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></radialGradient>`
    + `<clipPath id="${id}c"><ellipse cx="${cx}" cy="${cy}" rx="${r0}" ry="${r0 * ry}"/></clipPath>`
    + `</defs>`;

  let out = '';

  // 影と草
  if (ground) {
    out += `<ellipse cx="${cx}" cy="${cy + H + R * ry - 2}" rx="${R + 14}" ry="11" fill="#2E4A33" opacity=".16"/>`;
    const tuft = (x, y, s) => `<path d="M${x} ${y} q${-3 * s} ${-9 * s} ${-8 * s} ${-12 * s} M${x} ${y} q${1 * s} ${-10 * s} ${-1 * s} ${-16 * s} M${x} ${y} q${4 * s} ${-8 * s} ${9 * s} ${-11 * s}" stroke="#5DAA6E" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    out += tuft(28, cy + H + R * ry - 4, 1.1) + tuft(176, cy + H + R * ry - 8, .9);
  }

  // 根の張り出し
  out += `<path d="M${cx - R + 6} ${cy + H + 8} q-14 10 -24 22 q20 -2 40 -12 Z" fill="${barkSide}"/>`
       + `<path d="M${cx + R - 6} ${cy + H + 8} q14 10 24 22 q-20 -2 -40 -12 Z" fill="${barkSide}"/>`;

  // 側面（樹皮）
  out += `<path d="M${cx - R} ${cy} L${cx - R} ${cy + H} A${R} ${R * ry} 0 0 0 ${cx + R} ${cy + H} L${cx + R} ${cy} Z" fill="url(#${id}b)"/>`;
  const barkLines = hinoki ? 22 : 15;
  for (let i = 0; i < barkLines; i++) {
    const x = cx - R + 6 + i * (2 * R - 12) / (barkLines - 1);
    const e = Math.sqrt(Math.max(0, R * R - (x - cx) ** 2)) * ry;
    const y1 = cy + e + 2, y2 = cy + H + e - 1;
    const wob = (rand() - .5) * 5;
    out += `<path d="M${x.toFixed(1)} ${y1.toFixed(1)} Q${(x + wob).toFixed(1)} ${((y1 + y2) / 2).toFixed(1)} ${x.toFixed(1)} ${y2.toFixed(1)}" stroke="${barkDark}" stroke-width="${hinoki ? 1.1 : 1.6}" opacity=".5" fill="none"/>`;
  }

  // 木口のふち（でこぼこした樹皮）
  let rim = '';
  const ph = rand() * 6.28;
  for (let j = 0; j <= 48; j++) {
    const a = j / 48 * Math.PI * 2;
    const rr = R * (1 + .018 * Math.sin(9 * a + ph) + .01 * Math.sin(23 * a));
    rim += (j ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ' ' + (cy + rr * Math.sin(a) * ry).toFixed(1);
  }
  out += `<path d="${rim}Z" fill="${barkTop}"/>`;

  // 白太と赤身
  out += `<ellipse cx="${cx}" cy="${cy}" rx="${r0}" ry="${r0 * ry}" fill="${sap}"/>`;
  out += `<ellipse cx="${cx + off * .5}" cy="${cy}" rx="${r0 * .7}" ry="${r0 * .7 * ry}" fill="url(#${id}h)"/>`;

  // 年輪（木目がゆらぐほど波打つ）
  let ringsOut = '';
  for (let i = 1; i <= ringCount; i++) {
    const r = (r0 - 3) * (i / ringCount);
    const amp = .012 + grain * .055;
    const p = rand() * 6.28;
    const k = 2 + Math.floor(rand() * 3);
    let d = '';
    for (let j = 0; j <= 44; j++) {
      const a = j / 44 * Math.PI * 2;
      const rr = r * (1 + amp * Math.sin(k * a + p));
      d += (j ? 'L' : 'M') + (cx + off * (1 - i / ringCount) + rr * Math.cos(a)).toFixed(1) + ' ' + (cy + rr * Math.sin(a) * ry).toFixed(1);
    }
    ringsOut += `<path d="${d}Z" fill="none" stroke="${line}" stroke-width="${i % 3 ? .9 : 1.8}" opacity="${i % 3 ? .45 : .65}"/>`;
  }

  // 干割れ（中心から外へのひび）
  const cracks = 1 + Math.floor(rand() * 2);
  for (let i = 0; i < cracks; i++) {
    const a = rand() * Math.PI * 2;
    const ra = r0 * (.12 + rand() * .15), rb = r0 * (.5 + rand() * .3), rm = (ra + rb) / 2;
    const pt = (r, da = 0) => `${(cx + off + r * Math.cos(a + da)).toFixed(1)} ${(cy + r * Math.sin(a + da) * ry).toFixed(1)}`;
    ringsOut += `<path d="M${pt(ra)} L${pt(rm, .06)} L${pt(rb)}" stroke="#7A4A30" stroke-width="1.5" fill="none" stroke-linecap="round" opacity=".55"/>`;
  }

  // 節
  const knotCount = Math.round(knots * 4);
  for (let i = 0; i < knotCount; i++) {
    const a = rand() * Math.PI * 2;
    const r = r0 * (.6 + rand() * .25);
    const x = (cx + r * Math.cos(a)).toFixed(1);
    const y = (cy + r * Math.sin(a) * ry).toFixed(1);
    ringsOut += `<ellipse cx="${x}" cy="${y}" rx="7.5" ry="5.5" fill="${mix(line, '#ffffff', .25)}" stroke="${line}" stroke-width="1.5"/>`
              + `<ellipse cx="${x}" cy="${y}" rx="4.2" ry="3.1" fill="#6E4230"/>`;
  }
  out += `<g clip-path="url(#${id}c)">${ringsOut}</g>`;

  // 髄（中心）とつや
  out += `<circle cx="${cx + off}" cy="${cy}" r="2.4" fill="${line}" opacity=".8"/>`;
  out += `<ellipse cx="${cx}" cy="${cy}" rx="${r0}" ry="${r0 * ry}" fill="url(#${id}g)"/>`;

  // 顔
  if (face) {
    out += `<ellipse cx="${cx - 31}" cy="${cy + 14}" rx="9" ry="5" fill="#FF8FB1" opacity=".6"/>`
         + `<ellipse cx="${cx + 31}" cy="${cy + 14}" rx="9" ry="5" fill="#FF8FB1" opacity=".6"/>`;
    const eye = x => `<ellipse cx="${x}" cy="${cy + 1}" rx="5" ry="5.6" fill="#3B2A20"/>`
                   + `<circle cx="${x + 1.6}" cy="${cy - 1}" r="1.8" fill="#fff"/><circle cx="${x - 1.6}" cy="${cy + 2.6}" r=".9" fill="#fff"/>`;
    const closed = x => `<path d="M${x - 6} ${cy + 2} q6 -7 12 0" stroke="#3B2A20" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
    if (mood === 'joy') out += closed(cx - 18) + closed(cx + 18);
    else if (mood === 'wink') out += closed(cx - 18) + eye(cx + 18);
    else out += eye(cx - 18) + eye(cx + 18);
    out += mood === 'joy'
      ? `<path d="M${cx - 8} ${cy + 10} q8 11 16 0 Z" fill="#3B2A20"/><path d="M${cx - 4} ${cy + 15} q4 3 8 0" fill="#FF7A9C"/>`
      : `<path d="M${cx - 7} ${cy + 11} q7 8 14 0" stroke="#3B2A20" stroke-width="3" fill="none" stroke-linecap="round"/>`;

    // 木ごとにちょっとした小物（キノコ or 桜の花）
    const deco = rand();
    if (deco < .4) {
      const mx = cx + R - 12, my = cy + H + R * ry * .45;
      out += `<rect x="${mx - 3}" y="${my - 10}" width="6" height="11" rx="3" fill="#FFF3E0"/>`
           + `<path d="M${mx - 11} ${my - 9} q11 -16 22 0 Z" fill="#E8584F"/>`
           + `<circle cx="${mx - 4}" cy="${my - 13}" r="1.8" fill="#fff"/><circle cx="${mx + 4}" cy="${my - 12}" r="1.4" fill="#fff"/>`;
    } else if (deco < .75) {
      const fx = cx - R + 22, fy = cy - R * ry + 14;
      let petals = '';
      for (let i = 0; i < 5; i++) {
        petals += `<ellipse cx="${fx}" cy="${fy - 5}" rx="3.6" ry="5" fill="#FFC2D4" transform="rotate(${i * 72} ${fx} ${fy})"/>`;
      }
      out += petals + `<circle cx="${fx}" cy="${fy}" r="2.2" fill="#F37C9B"/>`;
    }
  }

  // 芽
  if (sprout) {
    const ty = cy - R * ry + 3;
    out += `<g class="sprout">`
         + `<path d="M${cx} ${ty} C${cx - 3} ${ty - 8} ${cx + 3} ${ty - 14} ${cx} ${ty - 21}" stroke="#4E9A63" stroke-width="4" fill="none" stroke-linecap="round"/>`
         + leafPath(cx, ty - 20, 24, -155, '#6DBE7F', '#3F8A54')
         + leafPath(cx, ty - 21, 24, -25, '#86D196', '#3F8A54')
         + `</g>`;
  }

  const label = t.name ? t.name + 'の切り株' : '切り株';
  return `<svg viewBox="0 0 200 200" role="img" aria-label="${label}">${defs}${out}</svg>`;
}

/* ---------------------------------------------------------
   立体の板（木口に年輪が見える）
   knots: 0〜1（多いほど節の数が増え、大きくなる）
   color: 0 = 白く明るい 〜 1 = 赤み
   grain: .5 未満 = 柾目（まっすぐ） / それ以上 = 板目（山形）
   --------------------------------------------------------- */
function plankSVG({ knots = 0, color = .3, grain = 0 }) {
  const id = nextId('pk');
  const masame = grain < .5;
  const sap   = mix('#FBEBCB', '#F6DDBA', color);
  const heart = mix('#F2D2A2', '#D77E68', color);
  const face  = mix('#F8E4C0', '#E8A688', color);
  const line  = mix('#D5B286', '#AE5E48', color);
  const edge  = mix('#B98E62', '#8A4636', color);

  // 頂点（上面: P0-P1-P2-P3 / 前面: P3-P2-P2'-P3' / 木口: P0-P3-P3'-P0'）
  const TOP = 'matrix(1.12 -.24 .3 .22 14 40)';   // 0〜100 の正方形 → 上面
  const FRONT = 'matrix(1.12 -.24 0 .16 44 62)';   // 0〜100 の正方形 → 前面
  const topPts = '14,40 126,16 156,38 44,62';
  const frontPts = '44,62 156,38 156,54 44,78';
  const endPts = '14,40 44,62 44,78 14,56';
  const ns = 'vector-effect="non-scaling-stroke"';

  // 上面の木目
  let g = '';
  if (masame) {
    for (let i = 0; i < 10; i++) {
      const v = 5 + i * 10;
      g += `<path d="M0 ${v} C33 ${v - 1.5} 66 ${v + 1.5} 100 ${v}" stroke="${line}" stroke-width="${i % 3 ? 1 : 1.8}" fill="none" opacity=".75" ${ns}/>`;
    }
  } else {
    // 入れ子になった山形（外側ほど左に尖り、幅が広い）
    for (let i = 0; i < 7; i++) {
      const w = 5 + i * 8, a = 74 - i * 10;
      g += `<path d="M100 ${50 - w} C${a + 26} ${50 - w} ${a + 5} ${50 - w * .35} ${a} 50 C${a + 5} ${50 + w * .35} ${a + 26} ${50 + w} 100 ${50 + w}" stroke="${line}" stroke-width="${i % 2 ? 1 : 1.8}" fill="none" opacity=".75" ${ns}/>`;
    }
    g += `<path d="M0 6 C40 5 70 7 100 6 M0 94 C40 95 70 93 100 94" stroke="${line}" stroke-width="1" fill="none" opacity=".6" ${ns}/>`;
  }

  // 節（上面）
  const spots = [[22, 38], [70, 64], [46, 22], [88, 34], [56, 80]];
  const s = .5 + .6 * knots;
  spots.slice(0, Math.round(knots * 5)).forEach(([u, v]) => {
    g += `<ellipse cx="${u}" cy="${v}" rx="${5.5 * s}" ry="${16 * s}" fill="${mix(line, '#ffffff', .3)}" stroke="${line}" stroke-width="1.3" ${ns}/>`
       + `<ellipse cx="${u}" cy="${v}" rx="${3 * s}" ry="${9 * s}" fill="#6E4230"/>`;
  });

  // 前面の木目
  let f = '';
  for (let i = 0; i < 4; i++) {
    const v = 18 + i * 22;
    f += `<path d="M0 ${v} C30 ${v + (masame ? 1 : 6)} 70 ${v - (masame ? 1 : 6)} 100 ${v}" stroke="${line}" stroke-width="1" fill="none" opacity=".6" ${ns}/>`;
  }

  // 木口の年輪（柾目は縦にまっすぐ、板目は弧になる）
  const [ox, oy] = masame ? [-40, 60] : [30, 110];
  let e = `<circle cx="${ox}" cy="${oy}" r="${masame ? 56 : 30}" fill="${heart}"/>`;
  for (let r = 6; r < 110; r += 4.5) {
    e += `<circle cx="${ox}" cy="${oy}" r="${r}" fill="none" stroke="${line}" stroke-width=".8" opacity=".8"/>`;
  }

  return `<svg viewBox="4 6 162 86" aria-hidden="true">`
    + `<defs>`
    + `<clipPath id="${id}t"><polygon points="${topPts}"/></clipPath>`
    + `<clipPath id="${id}e"><polygon points="${endPts}"/></clipPath>`
    + `<clipPath id="${id}f"><polygon points="${frontPts}"/></clipPath>`
    + `<linearGradient id="${id}s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></linearGradient>`
    + `</defs>`
    + `<ellipse cx="86" cy="83" rx="74" ry="6" fill="#2E4A33" opacity=".14"/>`
    // 前面
    + `<polygon points="${frontPts}" fill="${face}"/>`
    + `<g clip-path="url(#${id}f)"><g transform="${FRONT}">${f}</g></g>`
    + `<polygon points="${frontPts}" fill="#5A2E14" opacity=".14"/>`
    // 木口
    + `<polygon points="${endPts}" fill="${sap}"/>`
    + `<g clip-path="url(#${id}e)">${e}</g>`
    + `<polygon points="${endPts}" fill="#5A2E14" opacity=".1"/>`
    // 上面
    + `<polygon points="${topPts}" fill="${face}"/>`
    + `<g clip-path="url(#${id}t)"><g transform="${TOP}">${g}</g></g>`
    + `<polygon points="${topPts}" fill="url(#${id}s)"/>`
    // 輪郭
    + `<path d="M14 40 L126 16 L156 38 L156 54 L44 78 L14 56 Z M44 62 L156 38 M44 62 L14 40 M44 62 L44 78" fill="none" stroke="${edge}" stroke-width="1.2" stroke-linejoin="round" opacity=".7"/>`
    + `</svg>`;
}

/* ---------------------------------------------------------
   吉野の山並みの背景（カードやシートの後ろに敷く）
   --------------------------------------------------------- */
function sceneSVG(tint, seed = 'x') {
  const rand = rng(hash(seed + 'scene'));
  const far  = mix(tint, '#8DC39E', .4);
  const farT = mix(tint, '#5E9C70', .45);
  const near = mix(tint, '#79B58A', .6);
  const nearT = mix(tint, '#3F7D52', .62);
  const grass = mix(tint, '#A6D5A0', .55);

  let trees = '';
  for (let i = 0; i < 9; i++) {
    const x = 10 + i * 46 + rand() * 20;
    trees += `<path d="${cedarPath(x, 168 - Math.sin(x / 60) * 8, 22 + rand() * 10)}" fill="${farT}"/>`;
  }
  for (let i = 0; i < 6; i++) {
    const x = i < 3 ? 14 + i * 34 + rand() * 10 : 270 + (i - 3) * 40 + rand() * 12;
    trees += `<path d="${cedarPath(x, 236 - (i % 2) * 6, 46 + rand() * 18)}" fill="${nearT}"/>`;
  }

  let petals = '';
  for (let i = 0; i < 5; i++) {
    const x = rand() * 400, y = 30 + rand() * 120;
    petals += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="4" ry="2.6" fill="#FFB7CC" opacity=".7" transform="rotate(${(rand() * 180).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`;
  }

  return `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true">`
    + `<circle cx="330" cy="66" r="30" fill="#FFF8DC" opacity=".85"/>`
    + `<g fill="#fff" opacity=".7"><ellipse cx="80" cy="60" rx="34" ry="11"/><ellipse cx="104" cy="52" rx="20" ry="12"/><ellipse cx="250" cy="96" rx="26" ry="8"/></g>`
    + `<path d="M0 178 Q60 128 128 160 T260 140 T400 158 V300 H0Z" fill="${far}"/>`
    + trees
    + `<path d="M0 236 Q110 196 210 226 T400 214 V300 H0Z" fill="${near}"/>`
    + `<path d="M0 270 Q200 248 400 272 V300 H0Z" fill="${grass}"/>`
    + petals
    + `</svg>`;
}

/* ---------------------------------------------------------
   香り（strong: しっかり / それ以外: ほのか）
   --------------------------------------------------------- */
function scentSVG(strong) {
  const swirl = (x, y, s, o) => `<path d="M${x} ${y} c${6 * s} ${-5 * s} ${-6 * s} ${-11 * s} 0 ${-16 * s} c${6 * s} ${-5 * s} ${-6 * s} ${-11 * s} 0 ${-16 * s}" stroke="#5DB378" stroke-width="3" fill="none" stroke-linecap="round" opacity="${o}"/>`;
  let air = '';
  if (strong) {
    air = swirl(44, 52, 1.1, .9) + swirl(116, 50, 1.1, .9) + swirl(30, 78, .8, .7) + swirl(132, 80, .8, .7) + swirl(80, 22, .7, .6)
        + leafPath(22, 40, 12, -30, '#86D196', '#3F8A54') + leafPath(138, 34, 12, 200, '#86D196', '#3F8A54');
  } else {
    air = swirl(118, 66, .8, .4);
  }
  return `<svg viewBox="0 0 160 100" aria-hidden="true">`
    + `<ellipse cx="80" cy="94" rx="40" ry="4" fill="#2E4A33" opacity=".14"/>`
    + `<rect x="76" y="78" width="8" height="16" rx="2" fill="#8C5D3C"/>`
    + `<path d="${cedarPath(80, 84, strong ? 74 : 58)}" fill="${strong ? '#3F8A54' : '#7DB98E'}"/>`
    + air
    + `</svg>`;
}

/* ---------------------------------------------------------
   物語（'story': 育った場所や物語 / 'look': 見た目と使い心地）
   --------------------------------------------------------- */
function storySVG(kind) {
  if (kind === 'story') {
    // 巻物に描かれた吉野の山と村
    return `<svg viewBox="0 0 160 100" aria-hidden="true">`
      + `<rect x="22" y="14" width="116" height="72" rx="3" fill="#FFF7E6" stroke="#E6CFA6" stroke-width="1.5"/>`
      + `<rect x="14" y="10" width="10" height="80" rx="5" fill="#9A6A45"/><rect x="136" y="10" width="10" height="80" rx="5" fill="#9A6A45"/>`
      + `<circle cx="112" cy="32" r="8" fill="#FF9DBE" opacity=".8"/>`
      + `<path d="M26 72 L54 38 L72 56 L92 30 L134 72 Z" fill="#9CCDA9"/>`
      + `<path d="${cedarPath(48, 74, 22)}" fill="#3F8A54"/><path d="${cedarPath(60, 74, 16)}" fill="#3F8A54"/><path d="${cedarPath(118, 74, 20)}" fill="#3F8A54"/>`
      + `<path d="M80 74 v-8 l7 -6 l7 6 v8 Z" fill="#C98D63"/><path d="M78 67 l9 -8 l9 8" stroke="#6E4A30" stroke-width="2.5" fill="none"/>`
      + `<path d="M26 78 H134" stroke="#B6D9BE" stroke-width="3"/>`
      + `</svg>`;
  }
  // つやつやのテーブル
  const spark = (x, y, s) => `<path d="M${x} ${y - 7 * s} L${x + 2 * s} ${y - 2 * s} L${x + 7 * s} ${y} L${x + 2 * s} ${y + 2 * s} L${x} ${y + 7 * s} L${x - 2 * s} ${y + 2 * s} L${x - 7 * s} ${y} L${x - 2 * s} ${y - 2 * s} Z" fill="#FFC94D"/>`;
  return `<svg viewBox="0 0 160 100" aria-hidden="true">`
    + `<ellipse cx="80" cy="92" rx="56" ry="5" fill="#2E4A33" opacity=".14"/>`
    + `<rect x="36" y="56" width="7" height="34" rx="2" fill="#B97A55"/><rect x="117" y="56" width="7" height="34" rx="2" fill="#B97A55"/>`
    + `<path d="M24 48 L136 48 L130 60 L30 60 Z" fill="#E9B48A"/>`
    + `<path d="M24 48 L136 48 L130 52 L30 52 Z" fill="#F6D2AE"/>`
    + `<path d="M40 54 C70 52 90 57 122 54" stroke="#C98D63" stroke-width="1.2" fill="none"/>`
    + `<path d="M58 42 h16 v6 h-16 Z" fill="#fff" opacity=".9"/><path d="M60 42 q6 -10 12 0" fill="#86D196"/>`
    + spark(110, 28, 1.3) + spark(40, 30, .9) + spark(128, 40, .7)
    + `</svg>`;
}

/* ---------------------------------------------------------
   使いみち（furniture / house / small / shop）
   --------------------------------------------------------- */
function useSVG(k) {
  const shadow = `<ellipse cx="80" cy="92" rx="48" ry="5" fill="#2E4A33" opacity=".14"/>`;
  const art = {
    furniture: `<rect x="56" y="20" width="9" height="70" rx="3" fill="#B97A55"/><rect x="95" y="50" width="9" height="40" rx="3" fill="#B97A55"/>`
      + `<rect x="62" y="22" width="34" height="8" rx="3" fill="#E9B48A"/><rect x="62" y="34" width="34" height="8" rx="3" fill="#E9B48A"/>`
      + `<path d="M52 48 H108 L104 58 H56 Z" fill="#F0C49C"/><rect x="66" y="58" width="8" height="32" rx="3" fill="#C98D63"/>`,
    house: `<path d="M40 50 L80 20 L120 50" fill="none" stroke="#C0574F" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"/>`
      + `<rect x="48" y="48" width="64" height="42" fill="#F3D3A6"/>`
      + `<path d="M48 58 H112 M48 68 H112 M48 78 H112" stroke="#D9AF80" stroke-width="1.5"/>`
      + `<rect x="58" y="58" width="16" height="14" rx="2" fill="#BFE3F2" stroke="#9A6A45" stroke-width="2"/><rect x="86" y="64" width="16" height="26" rx="2" fill="#9A6A45"/>`,
    small: `<rect x="48" y="44" width="64" height="46" rx="4" fill="#F0C49C"/><rect x="44" y="34" width="72" height="14" rx="4" fill="#E9B48A"/>`
      + `<rect x="75" y="34" width="10" height="56" fill="#FF8DB3"/>`
      + `<path d="M80 34 C68 18 58 26 70 34 M80 34 C92 18 102 26 90 34" stroke="#FF8DB3" stroke-width="5" fill="none" stroke-linecap="round"/>`,
    shop: `<rect x="44" y="40" width="72" height="50" fill="#FFF7E6"/>`
      + `<path d="M40 26 H120 L124 44 H36 Z" fill="#5DAA6E"/><path d="M52 26 L50 44 M68 26 L68 44 M84 26 L86 44 M100 26 L104 44" stroke="#fff" stroke-width="6"/>`
      + `<path d="M36 44 q8 8 16 0 q8 8 16 0 q8 8 16 0 q8 8 16 0 q8 8 16 0 q8 8 16 0" fill="#5DAA6E"/>`
      + `<rect x="50" y="68" width="60" height="22" rx="2" fill="#C98D63"/><path d="M50 74 H110" stroke="#E9B48A" stroke-width="2"/>`,
  }[k];
  return `<svg viewBox="0 0 160 100" aria-hidden="true">${shadow}${art}</svg>`;
}
