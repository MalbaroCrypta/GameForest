// Sample data for marketplace / top-up
window.GF_MARKET_DATA = {
  topupProducts: [
    {
      id: "steam_wallet",
      name: { uk: "Steam Гаманець", en: "Steam Wallet" },
      regions: ["US", "EU", "UA"],
      currency: "USD",
      rate: 1,
      amounts: [5, 10, 25, 50, 100]
    },
    {
      id: "psn_card",
      name: { uk: "PlayStation Store", en: "PlayStation Store" },
      regions: ["US", "EU"],
      currency: "USD",
      rate: 1,
      amounts: [10, 20, 50, 75, 100]
    },
    {
      id: "xbox_gift",
      name: { uk: "Xbox Gift Card", en: "Xbox Gift Card" },
      regions: ["US", "EU"],
      currency: "USD",
      rate: 1,
      amounts: [10, 25, 50, 100]
    },
    {
      id: "robux",
      name: { uk: "Roblox Robux", en: "Roblox Robux" },
      regions: ["Global"],
      currency: "USD",
      rate: 1,
      amounts: [800, 1700, 4500, 10000]
    },
    {
      id: "vbuck",
      name: { uk: "Fortnite V-Bucks", en: "Fortnite V-Bucks" },
      regions: ["US", "EU"],
      currency: "USD",
      rate: 1,
      amounts: [1000, 2800, 5000, 13500]
    }
  ],
  listings: [
    {
      id: "robux-10k",
      title: { uk: "Roblox Robux 10 000", en: "Roblox Robux 10 000" },
      game: "Roblox",
      priceUSD: 94,
      priceLabel: "$94 / 10k R$",
      type: "Currency",
      platform: "Global",
      currency: "USD / R$",
      badge: "Instant"
    },
    {
      id: "robux-4k",
      title: { uk: "Robux 4 500", en: "Robux 4 500" },
      game: "Roblox",
      priceUSD: 48,
      priceLabel: "$48 / 4.5k R$",
      type: "Currency",
      platform: "Global",
      currency: "USD / R$",
      badge: "Instant"
    },
    {
      id: "cs2-dragonlore",
      title: { uk: "AWP Dragon Lore (FN)", en: "AWP Dragon Lore (FN)" },
      game: "Counter-Strike 2",
      priceUSD: 1899,
      type: "Skin",
      platform: "PC",
      currency: "USD",
      badge: "Legendary"
    },
    {
      id: "cs2-ak-redline",
      title: { uk: "AK Redline (ST MW)", en: "AK Redline (ST MW)" },
      game: "Counter-Strike 2",
      priceUSD: 62,
      type: "Skin",
      platform: "PC",
      currency: "USD",
      badge: "Verified seller"
    },
    {
      id: "cs2-mirage-case",
      title: { uk: "CS2 Mirage Collection Case", en: "CS2 Mirage Collection Case" },
      game: "Counter-Strike 2",
      priceUSD: 3.4,
      priceLabel: "$3.4 per case",
      type: "Case",
      platform: "PC",
      currency: "USD",
      badge: "New drop"
    },
    {
      id: "cs2-kilowatt-case",
      title: { uk: "CS2 Kilowatt Case (x10)", en: "CS2 Kilowatt Case (x10)" },
      game: "Counter-Strike 2",
      priceUSD: 29,
      priceLabel: "$29 / bundle",
      type: "Case",
      platform: "PC",
      currency: "USD",
      badge: "Verified"
    },
    {
      id: "valorant-knife",
      title: { uk: "Valorant Prime Karambit", en: "Valorant Prime Karambit" },
      game: "Valorant",
      priceUSD: 180,
      type: "Skin",
      platform: "PC",
      currency: "USD",
      badge: "Prime"
    },
    {
      id: "gta5-account",
      title: { uk: "GTA Online (High roller)", en: "GTA Online (High roller)" },
      game: "GTA V Online",
      priceUSD: 260,
      type: "Account",
      platform: "PC",
      currency: "USD",
      badge: "Verified seller"
    },
    {
      id: "genshin-account",
      title: { uk: "Genshin аккаунт AR56", en: "Genshin account AR56" },
      game: "Genshin Impact",
      priceUSD: 320,
      type: "Account",
      platform: "PC/Mobile",
      currency: "USD",
      badge: "Verified seller"
    },
    {
      id: "dota-arcana",
      title: { uk: "Dota 2 Arcana Bundle", en: "Dota 2 Arcana Bundle" },
      game: "Dota 2",
      priceUSD: 140,
      type: "Skin",
      platform: "PC",
      currency: "USD",
      badge: "Arcana"
    },
    {
      id: "apex-heirloom",
      title: { uk: "Apex Heirloom Set", en: "Apex Heirloom Set" },
      game: "Apex Legends",
      priceUSD: 520,
      type: "Skin",
      platform: "PC/Console",
      currency: "USD",
      badge: "Heirloom"
    }
  ]
};
window.GF_MARKET_DATA.demoListings = window.GF_MARKET_DATA.listings;
