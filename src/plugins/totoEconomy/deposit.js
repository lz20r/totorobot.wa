const { totoEconomy } = require("../../models");
const {
  sendError,
  sendWarning,
  infoRegister,
  help,
} = require("../../functions/messages");
const prefix = require("../../../settings.json").prefix;
const totoroLog = require("../../functions/totoroLog");

module.exports = {
  name: "deposit",
  category: "totoEconomy",
  subcategory: "ganancias",
  aliases: ["dep", "deposit"],
  description: "Deposita una cantidad de totoCoins en el banco.",
  usage: `${prefix}deposit <cantidad>`,
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
      const targetPhone = message.key.participant?.split("@")[0];

      // Encuentra el registro de economía del usuario
      const userEconomy = await totoEconomy.findOne({
        where: { phone: targetPhone, groupId: remoteJid },
      });

      if (!userEconomy) {
        return infoRegister(
          msg,
          `Te invitamos Totorolandia con ${prefix}register <nombre>.<edad>`
        );
      }

      // Validar si el usuario tiene balance para depositar
      if (userEconomy.balance <= 0) {
        msg.react("⚠");
        msg.reply({
          text: `> @${targetPhone} no tienes totoCoins para depositar.`,
          mentions: [
            mentionedJid || quotedParticipant || message.key.participant,
          ],
        });
        return;
      }

      // Validar si el usuario ha especificado la cantidad o 'all'
      let depositAmount;
      if (args[0]?.toLowerCase() === "all") {
        // Si el usuario especifica "all", depositar todo su balance
        depositAmount = userEconomy.balance;
      } else {
        depositAmount = parseInt(args[0]);
        if (isNaN(depositAmount) || depositAmount <= 0) {
          sendWarning(
            totoro,
            msg,
            "Por favor, introduce una cantidad válida para depositar."
          );
          return;
        }
      }

      // Validar que el usuario tenga suficiente balance para depositar
      if (userEconomy.balance < depositAmount) {
        const responseMessage = `> @${targetPhone} no tienes suficientes totoCoins para depositar ${depositAmount.toLocaleString(
          "es-ES"
        )} totoCoins.`;
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
        return;
      }

      // Actualizar el balance y el banco del usuario
      userEconomy.balance -= depositAmount;
      userEconomy.banco += depositAmount;
      await userEconomy.save();

      // Formatear los números con separadores de miles
      const formattedDepositAmount = depositAmount.toLocaleString("es-ES");
      const formattedBankAmount = userEconomy.banco.toLocaleString("es-ES");

      const depositar =
        `╭─⬣「 @${targetPhone}'s Deposito 」\n` +
        `│  ≡◦ 🤑 Monto depositado: ${formattedDepositAmount} totoCoins.\n` +
        `│  ≡◦ 🏦 Monto total en el banco: ${formattedBankAmount} totoCoins.\n` +
        `╰─⬣\n` +
        `> @${targetPhone} usa ${prefix}withdraw para retirar totoCoins de tu banco.\n` +
        `> @${targetPhone} usa ${prefix}balance para ver tu balance.\n`;

      // Enviar confirmación al usuario
      await totoro.sendMessage(
        remoteJid,
        {
          text: depositar,
          mentions: [message.key.participant],
        },
        { quoted: message }
      );
    } catch (error) {
      totoroLog.error(
        "./logs/commands/deposit.log",
        `[COMMAND] Error en deposit: ${error.message}`
      );
      await sendError(
        msg.key.remoteJid,
        "Hubo un error al depositar. Intenta de nuevo más tarde.",
        totoro
      );
    }
  },
};
