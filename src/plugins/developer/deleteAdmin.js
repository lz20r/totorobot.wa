const fs = require("fs");
const path = require("path");
const { sendSuccess, help } = require("../../functions/messages");

module.exports = {
  name: "removeAdmin",
  category: "developer",
  subcategory: "owner",
  aliases: ["admindelete", "adminremove", "admindel", "radmin"],
  usage: "<admin>",
  description: "Elimina un admin de settings.json",
  dev: true,

  async execute(totoro, msg, args) {
    try {
      let adminValue = "";
      let fullAdminValue = "";

      const message =
        msg.messages[0].message?.ephemeralMessage?.message?.extendedTextMessage;
      const quotedContextInfo = message?.contextInfo;

      // Obtener el número del mensaje citado
      if (quotedContextInfo && quotedContextInfo.participant) {
        adminValue = quotedContextInfo.participant.replace(
          "@s.whatsapp.net",
          ""
        );
      }

      // Si no hay mensaje citado, usar el argumento pasado
      if (!adminValue && args.length > 0) {
        adminValue = args[0];
      }

      if (!adminValue.trim()) {
        return msg.reply(
          "Por favor, proporciona un número de administrador válido."
        );
      }

      fullAdminValue = `${adminValue}@s.whatsapp.net`;

      const settingsPath = path.join(__dirname, "../../../settings.json");

      // Leer el archivo settings.json
      const settingsData = await fs.promises.readFile(settingsPath, "utf8");
      const settings = JSON.parse(settingsData);

      // Verificar si el usuario es un administrador
      const adminIndex = settings.admin.indexOf(fullAdminValue);
      if (adminIndex === -1) {
        return msg.reply({
          text: `El usuario @${adminValue} no está en la lista de administradores.`,
          mentions: [adminValue + "@s.whatsapp.net"],
        });
      }

      // Eliminar el administrador de la lista
      settings.admin.splice(adminIndex, 1);

      // Guardar los cambios en settings.json
      await fs.promises.writeFile(
        settingsPath,
        JSON.stringify(settings, null, 2)
      );

      // Enviar mensaje de éxito mencionando al administrador eliminado
      sendSuccess(totoro, msg, "Administrador eliminado exitosamente.");
    } catch (error) {
      console.error("Error:", error);
      msg.reply("Hubo un error al intentar actualizar settings.json.");
    }
  },
};
