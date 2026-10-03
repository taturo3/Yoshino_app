/* =========================================================
   screens/oshi.js — 推し木リスト画面
   ========================================================= */

function showOshi() {
  setTabs('oshi');
  $('#topMeta').textContent = 'あなたの推し木';

  const list = S.matches.map(id => TREES.find(t => t.id === id)).filter(Boolean);

  // まだ1本も推していないとき
  if (!list.length) {
    paint(`
      <section class="empty">
        ${stumpSVG({ id: 'lonely', rings: .5, knots: .3, color: .3, grain: .3 })}
        <h2>まだ推し木はいません</h2>
        <p>気になる木に♡を押すと、ここに集まります。</p>
        <button class="btn primary" id="toSwipe" style="max-width:260px">木をさがす</button>
      </section>`, 'oshi-empty');
    $('#toSwipe').onclick = () => showSwipe();
    return;
  }

  const itemsHTML = list.map(t => {
    const f = S.feelings[t.id] || [];
    return `
      <button class="mini" data-id="${t.id}">
        <div class="art" style="background:${t.tint}">${treeArt(t, { sprout: false })}</div>
        <div class="t">
          <span class="kind ${t.species}">${SPECIES[t.species].name}</span>
          <b>${t.name}</b>
          <small>樹齢${t.age}年・${t.place}</small>
          <span class="pct">相性 ${score(t)}%</span>
          ${f.length ? `<span class="feel-note">${f[0]}${f.length > 1 ? ` ほか${f.length - 1}` : ''}</span>` : ''}
        </div>
      </button>`;
  }).join('');

  paint(`
    <section class="pad">
      <h2 class="list-title">推し木 ${list.length}本</h2>
      <p class="list-sub">タップすると、材・商品・つくり手・体験までたどれます。</p>
      <div class="grid">${itemsHTML}</div>
    </section>`, 'oshi');

  main.querySelectorAll('.mini').forEach(b => {
    b.onclick = () => openSheet(TREES.find(t => t.id === b.dataset.id));
  });
}
