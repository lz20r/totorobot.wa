const fs = require("fs");
const path = require("path");
const { sendSuccess, help } = require("../../functions/messages");

module.exports = {
  name: "addCmdBlock",
  category: "developer",
  subcategory: "owner",
  aliases: [
    "cmdBlock",
    "blockCmd",
    "cBlock",
    "bCmd",
    "blockcmd",
    "cblock",
    "bcmd",
  ],
  usage: "<cmdBlock>",
  description: "Agrega cmdBlock a settings.json",
  dev: true,

  async execute(totoro, msg, args) {
    try {
      // Verifica si se proporcionó un argumento
      if (!args.length) {
        return help(
          totoro,
          msg,
          "addCmdBlock",
          "Falta el valor de cmdBlock",
          "+addCmdBlock <cmdBlock>"
        );
      }

      // Obtenemos el valor de cmdBlock del primer argumento
      const cmdBlockValue = args[0];

      const settingsPath = path.join(__dirname, "../../../settings.json");

      let settingsData;
      try {
        // Leemos el contenido actual de settings.json
        settingsData = await fs.promises.readFile(settingsPath, "utf8");
      } catch (readError) {
        console.error("Error al leer settings.json:", readError);
        return msg.reply("Hubo un error al leer el archivo de configuración.");
      }

      let settings;
      try {
        // Analizamos el contenido leído
        settings = JSON.parse(settingsData);
      } catch (parseError) {
        console.error("Error al analizar settings.json:", parseError);
        return msg.reply("El archivo de configuración está corrupto.");
      }

      // Verifica si `cmdBlock` existe y es un array
      if (!Array.isArray(settings.cmdBlock)) {
        settings.cmdBlock = [];
      }

      // Agregar el nuevo valor a cmdBlock si no está ya presente
      if (!settings.cmdBlock.includes(cmdBlockValue)) {
        settings.cmdBlock.push(cmdBlockValue);
      } else {
        return msg.reply("El cmdBlock ya está en la lista.");
      }

      try {
        // Escribimos los cambios de vuelta en settings.json
        await fs.promises.writeFile(
          settingsPath,
          JSON.stringify(settings, null, 2)
        );
      } catch (writeError) {
        console.error("Error al escribir settings.json:", writeError);
        return msg.reply("Hubo un error al actualizar el archivo de configuración.");
      }

      // Notificamos al usuario que la operación fue exitosa
      sendSuccess(totoro, msg, "cmdBlock actualizado correctamente.");
    } catch (error) {
      console.error("Error inesperado:", error);
      msg.reply("Hubo un error al intentar actualizar settings.json.");
    }
  },
};
