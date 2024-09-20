const fs = require("fs/promises");
const totoroLog = require("../../functions/totoroLog");

module.exports = {
  name: "gsesion",
  category: "developer",
  subcategory: "WhatsApp",
  aliases: ["getSesion", "sesion"],
  description: "Obtener la sesión de WhatsApp",
  usage: "<getSesion>",
  dev: true,

  async execute(_, msg, __) {
    // Leer el contenido de la carpeta de sesiones de WhatsApp
    try {
      const auth = await fs.readdir("auth/Totoro-auth");

      // Verificar si la carpeta está vacía
      if (auth.length === 0) {
        msg.reply(
          "╭──⬣「 Sesión no encontrada 」⬣\n" +
            "│  ≡◦ 🐥 No se encontró una sesión de WhatsApp.\n" +
            "╰──⬣"
        );
        return;
      }

      // Filtrar los archivos de sesión, excluyendo creds.json
      const sessionFiles = auth.filter((file) => file !== "creds.json");

      // Construir la lista de archivos de sesión
      const files = sessionFiles.map((file) => `│  ≡◦ 📄 ${file}`).join("\n");

      // Informar al usuario de los archivos de sesión y el total
      msg.reply(
        `> Total: ${sessionFiles.length} sesión(es) de WhatsApp\n\n` +
          "╭──⬣「 Sesión encontrada 」⬣\n" +
          `${files}\n` +
          `╰──⬣\n`
      );

      await msg.react("📄");
    } catch (error) {
      console.error(error);

      // Informar al usuario del error
      totoroLog.error(
        "./logs/plugins/developer/getSesion.log",
        `Error al obtener la sesión de WhatsApp: ${error.message}`
      );

      msg.reply(
        "╭──⬣「 Sesión no encontrada 」⬣\n" +
          "│  ≡◦ 🐥 No se pudo obtener la sesión de WhatsApp.\n" +
          "╰──⬣"
      );
    }
  },
};
