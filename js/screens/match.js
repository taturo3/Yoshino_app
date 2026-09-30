/* =========================================================
   screens/match.js — 推したときのマッチ演出
   ========================================================= */

function showMatch(t) {
  const m = $('#match');

  // 桜の花びらをランダムに降らせる
  let petals = '';
  for (let i = 0; i < 22; i++) {
    const left = Math.random() * 100;
    const dx = (Math.random() * 120 - 60).toFixed(0);
    const duration = (2.6 + Math.random() * 2.4).toFixed(1);
    const delay = (Math.random() * 1.2).toFixed(1);
    petals += `<span class="petal" style="left:${left}%;--dx:${dx}px;animation-duration:${duration}s;animation-delay:${delay}s"></span>`;
  }

  m.innerHTML = `${petals}
    <p class="small">相性 ${score(t)}%</p>
    <h2 id="matchTitle">あなたの推し木に<br>なりました</h2>
    <div class="pair">
      <div class="p">${stumpSVG(me(), { sprout: false })}</div>
      <div class="heart">${ICON.heart}</div>
      <div class="p">${stumpSVG(t, { sprout: false })}</div>
    </div>
    <p class="who">${SPECIES[t.species].name}「${t.name}」<br>樹齢${t.age}年・${t.place}育ち</p>
    <div class="btns">
      <button class="btn white" id="mSee">${t.name}とのつながりを見る</button>
      <button class="btn link" id="mMore">ほかの木にも会う</button>
    </div>`;

  m.hidden = false;
  $('#mSee').focus();

  $('#mSee').onclick = () => {
    m.hidden = true;
    openSheet(t);
  };
  $('#mMore').onclick = () => {
    m.hidden = true;
  };
}
