const fs = require("fs");
const path = require("path");
const { sendSuccess, help } = require("../../functions/messages");
const { totoAdmin, totoUser } = require("../../models");

module.exports = {
  name: "addAdmin",
  category: "developer",
  subcategory: "owner",
  aliases: ["adminadd", "addadmin", "promote", "admin"],
  usage: "<admin>",
  description: "Agrega un nuevo admin a settings.json y la base de datos",
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

      // Verificar si el usuario ya es admin
      if (!settings.admin.includes(fullAdminValue)) {
        settings.admin.push(fullAdminValue);
      } else {
        return msg.reply({
          text: `El usuario @${adminValue} ya es un administrador.`,
          mentions: [adminValue + "@s.whatsapp.net"],
        });
      }

      // Guardar cambios en settings.json
      await fs.promises.writeFile(
        settingsPath,
        JSON.stringify(settings, null, 2)
      );

      // Verificar si el usuario está registrado en la base de datos
      const existingUser = await totoUser.findOne({
        where: { phone: adminValue },
      });

      // Si el usuario no está registrado, mostrar advertencia, pero continuar
      if (!existingUser) {
        return msg.reply({
          text: `El usuario @${adminValue} no está registrado en la base de datos, pero ha sido agregado a settings.json.`,
          mentions: [adminValue + "@s.whatsapp.net"],
        });
      } else {
        // Agregar el admin a la base de datos
        await totoAdmin.create({
          phone: adminValue,
          role: "Admin",
        });
      }

      // Enviar mensaje de éxito mencionando al nuevo administrador
      sendSuccess(totoro, msg, "Administrador agregado exitosamente.");
    } catch (error) {
      console.error("Error:", error);
      msg.reply(
        "Hubo un error al intentar actualizar settings.json o la base de datos."
      );
    }
  },
};
