// Marketplace / Top-up interactions
// Depends on: i18n.js, shell.js, market-data.js
(function(){
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const data = window.GF_MARKET_DATA || { topupProducts: [], demoListings: [] };

  const state = {
    tab: "topup",
    product: data.topupProducts[0]?.id || "",
    region: data.topupProducts[0]?.regions?.[0] || "",
    amount: data.topupProducts[0]?.amounts?.[0] || 0,
    customAmount: "",
    checkoutMode: "demo"
  };

  const t = (k) => window.GF_I18N.t(k);

  const dom = {
    tabs: $$('[data-tab]'),
    tabPanels: $$('[data-panel]'),
    serviceSelect: $("#serviceSelect"),
    regionSelect: $("#regionSelect"),
    amountSelect: $("#amountSelect"),
    customAmount: $("#customAmount"),
    checkoutBtn: $("#checkoutBtn"),
    checkoutMode: $$('[name="checkoutMode"]'),
    listingWrap: $("#listingWrap"),
    listingSearch: $("#listingSearch"),
    listingType: $("#listingType"),
    checkoutModal: $("#checkoutModal"),
    checkoutBody: $("#checkoutBody"),
    disclaimer: $("#marketDisclaimer")
  };

  function nameOfProduct(p){ return p?.name?.[GF_I18N.lang] || p?.name?.en || p?.id; }

  function renderTabs(){
    dom.tabs.forEach(btn => {
      const tab = btn.getAttribute("data-tab");
      btn.classList.toggle("is-active", tab === state.tab);
      btn.addEventListener("click", () => switchTab(tab));
    });
  }

  function switchTab(tab){
    state.tab = tab;
    dom.tabs.forEach(btn => btn.classList.toggle("is-active", btn.getAttribute("data-tab") === tab));
    dom.tabPanels.forEach(panel => panel.classList.toggle("hidden", panel.getAttribute("data-panel") !== tab));
  }

  function renderTopupSelectors(){
    if (!dom.serviceSelect) return;
    dom.serviceSelect.innerHTML = "";
    data.topupProducts.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = nameOfProduct(p);
      dom.serviceSelect.appendChild(opt);
    });
    dom.serviceSelect.value = state.product;
    dom.serviceSelect.addEventListener("change", () => {
      state.product = dom.serviceSelect.value;
      const prod = data.topupProducts.find(x => x.id === state.product);
      state.region = prod?.regions?.[0] || "";
      state.amount = prod?.amounts?.[0] || 0;
      state.customAmount = "";
      if (dom.customAmount) dom.customAmount.value = "";
      renderRegions();
      renderAmounts();
      renderSummary();
    });
    renderRegions();
    renderAmounts();
  }

  function renderRegions(){
    const prod = data.topupProducts.find(x => x.id === state.product);
    dom.regionSelect.innerHTML = "";
    (prod?.regions || []).forEach(r => {
      const opt = document.createElement("option");
      opt.value = r; opt.textContent = r; dom.regionSelect.appendChild(opt);
    });
    state.region = state.region || prod?.regions?.[0] || "";
    dom.regionSelect.value = state.region;
    dom.regionSelect.addEventListener("change", () => { state.region = dom.regionSelect.value; renderSummary(); });
  }

  function renderAmounts(){
    const prod = data.topupProducts.find(x => x.id === state.product);
    dom.amountSelect.innerHTML = "";
    (prod?.amounts || []).forEach(a => {
      const opt = document.createElement("option");
      opt.value = a; opt.textContent = `${a} ${prod.currency}`;
      dom.amountSelect.appendChild(opt);
    });
    state.amount = state.amount || prod?.amounts?.[0] || 0;
    dom.amountSelect.value = state.amount;
    dom.amountSelect.addEventListener("change", () => { state.amount = Number(dom.amountSelect.value); state.customAmount = ""; if (dom.customAmount) dom.customAmount.value = ""; renderSummary(); });
  }

  function calcPrice(){
    const prod = data.topupProducts.find(x => x.id === state.product);
    const amount = state.customAmount ? Number(state.customAmount) : Number(state.amount || 0);
    const rate = prod?.rate || 1;
    const fee = 0.035; // 3.5% acquiring buffer
    const base = amount * rate;
    const total = base + base * fee;
    return { amount, currency: prod?.currency || "USD", total: Math.max(0, total.toFixed(2)) };
  }

  function renderSummary(){
    const summary = $("#topupSummary");
    if (!summary) return;
    const prod = data.topupProducts.find(x => x.id === state.product);
    const { amount, currency, total } = calcPrice();
    summary.innerHTML = `
      <div class="statrow statrow--inline">
        <div class="statcard">
          <div class="statcard__label">${t("topupService")}</div>
          <div class="statcard__value">${nameOfProduct(prod)}</div>
          <div class="statcard__hint">${state.region}</div>
        </div>
        <div class="statcard">
          <div class="statcard__label">${t("topupAmount")}</div>
          <div class="statcard__value">${amount} ${currency}</div>
          <div class="statcard__hint">fx ×${prod?.rate || 1}</div>
        </div>
        <div class="statcard">
          <div class="statcard__label">Total (incl. fee)</div>
          <div class="statcard__value">$${total}</div>
          <div class="statcard__hint">${t("topupTest")}</div>
        </div>
      </div>`;
  }

  function bindCheckout(){
    dom.checkoutMode.forEach(r => r.addEventListener("change", () => { state.checkoutMode = r.value; }));
    dom.customAmount?.addEventListener("input", () => { state.customAmount = dom.customAmount.value; renderSummary(); });
    dom.checkoutBtn?.addEventListener("click", () => {
      const { amount, currency, total } = calcPrice();
      const body = dom.checkoutBody;
      if (!body) return;
      body.innerHTML = `
        <div class="pitch">
          <div class="pitch__block">
            <div class="pitch__h">${t("checkoutDemoTitle")}</div>
            <div class="pitch__p">${t("checkoutDemoCopy")}</div>
          </div>
          <div class="pitch__block">
            <div class="pitch__h">${t("topupService")}</div>
            <div class="pitch__p">${nameOfProduct(data.topupProducts.find(p => p.id === state.product))} · ${state.region}</div>
          </div>
          <div class="pitch__block">
            <div class="pitch__h">${t("topupAmount")}</div>
            <div class="pitch__p">${amount} ${currency} → $${total} (${state.checkoutMode})</div>
          </div>
          <div class="pitch__block">
            <div class="pitch__h">${t("checkoutDone")}</div>
            <div class="pitch__p">success.html / cancel.html можна підключити як success_url / cancel_url у Stripe.</div>
          </div>
        </div>`;
      GF_SHELL.showModal(dom.checkoutModal);
    });
  }

  function renderListings(){
    const query = (dom.listingSearch?.value || "").toLowerCase();
    const type = dom.listingType?.value || "";
    const items = data.demoListings.filter(l => {
      const text = `${l.title?.[GF_I18N.lang] || l.title?.en} ${l.game}`.toLowerCase();
      const okQ = !query || text.includes(query);
      const okType = !type || l.type === type;
      return okQ && okType;
    });
    if (!dom.listingWrap) return;
    if (!items.length){
      dom.listingWrap.innerHTML = `<div class="empty">${t("marketEmpty")}</div>`;
      return;
    }
    dom.listingWrap.innerHTML = items.map(item => `
      <article class="card">
        <div class="card__head">
          <span class="badge badge--primary">${t("marketBadge")}</span>
          <span class="chip chip--mini chip--ghost">${item.type}</span>
        </div>
        <div class="card__title">${item.title?.[GF_I18N.lang] || item.title?.en}</div>
        <div class="muted">${item.game} · ${item.platform}</div>
        <div class="card__meta">
          <span class="tag tag--glow">${item.badge}</span>
          <span class="price">$${item.priceUSD}</span>
        </div>
        <div class="muted" style="font-size:12px;">${t("marketDisclaimer")}</div>
      </article>`).join("");
  }

  function bindListingFilters(){
    dom.listingSearch?.addEventListener("input", renderListings);
    dom.listingType?.addEventListener("change", renderListings);
  }

  function applyTranslations(){
    GF_I18N.apply(document);
    const ph = dom.listingSearch?.getAttribute("data-i18n-placeholder");
    if (ph && dom.listingSearch) dom.listingSearch.placeholder = t(ph);
    if (dom.disclaimer) dom.disclaimer.textContent = t("marketDisclaimer");
  }

  function init(){
    GF_SHELL.initShell("market");
    renderTabs();
    switchTab(state.tab);
    renderTopupSelectors();
    renderSummary();
    bindCheckout();
    renderListings();
    bindListingFilters();
    applyTranslations();
    document.addEventListener("gf:lang", () => {
      applyTranslations();
      renderSummary();
      renderListings();
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
