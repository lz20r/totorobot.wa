const {
  sendMessage,
  sendError,
  help,
  sendWarning,
} = require("../../functions/messages");

module.exports = {
  name: "members",
  description: "Lista a todos los miembros del grupo.",
  category: "moderator",
  subcategory: "admin",
  aliases: ["miembros", "listmembers", "lm"],
  usage: "<members>",
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
      const members = groupInfo.participants;

      if (members.length === 0) {
        sendError(
          totoro,
          msg,
          "Totoro no pudo encontrar a ningún miembro en este grupo."
        );
        return;
      }

      let memberList = `╭─⬣「 Miembros del Grupo (${members.length}) 」⬣\n`;
      const mentions = [];
      members.forEach((member, index) => {
        const prefix = index === members.length - 1 ? "│  ≡◦  🍭" : "│  ≡◦  🍭";
        memberList += `${prefix} @${member.id.split("@")[0]}\n`;
        mentions.push(member.id);
      });
      memberList += "╰─⬣";

      await totoro.sendMessage(msg.messages[0].key.remoteJid, {
        text: memberList,
        mentions: mentions,
      });
    } catch (error) {
      console.error(error);
      await totoro.sendMessage(msg.messages[0].key.remoteJid, {
        text: `Momo está cansado y no pudo obtener la lista de miembros. Error: ${error.message}`,
      });
    }
  },
};
