const { Sequelize } = require("sequelize");
const { totoUser, totoPlugin, totoDev, totoCounter } = require("../../models");
const { sendError } = require("../../functions/messages");
const totoroLog = require("../../functions/totoroLog");
const settings = require("../../../settings.json");
const runtime = require("../../functions/runtime");

module.exports = {
  name: "botinfo",
  description: "Obtener información del bot.",
  category: "general",
  subcategory: "information",
  usage: "botinfo",
  cooldown: 5,
  botPermissions: ["SEND_MESSAGES"],
  userPermissions: [],
  aliases: ["toinfo", "infobot", "info", "totoro"],

  async execute(totoro, msg) {
    try {
      // Obtener teléfonos de desarrolladores
      const devUsers = await totoDev.findAll({ attributes: ["phone"] });
      const devPhones = devUsers.map((dev) =>
        dev.phone.replace("@s.whatsapp.net", "")
      );
      // Obtener IDs de usuarios desarrolladores
      const devUserRecords = await totoUser.findAll({
        attributes: ["id"],
        where: {
          phone: {
            [Sequelize.Op.in]: devPhones, // Verificamos que el campo 'phone' esté correctamente relacionado
          },
        },
      });

      const devUserIds = devUserRecords.map((user) => user.id);

      // Verificar si las IDs son correctas
      if (!devUserIds.length) {
        console.log(
          "No se encontraron desarrolladores con los números indicados."
        );
      }

      // Contar el total de usuarios excluyendo desarrolladores
      const totalUsers = await totoUser.count({
        where: {
          id: {
            [Sequelize.Op.notIn]: devUserIds, // Aseguramos que estamos excluyendo los IDs correctos
          },
        },
      });

      // Contar el total de usuarios premium excluyendo desarrolladores
      const premiumUsers = await totoUser.count({
        where: {
          id: {
            [Sequelize.Op.notIn]: devUserIds, // Excluimos desarrolladores también para premium
          },
          premium: true,
        },
      });

      // Contar el total de plugins cargados
      const totalPlugins = await totoPlugin.count();

      // Obtener el número de ejecuciones de plugins
      const pluginRecords = await totoCounter.findAll();
      const plugins = pluginRecords.map((record) =>
        record.pluginName.toLowerCase()
      );

      let totalPluginsExec = 0;
      const count = await totoCounter.findAll();
      count.forEach((user) => {
        if (plugins.includes(user.pluginName.toLowerCase())) {
          totalPluginsExec += user.count;
        }
      });

      // Obtener el uptime del bot
      const uptimeString = await runtime(process.uptime());

      const dev = settings.dev[0];

      // Crear el mensaje
      let txt = `*totoName ∙* @447360497992\n`;
      txt += `*totoCreator ∙* @${dev.replace(/@.+/, "")}\n`;
      txt += `*totoActivity ∙* \`${uptimeString}\`\n`;
      txt += `*totoUsers ∙* \`${totalUsers}\`\n`;
      txt += `*totoPremium ∙* \`${premiumUsers}\`\n`;
      txt += `*totoPlugins ∙* \`${totalPlugins}\`\n\n`;
      txt += `> *totoPlugins Ejecutados ∙* \`${totalPluginsExec}\``;
  
      msg.reply({
        text: txt,
        contextInfo: { mentionedJid: [dev, "447360497992@s.whatsapp.net"] },
      });
    } catch (error) {
      // En caso de error, logueamos para depuración y mandamos el mensaje de error al usuario
      totoroLog.error(
        "./logs/plugins/information/botinfo.log",
        `Error en botinfo: ${error}`
      );
      sendError(totoro, msg, error);
    }
  },
};
