const { sendError } = require("../../functions/messages");
const { totoroLog } = require("../../functions/totoroLog");

module.exports = {
  name: "avatar",
  category: "group",
  subcategory: "tools",
  description: "Muestra el avatar de un usuario",
  usage: "avatar <@usuario>",
  aliases: ["av", "pfp"],

  blockcmd: false,

  async execute(totoro, msg, args) {
    try {
      const participant = msg.messages?.[0]?.key?.participant;
      const remoteJid = msg.messages?.[0]?.key?.remoteJid;

      msg.react("🔍");

      let targetJid;
      let mentionUser;
      if (
        msg.messages?.[0]?.message?.extendedTextMessage?.contextInfo
          ?.quotedMessage
      ) {
        // Si hay un mensaje citado, obtener el JID del remitente del mensaje citado
        targetJid =
          msg.messages[0].message.extendedTextMessage.contextInfo.participant;
        mentionUser = targetJid.split("@")[0];
      } else if (args[0]) {
        // Si se menciona a alguien, obtener el JID del usuario mencionado
        const mentionedPhone =
          args[0].replace(/[@\s]/g, "") + "@s.whatsapp.net";
        targetJid = mentionedPhone;
        mentionUser = args[0].replace(/[@\s]/g, "");
      } else {
        // Si no se menciona a nadie ni hay un mensaje citado, obtener el JID del remitente
        targetJid = participant;
        mentionUser = participant.split("@")[0];
      }

      let profilePicUrl;
      try {
        profilePicUrl = await totoro.profilePictureUrl(
          targetJid,
          "image",
          5000
        );
      } catch (profileError) {
        // Imagen por defecto si no se puede obtener la del usuario
        profilePicUrl = "https://tinyurl.com/24cjylya";
      }

      msg.react("👀");
      await totoro.sendMessage(
        remoteJid || participant,
        {
          image: { url: profilePicUrl },
          caption: `🖼️ *Avatar de @${mentionUser}*`,
          mentions: [targetJid],
        },
        { quoted: msg.messages?.[0] }
      );
    } catch (error) {
      await sendError(totoro, msg, `${error.message}`);
      totoroLog.error(
        "./logs/plugins/group/avatar.log",
        `Error en el comando ${this.name}: ${error.message}`
      );
    }
  },
};
