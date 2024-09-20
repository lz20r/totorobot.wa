const { totoGroupSettings } = require("../../models");
const { prefix } = require("../../../settings.json");
const {
  help,
  sendMessage,
  sendWarning,
  sendError,
} = require("../../functions/messages");
const totoroLog = require("../../functions/totoroLog");

module.exports = {
  name: "welcome",
  aliases: ["bienvenida", "wlcm", "welcm"],
  category: "settings",
  subcategory: "setup",
  usage: "<on / off>",
  example: "setwelcome on",
  description:
    "Activa o desactiva las bienvenidas en este grupo, o muestra la configuración actual.",
  onlyAdmin: true,
  onlyGroup: true,

  async execute(totoro, msg, args) {
    try {
      const info = msg.messages[0];
      const from = info.key.remoteJid; // Obtener el remoteJid completo
      const groupId = from; // Usar el remoteJid como groupId
      const mode = args.join(" ").toLowerCase(); // Modo (on/off)
      const sender = msg.messages[0].key.participant;

      // Obtener metadata del grupo
      const groupInfo = await totoro.groupMetadata(groupId);
      const groupName = groupInfo.subject;
      const participant = groupInfo.participants.find((x) => x.id === sender);

      // Verificar si el usuario es administrador
      if (!participant || !participant.admin) {
        return sendWarning(
          totoro,
          msg,
          "No tienes permisos para ejecutar este comando. Solo los administradores pueden usar este comando."
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
          status: "off", // Por defecto, bienvenida deshabilitada
        });
      }

      // Si no se proporciona un modo, mostrar la configuración actual
      if (!mode) {
        const status =
          groupConfig.status === "on" ? "activadas" : "desactivadas";
        msg.reply({
          text:
            `╭─⬣ 🌟 *Configuración de Bienvenidas* 🌟 ⬣\n` +
            `│\n` +
            `│ 📢 El sistema de bienvenidas en *${groupName}* está actualmente *${status}*.\n` +
            `│\n` +
            `│ 🔧 *Opciones para cambiar el estado:*\n` +
            `│   - ✅ \`${prefix}welcome on\` → *Activar* las bienvenidas.\n` +
            `│   - ❌ \`${prefix}welcome off\` → *Desactivar* las bienvenidas.\n` +
            `│\n` +
            `╰─⬣⚙️ *Personaliza las bienvenidas para mejorar la experiencia de los nuevos miembros.*\n\n` +
            `───────────────\n` +
            `*Ejemplo de uso:*\n` +
            `- \`${prefix}welcome on\` → Activa el sistema de bienvenidas.\n` +
            `- \`${prefix}welcome off\` → Desactiva el sistema de bienvenidas.\n` +
            `───────────────`,
        });
        return;
      }

      // Activar o desactivar la bienvenida según el modo proporcionado
      if (mode === "on") {
        if (groupConfig.status === "on") {
          return msg.reply({
            text:
              `╭─⬣ 🌟 *Configuración de Bienvenidas* 🌟 ⬣\n` +
              `│\n` +
              `│ ✅ Las bienvenidas ya están *activadas* en el grupo *${groupName}*.\n` +
              `│\n` +
              `╰─⬣`,
          });
        } else {
          await groupConfig.update({ status: "on" });
          return msg.reply({
            text:
              `╭─⬣ 🌟 *Configuración de Bienvenidas* 🌟 ⬣\n` +
              `│\n` +
              `│ ✅ *Se activaron* las bienvenidas en el grupo *${groupName}*.\n` +
              `│\n` +
              `╰─⬣`,
          });
        }
      } else if (mode === "off") {
        if (groupConfig.status === "off") {
          return msg.reply({
            text:
              `╭─⬣ 🌟 *Configuración de Bienvenidas* 🌟 ⬣\n` +
              `│\n` +
              `│ ❌ Las bienvenidas ya están *desactivadas* en el grupo *${groupName}*.\n` +
              `│\n` +
              `╰─⬣`,
          });
        } else {
          await groupConfig.update({ status: "off" });
          return msg.reply({
            text:
              `╭─⬣ 🌟 *Configuración de Bienvenidas* 🌟 ⬣\n` +
              `│\n` +
              `│ ❌ *Se desactivaron* las bienvenidas en el grupo *${groupName}*.\n` +
              `│\n` +
              `╰─⬣`,
          });
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
