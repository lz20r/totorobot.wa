const { totoEconomy } = require("../models");

async function addmoney(phone, amount) {
  const user = await totoEconomy.findOne({ where: { phone } });
  if (!user) return false;
  user.balance += amount;
  await user.save();
  return true;
}