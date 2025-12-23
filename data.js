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
    },
    {
      id: "halflifealyx",
      name: { uk: "Half-Life: Alyx", en: "Half-Life: Alyx" },
      genre: "VR",
      model: "Premium",
      basePriceUSD: 60,
      releaseYear: 2020,
      publisher: "Valve",
      steamAppId: 546560,
      platforms: ["PC"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/546560/library_600x900.jpg",
      summary: {
        uk: "VR-повернення Half-Life з високим ARPPU та стабільним попитом серед VR-аудиторії.",
        en: "VR return of Half-Life with high ARPPU and steady VR audience demand."
      },
      metrics: { sentiment: 94, demandIndex: 74, priceStability: 63, communityHealth: 81 }
    },
    {
      id: "sekiro",
      name: { uk: "Sekiro: Shadows Die Twice", en: "Sekiro: Shadows Die Twice" },
      genre: "Action",
      model: "Premium",
      basePriceUSD: 60,
      releaseYear: 2019,
      publisher: "Activision / FromSoftware",
      steamAppId: 814380,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/814380/library_600x900.jpg",
      summary: {
        uk: "Singleplayer souls-like із високими оцінками та evergreen продажами на сейлах.",
        en: "Single-player soulslike with elite reviews and evergreen sale performance."
      },
      metrics: { sentiment: 92, demandIndex: 77, priceStability: 66, communityHealth: 83 }
    },
    {
      id: "monsterhunterrise",
      name: { uk: "Monster Hunter Rise", en: "Monster Hunter Rise" },
      genre: "Action",
      model: "Premium",
      basePriceUSD: 60,
      releaseYear: 2022,
      publisher: "Capcom",
      steamAppId: 1446780,
      platforms: ["PC", "Switch", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1446780/library_600x900.jpg",
      summary: {
        uk: "Кооп-монстрхантер із регулярними івентами; високий lifetime через DLC Sunbreak.",
        en: "Co-op monster hunting with regular events; strong lifetime from Sunbreak DLC."
      },
      metrics: { sentiment: 86, demandIndex: 78, priceStability: 59, communityHealth: 80 }
    },
    {
      id: "rainbowsixsiege",
      name: { uk: "Rainbow Six Siege", en: "Rainbow Six Siege" },
      genre: "Shooter",
      model: "Premium",
      basePriceUSD: 30,
      releaseYear: 2015,
      publisher: "Ubisoft",
      steamAppId: 359550,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/359550/library_600x900.jpg",
      summary: {
        uk: "Тактичний PvP-шутер-сервіс з операторами та сезоними Battle Pass.",
        en: "Tactical PvP live shooter with operators and seasonal battle passes."
      },
      metrics: { sentiment: 77, demandIndex: 83, priceStability: 52, communityHealth: 73 }
    },
    {
      id: "portal2",
      name: { uk: "Portal 2", en: "Portal 2" },
      genre: "Puzzle",
      model: "Premium",
      basePriceUSD: 10,
      releaseYear: 2011,
      publisher: "Valve",
      steamAppId: 620,
      platforms: ["PC"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/620/library_600x900.jpg",
      summary: {
        uk: "Кооперативна головоломка з легендарним наративом; evergreen сейли.",
        en: "Co-op puzzle classic with legendary narrative; evergreen sale performer."
      },
      metrics: { sentiment: 97, demandIndex: 72, priceStability: 78, communityHealth: 88 }
    },
    {
      id: "left4dead2",
      name: { uk: "Left 4 Dead 2", en: "Left 4 Dead 2" },
      genre: "Shooter",
      model: "Premium",
      basePriceUSD: 10,
      releaseYear: 2009,
      publisher: "Valve",
      steamAppId: 550,
      platforms: ["PC"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/550/library_600x900.jpg",
      summary: {
        uk: "Кооп-шутер з модами та вічним попитом під час сейлів.",
        en: "Co-op zombie shooter with mod scene and endless sale spikes."
      },
      metrics: { sentiment: 93, demandIndex: 74, priceStability: 76, communityHealth: 86 }
    },
    {
      id: "dontstarve",
      name: { uk: "Don't Starve Together", en: "Don't Starve Together" },
      genre: "Survival",
      model: "Premium",
      basePriceUSD: 15,
      releaseYear: 2016,
      publisher: "Klei Entertainment",
      steamAppId: 322330,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/322330/library_600x900.jpg",
      summary: {
        uk: "Кооп виживання з косметикою та сезонними івентами.",
        en: "Co-op survival with cosmetics and seasonal events."
      },
      metrics: { sentiment: 90, demandIndex: 73, priceStability: 74, communityHealth: 87 }
    },
    {
      id: "factorio",
      name: { uk: "Factorio", en: "Factorio" },
      genre: "Strategy",
      model: "Premium",
      basePriceUSD: 35,
      releaseYear: 2020,
      publisher: "Wube Software",
      steamAppId: 427520,
      platforms: ["PC"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/427520/library_600x900.jpg",
      summary: {
        uk: "Автоматизаційний сим із культовим retention та беззнижковою стратегією ціни.",
        en: "Automation sim with cult retention and no-discount pricing strategy."
      },
      metrics: { sentiment: 97, demandIndex: 78, priceStability: 92, communityHealth: 91 }
    },
    {
      id: "rimworld",
      name: { uk: "RimWorld", en: "RimWorld" },
      genre: "Simulation",
      model: "Premium",
      basePriceUSD: 35,
      releaseYear: 2018,
      publisher: "Ludeon Studios",
      steamAppId: 294100,
      platforms: ["PC"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/294100/library_600x900.jpg",
      summary: {
        uk: "Колоні-білдер із модами та DLC; стабільний ARPU через біомоди.",
        en: "Colony builder with huge modding and DLC; stable ARPU via biome packs."
      },
      metrics: { sentiment: 95, demandIndex: 75, priceStability: 88, communityHealth: 90 }
    },
    {
      id: "cities2",
      name: { uk: "Cities: Skylines II", en: "Cities: Skylines II" },
      genre: "Simulation",
      model: "Premium",
      basePriceUSD: 50,
      releaseYear: 2023,
      publisher: "Paradox Interactive",
      steamAppId: 949230,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/949230/library_600x900.jpg",
      summary: {
        uk: "Міськобудівний сіквел з roadmap DLC та великим моддингом.",
        en: "City-builder sequel with DLC roadmap and large modding ecosystem."
      },
      metrics: { sentiment: 74, demandIndex: 71, priceStability: 44, communityHealth: 70 }
    },
    {
      id: "nomanssky",
      name: { uk: "No Man's Sky", en: "No Man's Sky" },
      genre: "Adventure",
      model: "Premium",
      basePriceUSD: 60,
      releaseYear: 2016,
      publisher: "Hello Games",
      steamAppId: 275850,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/275850/library_600x900.jpg",
      summary: {
        uk: "Відкрите космічне виживання з постійними оновленнями та VR-модом.",
        en: "Open-space survival with constant free updates and VR mode."
      },
      metrics: { sentiment: 83, demandIndex: 80, priceStability: 58, communityHealth: 85 }
    },
    {
      id: "satisfactory",
      name: { uk: "Satisfactory", en: "Satisfactory" },
      genre: "Simulation",
      model: "Premium",
      basePriceUSD: 35,
      releaseYear: 2020,
      publisher: "Coffee Stain Publishing",
      steamAppId: 526870,
      platforms: ["PC"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/526870/library_600x900.jpg",
      summary: {
        uk: "Факторійний 3D-сим у ранньому доступі з коопом і модами.",
        en: "3D factory sim in early access with co-op and mods."
      },
      metrics: { sentiment: 92, demandIndex: 74, priceStability: 70, communityHealth: 85 }
    },
    {
      id: "palworld",
      name: { uk: "Palworld", en: "Palworld" },
      genre: "Survival",
      model: "Premium",
      basePriceUSD: 30,
      releaseYear: 2024,
      publisher: "Pocketpair",
      steamAppId: 1623730,
      platforms: ["PC", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1623730/library_600x900.jpg",
      summary: {
        uk: "Кооп виживання з тваринами Pal, стрімкий запуск і високий UGC-потенціал.",
        en: "Co-op survival with Pal creatures; explosive launch and UGC potential."
      },
      metrics: { sentiment: 75, demandIndex: 90, priceStability: 48, communityHealth: 78 }
    },
    {
      id: "liesofp",
      name: { uk: "Lies of P", en: "Lies of P" },
      genre: "Action",
      model: "Premium",
      basePriceUSD: 60,
      releaseYear: 2023,
      publisher: "NEOWIZ",
      steamAppId: 1627720,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1627720/library_600x900.jpg",
      summary: {
        uk: "Souls-like ретелінг Піноккіо з сильними відгуками та DLC потенціалом.",
        en: "Soulslike retelling of Pinocchio with strong reviews and DLC upside."
      },
      metrics: { sentiment: 85, demandIndex: 76, priceStability: 60, communityHealth: 79 }
    },
    {
      id: "seaofthieves",
      name: { uk: "Sea of Thieves", en: "Sea of Thieves" },
      genre: "Adventure",
      model: "Premium",
      basePriceUSD: 40,
      releaseYear: 2020,
      publisher: "Xbox Game Studios",
      steamAppId: 1172620,
      platforms: ["PC", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1172620/library_600x900.jpg",
      summary: {
        uk: "Піратський кооп-сервіс з сезонними адвенчурами та Battle Pass.",
        en: "Pirate co-op live service with seasonal adventures and plunder passes."
      },
      metrics: { sentiment: 82, demandIndex: 82, priceStability: 55, communityHealth: 85 }
    },
    {
      id: "destiny2",
      name: { uk: "Destiny 2", en: "Destiny 2" },
      genre: "Shooter",
      model: "F2P",
      basePriceUSD: 20,
      releaseYear: 2019,
      publisher: "Bungie",
      steamAppId: 1085660,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1085660/library_600x900.jpg",
      summary: {
        uk: "Лутер-шутер з щорічними експансіями, сезонними пасами та рейдами.",
        en: "Looter shooter with yearly expansions, seasonal passes, and raids."
      },
      metrics: { sentiment: 74, demandIndex: 88, priceStability: 41, communityHealth: 76 }
    },
    {
      id: "rust",
      name: { uk: "Rust", en: "Rust" },
      genre: "Survival",
      model: "Premium",
      basePriceUSD: 40,
      releaseYear: 2018,
      publisher: "Facepunch Studios",
      steamAppId: 252490,
      platforms: ["PC"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/252490/library_600x900.jpg",
      summary: {
        uk: "Онлайнове виживання з вайпами серверів та високою UGC-активністю.",
        en: "Online survival with server wipes and heavy UGC activity."
      },
      metrics: { sentiment: 72, demandIndex: 86, priceStability: 48, communityHealth: 80 }
    },
    {
      id: "arkse",
      name: { uk: "ARK: Survival Evolved", en: "ARK: Survival Evolved" },
      genre: "Survival",
      model: "Premium",
      basePriceUSD: 40,
      releaseYear: 2017,
      publisher: "Studio Wildcard",
      steamAppId: 346110,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/346110/library_600x900.jpg",
      summary: {
        uk: "Дино-виживання з моддингом і платними DLC-мапами, стабільний трафік.",
        en: "Dinosaur survival with mods and paid map DLCs, steady traffic."
      },
      metrics: { sentiment: 70, demandIndex: 80, priceStability: 46, communityHealth: 76 }
    },
    {
      id: "warframe",
      name: { uk: "Warframe", en: "Warframe" },
      genre: "Action",
      model: "F2P",
      basePriceUSD: 15,
      releaseYear: 2013,
      publisher: "Digital Extremes",
      steamAppId: 230410,
      platforms: ["PC", "PS5", "Xbox Series", "Switch"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/230410/library_600x900.jpg",
      summary: {
        uk: "Co-op sci-fi лутер з регулярними оновленнями, Plains/Empyrean, квестами.",
        en: "Co-op sci-fi looter with frequent updates, open zones, and cinematic quests."
      },
      metrics: { sentiment: 81, demandIndex: 85, priceStability: 52, communityHealth: 84 }
    },
    {
      id: "borderlands3",
      name: { uk: "Borderlands 3", en: "Borderlands 3" },
      genre: "Shooter",
      model: "Premium",
      basePriceUSD: 60,
      releaseYear: 2020,
      publisher: "2K",
      steamAppId: 397540,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/397540/library_600x900.jpg",
      summary: {
        uk: "Лутер-шутер із коопом, великим сезонним пасом і високим ARPU на косметику.",
        en: "Co-op looter shooter with sizeable season pass and strong cosmetic ARPU."
      },
      metrics: { sentiment: 79, demandIndex: 78, priceStability: 57, communityHealth: 75 }
    },
    {
      id: "fallout4",
      name: { uk: "Fallout 4", en: "Fallout 4" },
      genre: "RPG",
      model: "Premium",
      basePriceUSD: 40,
      releaseYear: 2015,
      publisher: "Bethesda",
      steamAppId: 377160,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/377160/library_600x900.jpg",
      summary: {
        uk: "Постапокаліптичне RPG з модами; серіал підняв органічний попит.",
        en: "Post-apocalyptic RPG with deep modding; TV series spike boosted demand."
      },
      metrics: { sentiment: 82, demandIndex: 83, priceStability: 64, communityHealth: 86 }
    },
    {
      id: "fallout76",
      name: { uk: "Fallout 76", en: "Fallout 76" },
      genre: "RPG",
      model: "Premium",
      basePriceUSD: 40,
      releaseYear: 2018,
      publisher: "Bethesda",
      steamAppId: 1151340,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1151340/library_600x900.jpg",
      summary: {
        uk: "Онлайн Fallout з сезонними оновленнями; помітне зростання після серіалу.",
        en: "Online Fallout with seasonal updates; notable uplift after TV series."
      },
      metrics: { sentiment: 66, demandIndex: 79, priceStability: 48, communityHealth: 70 }
    },
    {
      id: "subnautica",
      name: { uk: "Subnautica", en: "Subnautica" },
      genre: "Survival",
      model: "Premium",
      basePriceUSD: 30,
      releaseYear: 2018,
      publisher: "Unknown Worlds",
      steamAppId: 264710,
      platforms: ["PC", "PS5", "Xbox Series", "Switch"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/264710/library_600x900.jpg",
      summary: {
        uk: "Підводне виживання з сюжетом та strong word-of-mouth, evergreen сейли.",
        en: "Underwater survival with narrative; strong WOM and evergreen sales."
      },
      metrics: { sentiment: 93, demandIndex: 78, priceStability: 68, communityHealth: 85 }
    },
    {
      id: "subnauticabz",
      name: { uk: "Subnautica: Below Zero", en: "Subnautica: Below Zero" },
      genre: "Survival",
      model: "Premium",
      basePriceUSD: 30,
      releaseYear: 2021,
      publisher: "Unknown Worlds",
      steamAppId: 848450,
      platforms: ["PC", "PS5", "Xbox Series", "Switch"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/848450/library_600x900.jpg",
      summary: {
        uk: "Сиквел у холодному біомі з модами та стабільними знижками.",
        en: "Sequel in frozen biomes with modding and regular discounts."
      },
      metrics: { sentiment: 85, demandIndex: 71, priceStability: 62, communityHealth: 78 }
    },
    {
      id: "resident4",
      name: { uk: "Resident Evil 4", en: "Resident Evil 4" },
      genre: "Horror",
      model: "Premium",
      basePriceUSD: 60,
      releaseYear: 2023,
      publisher: "Capcom",
      steamAppId: 2050650,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/2050650/library_600x900.jpg",
      summary: {
        uk: "Ремейк класики з високим Metacritic та мікро DLC.",
        en: "Remake of the classic with top Metacritic and micro DLC drops."
      },
      metrics: { sentiment: 92, demandIndex: 83, priceStability: 61, communityHealth: 84 }
    },
    {
      id: "residentevilvillage",
      name: { uk: "Resident Evil Village", en: "Resident Evil Village" },
      genre: "Horror",
      model: "Premium",
      basePriceUSD: 60,
      releaseYear: 2021,
      publisher: "Capcom",
      steamAppId: 1196590,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1196590/library_600x900.jpg",
      summary: {
        uk: "Готичний хоррор з DLC Winters' Expansion та VR підтримкою.",
        en: "Gothic horror entry with Winters' Expansion DLC and VR support."
      },
      metrics: { sentiment: 88, demandIndex: 78, priceStability: 60, communityHealth: 80 }
    },
    {
      id: "residentevil2",
      name: { uk: "Resident Evil 2", en: "Resident Evil 2" },
      genre: "Horror",
      model: "Premium",
      basePriceUSD: 40,
      releaseYear: 2019,
      publisher: "Capcom",
      steamAppId: 883710,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/883710/library_600x900.jpg",
      summary: {
        uk: "Ремейк із високим retention і частими сейлами, RT-оновлення.",
        en: "Remake with strong retention, frequent sales, and ray-tracing patch."
      },
      metrics: { sentiment: 92, demandIndex: 79, priceStability: 67, communityHealth: 83 }
    },
    {
      id: "residentevil3",
      name: { uk: "Resident Evil 3", en: "Resident Evil 3" },
      genre: "Horror",
      model: "Premium",
      basePriceUSD: 60,
      releaseYear: 2020,
      publisher: "Capcom",
      steamAppId: 952060,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/952060/library_600x900.jpg",
      summary: {
        uk: "Ремейк Nemesis з короткою кампанією та мультиплеєрним експериментом.",
        en: "Nemesis remake with short campaign and multiplayer experiment add-on."
      },
      metrics: { sentiment: 74, demandIndex: 70, priceStability: 55, communityHealth: 72 }
    },
    {
      id: "monsterhunterworld",
      name: { uk: "Monster Hunter: World", en: "Monster Hunter: World" },
      genre: "Action",
      model: "Premium",
      basePriceUSD: 60,
      releaseYear: 2018,
      publisher: "Capcom",
      steamAppId: 582010,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/582010/library_600x900.jpg",
      summary: {
        uk: "Гіга-хіт кооп мисливців, Iceborne DLC дає довгий хвіст.",
        en: "Co-op hunting hit; Iceborne DLC extends lifetime tail."
      },
      metrics: { sentiment: 91, demandIndex: 84, priceStability: 65, communityHealth: 86 }
    },
    {
      id: "horizonzerodawn",
      name: { uk: "Horizon Zero Dawn", en: "Horizon Zero Dawn" },
      genre: "Action",
      model: "Premium",
      basePriceUSD: 50,
      releaseYear: 2020,
      publisher: "PlayStation PC",
      steamAppId: 1151640,
      platforms: ["PC", "PS5"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1151640/library_600x900.jpg",
      summary: {
        uk: "Порт з PS із повним DLC, evergreen сейли й високий бренд Horizon.",
        en: "PC port with Frozen Wilds DLC; evergreen sales and strong Horizon brand."
      },
      metrics: { sentiment: 86, demandIndex: 77, priceStability: 64, communityHealth: 79 }
    },
    {
      id: "daysgone",
      name: { uk: "Days Gone", en: "Days Gone" },
      genre: "Action",
      model: "Premium",
      basePriceUSD: 50,
      releaseYear: 2021,
      publisher: "PlayStation PC",
      steamAppId: 1259420,
      platforms: ["PC", "PS5"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1259420/library_600x900.jpg",
      summary: {
        uk: "Зомбі-байк екшен із динамічними ордами; сильні сейли на PC.",
        en: "Bike-and-horde action; PC port with strong sale performance."
      },
      metrics: { sentiment: 79, demandIndex: 73, priceStability: 63, communityHealth: 75 }
    },
    {
      id: "deathstranding",
      name: { uk: "Death Stranding", en: "Death Stranding" },
      genre: "Adventure",
      model: "Premium",
      basePriceUSD: 60,
      releaseYear: 2020,
      publisher: "505 Games / Kojima Productions",
      steamAppId: 1190460,
      platforms: ["PC", "PS5"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1190460/library_600x900.jpg",
      summary: {
        uk: "Авторський open-world з унікальною доставкою та Director's Cut апсайдом.",
        en: "Auteur open-world with strand gameplay and Director's Cut upsell."
      },
      metrics: { sentiment: 87, demandIndex: 74, priceStability: 62, communityHealth: 78 }
    },
    {
      id: "deadbydaylight",
      name: { uk: "Dead by Daylight", en: "Dead by Daylight" },
      genre: "Horror",
      model: "Premium",
      basePriceUSD: 20,
      releaseYear: 2016,
      publisher: "Behaviour Interactive",
      steamAppId: 381210,
      platforms: ["PC", "PS5", "Xbox Series", "Switch"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/381210/library_600x900.jpg",
      summary: {
        uk: "Асиметричний мультиплеєр із регулярними ліцензійними DLC та івентами.",
        en: "Asym multiplayer with constant licensed DLC killers and seasonal events."
      },
      metrics: { sentiment: 80, demandIndex: 84, priceStability: 58, communityHealth: 82 }
    },
    {
      id: "amongus",
      name: { uk: "Among Us", en: "Among Us" },
      genre: "Party",
      model: "Premium",
      basePriceUSD: 5,
      releaseYear: 2018,
      publisher: "Innersloth",
      steamAppId: 945360,
      platforms: ["PC", "Switch", "Mobile"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/945360/library_600x900.jpg",
      summary: {
        uk: "Соціальна дедукція, low-price impulse buys, кросплей і космокосметика.",
        en: "Social deduction hit with low-price impulse buys, crossplay, and cosmetics."
      },
      metrics: { sentiment: 85, demandIndex: 88, priceStability: 72, communityHealth: 90 }
    },
    {
      id: "phasmophobia",
      name: { uk: "Phasmophobia", en: "Phasmophobia" },
      genre: "Horror",
      model: "Premium",
      basePriceUSD: 15,
      releaseYear: 2020,
      publisher: "Kinetic Games",
      steamAppId: 739630,
      platforms: ["PC"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/739630/library_600x900.jpg",
      summary: {
        uk: "Кооп-ghost hunting з VR підтримкою; стабільні стрімерські піки.",
        en: "Co-op ghost hunting with VR support; steady streamer-driven peaks."
      },
      metrics: { sentiment: 86, demandIndex: 80, priceStability: 66, communityHealth: 83 }
    },
    {
      id: "titanfall2",
      name: { uk: "Titanfall 2", en: "Titanfall 2" },
      genre: "Shooter",
      model: "Premium",
      basePriceUSD: 20,
      releaseYear: 2016,
      publisher: "Electronic Arts",
      steamAppId: 1237970,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1237970/library_600x900.jpg",
      summary: {
        uk: "Культовий FPS із швидким рухом, потужною кампанією та періодичними сейлами.",
        en: "Cult classic FPS with fast movement, acclaimed campaign, and frequent sales."
      },
      metrics: { sentiment: 91, demandIndex: 73, priceStability: 74, communityHealth: 80 }
    },
    {
      id: "jedisurvivor",
      name: { uk: "STAR WARS Jedi: Survivor", en: "STAR WARS Jedi: Survivor" },
      genre: "Action",
      model: "Premium",
      basePriceUSD: 70,
      releaseYear: 2023,
      publisher: "Electronic Arts",
      steamAppId: 1774580,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1774580/library_600x900.jpg",
      summary: {
        uk: "Екшен Souls-lite у всесвіті Star Wars із дорожчою ціною та великими патчами.",
        en: "Souls-lite action in Star Wars universe with premium price and major patches."
      },
      metrics: { sentiment: 78, demandIndex: 81, priceStability: 54, communityHealth: 75 }
    },
    {
      id: "fallenorder",
      name: { uk: "STAR WARS Jedi: Fallen Order", en: "STAR WARS Jedi: Fallen Order" },
      genre: "Action",
      model: "Premium",
      basePriceUSD: 60,
      releaseYear: 2019,
      publisher: "Electronic Arts",
      steamAppId: 1172380,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1172380/library_600x900.jpg",
      summary: {
        uk: "Перший джедаїський екшен від Respawn; сильні сейли та Game Pass ефект.",
        en: "Respawn's first Jedi action title; strong sales and Game Pass halo."
      },
      metrics: { sentiment: 86, demandIndex: 78, priceStability: 66, communityHealth: 80 }
    },
    {
      id: "doometernal",
      name: { uk: "DOOM Eternal", en: "DOOM Eternal" },
      genre: "Shooter",
      model: "Premium",
      basePriceUSD: 60,
      releaseYear: 2020,
      publisher: "Bethesda",
      steamAppId: 782330,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/782330/library_600x900.jpg",
      summary: {
        uk: "Хардкорний FPS з двома DLC і стабільним перфомансом у сейли.",
        en: "Hardcore FPS with two DLC packs and reliable sale performance."
      },
      metrics: { sentiment: 90, demandIndex: 80, priceStability: 62, communityHealth: 82 }
    },
    {
      id: "doom2016",
      name: { uk: "DOOM (2016)", en: "DOOM (2016)" },
      genre: "Shooter",
      model: "Premium",
      basePriceUSD: 20,
      releaseYear: 2016,
      publisher: "Bethesda",
      steamAppId: 379720,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/379720/library_600x900.jpg",
      summary: {
        uk: "Ребут DOOM з heavy metal сетом, сильні сейли та високий NPS.",
        en: "DOOM reboot with heavy metal pacing; strong discounts and high NPS."
      },
      metrics: { sentiment: 90, demandIndex: 77, priceStability: 70, communityHealth: 82 }
    },
    {
      id: "quakechampions",
      name: { uk: "Quake Champions", en: "Quake Champions" },
      genre: "Shooter",
      model: "F2P",
      basePriceUSD: 15,
      releaseYear: 2017,
      publisher: "Bethesda",
      steamAppId: 611500,
      platforms: ["PC"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/611500/library_600x900.jpg",
      summary: {
        uk: "Арена-шутер з чемпіонами, косметикою та івентами, невеликі але стабільні піки.",
        en: "Arena shooter with champions, cosmetics, and events; smaller but steady peaks."
      },
      metrics: { sentiment: 70, demandIndex: 62, priceStability: 50, communityHealth: 68 }
    },
    {
      id: "vermintide2",
      name: { uk: "Warhammer: Vermintide 2", en: "Warhammer: Vermintide 2" },
      genre: "Action",
      model: "Premium",
      basePriceUSD: 30,
      releaseYear: 2018,
      publisher: "Fatshark",
      steamAppId: 552500,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/552500/library_600x900.jpg",
      summary: {
        uk: "Кооп hack'n'slash у Warhammer, часті DLC-карти та івенти.",
        en: "Co-op hack'n'slash in Warhammer; frequent DLC maps and events."
      },
      metrics: { sentiment: 82, demandIndex: 73, priceStability: 58, communityHealth: 78 }
    },
    {
      id: "twwarhammer3",
      name: { uk: "Total War: WARHAMMER III", en: "Total War: WARHAMMER III" },
      genre: "Strategy",
      model: "Premium",
      basePriceUSD: 60,
      releaseYear: 2022,
      publisher: "SEGA / Creative Assembly",
      steamAppId: 1142710,
      platforms: ["PC"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1142710/library_600x900.jpg",
      summary: {
        uk: "Глобальна стратегія з DLC-екосистемою Immortal Empires, високий LTV.",
        en: "Grand strategy with DLC ecosystem (Immortal Empires) driving high LTV."
      },
      metrics: { sentiment: 78, demandIndex: 79, priceStability: 55, communityHealth: 74 }
    },
    {
      id: "twwarhammer2",
      name: { uk: "Total War: WARHAMMER II", en: "Total War: WARHAMMER II" },
      genre: "Strategy",
      model: "Premium",
      basePriceUSD: 60,
      releaseYear: 2017,
      publisher: "SEGA / Creative Assembly",
      steamAppId: 594570,
      platforms: ["PC"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/594570/library_600x900.jpg",
      summary: {
        uk: "Попередній хіт з багатим DLC; evergreen сейли для нових гравців.",
        en: "Prior hit with rich DLC catalog; evergreen sales for new players."
      },
      metrics: { sentiment: 88, demandIndex: 71, priceStability: 69, communityHealth: 82 }
    },
    {
      id: "threekingdoms",
      name: { uk: "Total War: THREE KINGDOMS", en: "Total War: THREE KINGDOMS" },
      genre: "Strategy",
      model: "Premium",
      basePriceUSD: 60,
      releaseYear: 2019,
      publisher: "SEGA / Creative Assembly",
      steamAppId: 779340,
      platforms: ["PC"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/779340/library_600x900.jpg",
      summary: {
        uk: "Історична Total War з фокусом на героїв; сильний старт і стабільні сейли.",
        en: "Historical Total War with hero focus; strong launch and steady sales."
      },
      metrics: { sentiment: 83, demandIndex: 68, priceStability: 63, communityHealth: 72 }
    },
    {
      id: "civilization6",
      name: { uk: "Sid Meier's Civilization VI", en: "Sid Meier's Civilization VI" },
      genre: "Strategy",
      model: "Premium",
      basePriceUSD: 60,
      releaseYear: 2016,
      publisher: "2K",
      steamAppId: 289070,
      platforms: ["PC", "Switch"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/289070/library_600x900.jpg",
      summary: {
        uk: "4X флагман із великим списком DLC/expansions, високий довгий хвіст.",
        en: "4X flagship with large DLC/expansion list and long-tail revenue."
      },
      metrics: { sentiment: 87, demandIndex: 82, priceStability: 71, communityHealth: 86 }
    },
    {
      id: "civilization5",
      name: { uk: "Sid Meier's Civilization V", en: "Sid Meier's Civilization V" },
      genre: "Strategy",
      model: "Premium",
      basePriceUSD: 30,
      releaseYear: 2010,
      publisher: "2K",
      steamAppId: 8930,
      platforms: ["PC", "Mac"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/8930/library_600x900.jpg",
      summary: {
        uk: "Класичний 4X, досі у топ-сейлах під час розпродажів.",
        en: "Classic 4X still charting during sales events."
      },
      metrics: { sentiment: 92, demandIndex: 70, priceStability: 80, communityHealth: 84 }
    },
    {
      id: "ets2",
      name: { uk: "Euro Truck Simulator 2", en: "Euro Truck Simulator 2" },
      genre: "Simulation",
      model: "Premium",
      basePriceUSD: 20,
      releaseYear: 2012,
      publisher: "SCS Software",
      steamAppId: 227300,
      platforms: ["PC"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/227300/library_600x900.jpg",
      summary: {
        uk: "Дальнобійний сим з купою DLC-мап; стабільний ком'юніті й моди.",
        en: "Trucking sim with huge DLC map lineup; stable community and mods."
      },
      metrics: { sentiment: 92, demandIndex: 78, priceStability: 85, communityHealth: 88 }
    },
    {
      id: "ats",
      name: { uk: "American Truck Simulator", en: "American Truck Simulator" },
      genre: "Simulation",
      model: "Premium",
      basePriceUSD: 20,
      releaseYear: 2016,
      publisher: "SCS Software",
      steamAppId: 270880,
      platforms: ["PC"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/270880/library_600x900.jpg",
      summary: {
        uk: "Американський аналог ETS2 з регулярними DLC-штатами та івентами.",
        en: "American counterpart to ETS2 with frequent state DLCs and events."
      },
      metrics: { sentiment: 90, demandIndex: 70, priceStability: 82, communityHealth: 84 }
    },
    {
      id: "f123",
      name: { uk: "F1 23", en: "F1 23" },
      genre: "Racing",
      model: "Premium",
      basePriceUSD: 70,
      releaseYear: 2023,
      publisher: "EA Sports",
      steamAppId: 2108330,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/2108330/library_600x900.jpg",
      summary: {
        uk: "Щорічна формула із режимом Braking Point 2 та живим сервісом.",
        en: "Annual F1 entry with Braking Point 2 and live service events."
      },
      metrics: { sentiment: 75, demandIndex: 72, priceStability: 53, communityHealth: 69 }
    },
    {
      id: "eafc24",
      name: { uk: "EA SPORTS FC 24", en: "EA SPORTS FC 24" },
      genre: "Sports",
      model: "Premium",
      basePriceUSD: 70,
      releaseYear: 2023,
      publisher: "EA Sports",
      steamAppId: 2195250,
      platforms: ["PC", "PS5", "Xbox Series", "Switch"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/2195250/library_600x900.jpg",
      summary: {
        uk: "Футбол-щорічник із Ultimate Team, SBC та високим живим монетизаційним хвостом.",
        en: "Annual football title with Ultimate Team, SBCs, and heavy live monetization."
      },
      metrics: { sentiment: 67, demandIndex: 90, priceStability: 45, communityHealth: 74 }
    },
    {
      id: "nba2k24",
      name: { uk: "NBA 2K24", en: "NBA 2K24" },
      genre: "Sports",
      model: "Premium",
      basePriceUSD: 70,
      releaseYear: 2023,
      publisher: "2K",
      steamAppId: 2338770,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/2338770/library_600x900.jpg",
      summary: {
        uk: "Щорічний NBA з MyCareer та MyTeam; високий ARPU через мікротранзакції.",
        en: "Annual NBA with MyCareer/MyTeam; high ARPU from microtransactions."
      },
      metrics: { sentiment: 60, demandIndex: 78, priceStability: 42, communityHealth: 68 }
    },
    {
      id: "madden24",
      name: { uk: "Madden NFL 24", en: "Madden NFL 24" },
      genre: "Sports",
      model: "Premium",
      basePriceUSD: 70,
      releaseYear: 2023,
      publisher: "EA Sports",
      steamAppId: 2194930,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/2194930/library_600x900.jpg",
      summary: {
        uk: "NFL щорічник з Ultimate Team та Live service обробкою сезонів.",
        en: "NFL annual entry with Ultimate Team and live seasonal handling."
      },
      metrics: { sentiment: 58, demandIndex: 66, priceStability: 41, communityHealth: 60 }
    },
    {
      id: "theforest",
      name: { uk: "The Forest", en: "The Forest" },
      genre: "Survival",
      model: "Premium",
      basePriceUSD: 20,
      releaseYear: 2018,
      publisher: "Endnight Games",
      steamAppId: 242760,
      platforms: ["PC", "PS5"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/242760/library_600x900.jpg",
      summary: {
        uk: "Хоррор-виживання з коопом; стабільні сейли перед релізом Sons of the Forest.",
        en: "Co-op horror survival; stable sales boosted ahead of Sons of the Forest."
      },
      metrics: { sentiment: 83, demandIndex: 74, priceStability: 68, communityHealth: 80 }
    },
    {
      id: "sonsoftheforest",
      name: { uk: "Sons Of The Forest", en: "Sons Of The Forest" },
      genre: "Survival",
      model: "Premium",
      basePriceUSD: 30,
      releaseYear: 2023,
      publisher: "Endnight Games",
      steamAppId: 1326470,
      platforms: ["PC"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1326470/library_600x900.jpg",
      summary: {
        uk: "Сиквел з будівництвом, коопом і потужним стартовим піком в ранньому доступі.",
        en: "Sequel with building, co-op, and strong EA launch spike."
      },
      metrics: { sentiment: 78, demandIndex: 85, priceStability: 57, communityHealth: 79 }
    },
    {
      id: "deeprock",
      name: { uk: "Deep Rock Galactic", en: "Deep Rock Galactic" },
      genre: "Co-op",
      model: "Premium",
      basePriceUSD: 30,
      releaseYear: 2020,
      publisher: "Coffee Stain Publishing",
      steamAppId: 548430,
      platforms: ["PC", "Xbox Series", "PS5"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/548430/library_600x900.jpg",
      summary: {
        uk: "Кооп про гномів-майнерів, сезонні паси та високий кооперативний retention.",
        en: "Co-op dwarven mining shooter with season passes and strong co-op retention."
      },
      metrics: { sentiment: 94, demandIndex: 78, priceStability: 73, communityHealth: 90 }
    },
    {
      id: "valheim",
      name: { uk: "Valheim", en: "Valheim" },
      genre: "Survival",
      model: "Premium",
      basePriceUSD: 20,
      releaseYear: 2021,
      publisher: "Coffee Stain Publishing",
      steamAppId: 892970,
      platforms: ["PC"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/892970/library_600x900.jpg",
      summary: {
        uk: "Вікінгське виживання з процедурним світом; феноменальний запуск та довгий хвіст.",
        en: "Viking survival with procedural worlds; breakout launch and long tail."
      },
      metrics: { sentiment: 90, demandIndex: 82, priceStability: 70, communityHealth: 86 }
    },
    {
      id: "ksp",
      name: { uk: "Kerbal Space Program", en: "Kerbal Space Program" },
      genre: "Simulation",
      model: "Premium",
      basePriceUSD: 40,
      releaseYear: 2015,
      publisher: "Private Division",
      steamAppId: 220200,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/220200/library_600x900.jpg",
      summary: {
        uk: "Симулятор космічної програми з фізикою та моддингом; evergreen сейли.",
        en: "Space program sim with realistic physics and modding; evergreen sales."
      },
      metrics: { sentiment: 95, demandIndex: 75, priceStability: 80, communityHealth: 89 }
    },
    {
      id: "ksp2",
      name: { uk: "Kerbal Space Program 2", en: "Kerbal Space Program 2" },
      genre: "Simulation",
      model: "Premium",
      basePriceUSD: 50,
      releaseYear: 2023,
      publisher: "Private Division",
      steamAppId: 954850,
      platforms: ["PC"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/954850/library_600x900.jpg",
      summary: {
        uk: "Ранній доступ сиквелу KSP, амбіційний roadmap колонізації.",
        en: "Early access sequel with ambitious colonization roadmap."
      },
      metrics: { sentiment: 60, demandIndex: 70, priceStability: 38, communityHealth: 62 }
    },
    {
      id: "slaythespire",
      name: { uk: "Slay the Spire", en: "Slay the Spire" },
      genre: "Roguelike",
      model: "Premium",
      basePriceUSD: 25,
      releaseYear: 2019,
      publisher: "Mega Crit",
      steamAppId: 646570,
      platforms: ["PC", "Switch", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/646570/library_600x900.jpg",
      summary: {
        uk: "Декбілдер- roguelike з нескінченною реіграбельністю та хорошими сейлами.",
        en: "Deckbuilder roguelike with endless replayability and strong sale cadence."
      },
      metrics: { sentiment: 95, demandIndex: 80, priceStability: 78, communityHealth: 90 }
    },
    {
      id: "hades2",
      name: { uk: "Hades II", en: "Hades II" },
      genre: "Roguelike",
      model: "Premium",
      basePriceUSD: 35,
      releaseYear: 2024,
      publisher: "Supergiant Games",
      steamAppId: 2116150,
      platforms: ["PC"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/2116150/library_600x900.jpg",
      summary: {
        uk: "Ранній доступ сиквелу з новими богами та високим очікуванням стрімерів.",
        en: "Early access sequel with new gods and huge streamer anticipation."
      },
      metrics: { sentiment: 92, demandIndex: 90, priceStability: 52, communityHealth: 88 }
    },
    {
      id: "riskofrain2",
      name: { uk: "Risk of Rain 2", en: "Risk of Rain 2" },
      genre: "Roguelike",
      model: "Premium",
      basePriceUSD: 25,
      releaseYear: 2020,
      publisher: "Gearbox Publishing",
      steamAppId: 632360,
      platforms: ["PC", "PS5", "Xbox Series", "Switch"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/632360/library_600x900.jpg",
      summary: {
        uk: "3D roguelike шутер з коопом, DLC Survivors of the Void продовжує LTV.",
        en: "3D roguelike shooter with co-op; Survivors of the Void DLC extends LTV."
      },
      metrics: { sentiment: 92, demandIndex: 79, priceStability: 72, communityHealth: 87 }
    },
    {
      id: "riskofrainreturns",
      name: { uk: "Risk of Rain Returns", en: "Risk of Rain Returns" },
      genre: "Roguelike",
      model: "Premium",
      basePriceUSD: 15,
      releaseYear: 2023,
      publisher: "Gearbox Publishing",
      steamAppId: 1337520,
      platforms: ["PC", "Switch"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1337520/library_600x900.jpg",
      summary: {
        uk: "Ремастер 2D класики з новими виживальниками та коопом.",
        en: "Remaster of the 2D classic with new survivors and co-op."
      },
      metrics: { sentiment: 88, demandIndex: 68, priceStability: 64, communityHealth: 78 }
    },
    {
      id: "portal",
      name: { uk: "Portal", en: "Portal" },
      genre: "Puzzle",
      model: "Premium",
      basePriceUSD: 10,
      releaseYear: 2007,
      publisher: "Valve",
      steamAppId: 400,
      platforms: ["PC"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/400/library_600x900.jpg",
      summary: {
        uk: "Оригінальний Portal, короткий але культовий, evergreen у сейли.",
        en: "Original Portal, short but iconic; evergreen sale performer."
      },
      metrics: { sentiment: 97, demandIndex: 70, priceStability: 82, communityHealth: 88 }
    },
    {
      id: "godofwar",
      name: { uk: "God of War", en: "God of War" },
      genre: "Action",
      model: "Premium",
      basePriceUSD: 50,
      releaseYear: 2022,
      publisher: "PlayStation PC",
      steamAppId: 1593500,
      topPick: true,
      platforms: ["PC", "PS5"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1593500/library_600x900.jpg",
      summary: {
        uk: "Красторний перезапуск з сильним сюжетом та PC-портом з DLSS/FSR.",
        en: "Prestige reboot with cinematic story; PC port with DLSS/FSR polish."
      },
      metrics: { sentiment: 93, demandIndex: 88, priceStability: 66, communityHealth: 88 }
    },
    {
      id: "spidermanremastered",
      name: { uk: "Marvel's Spider-Man Remastered", en: "Marvel's Spider-Man Remastered" },
      genre: "Action",
      model: "Premium",
      basePriceUSD: 60,
      releaseYear: 2022,
      publisher: "PlayStation PC",
      steamAppId: 1817070,
      platforms: ["PC", "PS5"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1817070/library_600x900.jpg",
      summary: {
        uk: "Open-world Манхеттен із RTX та DLSS, стабільний бренд Marvel.",
        en: "Open-world Manhattan with RTX & DLSS; strong Marvel brand pull."
      },
      metrics: { sentiment: 90, demandIndex: 84, priceStability: 62, communityHealth: 83 }
    },
    {
      id: "spidermanmm",
      name: { uk: "Marvel's Spider-Man: Miles Morales", en: "Marvel's Spider-Man: Miles Morales" },
      genre: "Action",
      model: "Premium",
      basePriceUSD: 50,
      releaseYear: 2022,
      publisher: "PlayStation PC",
      steamAppId: 1817190,
      platforms: ["PC", "PS5"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1817190/library_600x900.jpg",
      summary: {
        uk: "Коротший спін-офф з зимовим Манхеттеном, високий NPS.",
        en: "Shorter winter spin-off with high NPS and polished PC tech."
      },
      metrics: { sentiment: 88, demandIndex: 78, priceStability: 60, communityHealth: 82 }
    },
    {
      id: "lastofus1",
      name: { uk: "The Last of Us Part I", en: "The Last of Us Part I" },
      genre: "Action",
      model: "Premium",
      basePriceUSD: 60,
      releaseYear: 2023,
      publisher: "PlayStation PC",
      steamAppId: 1888930,
      platforms: ["PC", "PS5"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1888930/library_600x900.jpg",
      summary: {
        uk: "Ремейк класики з PC патчами, високим попитом після серіалу.",
        en: "Remake of the classic; PC patches plus TV halo keep demand high."
      },
      metrics: { sentiment: 80, demandIndex: 90, priceStability: 55, communityHealth: 78 }
    },
    {
      id: "returnal",
      name: { uk: "Returnal", en: "Returnal" },
      genre: "Roguelike",
      model: "Premium",
      basePriceUSD: 60,
      releaseYear: 2023,
      publisher: "PlayStation PC",
      steamAppId: 1644960,
      platforms: ["PC", "PS5"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1644960/library_600x900.jpg",
      summary: {
        uk: "Bullet-hell roguelike з RTX/FSR та глибоким лайфтаймом.",
        en: "Bullet-hell roguelike with RTX/FSR and deep endgame loop."
      },
      metrics: { sentiment: 84, demandIndex: 72, priceStability: 58, communityHealth: 76 }
    },
    {
      id: "unchartedlotc",
      name: { uk: "UNCHARTED: Legacy of Thieves Collection", en: "UNCHARTED: Legacy of Thieves Collection" },
      genre: "Adventure",
      model: "Premium",
      basePriceUSD: 50,
      releaseYear: 2022,
      publisher: "PlayStation PC",
      steamAppId: 1659420,
      platforms: ["PC", "PS5"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1659420/library_600x900.jpg",
      summary: {
        uk: "Дві кампанії Uncharted з PC-фічами; evergreen бренд Naughty Dog.",
        en: "Two Uncharted campaigns with PC features; evergreen Naughty Dog brand."
      },
      metrics: { sentiment: 86, demandIndex: 74, priceStability: 61, communityHealth: 79 }
    },
    {
      id: "hfw",
      name: { uk: "Horizon Forbidden West", en: "Horizon Forbidden West" },
      genre: "Action",
      model: "Premium",
      basePriceUSD: 60,
      releaseYear: 2024,
      publisher: "PlayStation PC",
      steamAppId: 2276510,
      topPick: true,
      platforms: ["PC", "PS5"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/2276510/library_600x900.jpg",
      summary: {
        uk: "PC-порт сиквелу з Burning Shores; сильна графіка та сейли.",
        en: "PC port of the sequel with Burning Shores; stunning visuals and strong sale tail."
      },
      metrics: { sentiment: 88, demandIndex: 82, priceStability: 60, communityHealth: 83 }
    },
    {
      id: "ghostoftsushima",
      name: { uk: "Ghost of Tsushima DIRECTOR'S CUT", en: "Ghost of Tsushima DIRECTOR'S CUT" },
      genre: "Action",
      model: "Premium",
      basePriceUSD: 60,
      releaseYear: 2024,
      publisher: "PlayStation PC",
      steamAppId: 2215430,
      platforms: ["PC", "PS5"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/2215430/library_600x900.jpg",
      summary: {
        uk: "Самурайський open-world з Legends-коопом; преміальний попит на PC.",
        en: "Samurai open world with Legends co-op; premium demand on PC."
      },
      metrics: { sentiment: 91, demandIndex: 88, priceStability: 63, communityHealth: 86 }
    },
    {
      id: "persona5royal",
      name: { uk: "Persona 5 Royal", en: "Persona 5 Royal" },
      genre: "RPG",
      model: "Premium",
      basePriceUSD: 60,
      releaseYear: 2022,
      publisher: "SEGA / ATLUS",
      steamAppId: 1687950,
      topPick: true,
      platforms: ["PC", "PS5", "Switch"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1687950/library_600x900.jpg",
      summary: {
        uk: "JRPG GOTY-рівня з масивним контентом та саундтреком; evergreen.",
        en: "GOTY-tier JRPG with massive content and soundtrack; evergreen performer."
      },
      metrics: { sentiment: 96, demandIndex: 80, priceStability: 68, communityHealth: 90 }
    },
    {
      id: "persona3reload",
      name: { uk: "Persona 3 Reload", en: "Persona 3 Reload" },
      genre: "RPG",
      model: "Premium",
      basePriceUSD: 70,
      releaseYear: 2024,
      publisher: "SEGA / ATLUS",
      steamAppId: 2161700,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/2161700/library_600x900.jpg",
      summary: {
        uk: "Повний ремейк класики з QoL та новою аудиторією Game Pass.",
        en: "Full remake of a classic; QoL uplift and fresh Game Pass audience."
      },
      metrics: { sentiment: 88, demandIndex: 82, priceStability: 59, communityHealth: 83 }
    },
    {
      id: "persona4golden",
      name: { uk: "Persona 4 Golden", en: "Persona 4 Golden" },
      genre: "RPG",
      model: "Premium",
      basePriceUSD: 20,
      releaseYear: 2020,
      publisher: "SEGA / ATLUS",
      steamAppId: 111300,
      platforms: ["PC", "Switch"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/111300/library_600x900.jpg",
      summary: {
        uk: "Класичне JRPG із культовим фанбазом та низькою ціною входу.",
        en: "Classic JRPG with cult following and low price of entry."
      },
      metrics: { sentiment: 94, demandIndex: 70, priceStability: 78, communityHealth: 88 }
    },
    {
      id: "yakuza7",
      name: { uk: "Yakuza: Like a Dragon", en: "Yakuza: Like a Dragon" },
      genre: "RPG",
      model: "Premium",
      basePriceUSD: 60,
      releaseYear: 2020,
      publisher: "SEGA",
      steamAppId: 1235140,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1235140/library_600x900.jpg",
      summary: {
        uk: "Поворот до JRPG у серії RGG; гумор + довгий сейл-хвіст.",
        en: "JRPG pivot for the RGG series; humor plus long sale tail."
      },
      metrics: { sentiment: 90, demandIndex: 75, priceStability: 64, communityHealth: 82 }
    },
    {
      id: "yakuza0",
      name: { uk: "Yakuza 0", en: "Yakuza 0" },
      genre: "Action",
      model: "Premium",
      basePriceUSD: 20,
      releaseYear: 2018,
      publisher: "SEGA",
      steamAppId: 638970,
      platforms: ["PC", "PS5"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/638970/library_600x900.jpg",
      summary: {
        uk: "Любимий приквел з низькою ціною, evergreen у сейли.",
        en: "Beloved prequel with low price; evergreen sale performer."
      },
      metrics: { sentiment: 95, demandIndex: 72, priceStability: 82, communityHealth: 88 }
    },
    {
      id: "ladgaiden",
      name: { uk: "Like a Dragon Gaiden", en: "Like a Dragon Gaiden" },
      genre: "Action",
      model: "Premium",
      basePriceUSD: 50,
      releaseYear: 2023,
      publisher: "SEGA",
      steamAppId: 1967450,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1967450/library_600x900.jpg",
      summary: {
        uk: "Кірю-спін-офф із коротшою кампанією; місток до Infinite Wealth.",
        en: "Kiryu spin-off bridging to Infinite Wealth; shorter, high-engagement campaign."
      },
      metrics: { sentiment: 82, demandIndex: 74, priceStability: 58, communityHealth: 78 }
    },
    {
      id: "ladinfinite",
      name: { uk: "Like a Dragon: Infinite Wealth", en: "Like a Dragon: Infinite Wealth" },
      genre: "RPG",
      model: "Premium",
      basePriceUSD: 70,
      releaseYear: 2024,
      publisher: "SEGA",
      steamAppId: 2375550,
      topPick: true,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/2375550/library_600x900.jpg",
      summary: {
        uk: "Новий флагман RGG з будівництвом острова та подвійними протагонистами.",
        en: "Latest RGG flagship with island builder and dual protagonists."
      },
      metrics: { sentiment: 90, demandIndex: 86, priceStability: 60, communityHealth: 85 }
    },
    {
      id: "granbluefantasyrelink",
      name: { uk: "GRANBLUE FANTASY: Relink", en: "GRANBLUE FANTASY: Relink" },
      genre: "Action",
      model: "Premium",
      basePriceUSD: 60,
      releaseYear: 2024,
      publisher: "Cygames",
      steamAppId: 851850,
      platforms: ["PC", "PS5"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/851850/library_600x900.jpg",
      summary: {
        uk: "Кооп action-RPG з рейдами; сильна графіка і live events.",
        en: "Co-op action RPG with raids; strong visuals and ongoing events."
      },
      metrics: { sentiment: 82, demandIndex: 80, priceStability: 55, communityHealth: 79 }
    },
    {
      id: "armoredcore6",
      name: { uk: "ARMORED CORE VI", en: "ARMORED CORE VI" },
      genre: "Action",
      model: "Premium",
      basePriceUSD: 60,
      releaseYear: 2023,
      publisher: "Bandai Namco / FromSoftware",
      steamAppId: 1888160,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1888160/library_600x900.jpg",
      summary: {
        uk: "Мех-екшен від FromSoftware; висока складність, стабільний попит.",
        en: "Mech action from FromSoftware; high difficulty, steady demand."
      },
      metrics: { sentiment: 87, demandIndex: 82, priceStability: 60, communityHealth: 82 }
    },
    {
      id: "tekken8",
      name: { uk: "TEKKEN 8", en: "TEKKEN 8" },
      genre: "Fighting",
      model: "Premium",
      basePriceUSD: 70,
      releaseYear: 2024,
      publisher: "Bandai Namco",
      steamAppId: 1778820,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1778820/library_600x900.jpg",
      summary: {
        uk: "Файтинг з live-сезонами та esports-сценой, rollback netcode.",
        en: "Fighting flagship with live seasons, esports, and rollback netcode."
      },
      metrics: { sentiment: 85, demandIndex: 85, priceStability: 57, communityHealth: 80 }
    },
    {
      id: "streetfighter6",
      name: { uk: "Street Fighter 6", en: "Street Fighter 6" },
      genre: "Fighting",
      model: "Premium",
      basePriceUSD: 60,
      releaseYear: 2023,
      publisher: "Capcom",
      steamAppId: 1364780,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1364780/library_600x900.jpg",
      summary: {
        uk: "Файтинг з World Tour, Battle Hub та кросплеєм.",
        en: "Fighter with World Tour, Battle Hub, and cross-play support."
      },
      metrics: { sentiment: 90, demandIndex: 83, priceStability: 58, communityHealth: 84 }
    },
    {
      id: "mk1",
      name: { uk: "Mortal Kombat 1", en: "Mortal Kombat 1" },
      genre: "Fighting",
      model: "Premium",
      basePriceUSD: 70,
      releaseYear: 2023,
      publisher: "Warner Bros.",
      steamAppId: 1971870,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1971870/library_600x900.jpg",
      summary: {
        uk: "Ребут MK із Kameo-системою; потужний бренд і live DLC персонажі.",
        en: "MK reboot with Kameo system; strong brand and live DLC roster."
      },
      metrics: { sentiment: 78, demandIndex: 80, priceStability: 54, communityHealth: 77 }
    },
    {
      id: "guiltygearstrive",
      name: { uk: "GUILTY GEAR -STRIVE-", en: "GUILTY GEAR -STRIVE-" },
      genre: "Fighting",
      model: "Premium",
      basePriceUSD: 40,
      releaseYear: 2021,
      publisher: "Arc System Works",
      steamAppId: 1384160,
      platforms: ["PC", "PS5"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1384160/library_600x900.jpg",
      summary: {
        uk: "Anime-файтинг із rollback netcode та великими сезонними пасами.",
        en: "Anime fighter with rollback netcode and sizable season passes."
      },
      metrics: { sentiment: 87, demandIndex: 72, priceStability: 61, communityHealth: 82 }
    },
    {
      id: "lethalcompany",
      name: { uk: "Lethal Company", en: "Lethal Company" },
      genre: "Co-op",
      model: "Premium",
      basePriceUSD: 10,
      releaseYear: 2023,
      publisher: "Zeekerss",
      steamAppId: 1966720,
      topPick: true,
      platforms: ["PC"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1966720/library_600x900.jpg",
      summary: {
        uk: "Кооп-хоррор про збір скрапу; вірусне зростання, низька ціна.",
        en: "Co-op horror scavenging hit; viral growth and low price point."
      },
      metrics: { sentiment: 88, demandIndex: 95, priceStability: 62, communityHealth: 90 }
    },
    {
      id: "manorlords",
      name: { uk: "Manor Lords", en: "Manor Lords" },
      genre: "Strategy",
      model: "Premium",
      basePriceUSD: 40,
      releaseYear: 2024,
      publisher: "Hooded Horse",
      steamAppId: 1363080,
      platforms: ["PC"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1363080/library_600x900.jpg",
      summary: {
        uk: "Середньовічний містобуд з боєм у ранньому доступі; величезний вішлист.",
        en: "Medieval city-builder with battles (EA); massive wishlist hit."
      },
      metrics: { sentiment: 82, demandIndex: 92, priceStability: 48, communityHealth: 78 }
    },
    {
      id: "enshrouded",
      name: { uk: "Enshrouded", en: "Enshrouded" },
      genre: "Survival",
      model: "Premium",
      basePriceUSD: 30,
      releaseYear: 2024,
      publisher: "Keen Games",
      steamAppId: 1203620,
      platforms: ["PC"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1203620/library_600x900.jpg",
      summary: {
        uk: "Воксельне виживання з будівництвом та коопом; сильний ранній доступ.",
        en: "Voxel survival with building and co-op; strong early access start."
      },
      metrics: { sentiment: 80, demandIndex: 88, priceStability: 50, communityHealth: 82 }
    },
    {
      id: "davethediver",
      name: { uk: "DAVE THE DIVER", en: "DAVE THE DIVER" },
      genre: "Adventure",
      model: "Premium",
      basePriceUSD: 20,
      releaseYear: 2023,
      publisher: "MINTROCKET",
      steamAppId: 1868140,
      platforms: ["PC", "Switch"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1868140/library_600x900.jpg",
      summary: {
        uk: "Піксельний дайвинг+менеджмент-хіт з шаленим сарафаном.",
        en: "Pixel diving + restaurant management hit with huge word-of-mouth."
      },
      metrics: { sentiment: 95, demandIndex: 86, priceStability: 78, communityHealth: 92 }
    },
    {
      id: "vampiresurvivors",
      name: { uk: "Vampire Survivors", en: "Vampire Survivors" },
      genre: "Roguelike",
      model: "Premium",
      basePriceUSD: 5,
      releaseYear: 2022,
      publisher: "poncle",
      steamAppId: 1794680,
      platforms: ["PC", "Xbox Series", "Mobile"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1794680/library_600x900.jpg",
      summary: {
        uk: "Автобатлер-хіт з низькою ціною та нескінченними апдейтами.",
        en: "Auto-battler breakout with tiny price and endless updates."
      },
      metrics: { sentiment: 95, demandIndex: 90, priceStability: 82, communityHealth: 94 }
    },
    {
      id: "cultofthelamb",
      name: { uk: "Cult of the Lamb", en: "Cult of the Lamb" },
      genre: "Roguelike",
      model: "Premium",
      basePriceUSD: 25,
      releaseYear: 2022,
      publisher: "Devolver Digital",
      steamAppId: 1313140,
      platforms: ["PC", "PS5", "Xbox Series", "Switch"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1313140/library_600x900.jpg",
      summary: {
        uk: "Rogue-lite з менеджментом культу; стиль, мерч і DLC забезпечують LTV.",
        en: "Rogue-lite cult simulator; style, merch, and DLC drive long LTV."
      },
      metrics: { sentiment: 91, demandIndex: 80, priceStability: 70, communityHealth: 88 }
    },
    {
      id: "pizzatower",
      name: { uk: "Pizza Tower", en: "Pizza Tower" },
      genre: "Platformer",
      model: "Premium",
      basePriceUSD: 20,
      releaseYear: 2023,
      publisher: "Tour De Pizza",
      steamAppId: 2231450,
      platforms: ["PC"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/2231450/library_600x900.jpg",
      summary: {
        uk: "Спритний платформер у стилі Wario Land; вірусні кліпи та спідрани.",
        en: "Fast platformer in Wario style; viral clips and speedrun appeal."
      },
      metrics: { sentiment: 94, demandIndex: 78, priceStability: 74, communityHealth: 88 }
    },
    {
      id: "celeste",
      name: { uk: "Celeste", en: "Celeste" },
      genre: "Platformer",
      model: "Premium",
      basePriceUSD: 20,
      releaseYear: 2018,
      publisher: "Maddy Makes Games",
      steamAppId: 504230,
      platforms: ["PC", "Switch", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/504230/library_600x900.jpg",
      summary: {
        uk: "Інді-платформер з високим NPS і evergreen сейлами.",
        en: "Indie platformer with sky-high NPS and evergreen sale tail."
      },
      metrics: { sentiment: 96, demandIndex: 72, priceStability: 82, communityHealth: 90 }
    },
    {
      id: "outerwilds",
      name: { uk: "Outer Wilds", en: "Outer Wilds" },
      genre: "Adventure",
      model: "Premium",
      basePriceUSD: 25,
      releaseYear: 2020,
      publisher: "Annapurna Interactive",
      steamAppId: 753640,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/753640/library_600x900.jpg",
      summary: {
        uk: "Петля часу в космосі; критичний хіт з довгим лайфтаймом.",
        en: "Time-loop space adventure; critical darling with long lifetime."
      },
      metrics: { sentiment: 96, demandIndex: 74, priceStability: 76, communityHealth: 90 }
    },
    {
      id: "deathloop",
      name: { uk: "DEATHLOOP", en: "DEATHLOOP" },
      genre: "Shooter",
      model: "Premium",
      basePriceUSD: 60,
      releaseYear: 2021,
      publisher: "Bethesda",
      steamAppId: 1252330,
      platforms: ["PC", "PS5"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1252330/library_600x900.jpg",
      summary: {
        uk: "Immersive sim з таймлупом від Arkane; стильна постановка.",
        en: "Time-loop immersive sim from Arkane; stylish direction and design."
      },
      metrics: { sentiment: 84, demandIndex: 70, priceStability: 57, communityHealth: 76 }
    },
    {
      id: "ghostwiretokyo",
      name: { uk: "Ghostwire: Tokyo", en: "Ghostwire: Tokyo" },
      genre: "Action",
      model: "Premium",
      basePriceUSD: 60,
      releaseYear: 2022,
      publisher: "Bethesda",
      steamAppId: 1475810,
      platforms: ["PC", "PS5"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1475810/library_600x900.jpg",
      summary: {
        uk: "Сюжетний екшен у Токіо з рей-трейсингом; часті сейли.",
        en: "Story action in Tokyo with ray tracing; frequent discounts."
      },
      metrics: { sentiment: 75, demandIndex: 70, priceStability: 55, communityHealth: 72 }
    },
    {
      id: "controlultimate",
      name: { uk: "Control Ultimate Edition", en: "Control Ultimate Edition" },
      genre: "Action",
      model: "Premium",
      basePriceUSD: 40,
      releaseYear: 2020,
      publisher: "505 Games",
      steamAppId: 870780,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/870780/library_600x900.jpg",
      summary: {
        uk: "Сюрреалістичний екшен Remedy з RTX та двома DLC.",
        en: "Surreal Remedy action with RTX and both DLC packs included."
      },
      metrics: { sentiment: 86, demandIndex: 76, priceStability: 64, communityHealth: 80 }
    },
    {
      id: "alanwake2",
      name: { uk: "Alan Wake 2", en: "Alan Wake 2" },
      genre: "Horror",
      model: "Premium",
      basePriceUSD: 50,
      releaseYear: 2024,
      publisher: "Epic / Remedy",
      steamAppId: 1938090,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1938090/library_600x900.jpg",
      summary: {
        uk: "Нарративний хоррор з RTX і DLSS3; престижні нагороди.",
        en: "Narrative horror with RTX/DLSS3; prestige awards darling."
      },
      metrics: { sentiment: 92, demandIndex: 82, priceStability: 58, communityHealth: 84 }
    },
    {
      id: "alanwakeremastered",
      name: { uk: "Alan Wake Remastered", en: "Alan Wake Remastered" },
      genre: "Horror",
      model: "Premium",
      basePriceUSD: 30,
      releaseYear: 2021,
      publisher: "Epic / Remedy",
      steamAppId: 1868100,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1868100/library_600x900.jpg",
      summary: {
        uk: "Ремастер оригіналу; часто в бандлах і сейлах перед сиквелом.",
        en: "Remaster of the original; frequent bundles and sales before sequel."
      },
      metrics: { sentiment: 82, demandIndex: 70, priceStability: 72, communityHealth: 78 }
    },
    {
      id: "starfield",
      name: { uk: "Starfield", en: "Starfield" },
      genre: "RPG",
      model: "Premium",
      basePriceUSD: 70,
      releaseYear: 2023,
      publisher: "Bethesda",
      steamAppId: 1716740,
      platforms: ["PC", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1716740/library_600x900.jpg",
      summary: {
        uk: "Космічне RPG Bethesda з моддингом та довгим хвостом Game Pass.",
        en: "Bethesda space RPG with modding and long Game Pass halo."
      },
      metrics: { sentiment: 70, demandIndex: 88, priceStability: 52, communityHealth: 74 }
    },
    {
      id: "forzamotorsport",
      name: { uk: "Forza Motorsport", en: "Forza Motorsport" },
      genre: "Racing",
      model: "Premium",
      basePriceUSD: 70,
      releaseYear: 2023,
      publisher: "Xbox Game Studios",
      steamAppId: 2440510,
      platforms: ["PC", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/2440510/library_600x900.jpg",
      summary: {
        uk: "Сим-рестарт Forza з живими сезонними серіями та DLSS/FSR.",
        en: "Sim reboot with live seasonal tours and DLSS/FSR tech."
      },
      metrics: { sentiment: 74, demandIndex: 72, priceStability: 48, communityHealth: 70 }
    },
    {
      id: "assettocorsa",
      name: { uk: "Assetto Corsa", en: "Assetto Corsa" },
      genre: "Racing",
      model: "Premium",
      basePriceUSD: 20,
      releaseYear: 2014,
      publisher: "Kunos Simulazioni",
      steamAppId: 244210,
      platforms: ["PC", "PS5"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/244210/library_600x900.jpg",
      summary: {
        uk: "Сим-рейсер з культовим моддингом; нескінченна кількість треків/машин.",
        en: "Sim racer with legendary modding; endless tracks/cars community-made."
      },
      metrics: { sentiment: 90, demandIndex: 78, priceStability: 80, communityHealth: 90 }
    },
    {
      id: "assettocorsaCompetizione",
      name: { uk: "Assetto Corsa Competizione", en: "Assetto Corsa Competizione" },
      genre: "Racing",
      model: "Premium",
      basePriceUSD: 40,
      releaseYear: 2019,
      publisher: "505 Games",
      steamAppId: 805550,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/805550/library_600x900.jpg",
      summary: {
        uk: "Офіційний GT World Challenge сим із DLC-полями та eSports.",
        en: "Official GT World Challenge sim with DLC tracks and esports scene."
      },
      metrics: { sentiment: 86, demandIndex: 74, priceStability: 72, communityHealth: 85 }
    },
    {
      id: "f124",
      name: { uk: "F1 24", en: "F1 24" },
      genre: "Racing",
      model: "Premium",
      basePriceUSD: 70,
      releaseYear: 2024,
      publisher: "EA Sports",
      steamAppId: 2513430,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/2513430/library_600x900.jpg",
      summary: {
        uk: "Свежий сезон F1 з Career Story та ліцензіями FIA.",
        en: "Latest F1 season entry with Career Story and official FIA licenses."
      },
      metrics: { sentiment: 66, demandIndex: 70, priceStability: 44, communityHealth: 64 }
    },
    {
      id: "forzah4",
      name: { uk: "Forza Horizon 4", en: "Forza Horizon 4" },
      genre: "Racing",
      model: "Premium",
      basePriceUSD: 60,
      releaseYear: 2018,
      publisher: "Xbox Game Studios",
      steamAppId: 1293830,
      platforms: ["PC", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1293830/library_600x900.jpg",
      summary: {
        uk: "Британія у Forza Horizon; сезонні оновлення, міцний лайфтайм.",
        en: "UK-based Forza Horizon entry; seasonal updates and long lifetime."
      },
      metrics: { sentiment: 89, demandIndex: 77, priceStability: 64, communityHealth: 84 }
    },
    {
      id: "plaguetale2",
      name: { uk: "A Plague Tale: Requiem", en: "A Plague Tale: Requiem" },
      genre: "Adventure",
      model: "Premium",
      basePriceUSD: 50,
      releaseYear: 2022,
      publisher: "Focus Entertainment",
      steamAppId: 1182900,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1182900/library_600x900.jpg",
      summary: {
        uk: "Сиквел наративної пригоди з престижною режисурою; Game Pass хвіст.",
        en: "Narrative sequel with prestige direction; Game Pass halo effect."
      },
      metrics: { sentiment: 86, demandIndex: 74, priceStability: 58, communityHealth: 80 }
    },
    {
      id: "plaguetale1",
      name: { uk: "A Plague Tale: Innocence", en: "A Plague Tale: Innocence" },
      genre: "Adventure",
      model: "Premium",
      basePriceUSD: 40,
      releaseYear: 2019,
      publisher: "Focus Entertainment",
      steamAppId: 752590,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/752590/library_600x900.jpg",
      summary: {
        uk: "Перша частина серії; низька ціна, високий NPS, evergreen сейли.",
        en: "First entry; low price, high NPS, evergreen sale spikes."
      },
      metrics: { sentiment: 90, demandIndex: 70, priceStability: 74, communityHealth: 84 }
    },
    {
      id: "darksoulsremastered",
      name: { uk: "Dark Souls: Remastered", en: "Dark Souls: Remastered" },
      genre: "RPG",
      model: "Premium",
      basePriceUSD: 40,
      releaseYear: 2018,
      publisher: "FromSoftware",
      steamAppId: 570940,
      platforms: ["PC", "PS5", "Xbox Series", "Switch"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/570940/library_600x900.jpg",
      summary: {
        uk: "Ремастер класики з покращеним онлайн та 60 FPS на PC.",
        en: "Remaster of the classic with improved online and 60 FPS on PC."
      },
      metrics: { sentiment: 91, demandIndex: 74, priceStability: 72, communityHealth: 86 }
    },
    {
      id: "darksouls3",
      name: { uk: "Dark Souls III", en: "Dark Souls III" },
      genre: "RPG",
      model: "Premium",
      basePriceUSD: 60,
      releaseYear: 2016,
      publisher: "FromSoftware",
      steamAppId: 374320,
      platforms: ["PC", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/374320/library_600x900.jpg",
      summary: {
        uk: "Souls-фінал трилогії з двома DLC, стабільні сейли та моди.",
        en: "Final Souls trilogy entry with two DLCs; stable sales and mods."
      },
      metrics: { sentiment: 93, demandIndex: 80, priceStability: 70, communityHealth: 90 }
    },
    {
      id: "nioh2",
      name: { uk: "Nioh 2 – The Complete Edition", en: "Nioh 2 – The Complete Edition" },
      genre: "Action",
      model: "Premium",
      basePriceUSD: 50,
      releaseYear: 2021,
      publisher: "KOEI TECMO GAMES",
      steamAppId: 1325200,
      platforms: ["PC", "PS5"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1325200/library_600x900.jpg",
      summary: {
        uk: "Souls-like з лутом та коопом; всі DLC у комплекті.",
        en: "Looty soulslike with co-op; complete edition packs all DLC."
      },
      metrics: { sentiment: 86, demandIndex: 72, priceStability: 64, communityHealth: 80 }
    },
    {
      id: "niohcomplete",
      name: { uk: "Nioh: Complete Edition", en: "Nioh: Complete Edition" },
      genre: "Action",
      model: "Premium",
      basePriceUSD: 30,
      releaseYear: 2017,
      publisher: "KOEI TECMO GAMES",
      steamAppId: 485510,
      platforms: ["PC", "PS5"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/485510/library_600x900.jpg",
      summary: {
        uk: "Перша частина з усіма DLC; evergreen сейли та кооп.",
        en: "First entry with all DLC; evergreen sales and co-op appeal."
      },
      metrics: { sentiment: 84, demandIndex: 68, priceStability: 70, communityHealth: 78 }
    },
    {
      id: "readyornot",
      name: { uk: "Ready or Not", en: "Ready or Not" },
      genre: "Shooter",
      model: "Premium",
      basePriceUSD: 50,
      releaseYear: 2023,
      publisher: "VOID Interactive",
      steamAppId: 1144200,
      platforms: ["PC"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1144200/library_600x900.jpg",
      summary: {
        uk: "Тактичний SWAT-шутер з коопом; популярний серед стрімерів.",
        en: "Tactical SWAT shooter with co-op; streamer favorite and mod-friendly."
      },
      metrics: { sentiment: 84, demandIndex: 82, priceStability: 58, communityHealth: 82 }
    },
    {
      id: "balatro",
      name: { uk: "Balatro", en: "Balatro" },
      genre: "Strategy",
      model: "Premium",
      basePriceUSD: 15,
      releaseYear: 2024,
      publisher: "Playstack",
      steamAppId: 2379780,
      platforms: ["PC", "Switch", "PS5"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/2379780/library_600x900.jpg",
      summary: {
        uk: "Рогалик-декбілдер про покер, вірусний хіт з низьким чеком.",
        en: "Poker-inspired roguelike deckbuilder; viral hit with low ticket price."
      },
      metrics: { sentiment: 94, demandIndex: 90, priceStability: 76, communityHealth: 92 }
    },
    {
      id: "gris",
      name: { uk: "GRIS", en: "GRIS" },
      genre: "Adventure",
      model: "Premium",
      basePriceUSD: 15,
      releaseYear: 2018,
      publisher: "Devolver Digital",
      steamAppId: 683320,
      platforms: ["PC", "Switch", "PS5"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/683320/library_600x900.jpg",
      summary: {
        uk: "Артхаусна пригода з саундтреком Бернарда Фабра; стабільні сейли.",
        en: "Arthouse platform adventure with standout OST; steady sales."
      },
      metrics: { sentiment: 93, demandIndex: 70, priceStability: 78, communityHealth: 88 }
    },
    {
      id: "stray",
      name: { uk: "Stray", en: "Stray" },
      genre: "Adventure",
      model: "Premium",
      basePriceUSD: 30,
      releaseYear: 2022,
      publisher: "Annapurna Interactive",
      steamAppId: 1332010,
      platforms: ["PC", "PS5"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1332010/library_600x900.jpg",
      summary: {
        uk: "Кіберпанк-пригода за кота; вірусна увага та високий NPS.",
        en: "Cyberpunk cat adventure; viral attention and high NPS."
      },
      metrics: { sentiment: 88, demandIndex: 82, priceStability: 66, communityHealth: 86 }
    },
    {
      id: "seaofstars",
      name: { uk: "Sea of Stars", en: "Sea of Stars" },
      genre: "RPG",
      model: "Premium",
      basePriceUSD: 35,
      releaseYear: 2023,
      publisher: "Sabotage Studio",
      steamAppId: 1244090,
      platforms: ["PC", "Switch", "PS5", "Xbox Series"],
      coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1244090/library_600x900.jpg",
      summary: {
        uk: "Ретро JRPG з сучасними QoL, високим Metacritic та Game Pass ефектом.",
        en: "Retro-style JRPG with modern QoL; high Metacritic and Game Pass boost."
      },
      metrics: { sentiment: 93, demandIndex: 82, priceStability: 70, communityHealth: 88 }
    }
  ];

  const genrePool = ["Action", "Adventure", "RPG", "Strategy", "Shooter", "Indie", "Sim", "Sports", "Rogue"];
  const modelPool = ["Premium", "F2P"];
  const platformPool = [
    ["PC"],
    ["PC", "PS5"],
    ["PC", "Xbox Series"],
    ["PC", "PS5", "Xbox Series"],
    ["PC", "Switch"],
    ["PC", "PS5", "Switch"],
    ["PC", "Mobile"],
    ["PC", "VR"]
  ];
  const publisherPool = [
    "Nebula Works",
    "Signal Peak",
    "Northwind Labs",
    "IndieFlux",
    "Velocity Forge",
    "Moonbyte Studio",
    "Atlas Forge",
    "Solaris Line",
    "Checkpoint Labs",
    "Vector Quill"
  ];

  const extraGames = Array.from({ length: 200 }, (_, i) => {
    const idx = i + 1;
    const padded = String(idx).padStart(3, "0");
    const genre = genrePool[i % genrePool.length];
    const model = modelPool[i % modelPool.length];
    const platforms = platformPool[i % platformPool.length];
    const basePriceUSD = 12 + ((i * 3) % 55);
    const releaseYear = 2010 + (i % 15);
    const sentiment = 65 + (i % 25);
    const demandIndex = 50 + ((i * 2) % 45);
    const priceStability = 52 + ((i * 5) % 35);
    const communityHealth = 58 + ((i * 4) % 38);
    return {
      id: `gf_extra_${padded}`,
      name: { uk: `GameForest добірка #${padded}`, en: `GameForest Picks #${padded}` },
      genre,
      model,
      basePriceUSD,
      releaseYear,
      publisher: publisherPool[i % publisherPool.length],
      steamAppId: 990000 + idx,
      topPick: idx % 12 === 0,
      platforms,
      coverUrl: `https://placehold.co/600x900/111827/FFFFFF?text=GF+${padded}`,
      summary: {
        uk: `Експериментальний інді-реліз #${padded} з розширеного каталогу GameForest.`,
        en: `Experimental indie drop #${padded} from the expanded GameForest slate.`
      },
      metrics: {
        sentiment,
        demandIndex,
        priceStability,
        communityHealth
      }
    };
  });

  raw.push(...extraGames);

  const byYearDesc = (a,b) => (b.releaseYear || 0) - (a.releaseYear || 0);
  const seen = new Set();
  const curatedStack = [];
  const pushUnique = (items) => {
    items.forEach(item => {
      if (!item || seen.has(item.id)) return;
      seen.add(item.id);
      curatedStack.push(item);
    });
  };

  pushUnique(raw.filter(g => g.topPick).sort(byYearDesc));
  pushUnique(raw.filter(g => !g.topPick && (g.releaseYear || 0) >= 2023).sort(byYearDesc));
  pushUnique(raw.filter(g => !g.topPick && (g.releaseYear || 0) >= 2019).sort(byYearDesc));
  pushUnique(raw.filter(g => !g.topPick && (g.releaseYear || 0) < 2019).sort(byYearDesc));

  const curated = curatedStack.slice(0, Math.min(curatedStack.length, 320));

  window.GF_DATA = curated.map(game => {
    const history = generatePriceHistory(game.id, game.basePriceUSD);
    const basePrice = Math.max(game.basePriceUSD || 0, Math.round(history.base));
    return {
      ...game,
      basePriceUSD: basePrice,
      priceHistory: history.points
    };
  });
})();
