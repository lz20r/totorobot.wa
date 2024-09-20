const { totoEconomy } = require(`../../models`);
const { economyCooldown, sendWarning } = require(`../../functions/messages`);
const prefix = require(`../../../settings.json`).prefix;
const convertTime = require(`../../functions/convertTime`);

module.exports = {
  name: "daily",
  category: "totoEconomy",
  subcategory: "ganancias",
  aliases: ["diario", "recompensa", "daily"],
  description: "Reclama tu recompensa diaria de totoCoins.",
  usage: `${prefix}daily`,
  cooldown: 86400000, // 24 horas en milisegundos
  economy: true,

  execute: async (totoro, msg, args) => {
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

    // Buscar al usuario en la base de datos para el grupo específico
    let economy = await totoEconomy.findOne({
      where: { phone: user, groupId: groupId },
    });

    const timeout = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

    // Verificar si el usuario ya reclamó su recompensa diaria
    if (economy && economy.lastDaily) {
      const lastDailyTime = economy.lastDaily;
      const timeDifference = Date.now() - lastDailyTime;

      if (timeDifference < timeout) {
        const timeLeft = convertTime(timeout - timeDifference);
        return economyCooldown(
          msg,
          "daily",
          `Espera ${timeLeft} para reclamar tu próxima recompensa diaria.`
        );
      }
    }

    // Si el usuario puede reclamar su recompensa diaria
    const min = 200;
    const max = 500;
    const amount = Math.floor(Math.random() * (max - min + 1)) + min;

    // Enviar mensaje al usuario con la cantidad reclamada
    msg.reply({
      text: `Has reclamado ${amount} totoCoins como tu recompensa diaria. ¡Vuelve mañana para reclamar más!`,
    });

    // Si el usuario no existe en la base de datos, creamos su registro
    if (!economy) {
      await totoEconomy.create({
        groupId: groupId,
        groupName: groupName,
        phone: user,
        balance: amount, // Agregamos la recompensa inicial al balance
        banco: 0,
        lastDaily: Date.now(),
      });
    } else {
      // Si el registro existe, actualizamos su balance y la fecha del último daily
      economy.balance += amount;
      economy.lastDaily = Date.now();
      await economy.save();
    }
  },
};
