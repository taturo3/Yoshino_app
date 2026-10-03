/* =========================================================
   screens/profile.js — MY TREE PROFILE（診断結果・わたしの好み）
   ========================================================= */

/** @param {boolean} first 診断直後の表示かどうか */
function showProfile(first) {
  setTabs(first ? null : 'me');
  $('#topMeta').textContent = 'MY TREE PROFILE';
  const a = S.answers;

  // 5段階のメーター
  const metersHTML = DIMS.map(d => {
    const v = a[d.k] ?? .5;
    const free = v === .5;
    return `
      <div class="meter">
        <div class="mtop"><span class="k">${d.label}</span><span class="val ${free ? 'free' : ''}">${answerText(d, a[d.k])}</span></div>
        <div class="track ${free ? 'free' : ''}">
          ${SCALE.map(p => `<i style="left:${8 + p * 21}%"></i>`).join('')}
          <span class="dot" style="left:${8 + v * 84}%"></span>
        </div>
        <div class="ends"><span>${d.ends[0]}</span><span>${d.ends[1]}</span></div>
      </div>`;
  }).join('');

  // 好みに近い材木（杉・桧あわせて上位3つ）
  const materialsHTML = materialsFor(me(), 3).map(m => `
    <button class="mat" data-mat="${m.id}">
      <span class="mat-art">${materialSVG(m)}</span>
      <span class="mat-txt">
        <b>${m.name}</b>
        <span>${m.desc}</span>
      </span>
      <span class="pct">${materialScore(m)}%</span>
    </button>`).join('');

  const prefs = strongPrefs(3);
  const inquiries = S.inquiries.length;

  paint(`
    <section class="pad">
      <div class="prof-head">
        <div class="av">${stumpSVG(me(), { mood: first ? 'joy' : 'smile' })}</div>
        <p class="prof-kick">${first ? '診断できました！ あなたは…' : 'あなたの木の好み'}</p>
        <h2 class="prof-type">${typeName()}</h2>
        ${prefs.length ? `<div class="prefs">${prefs.map(p => `<span class="chip">${p.label}：${p.text}</span>`).join('')}</div>` : ''}
      </div>
      <div class="prof-card">
        <h3>MY TREE PROFILE</h3>
        ${metersHTML}
        <div class="prof-use"><b>使いたい場所</b><span class="chip">${USES[a.use] || 'まだ'}</span></div>
      </div>
      <div class="prof-card">
        <h3>あなたに合う材木 <small>タップでくわしく</small></h3>
        ${materialsHTML}
        <button class="btn link more" id="toMat">材木をぜんぶ見る</button>
      </div>
      <div class="stack-btns">
        <button class="btn primary" id="go">${ICON.heart} ${first ? 'この好みで推し木をさがす' : '推し木をさがす'}</button>
        <button class="btn soft" id="share">${ICON.share} 結果をシェアする</button>
      </div>
      ${!first ? `
      <div class="prof-card settings">
        <h3>設定</h3>
        <div class="row"><span>送った相談</span><b>${inquiries}件</b></div>
        <button class="row" id="redo"><span>診断をやりなおす</span>${ICON.arrow}</button>
        <button class="row danger" id="reset"><span>データをすべて消す</span>${ICON.arrow}</button>
      </div>` : '<button class="btn link" id="redo">診断をやりなおす</button>'}
    </section>`, first ? 'profile-first' : 'profile');

  main.querySelectorAll('[data-mat]').forEach(b => {
    b.onclick = () => openMaterialSheet(MATERIALS.find(m => m.id === b.dataset.mat));
  });
  $('#toMat').onclick = () => showMaterials();
  $('#go').onclick = () => showSwipe();
  $('#share').onclick = shareResult;
  $('#redo').onclick = () => showStart();
  const reset = $('#reset');
  if (reset) {
    reset.onclick = () => {
      if (!confirm('診断結果・推し木・相談の履歴をすべて消します。よろしいですか？')) return;
      resetAll();
      updateCount();
      toast('データを消しました');
      showStart();
    };
  }
}

/** 診断結果をシェア（対応していなければクリップボードへ） */
async function shareResult() {
  const prefs = strongPrefs(2).map(p => `${p.label}は${p.text}`).join('、');
  const text = `わたしの木の好みは「${typeName()}」でした🌲${prefs ? `（${prefs}）` : ''} #推し木`;
  try {
    if (navigator.share) {
      await navigator.share({ title: '推し木', text });
      return;
    }
    await navigator.clipboard.writeText(text);
    toast('結果をコピーしました');
  } catch (e) {
    if (e && e.name === 'AbortError') return; // シェアをキャンセルした
    toast('シェアできませんでした');
  }
}
