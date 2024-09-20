const fs = require("fs");
const path = require("path");
const { sendSuccess, help } = require("../../functions/messages");
const settingsPath = path.join(__dirname, "../../../settings.json");
let settings = require(settingsPath);

module.exports = {
  name: "unblockCmd",
  category: "developer",
  subcategory: "owner",
  aliases: ["unblockcmd"],
  usage: `${settings.prefix}unblockCmd <cmdName>`,
  description:
    "Desbloquea un comando eliminándolo de blockCmd en settings.json",
  dev: true,

  async execute(totoro, msg, args) {
    await msg.react("⏳");
    try {
      // Verifica si se proporcionó un argumento
      if (!args.length) {
        await msg.react("❌");
        return help(
          totoro,
          msg,
          "unblockCmd",
          "Falta el nombre del comando a desbloquear",
          `${settings.prefix}unblockCmd <cmdName>`
        );
      }

      const cmdName = args[0]; // Obtenemos el nombre del comando del primer argumento

      // Verificamos si blockCmd ya existe y contiene el comando
      if (!settings.blockCmd || !settings.blockCmd.includes(cmdName)) {
        await msg.react("❌");
        return msg.reply("El comando no está bloqueado.");
      }

      // Eliminamos el comando de blockCmd
      settings.blockCmd = settings.blockCmd.filter((cmd) => cmd !== cmdName);

      // Escribimos los cambios de vuelta en settings.json
      await fs.promises.writeFile(
        settingsPath,
        JSON.stringify(settings, null, 2)
      );

      await msg.react("✅");
      // Notificamos al usuario que la operación fue exitosa
      sendSuccess(totoro, msg, "Comando desbloqueado correctamente.");
    } catch (error) {
      console.error(error);
      await msg.react("❌");
      msg.reply("Hubo un error al intentar actualizar settings.json.");
    }
  },
};
