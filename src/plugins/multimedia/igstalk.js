const {
  prepareWAMessageMedia,
  generateWAMessageFromContent,
} = require("@whiskeysockets/baileys");
const { help, sendWarning } = require("../../functions/messages");

module.exports = {
  name: "instagramstalk",
  aliases: ["igstalk", "ig"],
  category: "multimedia",
  subcategory: "instagram",
  usage: "igstalk <user>",
  example: "igstalk @nialr20",
  description: "Obten información de un perfil de Instagram",

  cmdPrem: false,
  async execute(totoro, msg, args) {
    const info = msg.messages[0];
    const from = info.key.remoteJid;
    const reply = (text) => {
      totoro.sendMessage(from, { text: text }, { quoted: info });
    };

    let username = args[0];
    if (!username)
      return help(
        totoro,
        msg,
        "igstalk",
        "Obten información de un perfil de Instagram",
        "igstalk <user>"
      );
    username = username.replace("@", "");

    const { search } = require("scrape-websitee");

    const sendInstagramStalk = async (username) => {
      try {
        const res = await search.igStalk(username);

        if (res.message?.includes("Tidak")) {
          return sendWarning(
            totoro,
            from,
            "El usuario no existe o no se pudo encontrar."
          );
        }

        const stalkInfo = formatStalkInfo(res);
        const profilePic = res.profilePic;

        const img = await prepareProfilePicture(totoro, profilePic);
        const message = createInteractiveMessage(
          from,
          stalkInfo,
          img,
          res.urlAcc
        );

        await sendMessage(totoro, from, message, info);
      } catch (err) {
        console.log(err);
        sendWarning(
          totoro,
          from,
          "No se pudo obtener la información del usuario de Instagram."
        );
      }
    };

    const formatStalkInfo = (res) => {
      return `\`Instagram stalk 👀\`\n\n*ID único:* @${
        res.username
      }\n*Nombre:* ${res.fullName}\n*Verificado:* ${
        res.verified ? "✅" : "❌"
      }\n*Cuenta privada:* ${res.private ? "✅" : "❌"}\n*Publicaciones:* ${
        res.totalPosts
      }\n*Seguidores:* ${res.followers}\n*Seguidos:* ${res.following}\n*Bio:* ${
        res.bio
      }`;
    };

    const prepareProfilePicture = async (totoro, url) => {
      return await prepareWAMessageMedia(
        { image: { url: url } },
        { upload: totoro.waUploadToServer }
      );
    };

    const createInteractiveMessage = (from, stalkInfo, img, urlAcc) => {
      return generateWAMessageFromContent(
        from,
        {
          viewOnceMessage: {
            message: {
              interactiveMessage: {
                header: {
                  hasMediaAttachment: true,
                  imageMessage: img.imageMessage,
                },
                body: { text: stalkInfo },
                footer: { text: "igstalk by Totoro" },
                nativeFlowMessage: {
                  buttons: [
                    {
                      name: "cta_url",
                      buttonParamsJson: JSON.stringify({
                        display_text: "look in Instagram 📲",
                        url: urlAcc,
                        merchant_url: urlAcc,
                      }),
                    },
                  ],
                  messageParamsJson: "",
                },
              },
            },
          },
        },
        { userJid: from }
      );
    };

    const sendMessage = async (totoro, from, message, info) => {
      await totoro.relayMessage(from, message.message, { messageId: info.id });
    };

    // Start the process
    sendInstagramStalk(username);
  },
};
