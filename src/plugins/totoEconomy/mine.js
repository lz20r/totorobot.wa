const { totoEconomy, totoInventory } = require(`../../models`);
const {
  economyCooldown,
  sendError,
  sendWarning,
} = require(`../../functions/messages`);
const prefix = require(`../../../settings.json`).prefix;
const convertTime = require(`../../functions/convertTime`);

module.exports = {
  name: "mine",
  category: "totoEconomy",
  subcategory: "ganancias",
  aliases: ["minar", "mina", "miner", "mine"],
  description: "Intenta minar para ganar totoCoins y materiales de roca.",
  usage: `${prefix}mine`,
  cooldown: 600000,
  economy: true,

  execute: async (totoro, msg, args) => {
    try {
      const info = msg.messages[0];
      const isGroup = info.key.remoteJid.endsWith(`@g.us`);
      const sender = isGroup ? info.key.participant : info.key.remoteJid;
      const user = sender.split(`@`)[0];
      const groupId = isGroup ? info.key.remoteJid : sender;
      const groupInfo = await totoro.groupMetadata(groupId);
      const groupName = groupInfo.subject;

      if (!msg.messages[0].key.remoteJid.endsWith("@g.us")) {
        sendWarning(
          totoro,
          msg,
          "Este comando solo puede ser utilizado en grupos."
        );
        return;
      }

      let economy = await totoEconomy.findOne({
        where: { groupId: groupId, phone: user },
      });

      const timeout = 200000; // 3 minutos

      if (economy && economy.lastMine) {
        const lastMineTime = economy.lastMine;
        const timeDifference = Date.now() - lastMineTime;

        if (timeDifference < timeout) {
          const timeLeft = convertTime(timeout - timeDifference);
          await economyCooldown(
            msg,
            "mine",
            `Espera ${timeLeft} para minar de nuevo.`
          );
          return;
        }
      }
      const materials = [
        { name: "piedra", price: 5 },
        { name: "granito", price: 10 },
        { name: "mármol", price: 20 },
        { name: "basalto", price: 15 },
        { name: "pizarra", price: 8 },
        { name: "obsidiana", price: 50 },
        { name: "cuarzo", price: 25 },
        { name: "esmeralda", price: 100 },
        { name: "zafiro", price: 120 },
        { name: "rubi", price: 150 },
        { name: "diamante", price: 200 },
        { name: "roca ígnea", price: 6 },
        { name: "roca sedimentaria", price: 7 },
        { name: "roca metamórfica", price: 12 },
        { name: "caliza", price: 10 },
        { name: "arenisca", price: 7 },
        { name: "piedra caliza", price: 9 },
        { name: "dolomita", price: 11 },
        { name: "yeso", price: 3 },
        { name: "arcilla", price: 2 },
        { name: "tierra rara", price: 75 },
        { name: "roca volcánica", price: 15 },
        { name: "jade", price: 110 },
        { name: "topacio", price: 130 },
        { name: "amatista", price: 140 },
        { name: "lapislázuli", price: 90 },
        { name: "fluorita", price: 45 },
        { name: "granate", price: 60 },
        { name: "pirita", price: 70 },
        { name: "berilo", price: 85 },
        { name: "hierro", price: 30 },
        { name: "malaquita", price: 50 },
        { name: "rodocrosita", price: 65 },
        { name: "azurita", price: 55 },
        { name: "calcita", price: 35 },
        { name: "magnetita", price: 25 },
        { name: "carbonato", price: 15 },
        { name: "silex", price: 20 },
        { name: "carbón", price: 10 },
        { name: "arena volcánica", price: 12 },
        { name: "grafito", price: 40 },
        { name: "sal gema", price: 18 },
        { name: "caolinita", price: 5 },
        { name: "antracita", price: 30 },
        { name: "mica", price: 45 },
        { name: "feldespato", price: 25 },
        { name: "zircón", price: 150 },
        { name: "hematites", price: 50 },
        { name: "limonita", price: 40 },
        { name: "cuprita", price: 60 },
        { name: "oro", price: 300 },
        { name: "plata", price: 250 },
        { name: "litio", price: 500 },
        { name: "plomo", price: 100 },
        { name: "platino", price: 600 },
        { name: "uranio", price: 1000 },
        { name: "niobio", price: 800 },
        { name: "bismuto", price: 400 },
        { name: "molibdeno", price: 350 },
        { name: "mercurio", price: 450 },
        { name: "corindón", price: 200 },
        { name: "peridotita", price: 70 },
        { name: "gabro", price: 30 },
        { name: "riolita", price: 25 },
        { name: "andesita", price: 20 },
        { name: "diabasio", price: 15 },
        { name: "piedra pómez", price: 10 },
        { name: "diorita", price: 35 },
        { name: "anortosita", price: 40 },
        { name: "pegmatita", price: 55 },
        { name: "riolita", price: 22 },
        { name: "leucogranito", price: 18 },
        { name: "peridot", price: 85 },
        { name: "apatita", price: 30 },
        { name: "cinabrio", price: 75 },
        { name: "galena", price: 90 },
        { name: "magnesita", price: 25 },
        { name: "baritina", price: 20 },
        { name: "crisocola", price: 65 },
        { name: "silvina", price: 15 },
        { name: "dolomita", price: 35 },
        { name: "halita", price: 10 },
        { name: "wulfenita", price: 110 },
        { name: "torbernite", price: 140 },
        { name: "bauxita", price: 55 },
        { name: "tantalita", price: 400 },
        { name: "wolframita", price: 350 },
        { name: "casiterita", price: 150 },
        { name: "esfalerita", price: 120 },
        { name: "ilmenita", price: 100 },
        { name: "apatito", price: 90 },
        { name: "scheelita", price: 130 },
        { name: "columbita", price: 180 },
        { name: "tantalum", price: 230 },
      ];

      const randomMaterial =
        materials[Math.floor(Math.random() * materials.length)];

      let inventory = await totoInventory.findOne({
        where: {
          userPhone: user,
          itemName: randomMaterial.name,
        },
      });

      if (!inventory) {
        await totoInventory.create({
          userPhone: user,
          itemId: 0,
          itemName: randomMaterial.name,
          quantity: 1,
          price: randomMaterial.price,
          origin: "encontrado", // Establecemos que fue encontrado
        });
      } else {
        inventory.quantity += 1;
        await inventory.save();
      }

      if (!economy) {
        await totoEconomy.create({
          groupId: groupId,
          groupName: groupName,
          phone: user,
          balance: randomMaterial.price,
          banco: 0,
          lastMine: Date.now(),
        });
      } else {
        economy.balance += randomMaterial.price;
        economy.lastMine = Date.now();
        await economy.save();
      }

      await totoro.sendText(groupId, {
        text:
          `╭──⬣「 🪨 Minando 」\n` +
          `│\n` +
          `│  🪨 *Has minado y has encontrado ${randomMaterial.name}.*\n` +
          `│     💰 Valor: ${randomMaterial.price} totoCoins\n` +
          `│\n` +
          `╰──⬣\n\n` +
          `> @${user} ha minado y ha encontrado ${randomMaterial.name}.`,
        mentions: [user],
      });

      economy.lastMine = Date.now();
      await economy.save();
    } catch (error) {
      console.error(`Error en el comando mine: ${error.message}`);
      return await sendError(totoro, msg, error);
    }
  },
};
