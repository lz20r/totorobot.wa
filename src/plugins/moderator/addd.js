const {
  sendWarning,
  help,
  sendError,
  sendMessage,
} = require("../../functions/messages");

module.exports = {
  name: "add",
  description: "Agrega a un usuario al grupo sin uso de botones.",
  category: "moderator",
  subcategory: "admin",
  usage: `add <usuario> | add <número de teléfono>`,
  cooldown: 5,
  botPermissions: ["SEND_MESSAGES", "ADD_PARTICIPANTS"],
  userPermissions: ["ADMINISTRATOR"],

  execute: async (totoro, msg, args) => {
    try {
      const sender = msg.messages[0].key.participant;
      const groupInfo = await totoro.groupMetadata(
        msg.messages[0].key.remoteJid
      );
      const groupName = groupInfo.subject;

      // Validar si el usuario que ejecuta el comando es administrador
      const participant = groupInfo.participants.find((x) => x.id === sender);
      if (!participant || !participant.admin) {
        await sendWarning(
          totoro,
          msg,
          "No tienes permisos para ejecutar este comando. Solo los administradores pueden usar este comando."
        );
        return;
      }

      if (msg.messages[0].key.remoteJid.endsWith("@g.us")) {
        const group = msg.messages[0].key.remoteJid;

        // Validar si se proporcionó un número de teléfono como argumento
        if (args.length > 0) {
          const phoneNumber = args[0];
          if (!/^\d+$/.test(phoneNumber)) {
            await sendMessage(
              totoro,
              msg,
              `El número de teléfono proporcionado no es válido.`
            );
            return;
          }

          const userJid = `${phoneNumber}@s.whatsapp.net`;

          if (groupInfo.participants.find((x) => x.id === userJid)) {
            await msg.react("⚠️");
            msg.reply({
              text: `@${phoneNumber} ya está en el grupo.`,
              mentions: [userJid],
            });
            return;
          }

          await totoro.groupParticipantsUpdate(group, [userJid], "add");

          // Enviar mensaje de bienvenida
          await totoro.sendMessage(group, {
            text:
              `╭─⬣「 Añadir Usuario 」⬣\n` +
              `│  ≡◦ 🍭 Bienvenido/a al grupo ${groupName}\n` +
              `╰─⬣\n` +
              `> Nuevo miembro: @${phoneNumber}\n` +
              `> Moderador: @${sender.split("@")[0]}\n` +
              `> ⏰ Fecha y hora: ${new Date().toLocaleString()}\n\n` +
              `> 🦤 Actualmente en *${groupName}* hay ${
                groupInfo.participants.length + 1
              } miembros.`,
            mentions: [userJid, sender],
          });

          return;
        }

        // Validar si hay un mensaje citado
        const quotedMessage =
          msg.messages[0].message.extendedTextMessage?.contextInfo
            ?.quotedMessage;
        if (!quotedMessage) {
          await sendMessage(
            totoro,
            msg,
            `Por favor, cita el mensaje del usuario que deseas agregar.`
          );
          return;
        }

        const quotedUser =
          msg.messages[0].message.extendedTextMessage.contextInfo.participant;

        if (!quotedUser) {
          await help(
            totoro,
            msg,
            "Agregar Usuario",
            "No se pudo determinar el usuario a agregar. Asegúrate de citar el mensaje correctamente.",
            "add"
          );
          return;
        }

        if (quotedUser === sender) {
          await msg.react("⚠️");
          msg.reply({
            text: `${
              sender.split("@")[0]
            }, no puedes agregarte a ti mismo al grupo.`,
            mentions: [`${sender}`],
          });
          return;
        } else if (groupInfo.participants.find((x) => x.id === quotedUser)) {
          await msg.react("⚠️");
          msg.reply({
            text: `@${quotedUser.split("@")[0]} ya está en el grupo.`,
            mentions: [quotedUser],
          });
          return;
        }

        await totoro.groupParticipantsUpdate(group, [quotedUser], "add");

        // Enviar mensaje de bienvenida
        await totoro.sendMessage(group, {
          text:
            `╭─⬣「 Añadir Usuario 」⬣\n` +
            `│  ≡◦ 🍭 Bienvenido/a al grupo ${groupName}\n` +
            `╰─⬣\n` +
            `> Nuevo miembro: @${quotedUser.split("@")[0]}\n` +
            `> Moderador: @${sender.split("@")[0]}\n` +
            `> ⏰ Fecha y hora: ${new Date().toLocaleString()}\n\n` +
            `> 🦤 Actualmente en *${groupName}* hay ${
              groupInfo.participants.length + 1
            } miembros.`,
          mentions: [quotedUser, sender],
        });
      } else {
        await sendWarning(
          totoro,
          msg,
          "Este comando solo puede ser usado en grupos."
        );
      }
    } catch (error) {
      console.error("Error durante la ejecución:", error);
      await sendError(
        totoro,
        msg,
        `No pude agregar a este usuario. Error: ${error.message}`
      );
    }
  },
};
