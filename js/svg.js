/* =========================================================
   svg.js — 切り株キャラと板のイラスト（木の特徴から自動で描く）
   ========================================================= */

/** clipPath の id を重複させないための連番 */
let uid = 0;

/**
 * 切り株キャラの SVG
 * @param {object} t  木（rings / knots / color / grain を使う）
 * @param {object} opts
 *   face   … 顔を描くか
 *   sprout … 頭の芽を描くか
 *   mood   … 'smile' | 'wink'
 */
function stumpSVG(t, { face = true, sprout = true, mood = 'smile' } = {}) {
  const R = 80, cx = 100, cy = 104, ry = .9;
  const rand = rng(hash(t.id || 'x'));

  const rings = t.rings ?? .5;
  const color = t.color ?? .5;
  const grain = t.grain ?? .5;
  const knots = t.knots ?? .3;

  const ringCount = Math.round(5 + rings * 11);
  const sap   = mix('#FCF0D8', '#F7E3C4', color); // 白太
  const heart = mix('#F3D9AE', '#DE8A6E', color); // 赤身
  const line  = mix('#D9B487', '#A95A45', color); // 年輪の線
  const off = grain * 8; // 芯のずれ

  // 側面と樹皮
  let out = `<ellipse cx="${cx}" cy="${cy + 16}" rx="${R}" ry="${R * ry}" fill="#7B5134"/>`
          + `<rect x="${cx - R}" y="${cy}" width="${R * 2}" height="16" fill="#7B5134"/>`;
  out += `<ellipse cx="${cx}" cy="${cy}" rx="${R}" ry="${R * ry}" fill="#9A6A45"/>`
       + `<ellipse cx="${cx}" cy="${cy}" rx="${R - 7}" ry="${(R - 7) * ry}" fill="${sap}"/>`;
  out += `<ellipse cx="${cx + off * .5}" cy="${cy}" rx="${(R - 7) * .66}" ry="${(R - 7) * .66 * ry}" fill="${heart}"/>`;

  // 年輪（木目がゆらぐほど波打つ）
  for (let i = 1; i <= ringCount; i++) {
    const r = (R - 10) * (i / ringCount);
    const amp = .012 + grain * .055;
    const ph = rand() * 6.28;
    const k = 2 + Math.floor(rand() * 3);
    let d = '';
    for (let j = 0; j <= 40; j++) {
      const a = j / 40 * Math.PI * 2;
      const rr = r * (1 + amp * Math.sin(k * a + ph));
      const x = cx + off * (1 - i / ringCount) + rr * Math.cos(a);
      const y = cy + rr * Math.sin(a) * ry;
      d += (j ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    out += `<path d="${d}Z" fill="none" stroke="${line}" stroke-width="${i % 3 ? 1 : 1.8}" opacity=".6"/>`;
  }

  // 節
  const knotCount = Math.round(knots * 4);
  for (let i = 0; i < knotCount; i++) {
    const a = rand() * Math.PI * 2;
    const r = (R - 10) * (.66 + rand() * .2);
    const x = (cx + r * Math.cos(a)).toFixed(1);
    const y = (cy + r * Math.sin(a) * ry).toFixed(1);
    out += `<ellipse cx="${x}" cy="${y}" rx="7.5" ry="6" fill="none" stroke="${line}" stroke-width="1.5"/>`
         + `<ellipse cx="${x}" cy="${y}" rx="4.2" ry="3.4" fill="#744630"/>`;
  }

  // 顔
  if (face) {
    out += `<ellipse cx="${cx - 30}" cy="${cy + 15}" rx="9" ry="5.5" fill="#FF8FB1" opacity=".65"/>`
         + `<ellipse cx="${cx + 30}" cy="${cy + 15}" rx="9" ry="5.5" fill="#FF8FB1" opacity=".65"/>`;
    if (mood === 'wink') {
      out += `<path d="M${cx - 24} ${cy + 3} q6 -6 12 0" stroke="#3B2A20" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
    } else {
      out += `<circle cx="${cx - 18}" cy="${cy + 2}" r="5" fill="#3B2A20"/>`
           + `<circle cx="${cx - 16.5}" cy="${cy + .2}" r="1.7" fill="#fff"/>`;
    }
    out += `<circle cx="${cx + 18}" cy="${cy + 2}" r="5" fill="#3B2A20"/>`
         + `<circle cx="${cx + 19.5}" cy="${cy + .2}" r="1.7" fill="#fff"/>`;
    out += `<path d="M${cx - 7} ${cy + 12} q7 8 14 0" stroke="#3B2A20" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  }

  // 芽
  if (sprout) {
    const ty = cy - R * ry + 3;
    out += `<g class="sprout">`
         + `<path d="M${cx} ${ty} V${ty - 18}" stroke="#4E9A63" stroke-width="4" stroke-linecap="round"/>`
         + `<ellipse cx="${cx - 10}" cy="${ty - 20}" rx="11" ry="6.5" fill="#6DBE7F" transform="rotate(-28 ${cx - 10} ${ty - 20})"/>`
         + `<ellipse cx="${cx + 10}" cy="${ty - 22}" rx="11" ry="6.5" fill="#86D196" transform="rotate(28 ${cx + 10} ${ty - 22})"/>`
         + `</g>`;
  }

  const label = t.name ? t.name + 'の切り株' : '切り株';
  return `<svg viewBox="0 0 200 200" role="img" aria-label="${label}">${out}</svg>`;
}

/**
 * 板のイラスト（診断の選択肢で使う）
 * grain < .5 なら柾目（まっすぐ）、それ以上なら板目（山形）
 */
function plankSVG({ knots = 0, color = .3, grain = 0 }) {
  const id = 'pk' + (uid++);
  const base = mix('#FBEBCB', '#E9A488', color);
  const line = mix('#DDBE93', '#B5644C', color);

  let g = '';
  if (grain < .5) {
    for (let i = 0; i < 9; i++) {
      const y = 12 + i * 7.4;
      g += `<path d="M4 ${y} C40 ${y - 1.4} 80 ${y + 1.4} 116 ${y}" stroke="${line}" stroke-width="${i % 3 ? 1.2 : 2}" fill="none" opacity=".75"/>`;
    }
  } else {
    for (let i = 0; i < 6; i++) {
      const w = 9 + i * 9.5;
      const top = 20 - i * 2.5;
      g += `<path d="M${60 - w} 84 C${60 - w} ${44 - i * 4} ${60 - w * .45} ${top + 4} 60 ${top} C${60 + w * .45} ${top + 4} ${60 + w} ${44 - i * 4} ${60 + w} 84" stroke="${line}" stroke-width="${i % 2 ? 1.2 : 2}" fill="none" opacity=".75"/>`;
    }
  }

  // 節：knots が大きいほど数が増え（最大3つ）、大きくなる
  let k = '';
  const knotCount = Math.ceil(knots * 3);
  const s = .5 + .5 * knots;
  [[32, 30], [88, 52], [52, 64]].slice(0, knotCount).forEach(([x, y]) => {
    k += `<ellipse cx="${x}" cy="${y}" rx="${10 * s}" ry="${7.5 * s}" fill="none" stroke="${line}" stroke-width="1.5"/>`
       + `<ellipse cx="${x}" cy="${y}" rx="${5.5 * s}" ry="${4.2 * s}" fill="#744630"/>`;
  });

  return `<svg viewBox="0 0 120 84" aria-hidden="true">`
       + `<defs><clipPath id="${id}"><rect x="4" y="4" width="112" height="76" rx="14"/></clipPath></defs>`
       + `<rect x="4" y="4" width="112" height="76" rx="14" fill="${base}"/>`
       + `<g clip-path="url(#${id})">${g}${k}</g>`
       + `</svg>`;
}
