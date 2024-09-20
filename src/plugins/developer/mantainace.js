const { help } = require("../../functions/messages");
const totoMantainance = require("../../models/totoMantainance");
const settings = require("../../../settings.json");
const runtime = require("../../functions/runtime");

module.exports = {
  name: "Mantenimiento Totoro",
  category: "developer",
  subcategory: "settings",
  aliases: ["mantainance"],
  usage: `${settings.prefix}mantainance <on|off>`,
  description: "Activa o desactiva el estado de mantenimiento del bot",
  dev: true,

  async execute(totoro, msg, args) {
    const participant = msg.messages[0].key.participant.split("@")[0];
    const userWithDomain = `${participant}@s.whatsapp.net`;

    if (!settings.dev.includes(userWithDomain)) {
      msg.react("⚠️");
      msg.reply({
        text: `${userWithDomain}, solo los desarrolladores pueden ejecutar este comando.`,
        mentions: [userWithDomain],
      });
      return;
    }

    if (!args.length) {
      return help(
        totoro,
        msg,
        `Estado de mantenimiento`,
        "Falta el estado de mantenimiento",
        `${settings.prefix}mantainance <on/off>`
      );
    }
    msg.react("⌛");

    const maintenance = args[0].toLowerCase();

    if (maintenance !== "on" && maintenance !== "off") {
      return msg.reply({
        text: `@${participant}, ${maintenance} no es un estado válido. Debe ser 'on' o 'off'.`,
        mentions: [userWithDomain],
      });
    }

    let currentMaintenance = await totoMantainance.findOne({
      where: { maintenanceId: 1 },
    });

    if (!currentMaintenance) {
      currentMaintenance = await totoMantainance.create({
        maintenanceId: 1,
        status: "off",
        startTime: null,
      });
    }

    if (maintenance === currentMaintenance.status) {
      msg.react("⚠️");
      msg.reply({
        text: `@${participant}, el estado de mantenimiento ya está en ${maintenance}.`,
        mentions: [userWithDomain],
      });
      return;
    }

    const now = new Date();
    const date = now.toLocaleDateString("es-ES", { timeZone: "Europe/Madrid" });
    const time = now.toLocaleTimeString("es-ES", { timeZone: "Europe/Madrid" });

    if (maintenance === "on") {
      await totoMantainance.upsert({
        maintenanceId: 1,
        status: maintenance,
        startTime: now, // Guardamos la fecha de inicio en la base de datos
      });

      await msg.react("✅");
      msg.reply({
        text:
          `╭─⬣「 Totoro en mantenimiento 」\n` +
          `│  ≡◦ Estado: ${maintenance}\n` +
          `│  ≡◦ Acción: activado\n` +
          `│  ≡◦ Moderador: @${participant}\n` +
          `│  ≡◦ Fecha de inicio: ${date}\n` +
          `│  ≡◦ Hora de inicio: ${time}\n` +
          `╰──────────────`,
        mentions: [userWithDomain],
      });
    } else {
      const startTime = new Date(currentMaintenance.startTime);
      const durationSeconds = Math.floor((now - startTime) / 1000); // Convertir a segundos
      const duration = await runtime(durationSeconds);

      await totoMantainance.upsert({
        maintenanceId: 1,
        status: maintenance,
        startTime: null, // Reiniciamos la variable de fecha de inicio en la base de datos
      });

      await msg.react("✅");
      msg.reply({
        text:
          `╭─⬣「 Totoro fuera de mantenimiento 」\n` +
          `│  ≡◦ Estado: ${maintenance}\n` +
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
