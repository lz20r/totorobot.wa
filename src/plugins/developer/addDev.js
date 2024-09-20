const fs = require("fs");
const path = require("path");
const { sendSuccess, help } = require("../../functions/messages");
const { totoDev, totoUser } = require("../../models");

module.exports = {
  name: "addDev",
  category: "developer",
  subcategory: "owner",
  aliases: ["devadd", "adddev", "promo", "dev"],
  usage: "<dev>",
  description: "Agrega un nuevo dev a settings.json y la base de datos",
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

      // Verificar si el usuario ya es dev
      if (!settings.dev.includes(fullDevValue)) {
        settings.dev.push(fullDevValue);
      } else {
        return msg.reply({
          text: `El usuario @${devValue} ya es un desarrollador.`,
          mentions: [devValue + "@s.whatsapp.net"],
        });
      }

      // Guardar cambios en settings.json
      await fs.promises.writeFile(
        settingsPath,
        JSON.stringify(settings, null, 2)
      );

      // Verificar si el usuario está registrado en la base de datos
      const existingUser = await totoUser.findOne({
        where: { phone: devValue },
      });

      // Si el usuario no está registrado, mostrar advertencia, pero continuar
      if (!existingUser) {
        msg.react("👑");
        return msg.reply({
          text: `El usuario @${devValue} no está registrado en la base de datos, pero ha sido agregado a settings.json.`,
          mentions: [devValue + "@s.whatsapp.net"],
        });
      } else {
        // Agregar el dev a la base de datos
        await totoDev.create({
          phone: devValue,
          role: "Developer",
        });
      }

      // Enviar mensaje de éxito mencionando al nuevo desarrollador
      sendSuccess(totoro, msg, "Desarrollador agregado exitosamente.");
    } catch (error) {
      console.error("Error:", error);
      msg.reply(
        "Hubo un error al intentar actualizar settings.json o la base de datos."
      );
    }
  },
};
