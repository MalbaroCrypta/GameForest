// Lightweight Steam index + detail loader with localStorage caching
(function(){
  const INDEX_URL = "./steam_index.json";
  const CACHE_PREFIX = "gf_steam_detail_";
  const CACHE_TTL = 1000 * 60 * 60 * 24; // 24h
  const MAX_HISTORY_MONTHS = 24;
  const clamp = (n,a,b) => Math.max(a, Math.min(b, n));
  const safeNum = (v, def=0) => Number.isFinite(Number(v)) ? Number(v) : def;

  let indexPromise = null;
  let indexData = null;

  function cover(appid){ return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/capsule_231x87.jpg`; }

  function readCache(appid){
    try{
      const raw = localStorage.getItem(CACHE_PREFIX + appid);
      if (!raw) return null;
      const { ts, data } = JSON.parse(raw);
      if (!ts || !data) return null;
      if (Date.now() - ts > CACHE_TTL){
        localStorage.removeItem(CACHE_PREFIX + appid);
        return null;
      }
      return data;
    }catch{return null;}
  }

  function writeCache(appid, data){
    try{ localStorage.setItem(CACHE_PREFIX + appid, JSON.stringify({ ts: Date.now(), data })); }catch{}
  }

  async function loadIndex(){
    if (indexData) return indexData;
    if (!indexPromise){
      indexPromise = fetch(INDEX_URL).then(r => r.json()).then(list => Array.isArray(list) ? list : []).catch(() => []);
    }
    indexData = await indexPromise;
    return indexData;
  }

  function searchIndex(query, limit=500){
    const q = (query || "").toLowerCase();
    const items = indexData || [];
    if (!items.length) return [];
    if (!q) return items.slice(0, limit);
    const res = [];
    for (const row of items){
      if (!row?.name) continue;
      if (row.name.toLowerCase().includes(q)){
        res.push(row);
        if (res.length >= limit) break;
      }
    }
    return res;
  }

  function hashString(str){
    let h = 0;
    for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
    return h >>> 0;
  }
  function rng(seed){
    let a = seed || 1;
    return () => {
      a = (a ^ (a << 13)) >>> 0;
      a = (a ^ (a >>> 17)) >>> 0;
      a = (a ^ (a << 5)) >>> 0;
      return (a >>> 0) / 0xffffffff;
    };
  }
  function buildPriceHistory(id, basePriceUSD){
    const months = MAX_HISTORY_MONTHS;
    const r = rng(hashString(String(id)));
    const anchor = Math.max(10, basePriceUSD || 30);
    const floor = Math.max(4, anchor * 0.32);
    const now = new Date();
    const points = [];
    let price = anchor * (0.92 + r() * 0.1);
    for (let i = months; i >= 0; i--){
      const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const sale = [0,5,10,11].includes(dt.getMonth()) ? (0.18 + r() * 0.2) : (0.06 + r() * 0.08);
      const bounce = r() < 0.1 ? (0.08 + r() * 0.1) : 0;
      const upward = r() < 0.07 ? (0.05 + r() * 0.05) : 0;
      const target = anchor * (1 - sale - bounce + upward);
      price = price * 0.5 + target * 0.5;
      price = clamp(price, floor, anchor * 1.3);
      points.push({ date: dt.toISOString().slice(0,10), price: Math.round(price * 100) / 100 });
    }
    return points;
  }

  async function fetchDetails(appid){
    if (!appid) return null;
    const key = String(appid);
    const cached = readCache(key);
    if (cached) return cached;
    const url = `https://store.steampowered.com/api/appdetails?appids=${encodeURIComponent(key)}&cc=us&l=en`;
    let payload = null;
    try{
      const res = await fetch(url);
      payload = await res.json();
    }catch{}
    const body = payload?.[key]?.data;
    if (!body) return null;
    const priceUSD = body.price_overview ? safeNum(body.price_overview.initial, 0) / 100 : 0;
    const releaseYear = body.release_date?.date ? parseInt(body.release_date.date.split(" ").pop(), 10) : undefined;
    const item = {
      id: `steam-${key}`,
      steamAppId: Number(key),
      name: { en: body.name },
      summary: { en: body.short_description || "" },
      coverUrl: body.header_image || cover(key),
      basePriceUSD: priceUSD,
      releaseYear: Number.isFinite(releaseYear) ? releaseYear : undefined,
      genre: body.genres?.[0]?.description || null,
      model: body.is_free ? "Free to Play" : "Paid",
      platforms: Object.entries(body.platforms || {}).filter(([,v]) => !!v).map(([k]) => k),
      metrics: {
        sentiment: safeNum(body.metacritic?.score, 80),
        demandIndex: 75,
        priceStability: 78,
        communityHealth: 76
      },
      priceHistory: buildPriceHistory(key, priceUSD)
    };
    writeCache(key, item);
    return item;
  }

  window.GF_STEAM = {
    loadIndex,
    searchIndex,
    fetchDetails,
    cover,
    cache: { read: readCache, write: writeCache, ttl: CACHE_TTL },
    buildPriceHistory
  };
})();
