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

  main.innerHTML = `
    <section class="start">
      <div class="hero-stump">${stumpSVG({ id: 'hero', rings: .8, knots: .15, color: .6, grain: .2 })}</div>
      <h1>推し木</h1>
      <p class="lead">好きな木目、好きな色。<br>あなたにぴったりの吉野の木と出会おう。</p>
      ${resumeHTML}
      <div class="entries">
        <button class="entry" data-entry="tree">
          <span class="em">🌲</span>
          <span><b>木から</b><small>樹齢や年輪、育った場所で選びたい</small></span>
        </button>
        <button class="entry" data-entry="use">
          <span class="em">🪑</span>
          <span><b>使いみちから</b><small>家具や内装、お店に使いたい</small></span>
        </button>
        <button class="entry" data-entry="product">
          <span class="em">🎁</span>
          <span><b>商品から</b><small>まずは小物やギフトを見てみたい</small></span>
        </button>
      </div>
      <p class="motto">「木っていいな」を、その日だけで終わらせない。</p>
      <p class="fine">サンプルアプリです。木・商品・つくり手の情報は架空です。</p>
    </section>`;

  // 入口を選ぶと、状態をリセットして診断へ
  main.querySelectorAll('[data-entry]').forEach(b => {
    b.onclick = () => {
      S.entry = b.dataset.entry;
      S.answers = {};
      S.matches = [];
      S.passed = [];
      S.feelings = {};
      save();
      showQuiz(0);
    };
  });

  const resume = $('#resume');
  if (resume) resume.onclick = () => showSwipe();
}
