const { promises: fs } = require("fs");
const totoroLog = require("../../functions/totoroLog");

module.exports = {
  name: "dsesion",
  category: "developer",
  subcategory: "WhatsApp",
  description: "Eliminar la sesión de WhatsApp",
  usage: "<deleteSesion>",
  dev: true,

  async execute(Totoro, msg, args) {
    // Borrar todo el contenido de la carpeta de sesiones de WhatsApp menos el archivo creds.json
    try {
      // Leer el contenido del directorio de autenticación
      const auth = await fs.readdir("auth/Totoro-auth");
      for (const file of auth) {
        // Comprobar si el archivo no es creds.json
        if (file !== "creds.json") {
          // Eliminar el archivo
          await fs.unlink(`auth/Totoro-auth/${file}`);
        }
      }

      // Registrar la acción en el log
      totoroLog.info(
        "./logs/plugins/developer/deleteSesion.log",
        "Sesión de WhatsApp eliminada con éxito"
      );

      // Informar al usuario del éxito
      msg.reply(
        "╭──⬣「 Sesión eliminada 」⬣\n" +
          "│  ≡◦ 🐥 ¿Me ves?\n" +
          "╰──⬣\n" +
          `> *Total: ${auth.length} sesión(es) de WhatsApp*`
      );

      // Reaccionar al mensaje
      await msg.react("🗑️");
    } catch (error) {
      console.error(error);

      // Informar al usuario del error
      totoroLog.error(
        "./logs/plugins/developer/deleteSesion.log",
        `Error al eliminar la sesión de WhatsApp: ${error.message}`
      );

      msg.reply(
        "╭──⬣「 Sesión no eliminada 」⬣\n" +
          "│  ≡◦ 🐥 No se pudo eliminar la sesión de WhatsApp.\n" +
          "╰──⬣"
      );
    }
  },
};
