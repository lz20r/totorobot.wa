const { totoEconomy } = require("../../models");
const { sendError, sendWarning } = require("../../functions/messages");
const prefix = require("../../../settings.json").prefix;
const totoroLog = require("../../functions/totoroLog");

module.exports = {
  name: "transfer",
  category: "totoEconomy",
  subcategory: "ganancias",
  aliases: ["transfer", "trans"],
  description: "Transfiere totoCoins al banco de otro usuario en el grupo.",
  usage: `${prefix}transfer <cantidad> @usuario o cita el mensaje de un usuario`,
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
      let targetPhone = message.key.participant?.split("@")[0]; // Remitente

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
          "Debes mencionar a un usuario o citar un mensaje para transferir."
        );
        return;
      }

      const transferAmount = parseInt(args[0], 10);
      if (isNaN(transferAmount) || transferAmount <= 0) {
        sendWarning(
          totoro,
          msg,
          "Por favor, especifica una cantidad válida de totoCoins para transferir."
        );
        return;
      }

      // Encuentra o crea el registro de economía del remitente (emisor)
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

      if (senderEconomy.balance < transferAmount) {
        sendWarning(
          totoro,
          msg,
          "No tienes suficientes totoCoins para transferir esa cantidad."
        );
        return;
      }

      // Encuentra o crea el registro de economía del receptor
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

      // Realiza la transferencia
      senderEconomy.balance -= transferAmount;
      receiverEconomy.banco += transferAmount; // Se agrega al banco

      await senderEconomy.save();
      await receiverEconomy.save();

      const responseMessage =
        `╭─⬣「 Transferencia 」\n` +
        `│  ≡◦ 💸 Monto transferido: ${transferAmount} totoCoins.\n` +
        `│  ≡◦ 💶 Balance de @${targetPhone}: ${senderEconomy.balance} totoCoins.\n` +
        `│  ≡◦ 🏦 Banco de @${receiverPhone}: ${receiverEconomy.banco} totoCoins.\n` +
        `╰─⬣\n` +
        `📌 @${targetPhone} ha transferido ${transferAmount} totoCoins al banco de @${receiverPhone}.`;

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
        "./logs/commands/transfer.log",
        `[COMMAND] Error en transfer: ${error.message}`
      );
      await sendError(
        totoro,
        msg,
        "Hubo un error al realizar la transferencia. Intenta de nuevo más tarde."
      );
    }
  },
};
