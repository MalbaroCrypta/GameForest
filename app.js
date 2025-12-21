// GameForest Catalog logic (table + filters + compare)
// Depends on: i18n.js, shell.js, data.js
(function(){
  const data = Array.isArray(window.GF_DATA) ? window.GF_DATA : [];
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const clamp = (n,a,b) => Math.max(a, Math.min(b, n));
  const safeNum = (v, def=0) => Number.isFinite(Number(v)) ? Number(v) : def;
  const LS_FILTERS = "gf_filters";
  const LS_COMPARE = "gf_compare_ids";

  const state = {
    q: "",
    platform: "",
    genre: "",
    model: "",
    priceMax: "",
    onlyTop: false,
    sortKey: "discount",
    sortDir: "desc",
    pageSize: 50,
    pageIndex: 0,
    compare: new Set(),
  };

  const dom = {
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
    tbody: $("#gamesTbody"),
    thSort: $$("#gamesTable thead th[data-sort]"),
    kpiCount: $("#kpiCount"),
    prevPage: $("#prevPage"),
    nextPage: $("#nextPage"),
    pageInfo: $("#pageInfo"),
    chips: $("#activeChips"),
    langToggle: $("#langToggle"),
    openCompare: $("#openCompare"),
    openPitch: $("#openPitch"),
    sidebar: $(".sidebar"),
    sidebarBackdrop: $("#sidebarBackdrop"),
    btnMenu: $("#btnMenu"),
    mobileHint: $("#mobileHint"),
    compareModal: $("#compareModal"),
    compareBody: $("#compareBody"),
  };

  // ---- helpers ----
  const t = (k) => window.GF_I18N.t(k);
  const nameOf = (g) => (g?.name?.[GF_I18N.lang] || g?.name?.en || g?.id || "—");
  const goToDetail = (id) => {
    if (!id) return;
    window.location.href = `game.html?id=${encodeURIComponent(id)}`;
  };
  const discountPct = (g) => {
    const sentiment = safeNum(g?.metrics?.sentiment, 70);
    const demand = safeNum(g?.metrics?.demandIndex, 70);
    const stability = safeNum(g?.metrics?.priceStability, 70);
    let base = 40 + (100 - stability) * 0.35 + (demand - 50) * 0.12 - (sentiment - 50) * 0.08;
    base = clamp(base, 10, 90);
    return Math.round(base);
  };
  const priceNow = (g) => {
    const base = safeNum(g?.basePriceUSD, 0);
    const disc = discountPct(g);
    return Math.max(0, Math.round(base * (1 - disc/100)));
  };
  const rating = (g) => clamp(Math.round(safeNum(g?.metrics?.sentiment, 0)), 0, 100);
  const fmtMoney = (n) => `$${Math.round(safeNum(n, 0))}`;

  // ---- filter options ----
  function buildSelectOptions(){
    const opt = (value, label) => {
      const o = document.createElement("option"); o.value = value; o.textContent = label; return o; };
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

    dom.platform.value = state.platform;
    dom.genre.value = state.genre;
    dom.model.value = state.model;
  }

  // ---- filtering ----
  function applyStateFromUI(){
    state.q = (dom.q?.value || "").trim();
    state.platform = dom.platform?.value || "";
    state.genre = dom.genre?.value || "";
    state.model = dom.model?.value || "";
    state.priceMax = dom.priceMax?.value || "";
    state.onlyTop = !!dom.onlyTop?.checked;
    state.pageSize = safeNum(dom.pageSize?.value, 50);
    state.pageIndex = 0;
    saveFilters();
  }

  function saveFilters(){
    try{
      const { q, platform, genre, model, priceMax, onlyTop, pageSize } = state;
      localStorage.setItem(LS_FILTERS, JSON.stringify({ q, platform, genre, model, priceMax, onlyTop, pageSize }));
    }catch{}
  }

  function saveCompare(){
    try{
      localStorage.setItem(LS_COMPARE, JSON.stringify(Array.from(state.compare)));
    }catch{}
  }

  function loadFilters(){
    try{
      const raw = localStorage.getItem(LS_FILTERS);
      if (!raw) return;
      const v = JSON.parse(raw);
      Object.assign(state, v);
      if (dom.q) dom.q.value = state.q;
      if (dom.platform) dom.platform.value = state.platform;
      if (dom.genre) dom.genre.value = state.genre;
      if (dom.model) dom.model.value = state.model;
      if (dom.priceMax) dom.priceMax.value = state.priceMax;
      if (dom.onlyTop) dom.onlyTop.checked = state.onlyTop;
      if (dom.pageSize) dom.pageSize.value = state.pageSize;
    }catch{}
  }

  function loadCompare(){
    try{
      const raw = JSON.parse(localStorage.getItem(LS_COMPARE) || "[]");
      if (Array.isArray(raw)) state.compare = new Set(raw);
    }catch{}
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

  // ---- sorting ----
  function sortItems(items){
    const dir = state.sortDir === "asc" ? 1 : -1;
    const key = state.sortKey;
    const getter = (g) => {
      if (key === "name") return nameOf(g).toLowerCase();
      if (key === "discount") return discountPct(g);
      if (key === "price") return priceNow(g);
      if (key === "sentiment") return rating(g);
      return 0;
    };
    return items.slice().sort((a,b) => {
      const av = getter(a), bv = getter(b);
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return nameOf(a).localeCompare(nameOf(b));
    });
  }

  // ---- chips ----
  function renderChips(){
    const chips = [];
    if (state.q) chips.push({ k:"q", label:`q: ${state.q}` });
    if (state.platform) chips.push({ k:"platform", label: state.platform });
    if (state.genre) chips.push({ k:"genre", label: state.genre });
    if (state.model) chips.push({ k:"model", label: state.model });
    if (state.priceMax) chips.push({ k:"priceMax", label:`≤ $${state.priceMax}` });
    if (state.onlyTop) chips.push({ k:"onlyTop", label: t("badgeTop") });

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

  // ---- table ----
  function renderTable(items){
    if (!data.length){
      dom.kpiCount.textContent = "0";
      dom.pageInfo.textContent = "1 / 1";
      dom.tbody.innerHTML = `<tr><td colspan="6" class="empty">${t("emptyData")}</td></tr>`;
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
      const topLabel = t("badgeTop");
      const tags = [];
      if (g.topPick) tags.push(`<span class="tag tag--glow">${topLabel}</span>`);
      if (g.model) tags.push(`<span class="tag">${g.model}</span>`);
      const platformsHtml = plats.slice(0,3).map(p => `<span class="chip chip--mini chip--ghost">${p}</span>`).join("") + (plats.length > 3 ? `<span class="chip chip--mini chip--ghost">+${plats.length - 3}</span>` : "");
      tr.innerHTML = `
        <td>
          <div class="covercell">
            <img loading="lazy" src="${g.coverUrl || ""}" alt="${nameOf(g)}">
          </div>
        </td>
        <td title="${nameOf(g)}">
          <div class="namecell">
            <div class="namecell__title"><a class="link--ghost" data-action="detail" href="game.html?id=${encodeURIComponent(g.id)}">${nameOf(g)}</a></div>
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
        <td><div class="platlist">${platformsHtml}</div></td>`;
      if (state.compare.has(g.id)) tr.classList.add("is-selected");
      tr.addEventListener("click", () => goToDetail(g.id));
      const compareBtn = document.createElement("button");
      compareBtn.className = "btn btn--ghost btn--mini";
      compareBtn.textContent = state.compare.has(g.id) ? t("compareToggle") : t("compareBtn");
      compareBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        if (state.compare.has(g.id)) state.compare.delete(g.id);
        else {
          if (state.compare.size >= 4) state.compare.delete(state.compare.values().next().value);
          state.compare.add(g.id);
        }
        saveCompare();
        render();
      });
      const tdActions = document.createElement("td");
      tdActions.appendChild(compareBtn);
      tr.appendChild(tdActions);
      dom.tbody.appendChild(tr);
    });
  }

  // ---- compare modal ----
  function renderCompareModal(){
    const items = Array.from(state.compare).map(id => data.find(x => x.id === id)).filter(Boolean);
    if (!items.length || !dom.compareBody) return;
    if (items.length < 2){
      dom.compareBody.innerHTML = `<div class="empty">${t("compareHint")}</div>`;
      return;
    }
    const rows = [
      [t("priceNow"), items.map(g => fmtMoney(priceNow(g)))],
      [t("discount"), items.map(g => `-${discountPct(g)}%`)],
      [t("rating"), items.map(g => `${rating(g)}%`)],
      [t("demand"), items.map(g => `${safeNum(g?.metrics?.demandIndex,0)}/100`)],
      [t("stability"), items.map(g => `${safeNum(g?.metrics?.priceStability,0)}/100`)],
      [t("health"), items.map(g => `${safeNum(g?.metrics?.communityHealth,0)}/100`)],
      [t("platforms"), items.map(g => (g.platforms || []).join(", "))],
      [t("model"), items.map(g => g.model || "—")],
      [t("genre"), items.map(g => g.genre || "—")],
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
      <button class="btn btn--ghost w100" id="cmpClear">${t("compareClear")}</button>`;
    $("#cmpClear")?.addEventListener("click", () => { state.compare.clear(); render(); renderCompareModal(); });
  }

  function applyStaticLabels(){
    if (dom.q) dom.q.placeholder = t("searchPlaceholder");
    const ths = $$("#gamesTable thead th");
    if (ths[1]) ths[1].textContent = t("thName");
    if (ths[2]) ths[2].textContent = t("thOff");
    if (ths[3]) ths[3].textContent = t("thPrice");
    if (ths[4]) ths[4].textContent = t("thRating");
    if (ths[5]) ths[5].textContent = t("thPlatforms");
    if (ths[6]) ths[6].textContent = t("compareBtn");
    $$("[data-i18n]").forEach(() => GF_I18N.apply(document));
  }

  function render(){
    applyStaticLabels();
    renderChips();
    const items = sortItems(filtered());
    renderTable(items);
  }

  // ---- events ----
  function bindEvents(){
    if (dom.btnMenu) dom.btnMenu.addEventListener("click", () => toggleSidebar(true));
    if (dom.sidebarBackdrop) dom.sidebarBackdrop.addEventListener("click", () => toggleSidebar(false));
    dom.applyFilters?.addEventListener("click", () => { applyStateFromUI(); render(); toggleSidebar(false); });
    dom.clearFilters?.addEventListener("click", () => {
      state.q = ""; dom.q.value = "";
      state.platform = ""; dom.platform.value = "";
      state.genre = ""; dom.genre.value = "";
      state.model = ""; dom.model.value = "";
      state.priceMax = ""; dom.priceMax.value = "";
      state.onlyTop = false; dom.onlyTop.checked = false;
      state.pageIndex = 0;
      saveFilters();
      render(); toggleSidebar(false);
    });
    dom.q?.addEventListener("input", () => { state.q = (dom.q.value || "").trim(); state.pageIndex = 0; saveFilters(); render(); });
    dom.btnSearch?.addEventListener("click", () => { applyStateFromUI(); render(); });
    dom.pageSize?.addEventListener("change", () => { state.pageSize = safeNum(dom.pageSize.value, 50); state.pageIndex = 0; render(); });
    dom.prevPage?.addEventListener("click", () => { state.pageIndex = Math.max(0, state.pageIndex - 1); render(); });
    dom.nextPage?.addEventListener("click", () => { state.pageIndex += 1; render(); });
    dom.thSort.forEach(th => th.addEventListener("click", () => {
      const key = th.getAttribute("data-sort");
      if (!key) return;
      if (state.sortKey === key) state.sortDir = (state.sortDir === "asc") ? "desc" : "asc";
      else { state.sortKey = key; state.sortDir = "desc"; }
      render();
    }));
    dom.langToggle?.addEventListener("click", () => { /* handled by shell */ });
    dom.openPitch?.addEventListener("click", () => {});
    dom.openCompare?.addEventListener("click", () => { renderCompareModal(); GF_SHELL.showModal(dom.compareModal); });
    window.addEventListener("resize", updateMobileHint);
  }

  function updateMobileHint(){
    if (!dom.mobileHint) return;
    dom.mobileHint.textContent = t("mobileHint");
  }

  function toggleSidebar(open){
    if (!dom.sidebar) return;
    dom.sidebar.classList.toggle("is-open", open);
    document.body.classList.toggle("sidebar-open", open);
    if (dom.sidebarBackdrop) dom.sidebarBackdrop.classList.toggle("is-visible", open);
  }

  function init(){
    GF_SHELL.initShell("catalog");
    buildSelectOptions();
    loadFilters();
    loadCompare();
    bindEvents();
    updateMobileHint();
    render();
    document.addEventListener("gf:lang", () => {
      buildSelectOptions();
      render();
      updateMobileHint();
      GF_SHELL.updateAuthUI();
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
