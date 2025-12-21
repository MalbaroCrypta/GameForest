// Game details page: renders hero, tabs, price chart, and compare toggle
(function(){
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const data = Array.isArray(window.GF_DATA) ? window.GF_DATA : [];

  const metricsOf = (g) => g?.metrics || {};
  const clamp = (n,a,b) => Math.max(a, Math.min(b, n));
  const safeNum = (v, def=0) => Number.isFinite(Number(v)) ? Number(v) : def;
  const fmtMoney = (n) => `$${(Math.round(n*100)/100).toLocaleString(undefined,{ minimumFractionDigits:0, maximumFractionDigits:2 })}`;

  function nameOf(g){ return (g?.name?.[GF_I18N.lang] || g?.name?.en || g?.id || "—"); }
  function discountPct(g){
    const sentiment = safeNum(metricsOf(g).sentiment, 70);
    const demand = safeNum(metricsOf(g).demandIndex, 70);
    const stability = safeNum(metricsOf(g).priceStability, 70);
    let base = 40 + (100 - stability) * 0.35 + (demand - 50) * 0.12 - (sentiment - 50) * 0.08;
    base = clamp(base, 10, 90);
    return Math.round(base);
  }
  function priceNow(g){
    const base = safeNum(g?.basePriceUSD, 0);
    const disc = discountPct(g);
    return Math.max(0, Math.round(base * (1 - disc/100)));
  }
  function findGame(){
    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    return data.find(g => g.id === id) || null;
  }

  function renderHero(g){
    $("#gameTitle").textContent = nameOf(g);
    $("#gameSubtitle").textContent = `${g.genre || ""} · ${g.model || ""}`;
    const tags = [];
    if (g.releaseYear) tags.push(`<span class="pill">${g.releaseYear}</span>`);
    if (g.publisher) tags.push(`<span class="pill">${g.publisher}</span>`);
    if (g.steamAppId) tags.push(`<span class="pill">Steam #${g.steamAppId}</span>`);
    if (g.topPick) tags.push(`<span class="pill pill--glow">${GF_I18N.t("badgeTop")}</span>`);
    $("#gameTags").innerHTML = tags.join("");

    const cover = $("#gameCover");
    if (cover) cover.innerHTML = `<img src="${g.coverUrl}" alt="${nameOf(g)}">`;
    $("#gameName").textContent = nameOf(g);

    const meta = [];
    meta.push(`<span class="pill">${g.genre || "—"}</span>`);
    if (Array.isArray(g.platforms)) meta.push(`<span class="pill">${g.platforms.join(", ")}</span>`);
    meta.push(`<span class="pill">${g.model || "—"}</span>`);
    $("#gameMeta").innerHTML = meta.join("");

    $("#priceNowVal").textContent = fmtMoney(priceNow(g));
    $("#discountVal").textContent = `-${discountPct(g)}%`;
    $("#ratingVal").textContent = `${safeNum(metricsOf(g).sentiment,0)} / 100`;
    $("#healthVal").textContent = `${safeNum(metricsOf(g).communityHealth,0)} / 100`;
    $("#demandVal").textContent = `${safeNum(metricsOf(g).demandIndex,0)} / 100`;

    $("#summaryText").textContent = g.summary?.[GF_I18N.lang] || g.summary?.en || "";
    $("#mDemand").textContent = `${safeNum(metricsOf(g).demandIndex,0)} / 100`;
    $("#mStab").textContent = `${safeNum(metricsOf(g).priceStability,0)} / 100`;
    $("#mHealth").textContent = `${safeNum(metricsOf(g).communityHealth,0)} / 100`;
    $("#mModel").textContent = g.model || "—";

    renderPlatforms(g);
    renderNotes(g);
  }

  function renderPlatforms(g){
    const tb = $("#platRows");
    if (!tb) return;
    const now = priceNow(g);
    const disc = discountPct(g);
    tb.innerHTML = (g.platforms || []).map(p => `
      <tr>
        <td>${p}</td>
        <td>${fmtMoney(now)}</td>
        <td>-${disc}%</td>
      </tr>`).join("");
  }

  function renderNotes(g){
    const box = $("#noteBox");
    if (!box) return;
    const disc = discountPct(g);
    const stability = safeNum(metricsOf(g).priceStability, 70);
    const msg = disc >= 50
      ? GF_I18N.t("detailNoteBuy")
      : stability >= 70
        ? GF_I18N.t("detailNoteStable")
        : GF_I18N.t("detailNoteWait");
    box.textContent = msg;
  }

  function chartPoints(g, range){
    const pts = Array.isArray(g.priceHistory) ? g.priceHistory : [];
    const sorted = pts.slice().sort((a,b) => new Date(a.date) - new Date(b.date));
    if (range === "1y") return sorted.slice(-12);
    return sorted;
  }

  function renderChart(g, range){
    const svg = $("#priceChart");
    if (!svg) return;
    const pts = chartPoints(g, range);
    if (!pts.length){ svg.innerHTML = ""; return; }
    const w = svg.clientWidth || 640;
    const h = svg.clientHeight || 260;
    const prices = pts.map(p => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    $("#minVal").textContent = fmtMoney(min);
    $("#maxVal").textContent = fmtMoney(max);
    const avg = prices.reduce((a,b)=>a+b,0) / prices.length;
    $("#avgVal").textContent = fmtMoney(avg);
    $("#chartBadge").textContent = range === "1y" ? "1Y" : GF_I18N.t("detailAllTime");

    const pad = 20;
    const xStep = (w - pad*2) / Math.max(pts.length - 1, 1);
    const yScale = (h - pad*2) / Math.max(max - min, 1);
    const coords = pts.map((p, i) => {
      const x = pad + i * xStep;
      const y = h - pad - (p.price - min) * yScale;
      return { ...p, x, y };
    });

    const path = coords.map((c,i) => `${i===0 ? "M" : "L"}${c.x},${c.y}`).join(" ");
    const area = `${path} L${pad + (coords.length-1)*xStep},${h-pad} L${pad},${h-pad} Z`;
    svg.innerHTML = `
      <defs>
        <linearGradient id="chartGradient" x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="#4c7dff"/>
          <stop offset="100%" stop-color="#3dd5a7"/>
        </linearGradient>
        <linearGradient id="chartArea" x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="rgba(76,125,255,0.35)"/>
          <stop offset="100%" stop-color="rgba(61,213,167,0.0)"/>
        </linearGradient>
      </defs>
      <g>
        <path class="chart__area" d="${area}"></path>
        <path class="chart__line" d="${path}"></path>
        ${coords.map(c => `<circle class="chart__point" cx="${c.x}" cy="${c.y}" r="3.5" data-date="${c.date}" data-price="${c.price}"></circle>`).join("")}
      </g>`;

    const tooltip = $("#chartTooltip");
    svg.onmousemove = (ev) => {
      const rect = svg.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const closest = coords.reduce((best, c) => {
        const dx = Math.abs(c.x - x);
        return dx < best.dx ? { dx, c } : best;
      }, { dx: 1e9, c: coords[0] }).c;
      if (!closest) return;
      tooltip.classList.remove("hidden");
      tooltip.textContent = `${closest.date} — ${fmtMoney(closest.price)}`;
      tooltip.style.left = `${closest.x}px`;
      tooltip.style.top = `${closest.y}px`;
    };
    svg.onmouseleave = () => { tooltip.classList.add("hidden"); };
  }

  function bindTabs(){
    const tabs = $$(".tab");
    const panes = $$(".tabpane");
    tabs.forEach(tab => tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => t.classList.toggle("is-active", t.dataset.tab === target));
      panes.forEach(p => p.classList.toggle("hidden", p.dataset.tab !== target));
    }));
  }

  function bindRange(g){
    const chips = $$("[data-range]");
    chips.forEach(ch => ch.addEventListener("click", () => {
      chips.forEach(c => c.classList.toggle("chip--ghost", c !== ch));
      renderChart(g, ch.dataset.range);
    }));
  }

  function bindShare(g){
    $("#shareBtn")?.addEventListener("click", async () => {
      const url = new URL(location.href);
      url.searchParams.set("id", g.id);
      try{
        await navigator.clipboard.writeText(url.toString());
        alert(GF_I18N.t("detailCopied"));
      }catch{
        alert(url.toString());
      }
    });
  }

  function bindCompare(g){
    $("#compareBtn")?.addEventListener("click", () => {
      const key = "gf_compare_ids";
      let ids = [];
      try{ ids = JSON.parse(localStorage.getItem(key) || "[]"); }catch{}
      if (!ids.includes(g.id)){
        ids.push(g.id);
        ids = ids.slice(-4);
        localStorage.setItem(key, JSON.stringify(ids));
      }
      alert(GF_I18N.t("comparePicked"));
    });
  }

  function init(){
    GF_SHELL.initShell("catalog");
    const game = findGame();
    if (!game){
      $("#gameTitle").textContent = "Not found";
      return;
    }
    renderHero(game);
    bindTabs();
    bindRange(game);
    renderChart(game, "1y");
    bindShare(game);
    bindCompare(game);
    GF_I18N.apply(document);
    document.addEventListener("gf:lang", () => { renderHero(game); renderChart(game, "1y"); });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
