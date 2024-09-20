const { totoEconomy } = require("../../models");
const { sendError, sendWarning } = require("../../functions/messages");
const prefix = require("../../../settings.json").prefix;
const totoroLog = require("../../functions/totoroLog");

module.exports = {
  name: "pay",
  category: "totoEconomy",
  subcategory: "ganancias",
  aliases: ["pay", "pago"],
  description: "Paga a otro usuario en el grupo con totoCoins.",
  usage: `${prefix}pay <cantidad> @usuario o cita el mensaje de un usuario`,
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
      const quotedMessage =
        message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      let targetPhone = message.key.participant?.split("@")[0];

      let receiverPhone;

      if (!mentionedJid && quotedMessage) {
        receiverPhone =
          message.message.extendedTextMessage.contextInfo.participant?.split(
            "@"
          )[0] ||
          message.message.extendedTextMessage.contextInfo.quotedMessage.contextInfo?.participant?.split(
            "@"
          )[0];
      } else if (mentionedJid) {
        receiverPhone = mentionedJid.split("@")[0];
      } else {
        sendWarning(
          totoro,
          msg,
          "Debes mencionar a un usuario o citar un mensaje para pagar."
        );
        return;
      }

      const payAmount = parseInt(args[0], 10);
      if (isNaN(payAmount) || payAmount <= 0) {
        sendWarning(
          totoro,
          msg,
          "Por favor, especifica una cantidad válida de totoCoins para pagar."
        );
        return;
      }

      const [senderEconomy] = await totoEconomy.findOrCreate({
        where: { phone: targetPhone, groupId: remoteJid },
        defaults: {
          groupId: groupId,
          groupName: groupName,
          phone: targetPhone,
          balance: 0,
          banco: 0,
        },
      });

      if (senderEconomy.balance < payAmount) {
        sendWarning(
          totoro,
          msg,
          "No tienes suficientes totoCoins para realizar este pago."
        );
        return;
      }

      const [receiverEconomy] = await totoEconomy.findOrCreate({
        where: { phone: receiverPhone, groupId: remoteJid },
        defaults: {
          groupId: groupId,
          groupName: groupName,
          phone: receiverPhone,
          balance: 0,
          banco: 0,
        },
      });

      senderEconomy.balance -= payAmount;
      receiverEconomy.balance += payAmount; // Se agrega al balance

      await senderEconomy.save();
      await receiverEconomy.save();

      const responseMessage =
        `╭─⬣「 Pago 」\n` +
        `│  ≡◦ 💸 Monto pagado: ${payAmount} totoCoins.\n` +
        `│  ≡◦ 💶 Balance de @${targetPhone}: ${senderEconomy.balance} totoCoins.\n` +
        `│  ≡◦ 💳 Balance de @${receiverPhone}: ${receiverEconomy.balance} totoCoins.\n` +
        `╰─⬣\n` +
        `📌 @${targetPhone} ha pagado ${payAmount} totoCoins a @${receiverPhone}.`;

      await totoro.sendMessage(
        remoteJid,
        {
          text: responseMessage,
          mentions: [
            `${targetPhone}@s.whatsapp.net`,
            `${receiverPhone}@s.whatsapp.net`,
          ],
        },
        { quoted: message }
      );
    } catch (error) {
      totoroLog.error(
        "./logs/commands/pay.log",
        `[COMMAND] Error en pay: ${error.message}`
      );
      await sendError(
        totoro,
        msg,
        "Hubo un error al realizar el pago. Intenta de nuevo más tarde."
      );
    }
  },
};
