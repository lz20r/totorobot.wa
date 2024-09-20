const {
  prepareWAMessageMedia,
  generateWAMessageFromContent,
} = require("@whiskeysockets/baileys");
const axios = require("axios");
const { sendWarning, sendError, help } = require("../../functions/messages");
const totoroLog = require("../../functions/totoroLog");
const prefix = require("../../../settings.json").prefix;

module.exports = {
  name: "tiktokstalk",
  aliases: ["ttstalk", "tiktokstalk", "tiktok"],
  category: "information",
  subcategory: "social",
  usage: `${prefix}tiktokstalk <usuario>`,
  example: `${prefix}tiktokstalk mrbeast`,
  description: "Obten información de un perfil de TikTok",

  async execute(totoro, msg, args) {
    const info = msg.messages[0];
    const isGroup = info.key.remoteJid.endsWith("@g.us");
    const sender = isGroup ? info.key.participant : info.key.remoteJid;
    const from = info.key.remoteJid;

    await msg.react("🔍");

    // Verifica si se proporciona un nombre de usuario
    let username = args[0];
    if (!username) {
      help(
        totoro,
        msg,
        "TikTok Stalk",
        "Obten información de un perfil de TikTok.",
        "ttstalk mrbeast"
      );
      return;
    }

    // Eliminar el símbolo '@' si está presente
    username = username.replace("@", "");

    try {
      const res = await axios.get(
        `https://cinapis.cinammon.es/rrss/tiktok/index.php?user=${username}`
      );
      const data = res.data;

      if (data.code !== 200) {
        sendWarning(
          totoro,
          msg,
          "TikTok Stalk",
          `No se encontró el usuario "@${username}".`
        );
        return;
      }

      const user = data.user;
      const stats = data.stats;
      const avatar = data.avatar;

      // Verifica si el avatar está presente y es una cadena
      if (!avatar || typeof avatar !== "string") {
        sendWarning(
          totoro,
          msg,
          "TikTok Stalk",
          `No se encontró el avatar del usuario "@${username}".`
        );
        return;
      }

      // Formatea la información del usuario
      const stalk = `
╭┈ ↷
│ ✐; *T I K T O K  -  U S E R  I N F O*
│ ┆ ✐; *ID:* ${user.id}
│ ┆ ✐; *Usuario:* @${user.username}
│ ┆ ✐; *Nombre:* ${user.profileName}
│ ┆ ✐; *Biografía:* ${user.description} 
│ ┆ ✐; *Seguidores:* ${stats.follower}
│ ┆ ✐; *Seguidos:* ${stats.following}
│ ┆ ✐; *Likes:* ${stats.like}
│ ┆ ✐; *Videos:* ${stats.video}
│ ┆ ✐; *Verificado:* ${user.verified ? "🍭" : "🐥"}
╰┈ ↷`;

      // Prepara la imagen de perfil
      const img = await prepareWAMessageMedia(
        { image: { url: avatar } },
        { upload: totoro.waUploadToServer }
      );

      const interactiveMessage = {
        viewOnceMessage: {
          message: {
            interactiveMessage: {
              header: { text: `\`TikTok Stalk 👀\`` },
              body: { text: stalk },
              footer: { text: "ttstalk by Totoro 🪼" },
              header: {
                hasMediaAttachment: true,
                imageMessage: img.imageMessage,
              },
              nativeFlowMessage: {
                buttons: [
                  {
                    name: "cta_url",
                    buttonParamsJson: JSON.stringify({
                      display_text: "Ver en TikTok 👀",
                      url: `https://www.tiktok.com/@${user.username}`,
                      merchant_url: `https://www.tiktok.com/@${user.username}`,
                    }),
                  },
                ],
                messageParamsJson: "",
              },
            },
          },
        },
      };

      const msag = generateWAMessageFromContent(from, interactiveMessage, {
        userJid: info.remoteJid,
        quoted: info,
      });

      await totoro.relayMessage(from, msag.message, { messageId: info.id });

      await msg.react("🪼");
    } catch (err) {
      totoroLog.error(
        "./logs/plugins/information/tiktokstalk.log",
        `Error al buscar "@${username}": ${err.message}, Stack: ${err.stack}`
      );
      sendError(
        totoro,
        msg,
        "TikTok Stalk",
        `Ocurrió un error al buscar "@${username}": ${err.message}`
      );
    }
  },
};
