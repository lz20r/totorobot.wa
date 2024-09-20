const { sendError, help, sendMessage, sendWarning } = require("../../functions/messages");
const { totoGroupSettings } = require("../../models");
const totoroLog = require("../../functions/totoroLog");
const prefix = require("../../../settings.json").prefix;

module.exports = {
  name: "welcome",
  aliases: ["bienvenida", "w", "wlcm"],
  category: "settings",
  subcategory: "setup",
  usage: "<on / off>",
  example: "setwelcome on",
  description: "Activa las bienvenidas en este grupo.",
  onlyAdmin: true,
  onlyGroup: true,

  async execute(totoro, msg, args) {
    try {
      const info = msg.messages[0];
      const from = info.key.remoteJid;
      const groupId = from.split("@")[0];
      const mode = args.join(" ").toLowerCase();
      const sender = msg.messages[0].key.participant;
      const groupInfo = await totoro.groupMetadata(
        msg.messages[0].key.remoteJid
      );
      const participant = groupInfo.participants.find((x) => x.id === sender);
      if (!participant || !participant.admin) {
        sendWarning(
          totoro,
          msg,
          "No tienes permisos para ejecutar este comando. Solo los administradores pueden usar este comando."
        );
        return;
      }

      // Si no se proporciona un modo, mostrar la ayuda
      if (!mode) {
        return help(
          totoro,
          msg,
          "welcome",
          "Activa las bienvenidas en este grupo.",
          `${prefix}welcome <on / off>`
        );
      }

      // Buscar configuración del grupo
      let groupConfig = await totoGroupSettings.findOne({
        where: { groupId: groupId },
      });

      // Si no existe, crear una nueva entrada en totoGroupSettings
      if (!groupConfig) {
        groupConfig = await totoGroupSettings.create({
          groupId: groupId,
          welcomeEnabled: false,
        });
      }

      // Activar o desactivar la bienvenida según el modo proporcionado
      if (mode === "on") {
        if (groupConfig.welcomeEnabled) {
          return sendMessage(totoro, msg, "Las bienvenidas ya están activadas");
        } else {
          await totoGroupSettings.update(
            { welcomeEnabled: true },
            { where: { groupId: groupId } }
          );
          return sendMessage(
            totoro,
            msg,
            "Se activaron las bienvenidas para este grupo"
          );
        }
      } else if (mode === "off") {
        if (!groupConfig.welcomeEnabled) {
          return sendMessage(
            totoro,
            msg,
            "Las bienvenidas ya están desactivadas"
          );
        } else {
          await totoGroupSettings.update(
            { welcomeEnabled: false },
            { where: { groupId: groupId } }
          );
          return sendMessage(
            totoro,
            msg,
            "Se desactivaron las bienvenidas para este grupo"
          );
        }
      } else {
        // Si el modo no es ni "on" ni "off", mostrar la ayuda
        return help(
          totoro,
          msg,
          "welcome",
          "Activa las bienvenidas en este grupo.",
          `${prefix}welcome <on / off>`
        );
      }
    } catch (err) {
      // Registrar el error y enviar un mensaje de error
      totoroLog.error(
        "./logs/plugins/setup/welcome.log",
        `Error en ejecutar welcome: ${err.message}`
      );
      sendError(
        totoro,
        msg,
        `Hubo un error al ejecutar el comando: ${err.message}`
      );
    }
  },
};
