const { totoEconomy } = require("../../models");
const { sendError, sendWarning, help } = require("../../functions/messages");
const prefix = require("../../../settings.json").prefix;
const totoroLog = require("../../functions/totoroLog");

module.exports = {
  name: "coinflip",
  category: "totoEconomy",
  subcategory: "ganancias",
  aliases: ["flip", "caraocruz", "cara", "cruz", "coin"],
  description:
    "Apuesta tus totoCoins en un juego de cara o cruz con multiplicadores.",
  usage: `${prefix}coinflip [cantidad]`,
  cooldown: 5,
  economy: true,

  execute: async (totoro, msg, args) => {
    try {
      if (!msg.messages[0].key.remoteJid.endsWith("@g.us")) {
        return sendWarning(
          totoro,
          msg,
          "Este comando solo puede ser utilizado en grupos."
        );
      }

      // Obtener la información del grupo y del usuario
      const message = msg.messages[0];
      const groupId = message.key.remoteJid; // ID del grupo
      const groupInfo = await totoro.groupMetadata(groupId);
      const groupName = groupInfo.subject;

      const extendedTextMessage = message.message.extendedTextMessage;

      const mentionedJid = extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      const quotedParticipant = extendedTextMessage?.contextInfo?.participant;

      const targetPhone =
        mentionedJid?.split("@")[0] ||
        quotedParticipant?.split("@")[0] ||
        message.key.participant?.split("@")[0];

      if (!targetPhone) {
        return help(
          totoro,
          msg,
          "coinflip",
          "Apuesta tus totoCoins en un juego de cara o cruz.",
          `${prefix}coinflip [cantidad]`
        );
      }

      let amount = parseInt(args[0], 10);
      if (isNaN(amount) || amount < 1) amount = 100;

      // Limitar la apuesta a un máximo de 1 billón
      const maxBet = 1000000000;
      if (amount > maxBet) {
        return sendWarning(
          totoro,
          msg,
          `No puedes apostar más de ${maxBet.toLocaleString()} totoCoins.`
        );
      }

      // Buscar o crear un registro de economía para este usuario en este grupo
      let economy = await totoEconomy.findOne({
        where: { phone: targetPhone, groupId: groupId },
      });

      // Si no existe el usuario en este grupo, creamos un nuevo registro
      if (!economy) {
        economy = await totoEconomy.create({
          groupId: groupId,
          groupName: groupName,
          phone: targetPhone,
          balance: 0,
          banco: 0,
        });
      }

      if (economy.balance < amount) {
        return sendWarning(
          totoro,
          msg,
          "No tienes suficientes totoCoins para realizar la apuesta."
        );
      }

      const userChoice = Math.random() < 0.5 ? "cara" : "cruz"; // Elección automática
      const coin = Math.random() < 0.5 ? "cara" : "cruz"; // Resultado del volado
      const win = userChoice === coin;

      // Configuración de multiplicadores
      const winMultiplier = 2; // Si gana, obtiene el doble de lo apostado
      const loseMultiplier = 1; // Si pierde, pierde la cantidad apostada

      const winAmount = win ? amount * winMultiplier : -amount * loseMultiplier;

      // Actualizar el balance: restar en caso de pérdida, sumar en caso de victoria
      economy.balance = economy.balance + winAmount;

      // Verificar que el balance no exceda 1 billón
      economy.balance = Math.min(economy.balance, maxBet);

      // Guardar los cambios en la base de datos
      await economy.save();

      // Mensaje de resultado con multiplicador
      const resultMessage = win
        ? `¡Has ganado ${
            amount * winMultiplier
          } totoCoins! (Multiplicador: x${winMultiplier})`
        : `Has perdido ${
            amount * loseMultiplier
          } totoCoins. (Multiplicador: x${loseMultiplier})`;

      msg.reply({
        text: `🪙 Has elegido ${userChoice}. La moneda cayó en ${coin}. ${resultMessage}`,
      });
    } catch (error) {
      totoroLog.error(
        "./logs/commands/coinflip.log",
        `[COMMAND] Error en coinflip: ${error.message}`
      );
      await sendError(
        totoro,
        msg,
        "Hubo un error al realizar la apuesta. Intenta de nuevo más tarde."
      );
    }
  },
};
