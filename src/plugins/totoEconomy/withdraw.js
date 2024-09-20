const { totoEconomy } = require("../../models");
const { sendError, sendWarning } = require("../../functions/messages");
const prefix = require("../../../settings.json").prefix;
const totoroLog = require("../../functions/totoroLog");

module.exports = {
  name: "withdraw",
  category: "totoEconomy",
  subcategory: "ganancias",
  aliases: ["wd", "withdraw", "retirar", "wd"],
  description: "Retira una cantidad de totoCoins de tu banco o all el saldo.",
  usage: `${prefix}withdraw <cantidad> o "all"`,
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
      const remoteJid = message.key.remoteJid;
      const mentionedJid =
        message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      const quotedParticipant =
        message.message?.extendedTextMessage?.contextInfo?.participant;
      const targetPhone = message.key.participant?.split("@")[0];

      // Validar si el usuario ha especificado la cantidad o "all"
      let withdrawAmount;
      if (args[0].toLowerCase() === "all") {
        withdrawAmount = "all";
      } else {
        withdrawAmount = parseInt(args[0]);
        if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
          await totoro.sendMessage(
            remoteJid,
            {
              text: `Debes especificar una cantidad válida para retirar. Ejemplo: ${prefix}withdraw 100`,
            },
            { quoted: message }
          );
          return;
        }
      }

      // Encuentra el registro de economía del usuario
      const userEconomy = await totoEconomy.findOne({
        where: { phone: targetPhone, groupId: remoteJid },
      });

      if (!userEconomy) {
        await totoro.sendMessage(
          remoteJid,
          {
            text: `No tienes un registro económico en este grupo. Usa el comando ${prefix}balance para crear uno.`,
          },
          { quoted: message }
        );
        return;
      }

      // Si se solicita "all", ajustar el monto a retirar
      if (withdrawAmount === "all") {
        withdrawAmount = userEconomy.banco;
      }

      // Validar que el usuario tenga suficiente dinero en el banco para retirar
      if (userEconomy.banco < withdrawAmount) {
        await totoro.sendMessage(
          remoteJid,
          {
            text: `No tienes suficientes totoCoins en el banco. Tienes ${userEconomy.banco} totoCoins en el banco.`,
          },
          { quoted: message }
        );
        return;
      }

      // Actualizar el banco y el balance del usuario
      userEconomy.banco -= withdrawAmount;
      userEconomy.balance += withdrawAmount;
      await userEconomy.save();

      // Enviar confirmación al usuario
      const wd =
        `╭─⬣「 @${targetPhone}'s Withdraw 」\n` +
        `│  ≡◦ 🤑 Monto Retirado: ${withdrawAmount} totoCoins.\n` +
        `│  ≡◦ 💶 Monto en el Balance: ${userEconomy.balance} totoCoins.\n` +
        `╰─⬣\n` +
        `> @${targetPhone} ten cuidado con tus totoCoins. te puden robar.`;

      await totoro.sendMessage(
        remoteJid,
        {
          text: wd,
          mentions: [
            mentionedJid || quotedParticipant || message.key.participant,
          ],
        },
        { quoted: message }
      );
    } catch (error) {
      totoroLog.error(
        "./logs/commands/withdraw.log",
        `[COMMAND] Error en withdraw: ${error.message}`
      );
      await sendError(
        totoro,
        msg,
        "Hubo un error al retirar. Intenta de nuevo más tarde."
      );
    }
  },
};
