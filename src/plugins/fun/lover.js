const { sendError, help, sendWarning } = require("../../functions/messages");
const prefix = require("../../../settings.json").prefix;
const loveImages = require("../../../data/fun/love.json");
const totoroLog = require("../../functions/totoroLog");
module.exports = {
  name: "love",
  category: "fun",
  subcategory: "amor",
  description: "Calcula el porcentaje de amor entre dos personas.",
  aliases: ["amor", "love", "lovers", "pareja", "ship"],
  usage: `${prefix}love <usuario1> <usuario2>`,
  cooldown: 5,

  execute: async (totoro, msg, args) => {
    try {
      const sender = msg.messages[0].key.participant;

      if (msg.messages[0].key.remoteJid.endsWith("@g.us")) {
        const group = msg.messages[0].key.remoteJid;
        let user1, user2;

        // Verificar si hay un usuario citado
        if (
          msg.messages[0].message.extendedTextMessage &&
          msg.messages[0].message.extendedTextMessage.contextInfo &&
          msg.messages[0].message.extendedTextMessage.contextInfo.participant
        ) {
          user1 =
            msg.messages[0].message.extendedTextMessage.contextInfo.participant;
        }

        // Verificar si hay un número de teléfono en los argumentos
        if (!user1 && args.length > 0 && args[0].includes("@")) {
          user1 = args.shift().split("@")[1] + "@s.whatsapp.net";
        }

        // Verificar si hay un segundo usuario citado
        if (args.length > 0 && args[0].includes("@")) {
          user2 = args.shift().split("@")[1] + "@s.whatsapp.net";
        }

        if (!user1 || !user2) {
          await help(
            totoro,
            msg,
            "love",
            "No se pudo determinar uno o ambos usuarios. Asegúrate de citar el mensaje correctamente o proporcionar un número de teléfono.",
            `${prefix}love <usuario1> <usuario2>`
          );
          return;
        }

        if (user1 === sender || user2 === sender) {
          await sendWarning(
            totoro,
            msg,
            "No puedes calcular el porcentaje de amor contigo mismo."
          );
          return;
        }

        // Calcular el porcentaje de amor
        const lovePercentage = Math.floor(Math.random() * 100) + 1;

        // Función para seleccionar una imagen aleatoria de un array
        const selectRandomImage = (imagesArray) => {
          return imagesArray[Math.floor(Math.random() * imagesArray.length)];
        };

        // Selección de imagen basada en el porcentaje desde el JSON
        let videoURL;
        if (lovePercentage == 0) {
          videoURL = selectRandomImage(loveImages.lowPercentageVideos);
        } else if (lovePercentage < 1) {
          videoURL = selectRandomImage(loveImages.lowPercentageVideos);
        } else if (lovePercentage < 10) {
          videoURL = selectRandomImage(loveImages.lowPercentageVideos);
        } else if (lovePercentage < 15) {
          videoURL = selectRandomImage(loveImages.lowPercentageVideos);
        } else if (lovePercentage < 20) {
          videoURL = selectRandomImage(loveImages.lowPercentageVideos);
        } else if (lovePercentage < 30) {
          videoURL = selectRandomImage(loveImages.mediumPercentageVideos);
        } else if (lovePercentage < 40) {
          videoURL = selectRandomImage(loveImages.mediumPercentageVideos);
        } else if (lovePercentage < 50) {
          videoURL = selectRandomImage(loveImages.mediumPercentageVideos);
        } else if (lovePercentage < 60) {
          videoURL = selectRandomImage(loveImages.highPercentageVideos);
        } else if (lovePercentage < 70) {
          videoURL = selectRandomImage(loveImages.highPercentageVideos);
        } else if (lovePercentage < 80) {
          videoURL = selectRandomImage(loveImages.highPercentageVideos);
        } else if (lovePercentage < 90) {
          videoURL = selectRandomImage(loveImages.veryHighPercentageVideos);
        } else if (lovePercentage == 100) {
          videoURL = selectRandomImage(loveImages.veryHighPercentageVideos);
        } else {
          videoURL = selectRandomImage(loveImages.veryHighPercentageVideos);
        }

        await totoro.sendMessage(
          group,
          {
            video: { url: videoURL },
            gifPlayback: true,
            caption: `> @${
              sender.split("@")[0]
            } calculó el porcentaje de amor entre @${user1.split("@")[0]} y @${
              user2.split("@")[0]
            }:\n> El porcentaje de amor es del ${lovePercentage}% 💖`,
            mentions: [sender, user1, user2],
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
        "./logs/plugins/fun/love.log",
        "Error en el comando love:",
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
