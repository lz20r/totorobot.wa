const { totoEconomy } = require("../../models");
const prefix = require("../../../settings.json").prefix;
const { Op } = require("sequelize");
const sequelize = require("sequelize");

module.exports = {
  name: "leaderboard",
  category: "totoEconomy",
  subcategory: "ranking",
  aliases: ["top", "ranking"],
  description:
    "Muestra la tabla de clasificación de los usuarios con más totoCoins en el banco y su balance total en el grupo actual.",
  usage: `${prefix}leaderboard`,
  cooldown: 5,
  economy: true,
  execute: async (totoro, msg, args) => {
    try {
      const message = msg.messages[0];
      const remoteJid = message.key.remoteJid;

      // Verificar si el mensaje proviene de un grupo
      if (!remoteJid.endsWith("@g.us")) {
        return msg.reply({
          text: "Este comando solo se puede usar en grupos.",
        });
      }

      const groupInfo = await totoro.groupMetadata(remoteJid);
      const groupName = groupInfo.subject;

      // Obtener los usuarios del grupo actual con más monedas en el banco, ordenados por el total de banco + balance
      const leaderboard = await totoEconomy.findAll({
        where: {
          groupId: remoteJid, // Filtra por el grupo actual
          banco: { [Op.gt]: 0 }, // Solo usuarios con monedas en el banco mayor a 0
        },
        order: [[sequelize.literal("banco + balance"), "DESC"]], // Ordenar por la suma de banco y balance
        limit: 10, // Número de usuarios a mostrar
      });

      // Verificar si hay usuarios en la clasificación
      if (leaderboard.length === 0) {
        return msg.reply({
          text:
            `╭─⬣「 *Tabla de Clasificación de totoCoins en el banco - ${groupName}* 」⬣\n` +
            `│  ≡◦ *No hay usuarios con totoCoins en el banco en este grupo*\n` +
            `│  ≡◦ *¡Comienza a ahorrar tus totoCoins!* \n` +
            `╰─⬣\n` +
            `> *Usa ${prefix}category economy para ver los comandos disponibles de economía*`,
        });
      }

      // Formatear la tabla de clasificación
      let leaderboardMessage = `╭─⬣「 *Tabla de Clasificación de totoCoins en el banco y total - ${groupName}* 」⬣\n`;
      const mentions = [];

      leaderboard.forEach((entry, index) => {
        const userMention = `${entry.phone}@s.whatsapp.net`;
        // Formatear el monto del banco, balance y total con separadores de miles

        const total = (entry.banco + entry.balance).toLocaleString("es-ES");

        leaderboardMessage += `│  ≡◦ ${index + 1}. @${
          entry.phone
        } - *${total} total*\n`;
        mentions.push(userMention); // Añade el identificador completo para las menciones
      });
      leaderboardMessage += "╰─⬣";

      // Enviar el mensaje con la tabla de clasificación y las menciones
      const replyOptions = {
        text: leaderboardMessage,
        mentions: mentions, // Añade las menciones al mensaje
      };

      await totoro.sendMessage(remoteJid, replyOptions, { quoted: message });
    } catch (error) {
      console.error(`Error en el comando 'leaderboard': ${error}`);
      return msg.reply({
        text: "Hubo un error al obtener la tabla de clasificación. Inténtalo más tarde.",
      });
    }
  },
};
