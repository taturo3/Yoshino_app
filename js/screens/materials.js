/* =========================================================
   screens/materials.js — 材木カタログ画面と、材木の詳細シート
   ========================================================= */

/** 樹種の絞り込み（'all' | 'sugi' | 'hinoki'） */
let matFilter = 'all';

function showMaterials() {
  setTabs('mat');
  $('#topMeta').textContent = '材木カタログ';

  const list = MATERIALS
    .filter(m => matFilter === 'all' || m.species === matFilter)
    .map(m => ({ ...m, pct: materialScore(m) }))
    .sort((a, b) => b.pct - a.pct);

  const filters = [['all', 'すべて'], ...Object.entries(SPECIES).map(([k, s]) => [k, s.name])];

  paint(`
    <section class="pad">
      <h2 class="list-title">材木をさがす</h2>
      <p class="list-sub">吉野の製材所から届く材木。あなたの好みに近い順です。</p>
      <div class="filters" role="tablist" aria-label="樹種でしぼりこむ">
        ${filters.map(([k, label]) => `<button role="tab" aria-selected="${matFilter === k}" data-filter="${k}">${label}</button>`).join('')}
      </div>
      <div class="mat-list">
        ${list.map((m, i) => `
          <button class="mat-item" data-mat="${m.id}">
            <span class="mat-art">${materialSVG(m)}</span>
            <span class="mat-txt">
              <span class="kind ${m.species}">${SPECIES[m.species].name}</span>
              <b>${m.gradeName}</b>
              <span>${m.usage.join('・')}</span>
            </span>
            <span class="pct">${i === 0 ? '<i>いちばん</i>' : ''}${m.pct}%</span>
          </button>`).join('')}
      </div>
      <p class="fine">等級の目安は一般的な説明です。実際の材は一本ずつ表情が異なります。</p>
    </section>`, 'mat');

  main.querySelectorAll('[data-filter]').forEach(b => {
    b.onclick = () => {
      matFilter = b.dataset.filter;
      showMaterials();
    };
  });
  main.querySelectorAll('[data-mat]').forEach(b => {
    b.onclick = () => openMaterialSheet(MATERIALS.find(m => m.id === b.dataset.mat));
  });
}

/** 材木の詳細シート */
function openMaterialSheet(m) {
  const sp = SPECIES[m.species];
  // この材に近い木（同じ樹種で、上位2つの材にこの材が入っている木）
  const trees = TREES.filter(t => t.species === m.species && materialsFor(t, 2, t.species).some(x => x.id === m.id));
  const knotText = m.knots == null ? '—' : m.knots >= .8 ? 'たくさん' : m.knots >= .5 ? 'ところどころ' : m.knots > 0 ? 'ほんの少し' : 'なし';

  const ov = openOverlay(`
    <div class="sheet-art mat-hero ${m.species}">
      ${materialSVG(m)}
      <button class="close" aria-label="閉じる">${ICON.x}</button>
      <span class="badge">相性 <b>${materialScore(m)}%</b></span>
    </div>
    <div class="sheet-body">
      <div class="name-row">
        <span class="kind ${m.species}">${sp.name}</span><h2 id="matName">${m.gradeName}</h2>
      </div>
      <p class="feature">${m.desc}</p>
      <dl class="specs">
        <div><dt>節</dt><dd>${knotText}</dd></div>
        <div><dt>木目</dt><dd>${m.grain === 0 ? '柾目（まっすぐ）' : '板目が中心'}</dd></div>
        <div><dt>色</dt><dd>${m.species === 'hinoki' ? '淡く明るい' : '赤身と白太'}</dd></div>
      </dl>
      <div class="sec"><h3>${sp.name}の特徴</h3><p class="bio">${sp.note}</p></div>
      <div class="sec"><h3>おすすめの使いみち</h3><div class="items">${m.usage.map(u => `<span class="chip">${u}</span>`).join('')}</div></div>
      ${trees.length ? `
      <div class="sec"><h3>この材に近い木</h3>
        <div class="tree-links">${trees.map(t => `
          <button class="tree-link" data-tree="${t.id}">
            <span class="ic" style="background:${t.tint}">${stumpSVG(t, { sprout: false, ground: false })}</span>
            <span><b>${t.name}</b><small>樹齢${t.age}年・${t.place}</small></span>${ICON.arrow}
          </button>`).join('')}
        </div></div>` : ''}
      <div class="sheet-actions one">
        <button class="btn primary" id="matAsk">${ICON.chat} 見積もり・相談する</button>
      </div>
    </div>`, 'matName');

  ov.querySelectorAll('[data-tree]').forEach(b => {
    b.onclick = () => openSheet(TREES.find(t => t.id === b.dataset.tree));
  });
  $('#matAsk').onclick = () => openInquiry(m.name, '吉野の製材所');
}
