const { totoEconomy, totoInventory } = require(`../../models`);
const {
  economyCooldown,
  sendError,
  sendWarning,
} = require(`../../functions/messages`);
const prefix = require(`../../../settings.json`).prefix;
const convertTime = require(`../../functions/convertTime`);

module.exports = {
  name: "fish",
  category: "totoEconomy",
  subcategory: "ganancias",
  aliases: ["pescar", "pescado", "fishing", "fish"],
  description: "Intenta pescar para ganar totoCoins y peces.",
  usage: `${prefix}fish`,
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

      if (economy && economy.lastFish) {
        const lastFishTime = economy.lastFish;
        const timeDifference = Date.now() - lastFishTime;

        if (timeDifference < timeout) {
          const timeLeft = convertTime(timeout - timeDifference);
          await economyCooldown(
            msg,
            "fish",
            `Espera ${timeLeft} para pescar de nuevo.`
          );
          return;
        }
      }

      const fishes = [
        { name: "trucha", price: 5 },
        { name: "salmón", price: 10 },
        { name: "pez dorado", price: 15 },
        { name: "pez espada", price: 50 },
        { name: "tiburón", price: 100 },
        { name: "ballena", price: 500 },
        { name: "pulpo", price: 75 },
        { name: "calamar", price: 60 },
        { name: "pez payaso", price: 20 },
        { name: "atún", price: 80 },
        { name: "bacalao", price: 25 },
        { name: "merluza", price: 30 },
        { name: "pez globo", price: 40 },
        { name: "carpa", price: 15 },
        { name: "bagre", price: 35 },
        { name: "pez león", price: 45 },
        { name: "pez ángel", price: 60 },
        { name: "caballito de mar", price: 50 },
        { name: "langosta", price: 100 },
        { name: "cangrejo", price: 20 },
        { name: "mejillón", price: 10 },
        { name: "ostra", price: 80 },
        { name: "almeja", price: 25 },
        { name: "erizo de mar", price: 30 },
        { name: "pez luna", price: 70 },
        { name: "pez volador", price: 55 },
        { name: "pez cirujano", price: 35 },
        { name: "pez loro", price: 45 },
        { name: "anguila", price: 60 },
        { name: "rayas", price: 100 },
        { name: "medusa", price: 50 },
        { name: "peces vela", price: 200 },
        { name: "pez mariposa", price: 40 },
        { name: "pez mandarín", price: 70 },
        { name: "pez sierra", price: 90 },
        { name: "pez aguja", price: 50 },
        { name: "pez sapo", price: 35 },
        { name: "pez hoja", price: 45 },
        { name: "pez gobio", price: 25 },
        { name: "pez roca", price: 60 },
        { name: "calamar gigante", price: 500 },
        { name: "pulpo azul", price: 80 },
        { name: "pulpo rojo", price: 75 },
        { name: "langosta espinosa", price: 120 },
        { name: "cangrejo ermitaño", price: 15 },
        { name: "cangrejo gigante", price: 150 },
        { name: "caracol marino", price: 5 },
        { name: "ostra perlífera", price: 200 },
        { name: "almeja gigante", price: 100 },
        { name: "pez sable", price: 250 },
        { name: "pez serpiente", price: 90 },
        { name: "pez piedra", price: 60 },
        { name: "pez trompeta", price: 40 },
        { name: "pez cuchillo", price: 55 },
        { name: "pez escorpión", price: 70 },
        { name: "pez zorro", price: 65 },
        { name: "pez tigre", price: 85 },
        { name: "pez cebra", price: 20 },
        { name: "pez gato", price: 45 },
        { name: "pez sable negro", price: 150 },
        { name: "cachalote", price: 700 },
        { name: "delfín", price: 500 },
        { name: "tortuga marina", price: 300 },
        { name: "foca", price: 250 },
        { name: "morsa", price: 400 },
        { name: "nutria marina", price: 200 },
        { name: "estrella de mar", price: 15 },
        { name: "pez cirujano azul", price: 80 },
        { name: "pez cirujano amarillo", price: 90 },
        { name: "pez halcón", price: 110 },
        { name: "pez sable plateado", price: 130 },
        { name: "pez ciego", price: 25 },
        { name: "pez dragón", price: 400 },
        { name: "pez remo", price: 350 },
        { name: "pez hielo", price: 60 },
        { name: "pez arcoíris", price: 50 },
        { name: "peces de coral", price: 20 },
        { name: "peces de arrecife", price: 25 },
        { name: "pez caracol", price: 40 },
        { name: "pez barracuda", price: 85 },
        { name: "pez cavernícola", price: 35 },
        { name: "pez ballesta", price: 45 },
        { name: "pez sable rojo", price: 100 },
        { name: "pez tigre del Congo", price: 150 },
        { name: "pez martillo", price: 200 },
        { name: "pez ángel emperador", price: 90 },
        { name: "pez cristal", price: 25 },
        { name: "peces koi", price: 120 },
        { name: "pez koi gigante", price: 500 },
        { name: "pez cabeza de serpiente", price: 70 },
        { name: "pez bruja", price: 85 },
        { name: "pez luna gigante", price: 300 },
        { name: "peces dorados chinos", price: 60 },
        { name: "pez arowana", price: 200 },
        { name: "pez cirujano verde", price: 50 },
        { name: "pez tambor", price: 30 },
        { name: "pez aguijón", price: 25 },
        { name: "pez sable eléctrico", price: 500 },
        { name: "pez gato gigante", price: 600 },
      ];

      const randomFish = fishes[Math.floor(Math.random() * fishes.length)];

      let inventory = await totoInventory.findOne({
        where: {
          userPhone: user,
          itemName: randomFish.name,
        },
      });

      if (!inventory) {
        await totoInventory.create({
          userPhone: user,
          itemId: 0,
          itemName: randomFish.name,
          quantity: 1,
          price: randomFish.price,
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
          balance: randomFish.price,
          banco: 0,
          lastFish: Date.now(),
        });
      } else {
        economy.balance += randomFish.price;
        economy.lastFish = Date.now();
        await economy.save();
      }

      msg.reply({
        text:
          `╭──⬣「 🎣 Pescando 」\n` +
          `│\n` +
          `│  🎣 *Has pescado ${randomFish.name}.*\n` +
          `│     💰 Valor: ${randomFish.price} totoCoins\n` +
          `│\n` +
          `╰──⬣\n\n` +
          `> @${user} ha pescado ${randomFish.name}.`,
        mentions: [user],
      });

      economy.lastFish = Date.now();
      await economy.save();
    } catch (error) {
      console.error(`Error en el comando fish: ${error.message}`);
      return await sendError(totoro, msg, error);
    }
  },
};
