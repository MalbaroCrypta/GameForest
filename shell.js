// Shared shell: navigation, language toggle, auth demo, pitch modal
(function(){
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const LS_USERS = "gf_users";
  const LS_SESSION = "gf_session";

  function loadUsers(){
    try { return JSON.parse(localStorage.getItem(LS_USERS) || "[]"); }
    catch { return []; }
  }
  function saveUsers(users){ localStorage.setItem(LS_USERS, JSON.stringify(users)); }
  function getSession(){
    try { return JSON.parse(localStorage.getItem(LS_SESSION) || "null"); }
    catch { return null; }
  }
  function setSession(session){ localStorage.setItem(LS_SESSION, JSON.stringify(session)); updateAuthUI(); }
  function clearSession(){ localStorage.removeItem(LS_SESSION); updateAuthUI(); }
  function isValidEmail(email){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

  function showModal(el){ if(el) el.classList.remove("hidden"); }
  function hideModal(el){ if(el) el.classList.add("hidden"); }
  function bindModalClose(modal){
    if (!modal) return;
    modal.addEventListener("click", (e) => {
      if (e.target.classList?.contains("modal__backdrop") || e.target.dataset.close === "1") hideModal(modal);
    });
  }

  function authMarkup(mode){
    const t = (k) => window.GF_I18N.t(k);
    if (mode === "register"){
      return `
        <div class="field">
          <label class="label">${t("email")}</label>
          <input class="input" id="aEmail" type="email" placeholder="you@email.com">
        </div>
        <div class="field">
          <label class="label">${t("password")}</label>
          <input class="input" id="aPass" type="password" placeholder="min 6 chars">
        </div>
        <div class="field">
          <label class="label">${t("password2")}</label>
          <input class="input" id="aPass2" type="password" placeholder="repeat password">
        </div>
        <div class="divider"></div>
        <button class="btn btn--primary w100" id="aSubmit">${t("createAccount")}</button>
        <button class="btn btn--ghost w100" id="aSwitch">${t("haveAccount")}</button>
        <div class="muted" id="aMsg" style="margin-top:10px;"></div>
        <div class="muted" style="margin-top:8px; font-size:12px;">${t("authDisclaimer")}</div>
      `;
    }
    return `
      <div class="field">
        <label class="label">${t("email")}</label>
        <input class="input" id="aEmail" type="email" placeholder="you@email.com">
      </div>
      <div class="field">
        <label class="label">${t("password")}</label>
        <input class="input" id="aPass" type="password" placeholder="your password">
      </div>
      <div class="divider"></div>
      <button class="btn btn--primary w100" id="aSubmit">${t("signIn")}</button>
      <button class="btn btn--ghost w100" id="aSwitch">${t("noAccount")}</button>
      <div class="muted" id="aMsg" style="margin-top:10px;"></div>
      <div class="muted" style="margin-top:8px; font-size:12px;">${t("authDisclaimer")}</div>
    `;
  }

  function openAuth(mode){
    const modal = $("#authModal");
    const title = $("#authTitle");
    const body = $("#authBody");
    if (!modal || !title || !body) return;

    title.textContent = (mode === "register") ? GF_I18N.t("register") : GF_I18N.t("login");
    body.innerHTML = authMarkup(mode);

    const msg = () => $("#aMsg");
    const emailEl = () => $("#aEmail");
    const passEl = () => $("#aPass");

    $("#aSwitch").addEventListener("click", () => openAuth(mode === "register" ? "login" : "register"));

    $("#aSubmit").addEventListener("click", () => {
      const email = (emailEl().value || "").trim().toLowerCase();
      const pass = (passEl().value || "").trim();
      if (!isValidEmail(email)) { msg().textContent = GF_I18N.t("badEmail"); return; }
      if (pass.length < 6) { msg().textContent = GF_I18N.t("passShort"); return; }

      const users = loadUsers();

      if (mode === "register"){
        const pass2 = ($("#aPass2").value || "").trim();
        if (pass !== pass2) { msg().textContent = GF_I18N.t("passMismatch"); return; }
        if (users.some(u => u.email === email)) { msg().textContent = GF_I18N.t("emailExists"); return; }
        users.push({ email, pass });
        saveUsers(users);
        setSession({ email });
        hideModal(modal);
        return;
      }

      const ok = users.find(u => u.email === email && u.pass === pass);
      if (!ok) { msg().textContent = GF_I18N.t("wrongCreds"); return; }
      setSession({ email });
      hideModal(modal);
    });

    showModal(modal);
  }

  function updateAuthUI(){
    const s = getSession();
    const logged = !!s?.email;
    const userBadge = $("#userBadge");
    const btnLogin = $("#btnLogin");
    const btnRegister = $("#btnRegister");
    const btnLogout = $("#btnLogout");

    if (btnLogin) { btnLogin.textContent = GF_I18N.t("login"); btnLogin.hidden = logged; }
    if (btnRegister) { btnRegister.textContent = GF_I18N.t("register"); btnRegister.hidden = logged; }
    if (btnLogout) { btnLogout.textContent = GF_I18N.t("logout"); btnLogout.hidden = !logged; }
    if (userBadge){ userBadge.hidden = !logged; if (logged) userBadge.textContent = s.email; }
  }

  function bindPitch(){
    const openers = $$('[data-open="pitch"]');
    const modal = $("#pitchModal");
    const body = $("#pitchBody");
    const title = $("#pitchTitle");
    if (!modal || !body || !title) return;

    const render = () => {
      title.textContent = GF_I18N.t("pitchTitle");
      body.innerHTML = `
        <div class="pitch">
          <div class="pitch__block">
            <div class="pitch__h">${GF_I18N.t("pitchProblem")}</div>
            <div class="pitch__p">${GF_I18N.t("pitchSolution")}</div>
          </div>
          <div class="pitch__block">
            <div class="pitch__h">${GF_I18N.t("pitchMonetization")}</div>
            <div class="pitch__p">${GF_I18N.t("pitchInvestors")}</div>
          </div>
          <div class="pitch__block">
            <div class="pitch__h">${GF_I18N.t("investorMetrics")}</div>
            <div class="pitch__p grid grid--3">
              <div><div class="muted">${GF_I18N.t("investorMau")}</div><div class="statcard__value">48k</div></div>
              <div><div class="muted">${GF_I18N.t("investorArpu")}</div><div class="statcard__value">$2.9</div></div>
              <div><div class="muted">${GF_I18N.t("investorConv")}</div><div class="statcard__value">3.4%</div></div>
            </div>
          </div>
          <div class="pitch__block">
            <div class="pitch__h">${GF_I18N.t("aboutOwner")}</div>
            <div class="pitch__p">${GF_I18N.t("pitchOwner")}</div>
          </div>
        </div>`;
    };

    openers.forEach(btn => btn.addEventListener("click", () => { render(); showModal(modal); }));
  }

  function setNavActive(page){
    $$('[data-page]').forEach(el => {
      el.classList.toggle("is-active", el.getAttribute("data-page") === page);
    });
  }

  function bindLangToggle(){
    const btn = $("#langToggle");
    if (!btn) return;
    const refresh = () => { btn.textContent = GF_I18N.lang.toUpperCase(); GF_I18N.apply(document); updateAuthUI(); };
    btn.addEventListener("click", () => {
      GF_I18N.setLang(GF_I18N.lang === "uk" ? "en" : "uk");
      refresh();
      document.dispatchEvent(new CustomEvent("gf:lang", { detail: { lang: GF_I18N.lang } }));
    });
    refresh();
  }

  function bindAuthButtons(){
    const btnLogin = $("#btnLogin");
    const btnRegister = $("#btnRegister");
    const btnLogout = $("#btnLogout");
    if (btnLogin) btnLogin.addEventListener("click", () => openAuth("login"));
    if (btnRegister) btnRegister.addEventListener("click", () => openAuth("register"));
    if (btnLogout) btnLogout.addEventListener("click", () => clearSession());
  }

  function bindModalClosers(){
    ["#authModal", "#pitchModal", "#compareModal", "#checkoutModal", "#contactModal"].forEach(sel => bindModalClose($(sel)));
  }

  function initShell(page){
    setNavActive(page);
    bindLangToggle();
    bindAuthButtons();
    bindPitch();
    bindModalClosers();
    updateAuthUI();
  }

  window.GF_SHELL = {
    initShell,
    updateAuthUI,
    showModal,
    hideModal,
    setNavActive,
    openAuth,
    getSession,
    clearSession,
  };
})();
