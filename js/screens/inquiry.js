/* =========================================================
   screens/inquiry.js — 相談・見積もりフォーム（モック。実際には送信しない）
   ========================================================= */

const INQUIRY_KINDS = ['見積もりがほしい', '実物を見たい・さわりたい', '工房・製材所を見学したい', 'その他の相談'];

/**
 * @param {string} subject 相談したいもの（例：吉野杉（無節））
 * @param {string} to      相談先（例：吉野の製材所）
 */
function openInquiry(subject, to) {
  const ov = openOverlay(`
    <div class="sheet-body form-body">
      <button class="close" aria-label="閉じる">${ICON.x}</button>
      <p class="form-kick">${esc(to)}へ</p>
      <h2 class="form-title" id="inqTitle">相談する</h2>
      <div class="subject">${ICON.chat}<span>${esc(subject)}</span></div>
      <form id="inqForm" novalidate>
        <fieldset class="field">
          <legend>相談したいこと</legend>
          <div class="kinds">
            ${INQUIRY_KINDS.map((k, i) => `<label class="kind-opt"><input type="radio" name="kind" value="${k}" ${i === 0 ? 'checked' : ''}><span>${k}</span></label>`).join('')}
          </div>
        </fieldset>
        <label class="field">
          <span>お名前 <em>必須</em></span>
          <input name="name" autocomplete="name" placeholder="吉野 はなこ" required>
        </label>
        <label class="field">
          <span>メールアドレス <em>必須</em></span>
          <input name="mail" type="email" autocomplete="email" placeholder="hanako@example.com" required>
        </label>
        <label class="field">
          <span>メッセージ</span>
          <textarea name="msg" rows="4">${esc(subject)}について相談したいです。</textarea>
        </label>
        <p class="form-err" id="inqErr" role="alert"></p>
        <button class="btn primary" type="submit">送信する</button>
        <p class="fine">サンプルアプリのため、実際には送信されません。</p>
      </form>
    </div>`, 'inqTitle');

  const form = ov.querySelector('#inqForm');
  form.onsubmit = e => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name')).trim();
    const mail = String(data.get('mail')).trim();
    const err = ov.querySelector('#inqErr');
    if (!name || !/^\S+@\S+\.\S+$/.test(mail)) {
      err.textContent = !name ? 'お名前を入れてください' : 'メールアドレスを確認してください';
      return;
    }
    S.inquiries.push({ subject, kind: data.get('kind'), at: Date.now() });
    save();

    ov.querySelector('.form-body').innerHTML = `
      <button class="close" aria-label="閉じる">${ICON.x}</button>
      <div class="done">
        <span class="done-ic">${ICON.check}</span>
        <h2 id="inqTitle">送信しました</h2>
        <p>${esc(name)}さん、ありがとうございます。<br>${esc(to)}から、2〜3日以内にご連絡します。</p>
        <p class="fine">※サンプルアプリのため、実際には送信されていません。</p>
        <button class="btn soft" id="inqDone">とじる</button>
      </div>`;
    ov.querySelector('.close').onclick = closeSheet;
    ov.querySelector('#inqDone').onclick = closeSheet;
    ov.querySelector('#inqDone').focus();
  };
}
