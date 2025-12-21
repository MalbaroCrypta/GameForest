// GameForest dataset with lightweight price history generator
// Adds summaries, platform/publisher metadata and seeded demo price curves.

(function(){
  const monthsBackDefault = 60; // ~5y

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

  function generatePriceHistory(id, basePriceUSD, monthsBack = monthsBackDefault){
    const seed = hashString(id + "_history");
    const rnd = rng(seed);
    const anchor = Math.max(18, basePriceUSD || 30);
    const minFloor = Math.max(6, anchor * 0.32);
    const now = new Date();
    const points = [];
    let price = anchor * (0.96 + rnd() * 0.08);

    for (let i = monthsBack; i >= 0; i--){
      const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = dt.getMonth();
      const seasonalSale = [0, 5, 6, 10, 11].includes(m) ? (0.22 + rnd() * 0.18) : (0.08 + rnd() * 0.08);
      const bounce = rnd() < 0.08 ? (0.12 + rnd() * 0.15) : 0;
      const upward = rnd() < 0.06 ? (0.06 + rnd() * 0.07) : 0;
      const target = anchor * (1 - seasonalSale - bounce + upward);
      price = price * 0.55 + target * 0.45;
      if (rnd() < 0.12) price = Math.min(anchor * 1.15, price * (1.08 + rnd() * 0.1));
      price = Math.min(anchor * 1.18, Math.max(minFloor, price));
      points.push({ date: dt.toISOString().slice(0,10), price: Math.round(price * 100) / 100 });
    }

    const base = Math.max(...points.map(p => p.price));
    return { points, base };
  }

  const raw = [
    {
      id: "cyberpunk2077",
      name: { uk: "Cyberpunk 2077", en: "Cyberpunk 2077" },
      genre: "RPG",
      model: "Premium",
      basePriceUSD: 60,
      releaseYear: 2020,
      publisher: "CD PROJEKT RED",
      steamAppId: 1091500,
      topPick: true,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/library_600x900.jpg",
      summary: {
        uk: "Кіберпанк-RPG про найманця у Найт-Сіті: сильний сюжет, моди та стабільні патчі після релізу.",
        en: "Cyberpunk RPG about a merc in Night City: strong narrative, mods, and steady post-launch fixes."
      },
      metrics: { sentiment: 82, demandIndex: 88, priceStability: 58, communityHealth: 75 }
    },
    {
      id: "rdr2",
      name: { uk: "Red Dead Redemption 2", en: "Red Dead Redemption 2" },
      genre: "Action",
      model: "Premium",
      basePriceUSD: 60,
      releaseYear: 2018,
      publisher: "Rockstar Games",
      steamAppId: 1174180,
      topPick: true,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/library_600x900.jpg",
      summary: {
        uk: "Відкритий світ Дикого Заходу з кінематографічною кампанією та Red Dead Online для довгого лайфтайму.",
        en: "Cinematic open-world West with a huge campaign and Red Dead Online keeping lifetime value high."
      },
      metrics: { sentiment: 92, demandIndex: 90, priceStability: 64, communityHealth: 84 }
    },
    {
      id: "witcher3",
      name: { uk: "The Witcher 3", en: "The Witcher 3" },
      genre: "RPG",
      model: "Premium",
      basePriceUSD: 40,
      releaseYear: 2015,
      publisher: "CD PROJEKT RED",
      steamAppId: 292030,
      topPick: true,
      platforms: ["PC", "PS5", "Xbox Series", "Switch"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/292030/library_600x900.jpg",
      summary: {
        uk: "Класичне сюжетне RPG з двома крупними DLC, стабільним трафіком та регулярними сейлами.",
        en: "Classic story-driven RPG with two big DLCs, evergreen traffic, and reliable seasonal sales."
      },
      metrics: { sentiment: 95, demandIndex: 86, priceStability: 70, communityHealth: 90 }
    },
    {
      id: "gta5",
      name: { uk: "GTA V", en: "GTA V" },
      genre: "Action",
      model: "Premium",
      basePriceUSD: 30,
      releaseYear: 2013,
      publisher: "Rockstar Games",
      steamAppId: 271590,
      topPick: true,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/271590/library_600x900.jpg",
      summary: {
        uk: "Найпопулярніший сэндбокс із GTA Online, що тримає ARPU через доповнення та івенти.",
        en: "Evergreen sandbox with GTA Online driving ARPU through updates and timed events."
      },
      metrics: { sentiment: 83, demandIndex: 92, priceStability: 62, communityHealth: 88 }
    },
    {
      id: "eldenring",
      name: { uk: "Elden Ring", en: "Elden Ring" },
      genre: "RPG",
      model: "Premium",
      basePriceUSD: 60,
      releaseYear: 2022,
      publisher: "Bandai Namco / FromSoftware",
      steamAppId: 1245620,
      topPick: true,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/library_600x900.jpg",
      summary: {
        uk: "Souls-like у відкритому світі: високий рейтинг, сильний DLC-потенціал та довгий хвіст продажів.",
        en: "Open-world soulslike with elite ratings, DLC upside, and a long-tail sales curve."
      },
      metrics: { sentiment: 90, demandIndex: 89, priceStability: 68, communityHealth: 82 }
    },
    {
      id: "helldivers2",
      name: { uk: "Helldivers 2", en: "Helldivers 2" },
      genre: "Shooter",
      model: "Premium",
      basePriceUSD: 40,
      releaseYear: 2024,
      publisher: "Arrowhead / PlayStation PC",
      steamAppId: 553850,
      topPick: true,
      platforms: ["PC", "PS5"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/553850/library_600x900.jpg",
      summary: {
        uk: "Кооперативний шутер-сервіс із сезонними ордерами, високим retention і соц-меметикою.",
        en: "Co-op live shooter with seasonal orders, high retention, and strong social memetics."
      },
      metrics: { sentiment: 84, demandIndex: 87, priceStability: 57, communityHealth: 78 }
    },
    {
      id: "bg3",
      name: { uk: "Baldur's Gate 3", en: "Baldur's Gate 3" },
      genre: "RPG",
      model: "Premium",
      basePriceUSD: 60,
      releaseYear: 2023,
      publisher: "Larian Studios",
      steamAppId: 1086940,
      topPick: true,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/library_600x900.jpg",
      summary: {
        uk: "CRPG-рівень GOTY з потужним сарафаном, високим утриманням та стабільною ціною.",
        en: "GOTY-tier CRPG with huge word-of-mouth, strong retention, and stable pricing."
      },
      metrics: { sentiment: 95, demandIndex: 89, priceStability: 71, communityHealth: 90 }
    },
    {
      id: "apex",
      name: { uk: "Apex Legends", en: "Apex Legends" },
      genre: "Shooter",
      model: "F2P",
      basePriceUSD: 20,
      releaseYear: 2019,
      publisher: "Electronic Arts",
      steamAppId: 1172470,
      topPick: true,
      platforms: ["PC", "PS5", "Xbox Series", "Switch"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1172470/library_600x900.jpg",
      summary: {
        uk: "Battle royale-сервіс із сезоним батлпасом, скінами та міцною esport-аудиторією.",
        en: "Battle royale live service with seasonal battle pass, cosmetics, and sticky esports audience."
      },
      metrics: { sentiment: 78, demandIndex: 86, priceStability: 42, communityHealth: 70 }
    },
    {
      id: "cs2",
      name: { uk: "Counter-Strike 2", en: "Counter-Strike 2" },
      genre: "Shooter",
      model: "F2P",
      basePriceUSD: 15,
      releaseYear: 2023,
      publisher: "Valve",
      steamAppId: 730,
      topPick: true,
      platforms: ["PC"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/730/library_600x900.jpg",
      summary: {
        uk: "Флагманський competitive shooter, скіни та кейси дають стабільний товарообіг для партнерів.",
        en: "Flagship competitive shooter; skins and cases keep partner GMV and trading velocity high."
      },
      metrics: { sentiment: 72, demandIndex: 96, priceStability: 38, communityHealth: 68 }
    },
    {
      id: "dota2",
      name: { uk: "Dota 2", en: "Dota 2" },
      genre: "MOBA",
      model: "F2P",
      basePriceUSD: 12,
      releaseYear: 2013,
      publisher: "Valve",
      steamAppId: 570,
      topPick: false,
      platforms: ["PC"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/570/library_600x900.jpg",
      summary: {
        uk: "MOBA з величезними піками під час турнірів; косметика та Battle Pass дають сезонні сплески.",
        en: "MOBA with massive esports peaks; cosmetics and Battle Pass drive seasonal spikes."
      },
      metrics: { sentiment: 77, demandIndex: 85, priceStability: 46, communityHealth: 66 }
    },
    {
      id: "hades",
      name: { uk: "Hades", en: "Hades" },
      genre: "Roguelike",
      model: "Premium",
      basePriceUSD: 25,
      releaseYear: 2020,
      publisher: "Supergiant Games",
      steamAppId: 1145360,
      topPick: true,
      platforms: ["PC", "PS5", "Xbox Series", "Switch"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/library_600x900.jpg",
      summary: {
        uk: "Стильний roguelike з міцним retention і любов'ю критиків; часто у промо-підбірках.",
        en: "Stylish roguelike with great retention and critic love; regularly featured in promos."
      },
      metrics: { sentiment: 93, demandIndex: 78, priceStability: 72, communityHealth: 86 }
    },
    {
      id: "stardew",
      name: { uk: "Stardew Valley", en: "Stardew Valley" },
      genre: "Simulation",
      model: "Premium",
      basePriceUSD: 15,
      releaseYear: 2016,
      publisher: "ConcernedApe",
      steamAppId: 413150,
      topPick: true,
      platforms: ["PC", "PS5", "Xbox Series", "Switch", "Mobile"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/413150/library_600x900.jpg",
      summary: {
        uk: "Затишний фермерський сим із нескінченним лайфтаймом, високим NPS та портами на всі платформи.",
        en: "Cozy farming sim with endless lifetime, high NPS, and ports across every platform."
      },
      metrics: { sentiment: 96, demandIndex: 82, priceStability: 80, communityHealth: 92 }
    },
    {
      id: "hollowknight",
      name: { uk: "Hollow Knight", en: "Hollow Knight" },
      genre: "Metroidvania",
      model: "Premium",
      basePriceUSD: 15,
      releaseYear: 2017,
      publisher: "Team Cherry",
      steamAppId: 367520,
      topPick: true,
      platforms: ["PC", "PS5", "Xbox Series", "Switch"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/library_600x900.jpg",
      summary: {
        uk: "Інді-хіт із сильним ком'юніті та очікуванням Silksong, що підтримує органічний попит.",
        en: "Indie hit with a passionate community; Silksong anticipation sustains organic demand."
      },
      metrics: { sentiment: 94, demandIndex: 76, priceStability: 74, communityHealth: 89 }
    },
    {
      id: "beamng",
      name: { uk: "BeamNG.drive", en: "BeamNG.drive" },
      genre: "Simulation",
      model: "Premium",
      basePriceUSD: 25,
      releaseYear: 2015,
      publisher: "BeamNG",
      steamAppId: 284160,
      topPick: false,
      platforms: ["PC"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/284160/library_600x900.jpg",
      summary: {
        uk: "Фізична песочниця з UGC-контентом і міцним моддингом; стабільний трафік YouTube/TikTok.",
        en: "Physics sandbox with heavy UGC/modding and steady creator traffic on YouTube/TikTok."
      },
      metrics: { sentiment: 87, demandIndex: 74, priceStability: 73, communityHealth: 76 }
    },
    {
      id: "forzah5",
      name: { uk: "Forza Horizon 5", en: "Forza Horizon 5" },
      genre: "Racing",
      model: "Premium",
      basePriceUSD: 60,
      releaseYear: 2021,
      publisher: "Xbox Game Studios",
      steamAppId: 1551360,
      topPick: true,
      platforms: ["PC", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1551360/library_600x900.jpg",
      summary: {
        uk: "Аркадні перегони з сезонними фестивалями та карнавалом автомобілів; сильний Game Pass вплив.",
        en: "Arcade racer with seasonal festivals and car drops; strong Game Pass halo effect."
      },
      metrics: { sentiment: 88, demandIndex: 80, priceStability: 69, communityHealth: 82 }
    },
    {
      id: "skyrim",
      name: { uk: "Skyrim", en: "Skyrim" },
      genre: "RPG",
      model: "Premium",
      basePriceUSD: 40,
      releaseYear: 2011,
      publisher: "Bethesda",
      steamAppId: 72850,
      topPick: true,
      platforms: ["PC", "PS5", "Xbox Series", "Switch"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/72850/library_600x900.jpg",
      summary: {
        uk: "Класичне RPG з безмежними модами: evergreen продажі, VR-порти та Anniversary оновлення.",
        en: "Classic RPG with endless mods; evergreen sales plus VR/Anniversary upgrades keep it alive."
      },
      metrics: { sentiment: 91, demandIndex: 85, priceStability: 66, communityHealth: 87 }
    },
    {
      id: "terraria",
      name: { uk: "Terraria", en: "Terraria" },
      genre: "Sandbox",
      model: "Premium",
      basePriceUSD: 10,
      releaseYear: 2011,
      publisher: "Re-Logic",
      steamAppId: 105600,
      topPick: true,
      platforms: ["PC", "PS5", "Xbox Series", "Switch", "Mobile"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/105600/library_600x900.jpg",
      summary: {
        uk: "Піксельний sandbox із крафтом та коопом; високий ROI завдяки низькій ціні та вічним сейлам.",
        en: "Pixel sandbox with crafting/co-op; huge ROI due to low price point and endless sales."
      },
      metrics: { sentiment: 93, demandIndex: 79, priceStability: 82, communityHealth: 88 }
    }
  ];

  window.GF_DATA = raw.map(game => {
    const history = generatePriceHistory(game.id, game.basePriceUSD);
    const basePrice = Math.max(game.basePriceUSD || 0, Math.round(history.base));
    return {
      ...game,
      basePriceUSD: basePrice,
      priceHistory: history.points
    };
  });
})();
