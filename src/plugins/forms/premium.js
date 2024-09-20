const {
  sendError,
  help,
  sendPrem,
  sendWarning,
} = require("../../functions/messages");
const { totoUser, totoPremium } = require("../../models");
const prefix = require("../../../settings.json").prefix;

module.exports = {
  name: "registerPremium",
  category: "forms",
  subcategory: "register",
  description: "Registra un usuario premium",
  usage: "premium <serial>",
  aliases: ["premium", "Premium", "prem", "Prem", "premi"],
  cmdBlock: true,

  async execute(totoro, msg, args) {
    try {
      const remoteJid = msg.messages[0].key.remoteJid;
      const participant = msg.messages[0].key.participant;
      const [keyword, serial] = args;

      // que no esté permitido en grupos
      if (remoteJid.endsWith("@g.us")) {
        await sendWarning(
          totoro,
          msg,
          "Este comando no está permitido en grupos."
        );
        return;
      }

      if (!serial) {
        await help(
          totoro,
          msg,
          "Registro de Usuario Premium",
          "Registra un usuario premium",
          `${prefix}license <serial>` // Se cambia a 'license' en el ejemplo de uso
        );
        await msg.react("❓");
        return;
      }

      // Verificar si la palabra clave es "license"
      if (keyword !== "license") {
        await sendWarning(
          totoro,
          msg,
          "La palabra clave es incorrecta. Debes usar 'license'."
        );
        return;
      }

      const telf = participant || remoteJid;
      const phone = telf.split("@")[0];

      if (!/^\d+$/.test(phone)) {
        await sendError(
          totoro,
          msg,
          `Número de teléfono ${phone} no es válido.`
        );
        return;
      }

      const user = await totoUser.findOne({ where: { phone } });

      if (!user) {
        await sendError(
          totoro,
          msg,
          `Usuario con teléfono ${phone} no encontrado.`
        );
        return;
      }

      // Verificar si ya tiene una cuenta premium
      if (user.premium) {
        await sendWarning(totoro, msg, `El usuario ya es premium.`);
        return;
      }

      // Verificar si el serial ya fue usado por este usuario
      const existingSerial = await totoPremium.findOne({
        where: { totoUserId: user.id },
      });

      if (existingSerial) {
        await sendWarning(
          totoro,
          msg,
          `Ya tienes un número de serie registrado: ${existingSerial.serialNumber}. No puedes registrar otro.`
        );
        return;
      }

      // Verificar si el serial ya fue usado en otra cuenta premium
      const premiumRecord = await totoPremium.findOne({
        where: { serialNumber: serial },
      });

      if (premiumRecord) {
        await sendError(
          totoro,
          msg,
          "Este número de serie ya ha sido utilizado."
        );
        return;
      }

      // Si el serial es válido, activar la cuenta premium
      await totoUser.update({ premium: true }, { where: { phone } });

      // Guardar el registro premium
      await totoPremium.create({
        totoUserId: user.id,
        serialNumber: serial,
      });

      await sendPrem(
        totoro,
        remoteJid,
        user.name,
        user.age,
        user.phone,
        user.country,
        serial,
        await totoUser.count({ where: { premium: true } })
      );

      await msg.react("✅");
    } catch (error) {
      console.error("Error al registrar el usuario premium:", error);
      await sendError(totoro, msg, "Error al registrar el usuario premium.");
    }
  },
};
