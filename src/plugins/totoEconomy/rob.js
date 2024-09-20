const { totoEconomy } = require(`../../models`);
const {
  economyCooldown,
  sendWarning,
  sendError,
} = require(`../../functions/messages`);
const prefix = require(`../../../settings.json`).prefix;
const convertTime = require(`../../functions/convertTime`);

module.exports = {
  name: "robar",
  category: "totoEconomy",
  subcategory: "ganancias",
  aliases: ["steal", "rob", "roba"],
  description: "Roba totoCoins de otro usuario.",
  usage: `${prefix}robar [@usuario] [cantidad]`,
  cooldown: 10, // Cooldown en minutos
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

      if (!isGroup) {
        return sendWarning(
          totoro,
          msg,
          "Este comando solo puede ser utilizado en grupos."
        );
      }

      // Verificar a quién se intenta robar
      const mentionedJid =
        info.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      const quotedParticipant =
        info.message.extendedTextMessage?.contextInfo?.participant;
      let targetPhone = null;

      if (mentionedJid) {
        targetPhone = mentionedJid.split("@")[0];
      } else if (quotedParticipant) {
        targetPhone = quotedParticipant.split("@")[0];
      } else {
        return sendWarning(
          totoro,
          msg,
          `Debes mencionar o responder a un mensaje de un usuario para robarle.`
        );
      }

      // Obtener la cantidad a robar
      let amount = parseInt(args[1], 10);
      if (isNaN(amount) || amount < 1) {
        amount = 100; // Cantidad predeterminada si no se especifica
      }

      // Buscar al usuario en la base de datos
      const economy = await totoEconomy.findOne({
        where: { phone: user, groupId: groupId },
      });
      const targetEconomy = await totoEconomy.findOne({
        where: { phone: targetPhone, groupId: groupId },
      });

      if (!targetEconomy || targetEconomy.balance < amount) {
        return sendWarning(
          totoro,
          msg,
          `El usuario objetivo no tiene suficientes totoCoins para robar.`
        );
      }

      // Definir el timeout para 'lastRob' (por ejemplo, 1 hora)
      let timeout = 1 * 60 * 60 * 1000; // 1 hora en milisegundos

      // Verificar si el usuario ya ha robado recientemente
      if (economy && economy.lastRob) {
        const lastRobTime = economy.lastRob;
        const timeDifference = Date.now() - lastRobTime;

        if (timeDifference < timeout) {
          let time = convertTime(timeout - timeDifference);
          return economyCooldown(
            msg,
            `robar`,
            `Aún no puedes robar. Espera ${time} antes de volver a intentarlo.`
          );
        }
      }

      // Si el usuario puede robar, actualizar el `lastRob`
      const newBalance = economy ? economy.balance + amount : amount;

      // Si no existe el registro en la base de datos, crear uno
      if (!economy) {
        await totoEconomy.create({
          groupId: groupId,
          groupName: groupName,
          phone: user,
          balance: newBalance,
          banco: 0,
          lastRob: Date.now(),
        });
      } else {
        // Actualizar el balance y la fecha del último robo
        economy.balance += amount;
        economy.lastRob = Date.now();
        await economy.save();
      }

      // Actualizar el balance de la víctima
      targetEconomy.balance -= amount;
      await targetEconomy.save();

      msg.reply({
        text: `¡Has robado ${amount} totoCoins a @${targetPhone}!`,
        mentions: [mentionedJid || quotedParticipant],
      });
    } catch (error) {
      await sendError(totoro, msg, `${error.message}`);
    }
  },
};
