const fs = require("fs");
const path = require("path");
const { sendSuccess, help } = require("../../functions/messages");

module.exports = {
  name: "removeDev",
  category: "developer",
  subcategory: "owner",
  aliases: ["devdelete", "devremove", "devdel", "rdev"],
  usage: "<dev>",
  description: "Elimina un dev de settings.json",
  dev: true,

  async execute(totoro, msg, args) {
    try {
      let devValue = "";
      let fullDevValue = "";

      const message =
        msg.messages[0].message?.ephemeralMessage?.message?.extendedTextMessage;
      const quotedContextInfo = message?.contextInfo;

      // Obtener el número del mensaje citado
      if (quotedContextInfo && quotedContextInfo.participant) {
        devValue = quotedContextInfo.participant.replace("@s.whatsapp.net", "");
      }

      // Si no hay mensaje citado, usar el argumento pasado
      if (!devValue && args.length > 0) {
        devValue = args[0];
      }

      if (!devValue.trim()) {
        return msg.reply(
          "Por favor, proporciona un número de desarrollador válido."
        );
      }

      fullDevValue = `${devValue}@s.whatsapp.net`;

      const settingsPath = path.join(__dirname, "../../../settings.json");

      // Leer el archivo settings.json
      const settingsData = await fs.promises.readFile(settingsPath, "utf8");
      const settings = JSON.parse(settingsData);

      // Verificar si el usuario es un desarrollador
      const devIndex = settings.dev.indexOf(fullDevValue);
      if (devIndex === -1) {
        return msg.reply({
          text: `El usuario @${devValue} no está en la lista de desarrolladores.`,
          mentions: [devValue + "@s.whatsapp.net"],
        });
      }

      // Eliminar el desarrollador de la lista
      settings.dev.splice(devIndex, 1);

      // Guardar los cambios en settings.json
      await fs.promises.writeFile(
        settingsPath,
        JSON.stringify(settings, null, 2)
      );

      // Enviar mensaje de éxito mencionando al desarrollador eliminado
      sendSuccess(totoro, msg, "Desarrollador eliminado exitosamente.");
    } catch (error) {
      console.error("Error:", error);
      msg.reply("Hubo un error al intentar actualizar settings.json.");
    }
  },
};
