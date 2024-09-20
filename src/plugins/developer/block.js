const { help, sendWarning } = require("../../functions/messages");
const totoBlock = require("../../models/totoBlock");
const settings = require("../../../settings.json");
const runtime = require("../../functions/runtime");

module.exports = {
  name: "Bloquear Totoro",
  category: "developer",
  subcategory: "settings",
  aliases: ["block", "lock"],
  usage: `${settings.prefix}block <on|off> [only-admins]`,
  description:
    "Bloquea o desbloquea el bot. Opción de restringir el chat solo para administradores o que solo administradores puedan usar el bot",
  dev: true,

  async execute(totoro, msg, args) {
    const message = msg.messages[0];

    if (!message.key.remoteJid.endsWith("@g.us")) {
      sendWarning(
        totoro,
        msg,
        "Este comando solo puede ser utilizado en grupos."
      );
      return;
    }

    msg.react("⌛");

    const participant = message.key.participant.split("@")[0]; // Sin dominio
    const userWithDomain = `${participant}@s.whatsapp.net`;
    const groupMetadata = await totoro.groupMetadata(message.key.remoteJid);
    const groupId = groupMetadata.id;
    const groupName = groupMetadata.subject;
    const groupAdmins = groupMetadata.participants
      .filter((p) => p.admin === "admin" || p.admin === "superadmin")
      .map((p) => p.id);

    // Verificar si el usuario que ejecuta el comando es admin
    if (!groupAdmins.includes(message.key.participant)) {
      msg.react("⚠️");
      return msg.reply({
        text: `@${participant}, solo los administradores del grupo pueden ejecutar este comando.`,
        mentions: [userWithDomain],
      });
    }

    if (!args.length) {
      return help(
        totoro,
        msg,
        `Bloquear Totoro en el grupo`,
        "Falta el estado de bloqueo",
        `${settings.prefix}block <on/off> [only-admins]`
      );
    }

    const block = args[0].toLowerCase();
    if (block !== "on" && block !== "off") {
      return msg.reply({
        text: `@${participant}, ${block} no es un estado válido. Debe ser 'on' o 'off'.`,
        mentions: [userWithDomain],
      });
    }

    // Verificamos si el comando tiene el argumento 'only-admins'
    const onlyAdmins = args[1] && args[1].toLowerCase() === "only-admins";

    let currentBlock = await totoBlock.findOne({
      where: { groupId: groupId },
    });

    if (!currentBlock) {
      currentBlock = await totoBlock.create({
        groupId: groupId,
        groupName: groupName,
        blockId: 1,
        status: "off",
        startTime: null,
        onlyAdmins: false, // Añadimos un campo para almacenar la restricción de solo admin
      });
    }

    if (block === currentBlock.status && onlyAdmins === currentBlock.onlyAdmins) {
      msg.react("⚠️");
      return msg.reply({
        text: `@${participant}, el estado de bloqueo ya está en ${block} para este grupo.`,
        mentions: [userWithDomain],
      });
    }

    const now = new Date();

    if (block === "on") {
      // Actualizamos el estado de bloqueo y si es solo admins
      await totoBlock.update(
        {
          status: block,
          startTime: now,
          onlyAdmins: onlyAdmins, // Guardamos la preferencia de solo admins
        },
        {
          where: { groupId: groupId },
        }
      );

      if (onlyAdmins) {
        // Restringimos el chat solo para admins si la opción está activada
        await totoro.groupSettingUpdate(message.key.remoteJid, "announcement");
      }

      await msg.react("✅");
      msg.reply({
        text:
          `╭─⬣「 Totoro bloqueado 」\n` +
          `│  ≡◦ Estado: ${block}\n` +
          `│  ≡◦ Acción: bloqueado\n` +
          `│  ≡◦ Moderador: @${participant}\n` +
          `│  ≡◦ Grupo: ${groupName}\n` +
          `│  ≡◦ Restricción de chat: ${onlyAdmins ? "Solo admins" : "Desactivada"}\n` +
          `│  ≡◦ Fecha: ${now.toLocaleString("es-ES", {
            timeZone: "Europe/Madrid",
          })}\n` +
          `╰──────────────`,
        mentions: [userWithDomain],
      });
    } else {
      const startTime = new Date(currentBlock.startTime);
      const durationMs = Math.floor((now - startTime) / 1000);
      const duration = await runtime(durationMs);

      // Quitamos la restricción de chat si estuvo activada
      if (currentBlock.status === "on" && onlyAdmins) {
        await totoro.groupSettingUpdate(
          message.key.remoteJid,
          "not_announcement"
        );
      }

      await totoBlock.update(
        {
          status: block,
          startTime: null,
          onlyAdmins: false, // Desactivamos la restricción de solo admins
        },
        {
          where: { groupId: groupId },
        }
      );

      await msg.react("✅");
      msg.reply({
        text:
          `╭─⬣「 Totoro desbloqueado 」\n` +
          `│  ≡◦ Estado: ${block}\n` +
          `│  ≡◦ Acción: desbloqueado\n` +
          `│  ≡◦ Moderador: @${participant}\n` +
          `│  ≡◦ Grupo: ${groupName}\n` +
          `│  ≡◦ Fecha: ${now.toLocaleString("es-ES", {
            timeZone: "Europe/Madrid",
          })}\n` +
          `│  ≡◦ Duración: ${duration}\n` +
          `╰──────────────`,
        mentions: [userWithDomain],
      });
    }
  },
};
