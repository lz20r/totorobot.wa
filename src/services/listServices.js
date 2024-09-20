// services/listService.js
const Blacklist = require("../models/totoBlackList");
const Whitelist = require("../models/totoWhiteList");
const totoUser = require("../models/totoUser");
const totoroLog = require("../functions/totoroLog");

const logOperation = (operation, list, phone) => {
  const message = `[${list.toUpperCase()}] ${operation} phone: ${phone}`;
  totoroLog.info(`./logs/lists/${list}.log`, message);
};

const addToBlacklist = async (phone, reason = null) => {
  try {
    const user = await totoUser.findOne({ where: { phone } });
    if (!user) throw new Error("User not found");

    await Blacklist.create({ userId: user.id, reason });
    logOperation("Added to", "blacklist", phone);
    return { success: true, message: "Phone added to blacklist." };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const removeFromBlacklist = async (phone) => {
  try {
    const user = await totoUser.findOne({ where: { phone } });
    if (!user) throw new Error("User not found");

    await Blacklist.destroy({ where: { userId: user.id } });
    logOperation("Removed from", "blacklist", phone);
    return { success: true, message: "Phone removed from blacklist." };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const isInBlacklist = async (phone) => {
  try {
    const user = await totoUser.findOne({ where: { phone } });
    if (!user) return false;

    const result = await Blacklist.findOne({ where: { userId: user.id } });
    return result !== null;
  } catch (error) {
    return false;
  }
};

const addToWhitelist = async (phone, reason = null) => {
  try {
    const user = await totoUser.findOne({ where: { phone } });
    if (!user) throw new Error("User not found");

    await Whitelist.create({ userId: user.id, reason });
    logOperation("Added to", "whitelist", phone);
    return { success: true, message: "Phone added to whitelist." };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const removeFromWhitelist = async (phone) => {
  try {
    const user = await totoUser.findOne({ where: { phone } });
    if (!user) throw new Error("User not found");

    await Whitelist.destroy({ where: { userId: user.id } });
    logOperation("Removed from", "whitelist", phone);
    return { success: true, message: "Phone removed from whitelist." };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const isInWhitelist = async (phone) => {
  try {
    const user = await totoUser.findOne({ where: { phone } });
    if (!user) return false;

    const result = await Whitelist.findOne({ where: { userId: user.id } });
    return result !== null;
  } catch (error) {
    return false;
  }
};

module.exports = {
  addToBlacklist,
  removeFromBlacklist,
  isInBlacklist,
  addToWhitelist,
  removeFromWhitelist,
  isInWhitelist,
};
