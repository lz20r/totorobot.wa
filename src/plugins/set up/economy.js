const { help, sendWarning } = require("../../functions/messages");
const { totoGroupEcononmy } = require("../../models");
const settings = require("../../../settings.json");

module.exports = {
  name: "economy",
  category: "setup",
  subcategory: "config group",
  aliases: ["geconomy", "economygroup", "gec", "economy"],
  usage: `${settings.prefix}economy <on|off>`,
  description: "Activa o desactiva el sistema de economía del bot en un grupo",

  async execute(totoro, msg, args) {
    const message = msg.messages[0];

    if (!message.key.remoteJid.endsWith("@g.us")) {
      return sendWarning(
        totoro,
        msg,
        "Este comando solo puede ser utilizado en grupos."
      );
    }

    const sender = msg.messages[0].key.participant;
    const groupInfo = await totoro.groupMetadata(msg.messages[0].key.remoteJid);

    // Validar si el usuario que ejecuta el comando es administrador
    const participant = groupInfo.participants.find((x) => x.id === sender);
    if (!participant || !participant.admin) {
      sendWarning(
        totoro,
        msg,
        "No tienes permisos para ejecutar este comando. Solo los administradores pueden usar este comando."
      );
      return;
    }
    msg.react("⌛");

    const user = message.key.participant.split("@")[0];
    const userWithDomain = `${user}@s.whatsapp.net`;
    const groupMetadata = await totoro.groupMetadata(message.key.remoteJid);
    const groupId = groupMetadata.id;
    const groupName = groupMetadata.subject;

    if (!args.length) {
      return help(
        totoro,
        msg,
        `Activar o desactivar economía`,
        "Falta el estado de la economía",
        `${settings.prefix}economy <on/off>`
      );
    }

    const economyState = args[0].toLowerCase();
    if (economyState !== "on" && economyState !== "off") {
      return msg.reply({
        text: `> @${user}, ${economyState} no es un estado válido. Debe ser 'on' o 'off'.`,
        mentions: [userWithDomain],
      });
    }

    let currentGroupEconomy = await totoGroupEcononmy.findOne({
      where: { groupId: groupId },
    });

    if (!currentGroupEconomy) {
      currentGroupEconomy = await totoGroupEcononmy.create({
        groupId: groupId,
        groupName: groupName,
        economyId: 1,
        status: "off",
      });
    }

    if (economyState === currentGroupEconomy.status) {
      msg.react("⚠️");
      return msg.reply({
        text: `> @${user}, el sistema de economía ya está en estado ${economyState} para este grupo.`,
        mentions: [userWithDomain],
      });
    }

    const now = new Date();

    await totoGroupEcononmy.update(
      { status: economyState },
      { where: { groupId: groupId } }
    );

    const actionText = economyState === "on" ? "activado" : "desactivado";

    await msg.react("✅");
    await msg.reply({
      text:
        `╭─⬣「 Sistema de economía en ${groupName} 」\n` +
        `│  ≡◦ Estado: ${economyState}\n` +
        `│  ≡◦ Acción: ${actionText}\n` +
        `│  ≡◦ Moderador: @${user}\n` +
        `│  ≡◦ Grupo: ${groupName}\n` +
        `│  ≡◦ Fecha: ${now.toLocaleString("es-ES", {
          timeZone: "Europe/Madrid",
        })}\n` +
        `╰──────────────`,
      mentions: [userWithDomain],
    });
  },
};
