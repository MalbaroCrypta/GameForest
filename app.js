// GameForest Demo — SteamDB-ish UI (table + filters + compare + auth demo)
// Requires: data.js defines: window.GF_DATA = [ ... ]

window.GF = (() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const safeNum = (v, def = 0) => Number.isFinite(Number(v)) ? Number(v) : def;

  const data = Array.isArray(window.GF_DATA) ? window.GF_DATA : [];

  // ---------- State ----------
  const state = {
    page: "home",
    lang: "uk",

    // filters
    q: "",
    platform: "",
    genre: "",
    model: "",
    priceMax: "",
    onlyTop: false,

    // table
    sortKey: "discount",
    sortDir: "desc",
    pageSize: 50,
    pageIndex: 0,

    // compare selection (max 4)
    compare: new Set(),
  };

  // ---------- i18n (minimal) ----------
  const I18N = {
    uk: {
      any: "Усі",
      searchPh: "Пошук гри...",
      name: "Name",
      off: "% Off",
      price: "Price",
      rating: "Rating",
      platforms: "Platforms",
      emptyData: "Нема даних. Перевір, що у data.js є: window.GF_DATA = [...]",
      compareHint: "Додай мінімум 2 гри: клікни по рядках у таблиці (вони підсвітяться).",
      compareTitle: "Compare",
      comparePicked: "Вибрано",
      compareClear: "Очистити вибір",
      login: "Вхід",
      register: "Реєстрація",
      logout: "Вийти",
      email: "Email",
      password: "Пароль",
      password2: "Повтор пароля",
      createAccount: "Створити акаунт",
      haveAccount: "У мене вже є акаунт",
      signIn: "Увійти",
      noAccount: "Створити акаунт",
      badEmail: "Невірний email.",
      passShort: "Пароль має бути мінімум 6 символів.",
      passMismatch: "Паролі не співпадають.",
      emailExists: "Такий email вже зареєстрований.",
      wrongCreds: "Неправильний email або пароль.",
      pitchHtml: `
        <div class="pitch">
          <div class="pitch__block">
            <div class="pitch__h">Проблема</div>
            <div class="pitch__p">Дані по іграх розкидані по магазинах і платформах — важко швидко порівняти.</div>
          </div>
          <div class="pitch__block">
            <div class="pitch__h">Рішення</div>
            <div class="pitch__p">Єдина панель: таблиця, фільтри, “best deal”, compare — висновок за 30 секунд.</div>
          </div>
          <div class="pitch__block">
            <div class="pitch__h">Монетизація</div>
            <div class="pitch__p">B2B підписка / API / партнерські інтеграції.</div>
          </div>
          <div class="pitch__block">
            <div class="pitch__h">Власник</div>
            <div class="pitch__p"><strong>Malbaro</strong> — founder, product vision.</div>
          </div>
        </div>
      `,
    },
    en: {
      any: "All",
      searchPh: "Search game...",
      name: "Name",
      off: "% Off",
      price: "Price",
      rating: "Rating",
      platforms: "Platforms",
      emptyData: "No data. Check data.js has: window.GF_DATA = [...]",
      compareHint: "Pick at least 2 games: click rows in the table (they will highlight).",
      compareTitle: "Compare",
      comparePicked: "Selected",
      compareClear: "Clear selection",
      login: "Login",
      register: "Register",
      logout: "Logout",
      email: "Email",
      password: "Password",
      password2: "Confirm password",
      createAccount: "Create account",
      haveAccount: "I already have an account",
      signIn: "Sign in",
      noAccount: "Create account",
      badEmail: "Invalid email.",
      passShort: "Password must be at least 6 characters.",
      passMismatch: "Passwords do not match.",
      emailExists: "This email is already registered.",
      wrongCreds: "Wrong email or password.",
      pitchHtml: `
        <div class="pitch">
          <div class="pitch__block">
            <div class="pitch__h">Problem</div>
            <div class="pitch__p">Game data is scattered across stores and platforms — hard to compare quickly.</div>
          </div>
          <div class="pitch__block">
            <div class="pitch__h">Solution</div>
            <div class="pitch__p">One dashboard: table, filters, “best deal”, compare — conclusion in 30 seconds.</div>
          </div>
          <div class="pitch__block">
            <div class="pitch__h">Monetization</div>
            <div class="pitch__p">B2B subscription / API / partner integrations.</div>
          </div>
          <div class="pitch__block">
            <div class="pitch__h">Owner</div>
            <div class="pitch__p"><strong>Malbaro</strong> — founder, product vision.</div>
          </div>
        </div>
      `,
    }
  };
  const t = (k) => (I18N[state.lang] && I18N[state.lang][k]) ? I18N[state.lang][k] : k;

  // ---------- DOM ----------
  const dom = {
    // pages
    pageHome: $("#page-home"),
    pageAbout: $("#page-about"),
    navBtns: $$(".topnav__btn"),

    // layout toggles
    btnMenu: $("#btnMenu"),
    sidebar: $(".sidebar"),
    sidebarBackdrop: $("#sidebarBackdrop"),

    // filters
    q: $("#q"),
    btnSearch: $("#btnSearch"),
    platform: $("#platform"),
    genre: $("#genre"),
    model: $("#model"),
    priceMax: $("#priceMax"),
    onlyTop: $("#onlyTop"),
    applyFilters: $("#applyFilters"),
    clearFilters: $("#clearFilters"),
    pageSize: $("#pageSize"),

    // table
    tbody: $("#gamesTbody"),
    thSort: $$("#gamesTable thead th[data-sort]"),
    kpiCount: $("#kpiCount"),
    prevPage: $("#prevPage"),
    nextPage: $("#nextPage"),
    pageInfo: $("#pageInfo"),
    chips: $("#activeChips"),

    // topbar / misc
    langToggle: $("#langToggle"),

    // quick actions
    openCompare: $("#openCompare"),
    openPitch: $("#openPitch"),

    // modals
    compareModal: $("#compareModal"),
    compareBody: $("#compareBody"),
    pitchModal: $("#pitchModal"),
    pitchBody: $("#pitchBody"),

    authModal: $("#authModal"),
    authTitle: $("#authTitle"),
    authBody: $("#authBody"),

    // auth buttons
    btnLogin: $("#btnLogin"),
    btnRegister: $("#btnRegister"),
    btnLogout: $("#btnLogout"),
    userBadge: $("#userBadge"),
  };

  // ---------- Modal helpers ----------
  function showModal(el){ if(el) el.classList.remove("hidden"); }
  function hideModal(el){ if(el) el.classList.add("hidden"); }

  function bindModalClose(modalEl){
    if (!modalEl) return;
    modalEl.addEventListener("click", (e) => {
      const target = e.target;
      if (target.classList && target.classList.contains("modal__backdrop")) hideModal(modalEl);
      if (target.getAttribute && target.getAttribute("data-close") === "1") hideModal(modalEl);
    });
  }

  // ---------- Nav ----------
  function setActiveNav(page){
    dom.navBtns.forEach(btn => {
      btn.classList.toggle("is-active", btn.getAttribute("data-page") === page);
    });
  }
  function setSidebar(open){
    if (!dom.sidebar) return;
    dom.sidebar.classList.toggle("is-open", open);
    if (dom.sidebarBackdrop) dom.sidebarBackdrop.classList.toggle("is-visible", open);
    document.body.classList.toggle("sidebar-open", open);
  }
  function nav(page){
    state.page = page;
    setActiveNav(page);
    setSidebar(false);
    if (page === "home"){
      dom.pageHome.classList.remove("hidden");
      dom.pageAbout.classList.add("hidden");
    } else {
      dom.pageHome.classList.add("hidden");
      dom.pageAbout.classList.remove("hidden");
    }
  }

  // ---------- Data helpers (demo calculations) ----------
  function nameOf(g){
    return (g?.name?.[state.lang] || g?.name?.en || g?.id || "—");
  }
  function discountPct(g){
    const sentiment = safeNum(g?.metrics?.sentiment, 70);
    const demand = safeNum(g?.metrics?.demandIndex, 70);
    const stability = safeNum(g?.metrics?.priceStability, 70);
    // demo logic: less stability => bigger discounts
    let base = 40 + (100 - stability) * 0.35 + (demand - 50) * 0.12 - (sentiment - 50) * 0.08;
    base = clamp(base, 10, 90);
    return Math.round(base);
  }
  function priceNow(g){
    const base = safeNum(g?.basePriceUSD, 0);
    const disc = discountPct(g);
    return Math.max(0, Math.round(base * (1 - disc/100)));
  }
  function rating(g){
    return clamp(Math.round(safeNum(g?.metrics?.sentiment, 0)), 0, 100);
  }
  function fmtMoney(n){ return `$${Math.round(safeNum(n,0))}`; }

  // ---------- Filters options ----------
  function buildSelectOptions(){
    const opt = (value, label) => {
      const o = document.createElement("option");
      o.value = value;
      o.textContent = label;
      return o;
    };

    const platforms = Array.from(new Set(data.flatMap(g => g.platforms || []))).sort();
    const genres = Array.from(new Set(data.map(g => g.genre).filter(Boolean))).sort();
    const models = Array.from(new Set(data.map(g => g.model).filter(Boolean))).sort();

    dom.platform.innerHTML = "";
    dom.platform.appendChild(opt("", t("any")));
    platforms.forEach(p => dom.platform.appendChild(opt(p, p)));

    dom.genre.innerHTML = "";
    dom.genre.appendChild(opt("", t("any")));
    genres.forEach(g => dom.genre.appendChild(opt(g, g)));

    dom.model.innerHTML = "";
    dom.model.appendChild(opt("", t("any")));
    models.forEach(m => dom.model.appendChild(opt(m, m)));

    // restore selected values
    dom.platform.value = state.platform;
    dom.genre.value = state.genre;
    dom.model.value = state.model;
  }

  // ---------- Filtering ----------
  function applyStateFromUI(){
    state.q = (dom.q.value || "").trim();
    state.platform = dom.platform.value || "";
    state.genre = dom.genre.value || "";
    state.model = dom.model.value || "";
    state.priceMax = dom.priceMax.value || "";
    state.onlyTop = !!dom.onlyTop.checked;
    state.pageSize = safeNum(dom.pageSize.value, 50);
    state.pageIndex = 0;
  }

  function filtered(){
    const q = state.q.toLowerCase();
    const maxP = state.priceMax ? safeNum(state.priceMax, null) : null;

    return data.filter(g => {
      const n = nameOf(g).toLowerCase();
      const okQ = !q || n.includes(q);
      const okPlatform = !state.platform || (g.platforms || []).includes(state.platform);
      const okGenre = !state.genre || g.genre === state.genre;
      const okModel = !state.model || g.model === state.model;
      const okTop = !state.onlyTop || !!g.topPick;
      const now = priceNow(g);
      const okPrice = maxP == null || now <= maxP;
      return okQ && okPlatform && okGenre && okModel && okTop && okPrice;
    });
  }

  // ---------- Sorting ----------
  function sortItems(items){
    const dir = state.sortDir === "asc" ? 1 : -1;
    const key = state.sortKey;

    const get = (g) => {
      if (key === "name") return nameOf(g).toLowerCase();
      if (key === "discount") return discountPct(g);
      if (key === "price") return priceNow(g);
      if (key === "sentiment") return rating(g);
      return 0;
    };

    return items.slice().sort((a,b) => {
      const av = get(a), bv = get(b);
      if (av < bv) return -1 * dir;
      if (av > bv) return  1 * dir;
      return nameOf(a).toLowerCase().localeCompare(nameOf(b).toLowerCase());
    });
  }

  // ---------- Chips ----------
  function renderChips(){
    const chips = [];
    if (state.q) chips.push({ k: "q", label: `q: ${state.q}` });
    if (state.platform) chips.push({ k: "platform", label: state.platform });
    if (state.genre) chips.push({ k: "genre", label: state.genre });
    if (state.model) chips.push({ k: "model", label: state.model });
    if (state.priceMax) chips.push({ k: "priceMax", label: `≤ $${state.priceMax}` });
    if (state.onlyTop) chips.push({ k: "onlyTop", label: "Top picks" });

    dom.chips.innerHTML = "";
    chips.forEach(ch => {
      const el = document.createElement("div");
      el.className = "chipitem";
      el.innerHTML = `<span>${ch.label}</span><button title="remove">×</button>`;
      el.querySelector("button").addEventListener("click", () => {
        if (ch.k === "q") { state.q = ""; dom.q.value = ""; }
        if (ch.k === "platform") { state.platform = ""; dom.platform.value = ""; }
        if (ch.k === "genre") { state.genre = ""; dom.genre.value = ""; }
        if (ch.k === "model") { state.model = ""; dom.model.value = ""; }
        if (ch.k === "priceMax") { state.priceMax = ""; dom.priceMax.value = ""; }
        if (ch.k === "onlyTop") { state.onlyTop = false; dom.onlyTop.checked = false; }
        state.pageIndex = 0;
        render();
      });
      dom.chips.appendChild(el);
    });
  }

  // ---------- Table render ----------
  function renderTable(items){
    if (!data.length){
      dom.kpiCount.textContent = "0";
      dom.pageInfo.textContent = "1 / 1";
      dom.tbody.innerHTML = `<tr><td colspan="6" style="color:#93a4b8; padding:14px;">${t("emptyData")}</td></tr>`;
      return;
    }

    const total = items.length;
    dom.kpiCount.textContent = String(total);

    const pages = Math.max(1, Math.ceil(total / state.pageSize));
    state.pageIndex = clamp(state.pageIndex, 0, pages - 1);

    const start = state.pageIndex * state.pageSize;
    const end = Math.min(total, start + state.pageSize);
    const slice = items.slice(start, end);

    dom.pageInfo.textContent = `${state.pageIndex + 1} / ${pages}`;
    dom.prevPage.disabled = state.pageIndex === 0;
    dom.nextPage.disabled = state.pageIndex >= pages - 1;

    dom.tbody.innerHTML = "";

    slice.forEach(g => {
      const tr = document.createElement("tr");

      const disc = discountPct(g);
      const now = priceNow(g);
      const rat = rating(g);
      const plats = g.platforms || [];
      const topLabel = state.lang === "uk" ? "Топ" : "Top";
      const tags = [];
      if (g.topPick) tags.push(`<span class="tag tag--glow">${topLabel}</span>`);
      if (g.model) tags.push(`<span class="tag">${g.model}</span>`);
      const platformsHtml = plats.slice(0,3).map(p => `<span class="chip chip--mini chip--ghost">${p}</span>`).join("") + (plats.length > 3 ? `<span class="chip chip--mini chip--ghost">+${plats.length - 3}</span>` : "");

      tr.innerHTML = `
        <td>
          <div class="covercell">
            <img src="${g.coverUrl || ""}" alt="${nameOf(g)}">
          </div>
        </td>
        <td title="${nameOf(g)}">
          <div class="namecell">
            <div class="namecell__title">${nameOf(g)}</div>
            <div class="namecell__tags">${tags.join("")}</div>
          </div>
        </td>
        <td><span class="badge badge--primary badge--pill">-${disc}%</span></td>
        <td>
          <div class="price">${fmtMoney(now)}</div>
          <div class="muted price__base">$${g.basePriceUSD || 0} base</div>
        </td>
        <td>
          <div class="meter"><div class="meter__fill" style="width:${rat}%"></div></div>
          <div class="meter__label">${rat}%</div>
        </td>
        <td>
          <div class="platlist">${platformsHtml}</div>
        </td>
      `;

      // highlight if selected for compare
      if (state.compare.has(g.id)) tr.classList.add("is-selected");

      // toggle compare selection on row click (max 4)
      tr.addEventListener("click", () => {
        if (state.compare.has(g.id)) state.compare.delete(g.id);
        else {
          if (state.compare.size >= 4) {
            const first = state.compare.values().next().value;
            state.compare.delete(first);
          }
          state.compare.add(g.id);
        }
        render(); // rerender highlights + chips + table
      });

      dom.tbody.appendChild(tr);
    });
  }

  // ---------- Compare modal ----------
  function renderCompareModal(){
    const items = Array.from(state.compare).map(id => data.find(x => x.id === id)).filter(Boolean);

    if (items.length < 2) {
      dom.compareBody.innerHTML = `<div class="empty">${t("compareHint")}</div>`;
      return;
    }

    const rows = [
      ["Price now", items.map(g => fmtMoney(priceNow(g)))],
      ["% Off", items.map(g => `-${discountPct(g)}%`)],
      ["Rating", items.map(g => `${rating(g)}%`)],
      ["Demand", items.map(g => `${safeNum(g?.metrics?.demandIndex,0)}/100`)],
      ["Stability", items.map(g => `${safeNum(g?.metrics?.priceStability,0)}/100`)],
      ["Health", items.map(g => `${safeNum(g?.metrics?.communityHealth,0)}/100`)],
      ["Platforms", items.map(g => (g.platforms || []).join(", "))],
      ["Model", items.map(g => g.model || "—")],
      ["Genre", items.map(g => g.genre || "—")],
    ];

    dom.compareBody.innerHTML = `
      <div class="muted" style="margin-bottom:10px;">
        ${t("comparePicked")}: <strong>${items.length}</strong>
      </div>
      <div class="tablewrap">
        <table class="table">
          <thead>
            <tr>
              <th>Metric</th>
              ${items.map(g => `<th>${nameOf(g)}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${rows.map(([label, vals]) => `
              <tr>
                <td>${label}</td>
                ${vals.map(v => `<td>${v}</td>`).join("")}
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
      <div class="divider"></div>
      <button class="btn btn--ghost w100" id="cmpClear">${t("compareClear")}</button>
    `;

    $("#cmpClear").addEventListener("click", () => {
      state.compare.clear();
      render();
      renderCompareModal();
    });
  }

  // ---------- Static labels ----------
  function applyStaticLabels(){
    dom.q.placeholder = t("searchPh");

    const ths = $$("#gamesTable thead th");
    if (ths[1]) ths[1].textContent = t("name");
    if (ths[2]) ths[2].textContent = t("off");
    if (ths[3]) ths[3].textContent = t("price");
    if (ths[4]) ths[4].textContent = t("rating");
    if (ths[5]) ths[5].textContent = t("platforms");
  }

  // ---------- Auth (DEMO LocalStorage) ----------
  const LS_USERS = "gf_users";
  const LS_SESSION = "gf_session";

  function loadUsers(){
    try { return JSON.parse(localStorage.getItem(LS_USERS) || "[]"); }
    catch { return []; }
  }
  function saveUsers(users){
    localStorage.setItem(LS_USERS, JSON.stringify(users));
  }
  function getSession(){
    try { return JSON.parse(localStorage.getItem(LS_SESSION) || "null"); }
    catch { return null; }
  }
  function setSession(session){
    localStorage.setItem(LS_SESSION, JSON.stringify(session));
    updateAuthUI();
  }
  function clearSession(){
    localStorage.removeItem(LS_SESSION);
    updateAuthUI();
  }
  function isValidEmail(email){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function updateAuthUI(){
    const s = getSession();
    const logged = !!s?.email;

    dom.btnLogin.textContent = t("login");
    dom.btnRegister.textContent = t("register");
    dom.btnLogout.textContent = t("logout");

    dom.btnLogin.hidden = logged;
    dom.btnRegister.hidden = logged;
    dom.btnLogout.hidden = !logged;

    dom.userBadge.hidden = !logged;
    if (logged) dom.userBadge.textContent = s.email;
  }

  function openAuth(mode){ // "login" | "register"
    dom.authTitle.textContent = (mode === "register") ? t("register") : t("login");

    if (mode === "register"){
      dom.authBody.innerHTML = `
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
      `;
    } else {
      dom.authBody.innerHTML = `
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
      `;
    }

    const msgEl = () => $("#aMsg");
    const emailEl = () => $("#aEmail");
    const passEl = () => $("#aPass");

    $("#aSwitch").addEventListener("click", () => openAuth(mode === "register" ? "login" : "register"));

    $("#aSubmit").addEventListener("click", () => {
      const email = (emailEl().value || "").trim().toLowerCase();
      const pass = (passEl().value || "").trim();

      if (!isValidEmail(email)) { msgEl().textContent = t("badEmail"); return; }
      if (pass.length < 6) { msgEl().textContent = t("passShort"); return; }

      const users = loadUsers();

      if (mode === "register"){
        const pass2 = ($("#aPass2").value || "").trim();
        if (pass !== pass2) { msgEl().textContent = t("passMismatch"); return; }
        if (users.some(u => u.email === email)) { msgEl().textContent = t("emailExists"); return; }

        users.push({ email, pass }); // DEMO: plain text
        saveUsers(users);
        setSession({ email });
        hideModal(dom.authModal);
        return;
      }

      const ok = users.find(u => u.email === email && u.pass === pass);
      if (!ok) { msgEl().textContent = t("wrongCreds"); return; }

      setSession({ email });
      hideModal(dom.authModal);
    });

    showModal(dom.authModal);
  }

  // ---------- Render ----------
  function render(){
    applyStaticLabels();
    renderChips();
    const items = sortItems(filtered());
    renderTable(items);
  }

  // ---------- Events ----------
  function bindEvents(){
    // mobile menu toggle
    if (dom.btnMenu) dom.btnMenu.addEventListener("click", () => setSidebar(!dom.sidebar?.classList.contains("is-open")));
    if (dom.sidebarBackdrop) dom.sidebarBackdrop.addEventListener("click", () => setSidebar(false));

    // nav buttons
    dom.navBtns.forEach(btn => {
      btn.addEventListener("click", () => nav(btn.getAttribute("data-page")));
    });

    // apply/reset filters
    dom.applyFilters.addEventListener("click", () => { applyStateFromUI(); render(); setSidebar(false); });
    dom.clearFilters.addEventListener("click", () => {
      state.q = ""; dom.q.value = "";
      state.platform = ""; dom.platform.value = "";
      state.genre = ""; dom.genre.value = "";
      state.model = ""; dom.model.value = "";
      state.priceMax = ""; dom.priceMax.value = "";
      state.onlyTop = false; dom.onlyTop.checked = false;
      state.pageIndex = 0;
      render();
      setSidebar(false);
    });

    // quick search
    dom.q.addEventListener("input", () => {
      state.q = (dom.q.value || "").trim();
      state.pageIndex = 0;
      render();
    });
    if (dom.btnSearch) dom.btnSearch.addEventListener("click", () => { applyStateFromUI(); render(); });

    // page size
    dom.pageSize.addEventListener("change", () => {
      state.pageSize = safeNum(dom.pageSize.value, 50);
      state.pageIndex = 0;
      render();
    });

    // pager
    dom.prevPage.addEventListener("click", () => { state.pageIndex = Math.max(0, state.pageIndex - 1); render(); });
    dom.nextPage.addEventListener("click", () => { state.pageIndex = state.pageIndex + 1; render(); });

    // sorting
    dom.thSort.forEach(th => {
      th.addEventListener("click", () => {
        const key = th.getAttribute("data-sort");
        if (!key) return;
        if (state.sortKey === key) state.sortDir = (state.sortDir === "asc") ? "desc" : "asc";
        else { state.sortKey = key; state.sortDir = "desc"; }
        render();
      });
    });

    // lang toggle
    dom.langToggle.addEventListener("click", () => {
      state.lang = (state.lang === "uk") ? "en" : "uk";
      dom.langToggle.textContent = state.lang.toUpperCase();
      buildSelectOptions();
      updateAuthUI();
      render();
    });

    // modals close
    bindModalClose(dom.authModal);
    bindModalClose(dom.pitchModal);
    bindModalClose(dom.compareModal);

    // pitch open
    dom.openPitch.addEventListener("click", () => {
      dom.pitchBody.innerHTML = I18N[state.lang].pitchHtml;
      showModal(dom.pitchModal);
    });

    // compare open
    dom.openCompare.addEventListener("click", () => {
      renderCompareModal();
      showModal(dom.compareModal);
    });

    // auth
    dom.btnLogin.addEventListener("click", () => openAuth("login"));
    dom.btnRegister.addEventListener("click", () => openAuth("register"));
    dom.btnLogout.addEventListener("click", () => clearSession());
  }

  // ---------- Init ----------
  function init(){
    buildSelectOptions();
    bindEvents();
    updateAuthUI();
    nav("home");
    render();
  }

  init();

  return { nav };
})();
