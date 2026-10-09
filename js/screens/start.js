/* =========================================================
   screens/start.js — スタート画面
   ========================================================= */

function showStart() {
  setTabs(null);
  $('#topMeta').textContent = '吉野の木マッチング';

  const hasAnswers = Object.keys(S.answers).length >= 7;

  const resumeHTML = hasAnswers
    ? `<button class="btn primary" id="resume">${ICON.heart} つづきから推し木をさがす</button>
       <p class="entry-q" style="margin-top:14px">または、はじめから</p>`
    : '<p class="entry-q">どこから探す？</p>';

  const entry = (key, emoji, title, sub) => `
    <button class="entry" data-entry="${key}">
      <span class="em" aria-hidden="true">${emoji}</span>
      <span><b>${title}</b><small>${sub}</small></span>
      <span class="go" aria-hidden="true">${ICON.arrow}</span>
    </button>`;

  paint(`
    <section class="start">
      <div class="hero-stump">${heroStumpSVG()}</div>
      <h1>推し木</h1>
      <p class="lead">好きな木目、好きな色。<br>あなたにぴったりの吉野の木と出会おう。</p>
      ${resumeHTML}
      <div class="entries">
        ${entry('tree', '🌲', '木から', '樹齢や年輪、育った場所で選びたい')}
        ${entry('use', '🪑', '使いみちから', '家具や内装、お店に使いたい')}
        ${entry('product', '🎁', '商品から', 'まずは小物やギフトを見てみたい')}
      </div>
      <ol class="steps" aria-label="使い方">
        <li><b>1</b>好みを5段階でチェック</li>
        <li><b>2</b>相性のいい木とスワイプで出会う</li>
        <li><b>3</b>材・商品・つくり手へつながる</li>
        <li><b>4</b>現地をめぐってスタンプを集める</li>
      </ol>
      <p class="motto">「木っていいな」を、その日だけで終わらせない。</p>
      <p class="fine">サンプルアプリです。木・商品・つくり手の情報は架空です。</p>
    </section>`, 'start');

  // 入口を選ぶと、状態をリセットして診断へ
  main.querySelectorAll('[data-entry]').forEach(b => {
    b.onclick = () => {
      // 相談の履歴とスタンプは、診断をやりなおしても残す
      const { inquiries, stamps } = S;
      resetAll();
      Object.assign(S, { inquiries, stamps });
      S.entry = b.dataset.entry;
      save();
      showQuiz(0);
    };
  });

  const resume = $('#resume');
  if (resume) resume.onclick = () => showSwipe();
}
