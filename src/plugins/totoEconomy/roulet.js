const { totoEconomy } = require("../../models");
const { sendError, sendWarning, help } = require("../../functions/messages");
const prefix = require("../../../settings.json").prefix;
const totoroLog = require("../../functions/totoroLog");

module.exports = {
  name: "ruleta",
  category: "totoEconomy",
  subcategory: "ganancias",
  aliases: ["roulette", "bet", "rulet"],
  description: "Apuesta totoCoins en la ruleta.",
  usage: `${prefix}ruleta [cantidad] [color]`,
  cooldown: 5, // Cooldown en minutos
  economy: true,
  execute: async (totoro, msg, args) => {
    try {
      const message = msg.messages[0];

      if (!msg.messages[0].key.remoteJid.endsWith("@g.us")) {
        sendWarning(
          totoro,
          msg,
          "Este comando solo puede ser utilizado en grupos."
        );
        return;
      }

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

      // Verificar y obtener la cantidad
      let amount = parseInt(args[0], 10);
      if (isNaN(amount) || amount < 1) {
        amount = 100; // Cantidad predeterminada si no se especifica
      }

      const color = args[1]?.toLowerCase();
      const validColors = ["rojo", "negro", "verde", "azul", "amarillo"]; // Nuevos colores
      if (!color || !validColors.includes(color)) {
        return help(
          totoro,
          msg,
          "ruleta",
          "Apuesta totoCoins en la ruleta.",
          `${prefix}ruleta [cantidad] [color]`
        );
      }

      // Verificar si el usuario tiene suficiente saldo
      let user = await totoEconomy.findOne({
        where: { phone: targetPhone },
      });

      // Si no existe el usuario, creamos un nuevo registro
      if (!user) {
        user = await totoEconomy.create({
          phone: targetPhone,
          groupId: msg.messages[0].key.remoteJid,
          balance: 1000, // Balance inicial si es un nuevo usuario
        });
      }

      if (user.balance < amount) {
        sendWarning(
          totoro,
          msg,
          `No tienes suficiente saldo para apostar ${amount} totoCoins.`
        );
        return;
      }

      // Calcular el resultado de la ruleta
      const winningColor =
        validColors[Math.floor(Math.random() * validColors.length)];
      const win = winningColor === color;

      // Actualizar el saldo del usuario
      const winnings = win ? amount * 2 : 0;
      const newBalance = win ? user.balance + winnings : user.balance - amount;
      await totoEconomy.update(
        { balance: newBalance },
        { where: { phone: targetPhone } }
      );

      // Enviar mensaje de resultado con imagen
      const mentionText = `> @${targetPhone} ${
        win ? "¡Felicidades!" : "Lo siento, perdiste."
      } Apostaste ${amount} totoCoins al color ${color} y ${
        win
          ? `ganaste ${winnings} totoCoins. El color ganador era ${winningColor}.`
          : `perdiste. El color ganador era ${winningColor}.`
      }`;

      // Enviar imagen y mensaje al grupo
      msg.reply({
        text: mentionText,
        mentions: [message.key.participant, mentionedJid || quotedParticipant],
      });
    } catch (error) {
      totoroLog.error("./logs/plugins/economy/ruleta", `${error}`);
      sendError(
        totoro,
        msg,
        "Ocurrió un error al ejecutar el comando de ruleta."
      );
    }
  },
};
