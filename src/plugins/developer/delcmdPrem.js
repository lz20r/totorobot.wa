const fs = require("fs");
const path = require("path");
const { sendSuccess, help } = require("../../functions/messages");

module.exports = {
  name: "deleteCmdPrem",
  category: "developer",
  subcategory: "owner",
  aliases: ["dcmdp"],
  usage: "dcmdp <cmd>",
  description: "Elimina cmdPrem de settings.json",
  dev: true,

  async execute(totoro, msg, args) {
    try {
      // Verifica si se proporcionó un argumento
      if (!args.length) {
        return help(
          totoro,
          msg,
          "deleteCmdPrem",
          "Falta el valor de cmdPrem",
          "+deleteCmdPrem <cmdPrem>"
        );
      }

      const cmdPremValue = args[0]; // Obtenemos el valor de cmdPrem del primer argumento

      const settingsPath = path.join(__dirname, "../../../settings.json");

      // Leemos el contenido actual de settings.json
      const settingsData = await fs.promises.readFile(settingsPath, "utf8");
      const settings = JSON.parse(settingsData);

      // Eliminar el valor de cmdPrem si existe
      const index = settings.cmdPrem.indexOf(cmdPremValue);
      if (index > -1) {
        settings.cmdPrem.splice(index, 1); // Elimina el valor del array
      } else {
        return msg.reply("El valor especificado no existe en cmdPrem.");
      }

      // Escribimos los cambios de vuelta en settings.json
      await fs.promises.writeFile(
        settingsPath,
        JSON.stringify(settings, null, 2)
      );

      // Notificamos al usuario que la operación fue exitosa
      sendSuccess(totoro, msg, "cmdPrem eliminado correctamente.");
    } catch (error) {
      console.error(error);
      msg.reply("Hubo un error al intentar actualizar settings.json.");
    }
  },
};
