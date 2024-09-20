const axios = require("axios");
const {
  sendError,
  sendLicence,
  sendWarning,
} = require("../../functions/messages");
const { totoUser } = require("../../models");
const { cmdBlock } = require("../ai/gemini");
const { prefix } = require("../../../settings.json").prefix;

module.exports = {
  name: "getLicense",
  category: "forms",
  subcategory: "register",
  description: "Generar un número de serie para un usuario",
  usage: `${prefix}license`,
  aliases: ["License", "license", "Licencia", "licencia", "lice", "serial"],
  cmdBlock: true,

  async execute(totoro, msg, args) {
    await msg.react("🔍"); // Reacción inicial para mostrar que el proceso comenzó
    try {
      const remoteJid = msg.messages[0].key.remoteJid;
      const participant = msg.messages[0].key.participant;

      // Verificar si el comando se está utilizando en un grupo
      if (remoteJid.endsWith("@g.us")) {
        await sendWarning(
          totoro,
          msg,
          "Este comando no está permitido en grupos."
        );
        return;
      }

      const telf = participant || remoteJid;
      const phone = telf.split("@")[0];

      // Validación del formato de teléfono (solo números)
      if (!/^\d+$/.test(phone)) {
        await sendWarning(
          totoro,
          msg,
          "Formato de teléfono no válido. Asegúrate de usar solo números."
        );
        return;
      }

      // Buscar al usuario en la base de datos
      const user = await totoUser.findOne({ where: { phone } });

      if (!user) {
        await sendWarning(
          totoro,
          msg,
          "Para obtener un número de serie, primero debe registrarse con el comando /register."
        );
        return;
      }

      // Solicitar la licencia a la API
      try {
        // Log para depuración, ver si la llamada a la API está funcionando
        console.log(`Solicitando licencia para el número: ${phone}`);
        const response = await axios.get(
          `https://cinammon.es/totoro/totoLicense.php?phone=${phone}`
        );

        console.log(response.data); // Ver la estructura completa de la respuesta

        // Cambiar el nombre del campo si es necesario según lo que veas en la respuesta
        const serialNumber =
          response.data.totoLicense ||
          response.data.license ||
          response.data.serial;

        // Validar si se recibió un número de serie
        if (serialNumber) {
          // Guardar la licencia en la base de datos
          user.serial = serialNumber;
          await user.save();

          // Enviar la licencia al usuario
          await sendLicence(
            msg,
            user.name,
            `*Número de licencia*: ${serialNumber}\n\nPara activar tu cuenta premium, utiliza el comando:\n\n*${prefix}premium license ${serialNumber}*`
          );

          // Respuesta directa con el número de serie
          await msg.reply(`${serialNumber}`);
        } else {
          await sendLicence(
            msg,
            user.name,
            "No se ha podido generar una licencia. Envíanos un correo a totorobot.wa@gmail.com para más información."
          );
        }
      } catch (apiError) {
        // Mejor manejo del error, ver exactamente qué pasó con la API
        console.error("Error en la llamada a la API:", apiError);
        await sendError(totoro, msg, "Error al generar el número de serie.");
        return;
      }

      // Reaccionar con una marca de verificación si todo sale bien
      await msg.react("✅");
    } catch (error) {
      // Log del error general
      console.error("Error general:", error);
      await sendError(totoro, msg, "Error al procesar el comando.");
    }
  },
};
