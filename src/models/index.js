const totoCounterActivate = require("./totoCounterActivate");
const totoGroupMantainance = require("./totoGroupMantainance");
const totoGroupEcononmy = require("./totoGroupEcononmy");
const totoGroupSettings = require("./totoGroupSettings");
const totoRecordatorio = require("./totoRecordatorio");
const totoMantainance = require("./totoMantainance");
const totoBlacklist = require("./totoBlackList");
const totoAntilinks = require("./totoAntilinks");
const totoInventory = require("./totoInventory");
const totoWhitelist = require("./totoWhiteList");
const totoEconomy = require("./totoEconomy");
const reusableIds = require("./reusableIds");
const totoPremium = require("./totoPremium");
const totoCounter = require("./totoCounter");
const totoGroups = require("./totoGroups");
const totoStatus = require("./totoStatus");
const totoCifrar = require("./totoCifrar");
const totoPlugin = require("./totoPlugin");
const totoWelcm = require("./totoWelcm");
const totoBlock = require("./totoBlock");
const totoAdmin = require("./totoAdmin");
const totoShop = require("./totoShop");
const totoUser = require("./totoUser");
const totoWarn = require("./totoWarn");
const totoDev = require("./totoDev");
const totoAfk = require("./totoAfk");

// Relación uno a uno
totoUser.hasOne(totoPremium, {
  foreignKey: "totoUserId",
  sourceKey: "id",
});

totoPremium.belongsTo(totoUser, {
  foreignKey: "totoUserId",
  targetKey: "id",
});

// Relación uno a muchos
totoUser.hasMany(totoPlugin, {
  foreignKey: "totoUserId",
  sourceKey: "id",
});

totoPlugin.belongsTo(totoUser, {
  foreignKey: "totoUserId",
  targetKey: "id",
});

module.exports = {
  totoGroupMantainance,
  totoCounterActivate,
  totoGroupSettings,
  totoGroupEcononmy,
  totoRecordatorio,
  totoMantainance,
  totoAntilinks,
  totoBlacklist,
  totoWhitelist,
  totoInventory,
  totoPremium,
  reusableIds,
  totoEconomy,
  totoCounter,
  totoCifrar,
  totoGroups,
  totoStatus,
  totoPlugin,
  totoAdmin,
  totoBlock,
  totoWelcm,
  totoUser,
  totoShop,
  totoWarn,
  totoAfk,
  totoDev,
};
