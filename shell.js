// Shared shell: navigation, language toggle, auth demo, pitch modal
(function(){
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const LS_USERS = "gf_users";
  const LS_SESSION = "gf_session";
  const LS_WISHLIST = "gf_wishlist";
  const LS_CART = "gf_cart";
  const LS_STATS = "gf_stats";

  function toast(msg){
    if (!msg) return;
    let box = $("#toast");
    if (!box){
      box = document.createElement("div");
      box.id = "toast";
      document.body.appendChild(box);
    }
    const item = document.createElement("div");
    item.className = "toast__item";
    item.textContent = msg;
    box.appendChild(item);
    setTimeout(() => { item.classList.add("is-visible"); }, 10);
    setTimeout(() => { item.classList.remove("is-visible"); item.remove(); }, 2200);
  }

  function loadList(key){
    try { return JSON.parse(localStorage.getItem(key) || "[]"); }
    catch { return []; }
  }
  function saveList(key, arr){ localStorage.setItem(key, JSON.stringify(arr)); }

  function listApi(key){
    const get = () => loadList(key);
    const has = (id) => get().includes(id);
    const toggle = (id) => {
      const list = get();
      const exists = list.includes(id);
      const next = exists ? list.filter(x => x !== id) : [...list, id];
      saveList(key, next);
      return { added: !exists, list: next };
    };
    return { get, has, toggle };
  }

  function loadStats(){
    try { return JSON.parse(localStorage.getItem(LS_STATS) || "{\"viewed\":[],\"compared\":[],\"saved\":[]}"); }
    catch { return { viewed: [], compared: [], saved: [] }; }
  }
  function saveStats(stats){ localStorage.setItem(LS_STATS, JSON.stringify(stats)); }
  function pushStat(field, id){
    if (!id) return;
    const stats = loadStats();
    const set = new Set(stats[field] || []);
    set.add(id);
    stats[field] = Array.from(set);
    saveStats(stats);
  }
  function removeStat(field, id){
    const stats = loadStats();
    stats[field] = (stats[field] || []).filter(x => x !== id);
    saveStats(stats);
  }

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
    const userMenuEmail = $("#userMenuEmail");
    const btnLogin = $("#btnLogin");
    const btnRegister = $("#btnRegister");
    const btnLogout = $("#btnLogout");

    if (btnLogin) { btnLogin.textContent = GF_I18N.t("login"); btnLogin.hidden = logged; }
    if (btnRegister) { btnRegister.textContent = GF_I18N.t("register"); btnRegister.hidden = logged; }
    if (btnLogout) { btnLogout.textContent = GF_I18N.t("logout"); btnLogout.hidden = !logged; }
    if (userBadge){ userBadge.hidden = !logged; if (logged) userBadge.textContent = s.email; }
    if (userMenuEmail){ userMenuEmail.textContent = logged ? s.email : "guest@demo.app"; }
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
    const dropdownLogout = $("#dropdownLogout");
    if (btnLogin) btnLogin.addEventListener("click", () => openAuth("login"));
    if (btnRegister) btnRegister.addEventListener("click", () => openAuth("register"));
    if (btnLogout) btnLogout.addEventListener("click", () => clearSession());
    if (dropdownLogout) dropdownLogout.addEventListener("click", () => clearSession());
  }

  function bindModalClosers(){
    ["#authModal", "#pitchModal", "#compareModal", "#checkoutModal", "#contactModal"].forEach(sel => bindModalClose($(sel)));
  }

  function bindDropdown(){
    const toggle = $("#userToggle");
    const dropdown = $("#userDropdown");
    if (!toggle || !dropdown) return;
    const close = () => dropdown.classList.add("hidden");
    toggle.addEventListener("click", () => dropdown.classList.toggle("hidden"));
    toggle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " "){ e.preventDefault(); dropdown.classList.toggle("hidden"); }
      if (e.key === "Escape") close();
    });
    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target) && !toggle.contains(e.target)) close();
    });
    dropdown.querySelectorAll("[data-go]").forEach(btn => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-go");
        if (target === "wishlist") window.location.href = "account.html#wishlist";
        if (target === "cart") window.location.href = "account.html#cart";
      });
    });
  }

  function bindDrawer(){
    const drawer = $("#navDrawer");
    const btn = $("#btnMenu");
    if (!drawer || !btn) return;
    const backdrop = drawer.querySelector(".drawer__backdrop");
    const closeBtns = drawer.querySelectorAll("[data-close=\"drawer\"]");
    const open = () => drawer.classList.add("is-open");
    const close = () => drawer.classList.remove("is-open");
    btn.addEventListener("click", open);
    closeBtns.forEach(b => b.addEventListener("click", close));
    backdrop?.addEventListener("click", close);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
    drawer.querySelectorAll("[data-drawer]").forEach(el => {
      el.addEventListener("click", () => {
        const act = el.getAttribute("data-drawer");
        if (act === "wishlist") window.location.href = "account.html#wishlist";
        if (act === "compare"){
          if (document.body?.dataset?.page === "catalog"){
            document.dispatchEvent(new CustomEvent("gf:openCompare"));
          }else{
            window.location.href = "index.html#compare";
          }
        }
        close();
      });
    });
  }

  function initShell(page){
    setNavActive(page);
    bindLangToggle();
    bindAuthButtons();
    bindPitch();
    bindModalClosers();
    bindDropdown();
    bindDrawer();
    updateAuthUI();
  }

  const wishlistApi = listApi(LS_WISHLIST);
  const cartApi = listApi(LS_CART);

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

  window.GF_STORE = {
    wishlist: {
      get: wishlistApi.get,
      has: wishlistApi.has,
      toggle: (id) => {
        const { added, list } = wishlistApi.toggle(id);
        pushStat("saved", id);
        document.dispatchEvent(new CustomEvent("gf:wishlist", { detail: { ids: list, added, id } }));
        toast(added ? GF_I18N.t("wishlistAdded") : GF_I18N.t("wishlistRemoved"));
        return added;
      }
    },
    cart: {
      get: cartApi.get,
      has: cartApi.has,
      toggle: (id) => {
        const { added, list } = cartApi.toggle(id);
        document.dispatchEvent(new CustomEvent("gf:cart", { detail: { ids: list, added, id } }));
        toast(added ? GF_I18N.t("cartAdded") : GF_I18N.t("cartRemoved"));
        return added;
      }
    },
    stats: {
      get: loadStats,
      view: (id) => pushStat("viewed", id),
      compareAdd: (id) => pushStat("compared", id),
      compareRemove: (id) => removeStat("compared", id),
      save: (id) => pushStat("saved", id)
    },
    toast
  };
})();
