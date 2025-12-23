// GameForest curated popular set (real Steam catalog, lightweight)
// Provides a fast popular-mode dataset; full Steam index is loaded separately via steam-data.js
(function(){
  const monthsBack = 42;
  const clamp = (n,a,b) => Math.max(a, Math.min(b, n));
  const safeNum = (v, def=0) => Number.isFinite(Number(v)) ? Number(v) : def;

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

  function generatePriceHistory(id, basePriceUSD, span=monthsBack){
    const rnd = rng(hashString(String(id)));
    const anchor = Math.max(10, basePriceUSD || 30);
    const minFloor = Math.max(5, anchor * 0.35);
    const now = new Date();
    const points = [];
    let price = anchor * (0.9 + rnd() * 0.12);
    for (let i = span; i >= 0; i--){
      const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const seasonalSale = [0,1,5,10,11].includes(dt.getMonth()) ? (0.18 + rnd() * 0.2) : (0.06 + rnd() * 0.1);
      const bounce = rnd() < 0.12 ? (0.08 + rnd() * 0.1) : 0;
      const upward = rnd() < 0.08 ? (0.05 + rnd() * 0.06) : 0;
      const target = anchor * (1 - seasonalSale - bounce + upward);
      price = price * 0.55 + target * 0.45;
      price = clamp(price, minFloor, anchor * 1.25);
      points.push({ date: dt.toISOString().slice(0,10), price: Math.round(price * 100) / 100 });
    }
    return points;
  }

  const cover = (appid) => `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/capsule_231x87.jpg`;
  const popular = [
    { steamAppId: 730, name: { en: "Counter-Strike 2", uk: "Counter-Strike 2" }, genre: "Shooter", model: "Free to Play", releaseYear: 2023, basePriceUSD: 0, platforms:["Windows"], summary:{ en: "Global Offensive evolved into Source 2 with modern anti-cheat.", uk: "Оновлений Counter-Strike на Source 2 з сучасним античітом."}, metrics:{ sentiment: 88, demandIndex: 98, priceStability: 92, communityHealth: 86 }, topPick:true },
    { steamAppId: 570, name:{ en:"Dota 2", uk:"Dota 2"}, genre:"MOBA", model:"Free to Play", releaseYear: 2013, basePriceUSD:0, platforms:["Windows","Linux","macOS"], summary:{ en:"Valve's flagship MOBA with The International esports scene.", uk:"Флагманська MOBA від Valve з кіберспортом The International."}, metrics:{ sentiment:87,demandIndex:95,priceStability:90,communityHealth:84 }, topPick:true },
    { steamAppId: 578080, name:{ en:"PUBG: BATTLEGROUNDS", uk:"PUBG: BATTLEGROUNDS"}, genre:"Battle Royale", model:"Free to Play", releaseYear:2017, basePriceUSD:0, platforms:["Windows"], summary:{ en:"Classic battle royale with realistic ballistics and huge maps.", uk:"Класичний battle royale з реалістичною балістикою та великими картами."}, metrics:{ sentiment:78,demandIndex:90,priceStability:82,communityHealth:76 } },
    { steamAppId: 1172470, name:{ en:"Apex Legends", uk:"Apex Legends"}, genre:"Battle Royale", model:"Free to Play", releaseYear:2019, basePriceUSD:0, platforms:["Windows"], summary:{ en:"Hero shooter battle royale from Respawn.", uk:"Hero shooter battle royale від Respawn."}, metrics:{ sentiment:85,demandIndex:91,priceStability:85,communityHealth:82 } },
    { steamAppId: 252490, name:{ en:"Rust", uk:"Rust"}, genre:"Survival", model:"Paid", releaseYear:2018, basePriceUSD:40, platforms:["Windows"], summary:{ en:"Harsh multiplayer survival sandbox.", uk:"Жорсткий багатокористувацький survival sandbox."}, metrics:{ sentiment:84,demandIndex:89,priceStability:83,communityHealth:80 }, topPick:true },
    { steamAppId: 553850, name:{ en:"HELLDIVERS™ 2", uk:"HELLDIVERS™ 2"}, genre:"Co-op Shooter", model:"Paid", releaseYear:2024, basePriceUSD:40, platforms:["Windows"], summary:{ en:"Co-op galactic war against automatons and bugs.", uk:"Кооперативна галактична війна проти автоматонів та жуків."}, metrics:{ sentiment:88,demandIndex:94,priceStability:77,communityHealth:85 }, topPick:true },
    { steamAppId: 1623730, name:{ en:"Palworld", uk:"Palworld"}, genre:"Survival", model:"Paid", releaseYear:2024, basePriceUSD:40, platforms:["Windows"], summary:{ en:"Creature collecting survival with base building.", uk:"Виживання з прирученням істот та будівництвом баз."}, metrics:{ sentiment:82,demandIndex:93,priceStability:72,communityHealth:80 } },
    { steamAppId: 1174180, name:{ en:"Red Dead Redemption 2", uk:"Red Dead Redemption 2"}, genre:"Adventure", model:"Paid", releaseYear:2019, basePriceUSD:60, platforms:["Windows"], summary:{ en:"Rockstar's western epic with Red Dead Online.", uk:"Вестерн-епопея Rockstar з Red Dead Online."}, metrics:{ sentiment:94,demandIndex:92,priceStability:88,communityHealth:88 }, topPick:true },
    { steamAppId: 271590, name:{ en:"Grand Theft Auto V", uk:"Grand Theft Auto V"}, genre:"Action", model:"Paid", releaseYear:2015, basePriceUSD:40, platforms:["Windows"], summary:{ en:"Los Santos sandbox plus GTA Online heists.", uk:"Пісочниця Лос-Сантоса та GTA Online з грабунками."}, metrics:{ sentiment:92,demandIndex:94,priceStability:86,communityHealth:86 }, topPick:true },
    { steamAppId: 1091500, name:{ en:"Cyberpunk 2077", uk:"Cyberpunk 2077"}, genre:"RPG", model:"Paid", releaseYear:2020, basePriceUSD:60, platforms:["Windows"], summary:{ en:"Night City open-world RPG with Phantom Liberty.", uk:"RPG у світі Нічного Міста з доповненням Phantom Liberty."}, metrics:{ sentiment:86,demandIndex:88,priceStability:85,communityHealth:83 }, topPick:true },
    { steamAppId: 1245620, name:{ en:"ELDEN RING", uk:"ELDEN RING"}, genre:"Action RPG", model:"Paid", releaseYear:2022, basePriceUSD:60, platforms:["Windows"], summary:{ en:"FromSoftware open-world Souls-like with co-op summons.", uk:"Open-world Souls-like від FromSoftware з кооперативом."}, metrics:{ sentiment:95,demandIndex:93,priceStability:90,communityHealth:90 }, topPick:true },
    { steamAppId: 1086940, name:{ en:"Baldur's Gate 3", uk:"Baldur's Gate 3"}, genre:"RPG", model:"Paid", releaseYear:2023, basePriceUSD:60, platforms:["Windows","macOS"], summary:{ en:"CRPG built on D&D 5e rules with cinematic choices.", uk:"CRPG за правилами D&D 5e з кінематографічними виборами."}, metrics:{ sentiment:97,demandIndex:92,priceStability:91,communityHealth:92 }, topPick:true },
    { steamAppId: 1716740, name:{ en:"Starfield", uk:"Starfield"}, genre:"RPG", model:"Paid", releaseYear:2023, basePriceUSD:70, platforms:["Windows"], summary:{ en:"Bethesda space RPG with ship building and factions.", uk:"Космічне RPG від Bethesda з будівництвом кораблів та фракціями."}, metrics:{ sentiment:74,demandIndex:80,priceStability:82,communityHealth:75 } },
    { steamAppId: 990080, name:{ en:"Hogwarts Legacy", uk:"Hogwarts Legacy"}, genre:"Adventure", model:"Paid", releaseYear:2023, basePriceUSD:60, platforms:["Windows"], summary:{ en:"Open-world wizarding RPG set in the 1890s.", uk:"Відкритий світ чарівників у 1890-х роках."}, metrics:{ sentiment:85,demandIndex:86,priceStability:83,communityHealth:82 } },
    { steamAppId: 1172620, name:{ en:"Sea of Thieves", uk:"Sea of Thieves"}, genre:"Co-op Adventure", model:"Paid", releaseYear:2020, basePriceUSD:40, platforms:["Windows"], summary:{ en:"Shared-world pirate voyages with tall tales.", uk:"Світ піратських мандрівок з кооперативними пригодами."}, metrics:{ sentiment:84,demandIndex:82,priceStability:80,communityHealth:80 } },
    { steamAppId: 1708720, name:{ en:"Halo Infinite", uk:"Halo Infinite"}, genre:"Shooter", model:"Free to Play", releaseYear:2021, basePriceUSD:0, platforms:["Windows"], summary:{ en:"Arena shooter with Forge and campaign.", uk:"Арена-шутер з Forge та кампанією."}, metrics:{ sentiment:78,demandIndex:80,priceStability:79,communityHealth:78 } },
    { steamAppId: 1604030, name:{ en:"V Rising", uk:"V Rising"}, genre:"Survival", model:"Paid", releaseYear:2024, basePriceUSD:35, platforms:["Windows"], summary:{ en:"Vampire survival with base raids and gothic style.", uk:"Вамповірний survival з рейдами та готичним стилем."}, metrics:{ sentiment:85,demandIndex:84,priceStability:78,communityHealth:80 } },
    { steamAppId: 892970, name:{ en:"Valheim", uk:"Valheim"}, genre:"Survival", model:"Paid", releaseYear:2021, basePriceUSD:20, platforms:["Windows","Linux"], summary:{ en:"Viking co-op survival in procedurally generated worlds.", uk:"Кооперативне виживання вікінгів у процедурних світах."}, metrics:{ sentiment:93,demandIndex:88,priceStability:85,communityHealth:88 } },
    { steamAppId: 1097150, name:{ en:"Fall Guys", uk:"Fall Guys"}, genre:"Party", model:"Free to Play", releaseYear:2020, basePriceUSD:0, platforms:["Windows"], summary:{ en:"60-player obstacle course chaos.", uk:"60 гравців на смугах перешкод."}, metrics:{ sentiment:82,demandIndex:81,priceStability:76,communityHealth:80 } },
    { steamAppId: 1446780, name:{ en:"Phasmophobia", uk:"Phasmophobia"}, genre:"Horror", model:"Paid", releaseYear:2020, basePriceUSD:15, platforms:["Windows"], summary:{ en:"Co-op ghost hunting with voice recognition.", uk:"Кооперативне полювання на привидів з розпізнаванням голосу."}, metrics:{ sentiment:94,demandIndex:84,priceStability:80,communityHealth:86 } },
    { steamAppId: 548430, name:{ en:"Deep Rock Galactic", uk:"Deep Rock Galactic"}, genre:"Co-op Shooter", model:"Paid", releaseYear:2020, basePriceUSD:30, platforms:["Windows"], summary:{ en:"Space dwarves mining procedurally generated caves.", uk:"Космічні дворфі у процедурних печерах."}, metrics:{ sentiment:95,demandIndex:83,priceStability:82,communityHealth:88 } },
    { steamAppId: 381210, name:{ en:"Dead by Daylight", uk:"Dead by Daylight"}, genre:"Horror", model:"Paid", releaseYear:2016, basePriceUSD:20, platforms:["Windows"], summary:{ en:"4v1 asymmetric horror with licensed killers.", uk:"4v1 асиметричний хорор з ліцензованими маніяками."}, metrics:{ sentiment:84,demandIndex:82,priceStability:79,communityHealth:80 } },
    { steamAppId: 2399830, name:{ en:"ARK: Survival Ascended", uk:"ARK: Survival Ascended"}, genre:"Survival", model:"Paid", releaseYear:2023, basePriceUSD:45, platforms:["Windows"], summary:{ en:"UE5 remaster of ARK with cross-platform servers.", uk:"Ремастер ARK на UE5 з кросплатформними серверами."}, metrics:{ sentiment:75,demandIndex:78,priceStability:74,communityHealth:74 } },
    { steamAppId: 238960, name:{ en:"Path of Exile", uk:"Path of Exile"}, genre:"ARPG", model:"Free to Play", releaseYear:2013, basePriceUSD:0, platforms:["Windows","macOS"], summary:{ en:"Dark action RPG with deep leagues and skill gems.", uk:"Темне action RPG з лігами та системою каменів навичок."}, metrics:{ sentiment:90,demandIndex:82,priceStability:86,communityHealth:85 } },
    { steamAppId: 1904540, name:{ en:"Football Manager 2024", uk:"Football Manager 2024"}, genre:"Sports", model:"Paid", releaseYear:2023, basePriceUSD:60, platforms:["Windows","macOS"], summary:{ en:"Annual management sim with revamped tactics.", uk:"Щорічний симулятор менеджера з новою тактикою."}, metrics:{ sentiment:83,demandIndex:79,priceStability:81,communityHealth:78 } },
    { steamAppId: 377160, name:{ en:"Fallout 4", uk:"Fallout 4"}, genre:"RPG", model:"Paid", releaseYear:2015, basePriceUSD:40, platforms:["Windows"], summary:{ en:"Bethesda post-apocalyptic RPG with settlements.", uk:"Постапокаліптичне RPG Bethesda з поселеннями."}, metrics:{ sentiment:86,demandIndex:78,priceStability:82,communityHealth:80 } },
    { steamAppId: 648800, name:{ en:"Raft", uk:"Raft"}, genre:"Survival", model:"Paid", releaseYear:2022, basePriceUSD:20, platforms:["Windows"], summary:{ en:"Ocean survival on a growing raft with co-op.", uk:"Виживання в океані на зростаючому плоті з кооперативом."}, metrics:{ sentiment:91,demandIndex:81,priceStability:80,communityHealth:82 } },
    { steamAppId: 292030, name:{ en:"The Witcher 3: Wild Hunt", uk:"The Witcher 3: Wild Hunt"}, genre:"RPG", model:"Paid", releaseYear:2015, basePriceUSD:40, platforms:["Windows"], summary:{ en:"Story-rich RPG with Hearts of Stone and Blood and Wine.", uk:"Насичене сюжетом RPG з доповненнями Hearts of Stone та Blood and Wine."}, metrics:{ sentiment:97,demandIndex:84,priceStability:88,communityHealth:90 }, topPick:true },
    { steamAppId: 381120, name:{ en:"For Honor", uk:"For Honor"}, genre:"Action", model:"Paid", releaseYear:2017, basePriceUSD:15, platforms:["Windows"], summary:{ en:"Melee brawler with factions of knights, vikings and samurai.", uk:"Бійки на мечах з фракціями лицарів, вікінгів та самураїв."}, metrics:{ sentiment:72,demandIndex:70,priceStability:70,communityHealth:70 } },
    { steamAppId: 526870, name:{ en:"Satisfactory", uk:"Satisfactory"}, genre:"Automation", model:"Paid", releaseYear:2020, basePriceUSD:35, platforms:["Windows"], summary:{ en:"First-person factory automation in alien biomes.", uk:"Побудова фабрик від першої особи в чужих біомах."}, metrics:{ sentiment:94,demandIndex:80,priceStability:82,communityHealth:84 } },
    { steamAppId: 1145360, name:{ en:"Hades", uk:"Hades"}, genre:"Roguelike", model:"Paid", releaseYear:2020, basePriceUSD:25, platforms:["Windows","macOS"], summary:{ en:"Supergiant's roguelike set in Greek myth.", uk:"Roguelike від Supergiant на основі грецьких міфів."}, metrics:{ sentiment:98,demandIndex:81,priceStability:84,communityHealth:88 } },
    { steamAppId: 284160, name:{ en:"BeamNG.drive", uk:"BeamNG.drive"}, genre:"Simulation", model:"Paid", releaseYear:2015, basePriceUSD:25, platforms:["Windows"], summary:{ en:"Soft-body physics driving sandbox.", uk:"Автомобільний sandbox із софт-боді фізикою."}, metrics:{ sentiment:95,demandIndex:79,priceStability:83,communityHealth:82 } },
    { steamAppId: 252950, name:{ en:"Rocket League", uk:"Rocket League"}, genre:"Sports", model:"Free to Play", releaseYear:2015, basePriceUSD:0, platforms:["Windows"], summary:{ en:"Arcade football with rocket-powered cars.", uk:"Аркадний футбол на ракетних автівках."}, metrics:{ sentiment:93,demandIndex:82,priceStability:85,communityHealth:86 } },
    { steamAppId: 413150, name:{ en:"Stardew Valley", uk:"Stardew Valley"}, genre:"Simulation", model:"Paid", releaseYear:2016, basePriceUSD:15, platforms:["Windows","Linux","macOS"], summary:{ en:"Cozy farming sim with endless updates.", uk:"Затишний фермерський симулятор з нескінченними оновленнями."}, metrics:{ sentiment:99,demandIndex:85,priceStability:88,communityHealth:90 }, topPick:true },
    { steamAppId: 275850, name:{ en:"No Man's Sky", uk:"No Man's Sky"}, genre:"Exploration", model:"Paid", releaseYear:2016, basePriceUSD:60, platforms:["Windows"], summary:{ en:"Procedural galaxy exploration with base building.", uk:"Дослідження процедурної галактики та будівництво баз."}, metrics:{ sentiment:89,demandIndex:80,priceStability:82,communityHealth:84 } },
    { steamAppId: 262060, name:{ en:"Darkest Dungeon®", uk:"Darkest Dungeon®"}, genre:"Roguelike", model:"Paid", releaseYear:2016, basePriceUSD:25, platforms:["Windows","macOS"], summary:{ en:"Gothic roguelike about stress and expedition risk.", uk:"Готичний roguelike про стрес та ризики експедицій."}, metrics:{ sentiment:91,demandIndex:74,priceStability:80,communityHealth:78 } },
    { steamAppId: 739630, name:{ en:"Among Us", uk:"Among Us"}, genre:"Party", model:"Paid", releaseYear:2018, basePriceUSD:5, platforms:["Windows"], summary:{ en:"Social deduction in space, great for voice chat.", uk:"Соціальна дедукція у космосі, добре працює з voice chat."}, metrics:{ sentiment:90,demandIndex:78,priceStability:77,communityHealth:82 } },
    { steamAppId: 239140, name:{ en:"Dying Light", uk:"Dying Light"}, genre:"Action", model:"Paid", releaseYear:2015, basePriceUSD:30, platforms:["Windows"], summary:{ en:"Parkour zombie action with night cycles.", uk:"Зомбі-екшен з паркуром та нічними циклами."}, metrics:{ sentiment:87,demandIndex:75,priceStability:81,communityHealth:79 } }
  ].map(game => ({
    ...game,
    id: `steam-${game.steamAppId}`,
    coverUrl: cover(game.steamAppId)
  }));

  window.GF_DATA = popular.map(game => ({
    ...game,
    priceHistory: generatePriceHistory(game.steamAppId, game.basePriceUSD)
  }));
})();
