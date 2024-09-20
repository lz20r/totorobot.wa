const { totoEconomy } = require(`../../models`);
const { economyCooldown, sendWarning } = require(`../../functions/messages`);
const prefix = require(`../../../settings.json`).prefix;
const convertTime = require(`../../functions/convertTime`);

module.exports = {
  name: "weekly",
  category: "totoEconomy",
  subcategory: "ganancias",
  aliases: ["semanal", "weeklyreward"],
  description: "Reclama tu recompensa semanal de totoCoins.",
  usage: `${prefix}weekly`,
  cooldown: 5,
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

    // Buscar al usuario en la base de datos
    const economy = await totoEconomy.findOne({
      where: { phone: user, groupId: groupId }, // Se agrega el groupId para asegurar que es del grupo actual
    });

    let timeout = 7 * 24 * 60 * 60 * 1000; // 7 días en milisegundos

    // Verificar si el usuario ya reclamó su recompensa semanal
    if (economy && economy.lastWeekly) {
      const lastWeeklyTime = economy.lastWeekly;
      const timeDifference = Date.now() - lastWeeklyTime;

      if (timeDifference < timeout) {
        let time = convertTime(timeout - timeDifference);
        return economyCooldown(
          msg,
          `weekly`,
          `Espera ${time} para reclamar tu recompensa semanal.`
        );
      }
    }

    // Si el usuario puede reclamar su recompensa, le damos las monedas
    const min = 500;
    const max = 1000;
    const amount = Math.floor(Math.random() * (max - min + 1)) + min;

    // Notificar al usuario la cantidad que ha recibido
    msg.reply({
      text: `Has reclamado ${amount} totoCoins como tu recompensa semanal.`,
    });

    // Si no existe el registro en la base de datos, crearlo y agregar el balance
    if (!economy) {
      await totoEconomy.create({
        groupId: groupId,
        groupName: groupName,
        phone: user,
        balance: amount,
        banco: 0,
        lastWeekly: Date.now(),
      });
    } else {
      // Si existe, agregar la cantidad al balance actual y actualizar la fecha de la última reclamación
      economy.balance += amount;
      economy.lastWeekly = Date.now();
      await economy.save();
    }
  },
};
