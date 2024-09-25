const {
  sendWarning,
  help,
  sendError,
  sendMessage,
} = require("../../functions/messages");

module.exports = {
  name: "kickk",
  description: "Expulsa a un usuario del grupo.",
  category: "moderator",
  subcategory: "admin",
  usage: `kickk <usuario> | kickk <número de teléfono> | kickk <mensaje citado>`,
  cooldown: 5,
  botPermissions: ["SEND_MESSAGES", "REMOVE_PARTICIPANTS"],
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
        sendWarning(
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
          const phoneOrMention = args[0];
          let userJid;

          // Check if argument is a phone number
          if (/^\d+$/.test(phoneOrMention)) {
            userJid = `${phoneOrMention}@s.whatsapp.net`;
          } else {
            // Handle mention
            const mentionedUsers =
              msg.messages[0].message.extendedTextMessage?.contextInfo
                ?.mentionedJid;
            if (mentionedUsers && mentionedUsers.length > 0) {
              userJid = mentionedUsers[0];
            } else {
              await sendMessage(
                totoro,
                msg,
                `El formato proporcionado no es válido. Usa un número de teléfono o menciona al usuario.`
              );
              return;
            }
          }

          const user = groupInfo.participants.find((x) => x.id === userJid);
          if (!user) {
            await msg.react("⚠️");
            msg.reply({
              text: `@${phoneOrMention} no está en el grupo.`,
              mentions: [userJid],
            });
            return;
          }

          if (user.admin) {
            await msg.react("⚠️");
            msg.reply({
              text: `@${phoneOrMention} es un administrador y no puede ser expulsado.`,
              mentions: [userJid],
            });
            return;
          }

          await totoro.groupParticipantsUpdate(group, [userJid], "remove");

          // Enviar mensaje de expulsión
          await totoro.sendMessage(group, {
            text:
              `╭─⬣「 Expulsar Usuario 」⬣\n` +
              `│  ≡◦ 🦑 El usuario ha sido expulsado del grupo ${groupName}\n` +
              `╰─⬣\n` +
              `> Usuario expulsado: @${phoneOrMention}\n` +
              `> Moderador: @${sender.split("@")[0]}\n` +
              `> ⏰ Fecha y hora: ${new Date().toLocaleString()}\n\n` +
              `> 🦤 Actualmente en *${groupName}* hay ${
                groupInfo.participants.length - 1
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
            `Por favor, cita el mensaje del usuario que deseas expulsar.`
          );
          return;
        }

        const quotedUser =
          msg.messages[0].message.extendedTextMessage.contextInfo.participant;

        if (!quotedUser) {
          await help(
            totoro,
            msg,
            "Expulsar Usuario",
            "No se pudo determinar el usuario a expulsar. Asegúrate de citar el mensaje correctamente.",
            "kick <usuario>"
          );
          return;
        }

        const user = groupInfo.participants.find((x) => x.id === quotedUser);
        if (user.admin) {
          await msg.react("⚠️");
          msg.reply({
            text: `> @${
              quotedUser.split("@")[0]
            } es un administrador y no puede ser expulsado.`,
            mentions: [`${sender}`, `${quotedUser}`],
          });
          return;
        }

        if (quotedUser === sender) {
          await msg.react("⚠️");
          msg.reply({
            text: `> No puedes expulsarte a ti mismo del grupo. ${
              sender.split("@")[0]
            }`,
            mentions: [`${sender}`],
          });

          return;
        } else if (!user) {
          await msg.react("⚠️");
          msg.reply({
            text: `> El usuario @${
              quotedUser.split("@")[0]
            } no está en el grupo.`,
            mentions: [`${quotedUser}`],
          });
          return;
        }

        await totoro.groupParticipantsUpdate(group, [quotedUser], "remove");

        // Enviar mensaje de expulsión
        await totoro.sendMessage(group, {
          text:
            `╭─⬣「 Expulsar Usuario 」⬣\n` +
            `│  ≡◦ 🦑 El usuario ha sido expulsado del grupo ${groupName}\n` +
            `╰─⬣\n` +
            `> Nuevo miembro: @${quotedUser.split("@")[0]}\n` +
            `> Moderador: @${sender.split("@")[0]}\n` +
            `> ⏰ Fecha y hora: ${new Date().toLocaleString()}\n\n` +
            `> 🦤 Actualmente en *${groupName}* hay ${
              groupInfo.participants.length - 1
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
      await sendError(
        totoro,
        msg,
        `No pude expulsar a este usuario. Error: ${error.message}`
      );
    }
  },
};
