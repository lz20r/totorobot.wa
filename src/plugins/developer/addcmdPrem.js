const fs = require("fs");
const path = require("path");
const { sendSuccess, help } = require("../../functions/messages");

module.exports = {
  name: "addCmdPrem",
  category: "developer",
  subcategory: "owner",
  aliases: ["addcmdprem"],
  usage: "<cmdprem>",
  description: "Agrega cmdPrem a settings.json",
  dev: true,

  async execute(totoro, msg, args) {
    try {
      // Verifica si se proporcionó un argumento
      if (!args.length) {
        return help(
          totoro,
          msg,
          "addCmdPrem",
          "Falta el valor de cmdPrem",
          "+addCmdPrem <cmdPrem>"
        );
      }

      const cmdPremValue = args[0]; // Obtenemos el valor de cmdPrem del primer argumento

      const settingsPath = path.join(__dirname, "../../../settings.json");

      // Leemos el contenido actual de settings.json
      const settingsData = await fs.promises.readFile(settingsPath, "utf8");
      const settings = JSON.parse(settingsData);

      // Agregar el nuevo valor a cmdPrem
      if (!settings.cmdPrem.includes(cmdPremValue)) {
        settings.cmdPrem.push(cmdPremValue);
      }

      // Escribimos los cambios de vuelta en settings.json
      await fs.promises.writeFile(
        settingsPath,
        JSON.stringify(settings, null, 2)
      );

      // Notificamos al usuario que la operación fue exitosa
      sendSuccess(totoro, msg, "cmdPrem actualizado correctamente.");
    } catch (error) {
      console.error(error);
      msg.reply("Hubo un error al intentar actualizar settings.json.");
    }
  },
};
