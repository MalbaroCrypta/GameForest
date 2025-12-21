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
      id: "cs2-dragonlore",
      title: { uk: "AWP Dragon Lore (FN)", en: "AWP Dragon Lore (FN)" },
      game: "Counter-Strike 2",
      priceUSD: 1899,
      type: "Skin",
      platform: "PC",
      badge: "Legendary"
    },
    {
      id: "valorant-knife",
      title: { uk: "Valorant Prime Karambit", en: "Valorant Prime Karambit" },
      game: "Valorant",
      priceUSD: 180,
      type: "Skin",
      platform: "PC",
      badge: "Prime"
    },
    {
      id: "gta5-account",
      title: { uk: "GTA Online (High roller)", en: "GTA Online (High roller)" },
      game: "GTA V Online",
      priceUSD: 260,
      type: "Account",
      platform: "PC",
      badge: "Verified seller"
    },
    {
      id: "genshin-account",
      title: { uk: "Genshin аккаунт AR56", en: "Genshin account AR56" },
      game: "Genshin Impact",
      priceUSD: 320,
      type: "Account",
      platform: "PC/Mobile",
      badge: "Verified seller"
    },
    {
      id: "dota-arcana",
      title: { uk: "Dota 2 Arcana Bundle", en: "Dota 2 Arcana Bundle" },
      game: "Dota 2",
      priceUSD: 140,
      type: "Skin",
      platform: "PC",
      badge: "Arcana"
    },
    {
      id: "apex-heirloom",
      title: { uk: "Apex Heirloom Set", en: "Apex Heirloom Set" },
      game: "Apex Legends",
      priceUSD: 520,
      type: "Skin",
      platform: "PC/Console",
      badge: "Heirloom"
    }
  ]
};
window.GF_MARKET_DATA.demoListings = window.GF_MARKET_DATA.listings;
