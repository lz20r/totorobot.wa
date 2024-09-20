const { help, sendWarning } = require("../../functions/messages");
const totoStatus = require("../../models/totoStatus");
const settings = require("../../../settings.json");
const runtime = require("../../functions/runtime");

module.exports = {
  name: "Status Totoro",
  category: "developer",
  subcategory: "settings",
  aliases: ["activate"],
  usage: `${settings.prefix}activate <on|off>`,
  description: "Activa o desactiva el bot",
  dev: true,

  async execute(totoro, msg, args) {
    // Obtener el número de teléfono del participante
    const participant = msg.messages[0].key.participant.split("@")[0];
    const userWithDomain = `${participant}@s.whatsapp.net`;

    // Verificación de si el participante es un desarrollador autorizado
    if (!settings.dev.includes(userWithDomain)) {
      await msg.react("⚠️");
      return msg.reply({
        text: `${userWithDomain}, solo los desarrolladores pueden ejecutar este comando.`,
        mentions: [userWithDomain],
      });
    }

    // Verificar si se ha proporcionado el argumento necesario
    if (!args.length) {
      return help(
        totoro,
        msg,
        `Activar Totoro`,
        "Falta el estado de activación",
        `${settings.prefix}activate <on/off>`
      );
    }
    await msg.react("⌛");
    const status = args[0].toLowerCase();
    if (status !== "on" && status !== "off") {
      return msg.reply({
        text: `@${participant}, ${status} no es un estado válido. Debe ser 'on' o 'off'.`,
        mentions: [participant],
      });
    }

    let currentStatus = await totoStatus.findOne({
      where: { statusId: 1 },
    });

    if (!currentStatus) {
      currentStatus = await totoStatus.create({
        statusId: 1,
        status: "off",
        startTime: null,
      });
    }

    if (status === currentStatus.status) {
      await msg.react("⚠️");
      return sendWarning(
        totoro,
        msg,
        `El bot ya está ${status === "on" ? "activado" : "desactivado"}`
      );
    }

    const now = new Date();
    const date = now.toLocaleDateString("es-ES", { timeZone: "Europe/Madrid" });
    const time = now.toLocaleTimeString("es-ES", { timeZone: "Europe/Madrid" });

    if (status === "on") {
      await currentStatus.update({ status, startTime: now });

      await msg.react("✅");
      msg.reply({
        text:
          `╭─⬣「 Status Totoro 」\n` +
          `│  ≡◦ Estado: ${status}\n` +
          `│  ≡◦ Acción: activado\n` +
          `│  ≡◦ Moderador: @${participant}\n` +
          `│  ≡◦ Fecha de inicio: ${date}\n` +
          `│  ≡◦ Hora de inicio: ${time}\n` +
          `╰──────────────`,
        mentions: [userWithDomain],
      });
    } else {
      const startTime = new Date(currentStatus.startTime);
      const durationSeconds = Math.floor((now - startTime) / 1000); 
      const duration = await runtime(durationSeconds);

      await currentStatus.update({ status, startTime: null });

      await msg.react("✅");
      msg.reply({
        text:
          `╭─⬣「 Status Totoro 」\n` +
          `│  ≡◦ Estado: ${status}\n` +
          `│  ≡◦ Acción: desactivado\n` +
          `│  ≡◦ Moderador: @${participant}\n` +
          `│  ≡◦ Fecha de finalización: ${date}\n` +
          `│  ≡◦ Hora de finalización: ${time}\n` +
          `│  ≡◦ Duración: ${duration}\n` +
          `╰──────────────`,
        mentions: [userWithDomain],
      });
    }
  },
};
