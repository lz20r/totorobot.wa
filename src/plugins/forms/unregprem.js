const {
  sendError,
  sendSuccess,
  help,
  infoGroup,
} = require("../../functions/messages");
const { totoUser, totoPremium } = require("../../models");

module.exports = {
  name: "leavePremium",
  category: "forms",
  subcategory: "unregister",
  description: "Desregistrar un usuario premium por número de serie",
  usage: "leavePremium <serialNumber>",
  aliases: ["leaveprem", "leavepremium", "leavep"],

  async execute(totoro, msg, args) {
    try {
      const remoteJid = msg.messages[0].key.remoteJid;
      if (remoteJid.endsWith("@g.us")) {
        await infoGroup(
          msg,
          this.name,
          "Este comando no está permitido en grupos."
        );
        return;
      }
      const [serialNumber] = args;
      if (!serialNumber) {
        await help(
          totoro,
          msg,
          "Desregistro de Usuario Premium",
          "Ingresa el número de serie",
          "+leavePremium <serialNumber>"
        );
        await msg.react("❓");
        return;
      }

      try {
        const premiumRecord = await totoPremium.findOne({
          where: { serialNumber },
        });

        if (!premiumRecord) {
          await sendError(
            totoro,
            msg,
            `No se encontró un registro premium con el número de serie ${serialNumber}.`
          );
          return;
        }

        const user = await totoUser.findOne({
          where: { id: premiumRecord.totoUserId },
        });

        if (!user) {
          await sendError(
            totoro,
            msg,
            `Usuario no encontrado para el número de serie ${serialNumber}.`
          );
          return;
        }

        if (!user.premium) {
          await sendError(
            totoro,
            msg,
            `El usuario con el número de serie ${serialNumber} no es un usuario premium.`
          );
          return;
        }

        // Actualizar el estado del usuario a no premium
        await totoUser.update({ premium: false }, { where: { id: user.id } });

        // Eliminar el registro en la tabla totoPremium
        await totoPremium.destroy({ where: { serialNumber } });

        await sendSuccess(
          totoro,
          msg,
          `El usuario ${user.name} con el número de serie ${serialNumber} ha dejado de ser premium con éxito.`
        );
        await msg.react("✅");
      } catch (error) {
        console.error("Error al desregistrar el usuario premium:", error);
        await sendError(
          totoro,
          msg,
          "Error al desregistrar el usuario premium."
        );
      }
    } catch (error) {
      console.error("Error al procesar el comando:", error);
      await sendError(totoro, msg, "Error al procesar el comando.");
    }
  },
};
