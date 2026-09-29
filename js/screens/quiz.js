/* =========================================================
   screens/quiz.js — 好みチェック（診断）画面
   ========================================================= */

/** i 番目の質問を表示する */
function showQuiz(i) {
  setTabs(null);
  const qs = questions();
  const q = qs[i];
  $('#topMeta').textContent = '好みチェック';

  const optsHTML = q.opts.map((o, j) => {
    const art = o.art ? o.art() : `<span class="emo">${o.emo}</span>`;
    const sel = S.answers[q.key] === o.v ? 'sel' : '';
    return `<button class="opt ${sel}" data-j="${j}"><span class="art">${art}</span>${o.label}</button>`;
  }).join('');

  main.innerHTML = `
    <section class="quiz">
      <div class="qbar">
        <button class="back" id="qback" aria-label="戻る">${ICON.back}</button>
        <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${qs.length}" aria-valuenow="${i}">
          <i style="width:${i / qs.length * 100}%"></i>
        </div>
        <span class="qnum">${i + 1} / ${qs.length}</span>
      </div>
      <span class="qhint">${q.hint}</span>
      <h2 class="qtitle">${q.title}</h2>
      <div class="opts ${q.four ? 'four' : ''}">${optsHTML}</div>
      ${q.four ? '' : '<button class="btn link either" id="either">どっちも好き</button>'}
    </section>`;

  // 描画後にバーを伸ばしてアニメーションさせる
  requestAnimationFrame(() => {
    const bar = main.querySelector('.progress i');
    if (bar) bar.style.width = ((i + 1) / qs.length * 100) + '%';
  });

  const next = v => {
    S.answers[q.key] = v;
    save();
    setTimeout(() => (i + 1 < qs.length ? showQuiz(i + 1) : showProfile(true)), 230);
  };

  main.querySelectorAll('.opt').forEach(b => {
    b.onclick = () => {
      main.querySelectorAll('.opt').forEach(x => x.classList.remove('sel'));
      b.classList.add('sel');
      next(q.opts[+b.dataset.j].v);
    };
  });

  const either = $('#either');
  if (either) either.onclick = () => next(.5);

  $('#qback').onclick = () => (i ? showQuiz(i - 1) : showStart());
}
