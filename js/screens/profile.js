/* =========================================================
   screens/profile.js — MY TREE PROFILE（診断結果・わたしの好み）
   ========================================================= */

/** @param {boolean} first 診断直後の表示かどうか */
function showProfile(first) {
  setTabs(first ? null : 'me');
  $('#topMeta').textContent = 'MY TREE PROFILE';
  const a = S.answers;

  const metersHTML = DIMS.map(d => {
    const v = a[d.k] ?? .5;
    const free = v === .5;
    return `
      <div class="meter">
        <span class="k">${d.label}</span>
        <div>
          <div class="track ${free ? 'free' : ''}"><span class="dot" style="left:${8 + v * 84}%"></span></div>
          <div class="ends">
            <span>${d.ends[0]}</span>${free ? '<span>こだわらない</span>' : ''}<span>${d.ends[1]}</span>
          </div>
        </div>
      </div>`;
  }).join('');

  main.innerHTML = `
    <section class="pad">
      <div class="prof-head">
        <div class="av">${stumpSVG(me(), { mood: first ? 'wink' : 'smile' })}</div>
        <p class="prof-kick">${first ? '診断できました！ あなたは…' : 'あなたの木の好み'}</p>
        <h2 class="prof-type">${typeName()}</h2>
      </div>
      <div class="prof-card">
        <h3>MY TREE PROFILE</h3>
        ${metersHTML}
        <div class="prof-use"><b>使いたい場所</b><span class="chip">${USES[a.use] || 'まだ'}</span></div>
      </div>
      <div class="stack-btns">
        <button class="btn primary" id="go">${ICON.heart} ${first ? 'この好みで推し木をさがす' : '推し木をさがす'}</button>
        <button class="btn link" id="redo">診断をやりなおす</button>
      </div>
    </section>`;

  $('#go').onclick = () => showSwipe();
  $('#redo').onclick = () => showStart();
}
