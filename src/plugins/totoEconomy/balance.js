const { totoEconomy } = require("../../models");
const { sendError, sendWarning } = require("../../functions/messages");
const prefix = require("../../../settings.json").prefix;
const totoroLog = require("../../functions/totoroLog");

module.exports = {
  name: "balance",
  category: "totoEconomy",
  subcategory: "ganancias",
  aliases: ["balance", "bal"],
  description: "Muestra tu balance de totoCoins por grupo.",
  usage: `${prefix}balance o responde a un mensaje`,
  cooldown: 5,
  economy: true,

  execute: async (totoro, msg, args) => {
    try {
      if (!msg.messages[0].key.remoteJid.endsWith("@g.us")) {
        sendWarning(
          totoro,
          msg,
          "Este comando solo puede ser utilizado en grupos."
        );
        return;
      }

      const message = msg.messages[0];
      const groupId = message.key.remoteJid;
      const remoteJid = message.key.remoteJid;
      const groupInfo = await totoro.groupMetadata(groupId);
      const groupName = groupInfo.subject;
      const mentionedJid =
        message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      const quotedParticipant =
        message.message?.extendedTextMessage?.contextInfo?.participant;
      let targetPhone = message.key.participant?.split("@")[0];

      if (mentionedJid) {
        targetPhone = mentionedJid.split("@")[0];
      } else if (quotedParticipant) {
        targetPhone = quotedParticipant.split("@")[0];
      } else {
        targetPhone = message.key.participant?.split("@")[0];
      }

      // Encuentra o crea el registro de economía para el usuario en el grupo específico
      const [userEconomy, created] = await totoEconomy.findOrCreate({
        where: { phone: targetPhone, groupId: remoteJid },
        defaults: {
          groupId: groupId,
          groupName: groupName,
          phone: targetPhone,
          balance: 0,
          banco: 0,
        },
      });

      // Si se creó un nuevo registro, muestra un mensaje indicando que el balance es 0
      if (created) {
        const responseMessage =
          `╭─⬣「 @${targetPhone}'s Economy 」\n` +
          `│  ≡◦ 💶 Balance total: 0 totoCoins.\n` +
          `│  ≡◦ 💳 Banco:  0 totoCoins.\n` +
          `│  ≡◦ 🏦 Total: 0 totoCoins.\n` +
          `╰─⬣`;
        await totoro.sendMessage(
          remoteJid,
          {
            text: responseMessage,
            mentions: [
              mentionedJid || quotedParticipant || message.key.participant,
            ],
          },
          { quoted: message }
        );
      } else {
        // Formatear los valores del balance y el banco con separadores de miles
        const formattedBalance = userEconomy.balance.toLocaleString("es-ES");
        const formattedBank = userEconomy.banco.toLocaleString("es-ES");
        const formattedTotal = (
          userEconomy.balance + userEconomy.banco
        ).toLocaleString("es-ES");

        // Muestra el balance actual del usuario en este grupo
        const responseMessage =
          `╭─⬣「 @${targetPhone}'s Economy 」\n` +
          `│  ≡◦ 💶 Balance total: ${formattedBalance} totoCoins.\n` +
          `│  ≡◦ 💳 Banco: ${formattedBank} totoCoins.\n` +
          `│  ≡◦ 🏦 Total: ${formattedTotal} totoCoins.\n` +
          `╰─⬣`;

        await totoro.sendMessage(
          remoteJid,
          {
            text: responseMessage,
            mentions: [
              mentionedJid || quotedParticipant || message.key.participant,
            ],
          },
          { quoted: message }
        );
      }
    } catch (error) {
      totoroLog.error(
        "./logs/commands/balance.log",
        `[COMMAND] Error en balance: ${error.message}`
      );
      await sendError(
        totoro,
        msg,
        "Hubo un error al obtener el balance. Intenta de nuevo más tarde."
      );
    }
  },
};
