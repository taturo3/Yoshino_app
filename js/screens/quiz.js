/* =========================================================
   screens/quiz.js — 好みチェック（診断）画面
     ふつうの質問 … 左右の絵を見比べて5段階で選ぶ（真ん中は「どっちでもいい」）
     four の質問   … 4択
   ========================================================= */

/** i 番目の質問を表示する */
function showQuiz(i) {
  setTabs(null);
  const qs = questions();
  const q = qs[i];
  $('#topMeta').textContent = '好みチェック';

  const body = q.four ? fourHTML(q) : scaleHTML(q);

  paint(`
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
      ${body}
    </section>`, 'quiz' + i);

  // 描画後にバーを伸ばしてアニメーションさせる
  requestAnimationFrame(() => {
    const bar = main.querySelector('.progress i');
    if (bar) bar.style.width = ((i + 1) / qs.length * 100) + '%';
  });

  let answered = false; // 連打で2問進まないように
  const next = v => {
    if (answered) return;
    answered = true;
    S.answers[q.key] = v;
    save();
    setTimeout(() => (i + 1 < qs.length ? showQuiz(i + 1) : showProfile(true)), 380);
  };

  if (q.four) bindFour(q, next);
  else bindScale(q, next);

  $('#qback').onclick = () => (i ? showQuiz(i - 1) : showStart());
}

/* ---------- 5段階 ---------- */

function scaleHTML(q) {
  const [L, R] = q.opts;
  const sel = valueToPos(q, S.answers[q.key]);
  return `
    <div class="versus" data-pos="${sel ?? ''}">
      <button class="side l" data-pos="0" aria-label="${scaleWord(0, L.label, R.label)}">
        <span class="art">${L.art()}</span><b>${L.label}</b>
      </button>
      <span class="vs" aria-hidden="true">VS</span>
      <button class="side r" data-pos="4" aria-label="${scaleWord(4, L.label, R.label)}">
        <span class="art">${R.art()}</span><b>${R.label}</b>
      </button>
    </div>
    <div class="scale" role="radiogroup" aria-label="${q.hint}の好みを5段階で">
      ${SCALE.map(p => `<button class="pt p${p}" role="radio" data-pos="${p}" aria-checked="${sel === p}" aria-label="${scaleWord(p, L.label, R.label)}"><span></span></button>`).join('')}
    </div>
    <div class="scale-lbl" aria-hidden="true"><span>${L.label}</span><span>どっちでもいい</span><span>${R.label}</span></div>
    <p class="scale-now" aria-live="polite">${sel == null ? '5段階でえらんでね' : scaleWord(sel, L.label, R.label)}</p>`;
}

function bindScale(q, next) {
  const [L, R] = q.opts;
  const versus = main.querySelector('.versus');
  const now = main.querySelector('.scale-now');
  const pts = [...main.querySelectorAll('.pt')];
  let chosen = valueToPos(q, S.answers[q.key]);

  // 指やマウスを乗せている間はプレビュー、離れたら選択中の位置に戻す
  const preview = pos => {
    versus.dataset.pos = pos ?? '';
    now.textContent = pos == null ? '5段階でえらんでね' : scaleWord(pos, L.label, R.label);
  };
  const choose = pos => {
    chosen = pos;
    pts.forEach(b => b.setAttribute('aria-checked', +b.dataset.pos === pos));
    preview(pos);
    next(posToValue(q, pos));
  };

  main.querySelectorAll('[data-pos]').forEach(b => {
    if (b === versus) return;
    const pos = +b.dataset.pos;
    b.onclick = () => choose(pos);
    b.onpointerenter = () => preview(pos);
    b.onfocus = () => preview(pos);
    b.onpointerleave = () => preview(chosen);
    b.onblur = () => preview(chosen);
  });
}

/* ---------- 4択 ---------- */

function fourHTML(q) {
  return `
    <div class="opts four">
      ${q.opts.map((o, j) => `
        <button class="opt ${S.answers[q.key] === o.v ? 'sel' : ''}" data-j="${j}">
          <span class="art">${o.art()}</span>${o.label}
        </button>`).join('')}
    </div>
    <p class="scale-now">ひとつえらんでね</p>`;
}

function bindFour(q, next) {
  main.querySelectorAll('.opt').forEach(b => {
    b.onclick = () => {
      main.querySelectorAll('.opt').forEach(x => x.classList.remove('sel'));
      b.classList.add('sel');
      next(q.opts[+b.dataset.j].v);
    };
  });
}
