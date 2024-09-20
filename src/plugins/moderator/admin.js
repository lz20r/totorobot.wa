const {
  sendMessage,
  sendError,
  help,
  sendWarning,
} = require("../../functions/messages");

module.exports = {
  name: "admins",
  description: "Lista a todos los administradores del grupo.",
  category: "moderator",
  subcategory: "admin",
  usage: "<admins>",
  cooldown: 5,
  botPermissions: ["SEND_MESSAGES", "MENTION_EVERYONE"],
  userPermissions: [],

  execute: async (totoro, msg, args) => {
    try {
      if (!msg.messages[0].key.remoteJid.endsWith("@g.us")) {
        sendWarning(totoro, msg, "✨ Este comando solo funciona en grupos. ✨");
        return;
      }

      const groupInfo = await totoro.groupMetadata(
        msg.messages[0].key.remoteJid
      );
      const admins = groupInfo.participants.filter(
        (participant) =>
          participant.admin || participant.superAdmin || participant.isCreator
      );

      if (admins.length === 0) {
        sendError(
          totoro,
          msg,
          "Totoro no pudo encontrar a ningún administrador en este grupo."
        );
        return;
      }

      let adminList = `╭─⬣「 Administradores del Grupo (${admins.length}) 」⬣\n`;
      const mentions = [];
      admins.forEach((admin, index) => {
        const prefix = index === admin.length - 1 ? "│  ≡◦  🍭" : "│  ≡◦  🍭";
        adminList += `${prefix} @${admin.id.split("@")[0]}\n`;
        mentions.push(admin.id);
      });
      adminList += "╰─⬣";

      await totoro.sendMessage(msg.messages[0].key.remoteJid, {
        text: adminList,
        mentions: mentions,
      });
    } catch (error) {
      console.error(error);
      await totoro.sendMessage(msg.messages[0].key.remoteJid, {
        text: `Momo está cansado y no pudo obtener la lista de administradores. Error: ${error.message}`,
      });
    }
  },
};
