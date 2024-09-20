const totoUser = require("../../models/totoUser");
const totoroLog = require("../../functions/totoroLog");
const {
  sendError,
  sendSuccess,
  infoRegister,
} = require("../../functions/messages");

module.exports = {
  name: "unregister",
  category: "forms",
  subcategory: "unregister",
  description: "Desregistra un totoUser de la base de datos",
  usage: "unregister",
  aliases: ["unreg"],

  async execute(totoro, msg, args) {
    try {
      const remoteJid = msg.messages[0].key.remoteJid;

      // Obtener número de teléfono directamente
      let telf = remoteJid;
      if (telf.includes("g.us")) {
        telf = msg.messages[0].key.participant;
      }

      const phone = telf.split("@")[0];

      // Buscar el ${user}
      let user = await totoUser.findOne({ where: { phone: phone } });
      if (!user) {
        await infoRegister(
          totoro,
          msg,
          `Por favor, ${user} regístrate con el siguiente comando: ${totoroPrefix}register nombre.edad`
        );
        return;
      }

      totoroLog.info(
        "./logs/plugins/forms/unregister.log",
        `${user.name}(${phone}) abandonón Totorolandia.`
      );

      // Eliminar el ${user} de la base de datos
      const result = await totoUser.destroy({ where: { phone: phone } });

      if (result === 0) {
        await sendError(
          totoro,
          msg,
          "Error al remover al ${user}. Inténtalo de nuevo."
        );
        totoroLog.error(
          "./logs/plugins/forms/unregister.log",
          `Error al remover al ${user}: El ${user} con el número de teléfono ${phone} no fue eliminado.`
        );
      } else {
        // Verificar si el ${user} realmente fue eliminado
        user = await totoUser.findOne({ where: { phone: phone } });
        if (user) {
          await sendError(
            totoro,
            msg,
            `Error al remover al ${user}. Totoro no pudo eliminarte en la totoBD.`
          );
          totoroLog.error(
            "./logs/plugins/forms/unregister.log",
            `Error al remover al ${user} con el número de teléfono ${phone}. No fue eliminado.`
          );
        } else {
          await sendSuccess(totoro, msg, "Has abandonado Totorolandia.");
          await msg.react("🗑️");
        }
      }
    } catch (error) {
      totoroLog.error(
        "./logs/plugins/forms/unregister.log",
        `Error al remover al ${user}: ${error.message || error}`
      );
      await sendError(
        totoro,
        msg,
        `Error al remover al ${user}. Inténtalo de nuevo. \n${error}`
      );
    }
  },
};
