(function(){
  const data = Array.isArray(window.GF_DATA) ? window.GF_DATA : [];
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const t = (k) => window.GF_I18N.t(k);
  const clamp = (n,a,b) => Math.max(a, Math.min(b, n));
  const safeNum = (v, def=0) => Number.isFinite(Number(v)) ? Number(v) : def;
  const fmtMoney = (n) => `$${Math.round(safeNum(n, 0))}`;

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
  const nameOf = (g) => g?.name?.[GF_I18N.lang] || g?.name?.en || g?.id || "—";

  function renderStats(){
    const stats = window.GF_STORE?.stats?.get() || { viewed: [], compared: [], saved: [] };
    $("#statViewed").textContent = stats.viewed?.length || 0;
    $("#statSaved").textContent = stats.saved?.length || 0;
    $("#statCompared").textContent = stats.compared?.length || 0;
  }

  function renderHeroMeta(){
    const emailEl = $("#accountEmail");
    const wishCount = $("#wishCount");
    const cartCount = $("#cartCount");
    const compareCount = $("#compareCount");
    const session = window.GF_SHELL?.getSession?.();
    if (emailEl) emailEl.textContent = session?.email || "guest@demo.app";
    if (wishCount) wishCount.textContent = window.GF_STORE?.wishlist?.get()?.length || 0;
    if (cartCount) cartCount.textContent = window.GF_STORE?.cart?.get()?.length || 0;
    if (compareCount){
      const ids = (() => { try{ return JSON.parse(localStorage.getItem("gf_compare_ids") || "[]"); }catch{return [];} })();
      compareCount.textContent = ids.length;
    }
  }

  function renderList(targetId, ids, emptyKey){
    const wrap = $("#"+targetId);
    if (!wrap) return;
    if (!ids?.length){
      wrap.innerHTML = `<div class="empty">${t(emptyKey)}</div>`;
      return;
    }
    const items = ids.map(id => data.find(g => g.id === id)).filter(Boolean);
    wrap.innerHTML = items.map(g => `
      <div class="listrow">
        <div class="listrow__cover"><img src="${g.coverUrl}" alt="${nameOf(g)}"></div>
        <div class="listrow__meta">
          <div class="listrow__title">${nameOf(g)}</div>
          <div class="muted">${g.genre || ""} · ${g.model || ""}</div>
        </div>
        <div class="listrow__price">
          <div class="price">${fmtMoney(priceNow(g))}</div>
          <div class="muted">-${discountPct(g)}%</div>
        </div>
        <div class="listrow__actions">
          <a class="chip chip--mini" href="game.html?id=${encodeURIComponent(g.id)}">${t("viewDetails")}</a>
          <button class="chip chip--mini" data-remove="${g.id}">${t("remove")}</button>
        </div>
      </div>`).join("");
    wrap.querySelectorAll("[data-remove]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-remove");
        if (targetId === "wishlistList") window.GF_STORE?.wishlist?.toggle(id);
        if (targetId === "cartList") window.GF_STORE?.cart?.toggle(id);
        refresh();
      });
    });
  }

  function applyAnchorFocus(){
    if (location.hash === "#wishlist") $("#wishlistSection")?.scrollIntoView({ behavior: "smooth" });
    if (location.hash === "#cart") $("#cartSection")?.scrollIntoView({ behavior: "smooth" });
  }

  function refresh(){
    GF_I18N.apply(document);
    renderHeroMeta();
    renderStats();
    renderList("wishlistList", window.GF_STORE?.wishlist?.get() || [], "wishlistEmpty");
    renderList("cartList", window.GF_STORE?.cart?.get() || [], "cartEmpty");
  }

  document.addEventListener("DOMContentLoaded", () => {
    window.GF_SHELL.initShell("account");
    refresh();
    applyAnchorFocus();
    document.addEventListener("gf:wishlist", refresh);
    document.addEventListener("gf:cart", refresh);
    document.addEventListener("gf:lang", refresh);
  });
})();
