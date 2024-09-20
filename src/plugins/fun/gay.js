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

        // Verificar si hay un usuario citado
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

        // Calcular el porcentaje de amor
        const gayPercentage = Math.floor(Math.random() * 100) + 1;

        // Crear un canvas y dibujar el porcentaje de amor
        const canvas = createCanvas(600, 600); // Tamaño del canvas
        const ctx = canvas.getContext("2d");

        // Fondo del canvas en blanco (opcional si quieres un borde)
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // avatar del usuario citado en el mensaje
        let profile;
        try {
          profile = await totoro.profilePictureUrl(user, "image", 5000);
        } catch (profileError) {
          console.error("Error obteniendo la foto de perfil:", profileError);
          profile = "https://i.ibb.co/j9N5kj3/image.jpg"; // Imagen de respaldo
        }

        msg.react("🏳️‍🌈");
        const avatar = await loadImage(profile);

        // Dibujar el avatar para que ocupe todo el canvas
        ctx.drawImage(avatar, 0, 0, canvas.width, canvas.height);

        // Cargar la imagen de la bandera gay
        const flag = await loadImage(
          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Gay_Pride_Flag.svg/1920px-Gay_Pride_Flag.svg.png"
        );

        // Dibujar la bandera sobre el avatar con transparencia
        ctx.globalAlpha = 0.5; // Establecer la transparencia (50%)
        ctx.drawImage(flag, 0, 0, canvas.width, canvas.height);

        // Restablecer la transparencia
        ctx.globalAlpha = 1;

        // Agregar el texto del porcentaje centrado sobre la imagen
        ctx.font = "50px tahoma";
        ctx.fillStyle = black;
        ctx.textAlign = "center";
        ctx.fillText(
          `${gayPercentage}% gay`,
          canvas.width / 2, // X centrada
          canvas.height - 50 // Y un poco hacia arriba desde el borde inferior
        );

        // Convertir el canvas en un buffer de imagen
        const buffer = canvas.toBuffer();

        // Enviar la imagen con el porcentaje de amor
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
