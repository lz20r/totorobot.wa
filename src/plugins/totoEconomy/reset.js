const { prefix } = require("../../../settings.json").prefix;
const { sendWarning, sendError } = require("../../functions/messages");
const totoEconomy = require("../../models/totoEconomy");
const totoroLog = require("../../functions/totoroLog");

module.exports = {
  name: "resetEconomyGroup",
  category: "totoEconomy",
  subcategory: "admin",
  aliases: ["resetEconomy", "resetGroupEconomy", "reseteconomy", "reset"],
  description: "Restablece la economía de todos los usuarios en el grupo.",
  usage: `${prefix}resetEconomyGroup`,
  cooldown: 5,
  economy: true,

  execute: async (totoro, msg, args) => {
    try {
      // Verifica si el comando se ejecuta en un grupo
      if (
        !msg.messages ||
        !msg.messages[0] ||
        !msg.messages[0].key ||
        !msg.messages[0].key.remoteJid ||
        !msg.messages[0].key.remoteJid.endsWith("@g.us")
      ) {
        sendWarning(
          totoro,
          msg,
          "Este comando solo puede ser utilizado en grupos."
        );
        return;
      }

      const sender = msg.messages[0].key.participant;
      const groupInfo = await totoro.groupMetadata(
        msg.messages[0].key.remoteJid
      );

      // Verifica si el usuario que ejecuta el comando es administrador
      const participant = groupInfo.participants.find((x) => x.id === sender);
      if (!participant || !participant.admin) {
        sendWarning(
          totoro,
          msg,
          "No tienes permisos para ejecutar este comando. Solo los administradores pueden usar este comando."
        );
        return;
      }

      const message = msg.messages[0];
      const remoteJid = message.key.remoteJid;

      // Restablece la economía de todos los usuarios en el grupo
      const result = await totoEconomy.update(
        { banco: 0, balance: 0 }, // Incluye otros campos si es necesario
        { where: { groupId: remoteJid } } // Asegúrate de que `groupId` es el campo correcto
      );

      if (result[0] > 0) {
        const responseMessage = `> La economía de todo el grupo ha sido restablecida. Todos los saldos en banco y balance ahora son 0.`;
        await totoro.sendMessage(
          remoteJid,
          {
            text: responseMessage,
          },
          { quoted: message }
        );
      } else {
        await totoro.sendMessage(
          remoteJid,
          {
            text: `No se encontró ningún registro de economía para este grupo.`,
          },
          { quoted: message }
        );
      }
    } catch (error) {
      totoroLog.error(
        "./logs/commands/resetEconomyGroup.log",
        `[COMMAND] Error en resetEconomyGroup: ${error.message}`
      );
      await sendError(
        totoro,
        msg,
        "Hubo un error al procesar el restablecimiento de la economía del grupo. Intenta de nuevo más tarde."
      );
    }
  },
};
