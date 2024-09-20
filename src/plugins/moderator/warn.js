const { sendWarning, help, sendError } = require("../../functions/messages");
const totoWarn = require("../../models/totoWarn");
const totoUser = require("../../models/totoUser");

module.exports = {
  name: "warns",
  description: "Avisa al usuario mencionado.",
  category: "moderator",
  subcategory: "admin",
  usage: `warn <options>`,
  cooldown: 5,
  botPermissions: ["SEND_MESSAGES", "REMOVE_PARTICIPANTS"],
  userPermissions: ["ADMINISTRATOR"],

  execute: async (totoro, msg, args) => {
    try {
      const sender = msg.messages[0].key.participant;
      const groupInfo = await totoro.groupMetadata(
        msg.messages[0].key.remoteJid
      );
      const key = msg.messages[0].key;
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
        let userToAdd;

        // Verificar si hay un usuario citado
        if (
          msg.messages[0].message.extendedTextMessage.contextInfo.participant
        ) {
          userToAdd =
            msg.messages[0].message.extendedTextMessage.contextInfo.participant;
        }

        // Verificar si hay un número de teléfono en los argumentos
        const typeCmd = args.shift();
        if (!userToAdd && args[0].includes("@")) {
          userToAdd = args.shift().split("@")[1] + "@s.whatsapp.net";
        }
        if (!userToAdd) {
          await help(
            totoro,
            msg,
            "Warn user",
            "No se pudo determinar el usuario a avisar. Asegúrate de citar el mensaje correctamente o proporcionar un número de teléfono.",
            "warns <warn|info> <usuario> | warns <warn|info> <número de teléfono> | warns <warn|info> (respondiendo a un mensaje)"
          );
          return;
        }
        let user = await totoWarn.findOne({
          where: { userPhone: userToAdd.split("@")[0] },
        });
        let userIdx;
        try {
          userIdx = (
            await totoUser.findOne({
              where: { phone: userToAdd.split("@")[0] },
            })
          ).id;
        } catch (error) {
          return msg.reply(
            "El usuario no está registrado en la base de datos."
          );
        }
        if (!user) {
          await totoWarn.create({
            userId: userIdx,
            userPhone: userToAdd.split("@")[0],
            warnInfo: "{}",
          });
          user = await totoWarn.findOne({
            where: { userPhone: userToAdd.split("@")[0] },
          });
        }

        if (typeCmd == "remove") {
          const subArgs = args.shift();
          const warns = JSON.parse(user.warnInfo);
          if (subArgs == "all") {
            if (!warns[key.remoteJid])
              return msg.reply("El usuario no tiene advertencias.");
            user.warnInfo[key.remoteJid] = {};
            await totoWarn.update(
              { warnInfo: JSON.stringify(user.warnInfo[key.remoteJid]) },
              { where: { userPhone: userToAdd.split("@")[0] } }
            );
            msg.reply("El historial de advertencias ha sido borrado.");
          } else if (subArgs == "last") {
            if (!warns[key.remoteJid])
              return msg.reply("El usuario no tiene advertencias.");
            const warnNumber = Object.keys(warns[key.remoteJid]).length;
            delete warns[key.remoteJid][warnNumber];
            await totoWarn.update(
              { warnInfo: JSON.stringify(warns) },
              { where: { userPhone: userToAdd.split("@")[0] } }
            );
            msg.reply("La última advertencia ha sido eliminada.");
          } else if (!isNaN(parseInt(subArgs))) {
            if (!user?.warnInfo)
              return msg.reply("El usuario no tiene advertencias.");
            if (!warns[key.remoteJid][parseInt(subArgs)])
              return msg.reply("La advertencia no existe.");
            delete warns[key.remoteJid][parseInt(subArgs)];
            await totoWarn.update(
              { warnInfo: JSON.stringify(warns) },
              { where: { userPhone: userToAdd.split("@")[0] } }
            );
            msg.reply("La advertencia ha sido eliminada.");
          }
        } else if (typeCmd == "info") {
          const warns = JSON.parse(user?.warnInfo);
          if (!warns[key.remoteJid])
            return msg.reply("El usuario no tiene advertencias.");
          let warnString = "";
          Object.keys(warns[key.remoteJid]).forEach((warn) => {
            warnString += `Advertencia ${warn} - ${
              warns[key.remoteJid][warn].reason
            }\n`;
          });
          msg.reply(warnString);
        } else if (typeCmd == "warn") {
          const warns = JSON.parse(user?.warnInfo);
          if (!warns[key.remoteJid]) {
            warns[key.remoteJid] = {};
          }
          const warnNumber =
            (warns[key.remoteJid]
              ? Object.keys(warns[key.remoteJid]).length
              : 0) + 1;
          warns[key.remoteJid][warnNumber] = {
            reason: args.join(" ") || "No hay motivo",
          };
          await totoWarn.update(
            { warnInfo: JSON.stringify(warns) },
            { where: { userPhone: userToAdd.split("@")[0] } }
          );

          if (!user?.warnInfo)
            return msg.reply("El usuario ha sido advertido por primera vez.");
          if (Object.keys(warns[key.remoteJid]).length >= 3) {
            await totoro.groupParticipantsUpdate(group, [userToAdd], "remove");
            msg.reply(
              "El usuario ha sido eliminado del grupo por acumular 3 advertencias. Se le borró el historial."
            );
            totoWarn.update(
              { warnInfo: JSON.stringify({}) },
              { where: { userPhone: userToAdd.split("@")[0] } }
            );
          } else {
            msg.reply("El usuario ha sido advertido.");
          }
        }
      } else {
        await sendWarning(
          totoro,
          msg,
          "Este comando solo puede ser usado en grupos."
        );
      }
    } catch (error) {
      console.error(error);
      await sendError(
        totoro,
        msg,
        `No se pudo agregar al participante: ${error.message}`
      );
    }
  },
};
