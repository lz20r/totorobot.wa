const { createCanvas, loadImage } = require("canvas");
const { sendError, help, sendWarning } = require("../../functions/messages");
const prefix = require("../../../settings.json").prefix;
const totoroLog = require("../../functions/totoroLog");
const { black } = require("cli-color");

module.exports = {
  name: "gay",
  category: "fun",
  subcategory: "amor",
  description: "Calcula el porcentaje de amor entre el usuario y otra persona.",
  aliases: ["amor", "gay", "gayrs", "pareja", "ship"],
  usage: `${prefix}gay <usuario>`,
  cooldown: 5,

  execute: async (totoro, msg, args) => {
    try {
      const sender = msg.messages[0].key.participant;

      if (msg.messages[0].key.remoteJid.endsWith("@g.us")) {
        const group = msg.messages[0].key.remoteJid;
        let user;
 
        if (
          msg.messages[0].message.extendedTextMessage &&
          msg.messages[0].message.extendedTextMessage.contextInfo &&
          msg.messages[0].message.extendedTextMessage.contextInfo.participant
        ) {
          user =
            msg.messages[0].message.extendedTextMessage.contextInfo.participant;
        }

        // Verificar si hay un número de teléfono en los argumentos
        if (!user && args.length > 0 && args[0].includes("@")) {
          user = args.shift().split("@")[1] + "@s.whatsapp.net";
        }

        if (!user) {
          await help(
            totoro,
            msg,
            "gay",
            "No se pudo determinar el usuario. Asegúrate de citar el mensaje correctamente o proporcionar un número de teléfono.",
            `${prefix}gay <usuario>`
          );
          return;
        }

        if (user === sender) {
          await sendWarning(
            totoro,
            msg,
            "No puedes calcular el porcentaje de amor contigo mismo."
          );
          return;
        }
        const gayPercentage = Math.floor(Math.random() * 100) + 1;

        const canvas = createCanvas(600, 600);
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let profile;
        try {
          profile = await totoro.profilePictureUrl(user, "image", 5000);
        } catch (profileError) {
          profile = "https://tinyurl.com/22289x2t";
        }

        msg.react("🏳️‍🌈");
        const avatar = await loadImage(profile);

        ctx.drawImage(avatar, 0, 0, canvas.width, canvas.height);

        const flag = await loadImage(
          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Gay_Pride_Flag.svg/1920px-Gay_Pride_Flag.svg.png"
        );
 
        ctx.globalAlpha = 0.5; 
        ctx.drawImage(flag, 0, 0, canvas.width, canvas.height);
 
        ctx.globalAlpha = 1;
 
        ctx.font = "50px tahoma";
        ctx.fillStyle = black;
        ctx.textAlign = "center";
        ctx.fillText(
          `${gayPercentage}% gay`,
          canvas.width / 2, 
          canvas.height - 50 
        );
 
        const buffer = canvas.toBuffer();
 
        await totoro.sendMessage(
          group,
          {
            image: buffer,
            caption: `@${user.split("@")[0]} eres ${gayPercentage}% gay. 🏳️‍🌈`,
            mentions: [user],
          },
          { quoted: msg.messages[0] }
        );
      } else {
        await sendWarning(
          totoro,
          msg,
          "Este comando solo puede ser usado en grupos."
        );
      }
    } catch (error) {
      console.error(error);
      totoroLog.error(
        "./logs/plugins/fun/gay.log",
        "Error en el comando gay:",
        error
      );
      sendError(
        totoro,
        msg,
        "Ocurrió un error al calcular el porcentaje de amor."
      );
    }
  },
};
