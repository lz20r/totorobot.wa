const { help } = require("../../functions/messages");
const { totoGroupMantainance, totoMantainance } = require("../../models");
const settings = require("../../../settings.json");

module.exports = {
  name: "Mantenimiento Totoro en grupo",
  category: "developer",
  subcategory: "settings",
  aliases: ["gmantainance", "mantainancegroup", "gme"],
  usage: `${settings.prefix}mantainance <on|off>`,
  description: "Activa o desactiva el estado de mantenimiento del bot",
  dev: true,

  async execute(totoro, msg, args) {
    const message = msg.messages[0];

    if (!message.key || !message.key.remoteJid) {
      console.error(
        "message.key o message.key.remoteJid no están definidos:",
        message
      );
      return msg.reply("Error: No se pudo obtener la información del grupo.");
    }

    if (!message.key.remoteJid.endsWith("@g.us")) {
      return msg.reply("Este comando solo puede ser utilizado en grupos.");
    }

    msg.react("⌛");

    if (!message.key.participant) {
      console.error("message.key.participant no está definido:", message.key);
      return msg.reply(
        "Error: No se pudo obtener la información del participante."
      );
    }

    const participant = message.key.participant.split("@")[0];
    const userWithDomain = `${participant}@s.whatsapp.net`;

    const groupMetadata = await totoro.groupMetadata(message.key.remoteJid);
    if (!groupMetadata) {
      console.error(
        "No se pudo obtener los metadatos del grupo para:",
        message.key.remoteJid
      );
      return msg.reply("Error: No se pudo obtener los metadatos del grupo.");
    }

    const groupId = groupMetadata.id;
    const groupName = groupMetadata.subject;

    const groupAdmins = groupMetadata.participants
      .filter((p) => p.admin === "admin" || p.admin === "superadmin")
      .map((p) => p.id);

    if (
      !settings.dev.includes(userWithDomain) &&
      !groupAdmins.includes(message.key.participant)
    ) {
      msg.react("⚠️");
      return msg.reply({
        text: `${userWithDomain}, solo los desarrolladores y administradores del grupo pueden ejecutar este comando.`,
        mentions: [userWithDomain],
      });
    }

    if (!args.length) {
      return help(
        totoro,
        msg,
        `Bloquear Totoro en el grupo`,
        "Falta el estado de bloqueo",
        `${settings.prefix}groupMantainance <on/off>`
      );
    }

    const groupMantainance = args[0].toLowerCase();
    if (groupMantainance !== "on" && groupMantainance !== "off") {
      return msg.reply({
        text: `@${participant}, ${groupMantainance} no es un estado válido. Debe ser 'on' o 'off'.`,
        mentions: [userWithDomain],
      });
    }

    let currentGroupMantainance = await totoGroupMantainance.findOne({
      where: { groupId: groupId },
    });

    if (!currentGroupMantainance) {
      currentGroupMantainance = await totoGroupMantainance.create({
        groupId: groupId,
        groupName: groupName,
        mantainanceId: 1,
        status: "off",
        startTime: null,
      });
    }

    if (groupMantainance === currentGroupMantainance.status) {
      msg.react("⚠️");
      return msg.reply({
        text: `@${participant}, el estado de bloqueo ya está en ${groupMantainance} para este grupo.`,
        mentions: [userWithDomain],
      });
    }

    const now = new Date();

    if (groupMantainance === "on") {
      await totoGroupMantainance.update(
        { status: groupMantainance },
        { where: { groupId: groupId } }
      );

      await msg.react("✅");
      msg.reply({
        text:
          `╭─⬣「 Totoro está en mantenimiento en ${groupName} 」\n` +
          `│  ≡◦ Estado: ${groupMantainance}\n` +
          `│  ≡◦ Acción: ${groupMantainance.status}\n` +
          `│  ≡◦ Moderador: @${participant}\n` +
          `│  ≡◦ Grupo: ${groupName}\n` +
          `│  ≡◦ Fecha: ${now.toLocaleString("es-ES", {
            timeZone: "Europe/Madrid",
          })}\n` +
          `╰──────────────`,
        mentions: [userWithDomain],
      });
    } else {
      await totoGroupMantainance.update(
        { status: groupMantainance },
        { where: { groupId: groupId } }
      );

      await await msg.react("✅");
      msg.reply({
        text:
          `╭─⬣「 Totoro dejó de estar en mantenimiento en ${groupName} 」\n` +
          `│  ≡◦ Estado: ${groupMantainance}\n` +
          `│  ≡◦ Acción: ${groupMantainance.status}\n` +
          `│  ≡◦ Moderador: @${participant}\n` +
          `│  ≡◦ Grupo: ${groupName}\n` +
          `│  ≡◦ Fecha: ${now.toLocaleString("es-ES", { timeZone: "Europe/Madrid" })}\n` +
          `│  ≡◦ Duración: ${formattedTime}\n` +
          `╰──────────────`,
        mentions: [userWithDomain],
      });
    }
  },
};

async function duration(durationMs) {  // en teoría funciona ya.
  const hours = Math.floor(durationMs / 3600);
  const min = Math.floor((durationMs % (60 * 60)) / 60);
  const sec = Math.floor(durationMs % 60);

  const formattedTime = [];

  if (hours == 1) formattedTime.push("1 hora");
  else if (hours > 1) formattedTime.push(`${hours} horas`);
  if (min == 1) formattedTime.push("1 minuto");
  else if (min > 1) formattedTime.push(`${min} minutos`);
  if (sec == 1) formattedTime.push("1 segundo");
  else if (sec > 1) formattedTime.push(`${sec} segundos`);

  return formattedTime.join(", ");
}
