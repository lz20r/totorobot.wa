const { help, sendWarning } = require("../../functions/messages");
const kissData = require("../../../data/interactions/videos/kiss");
const fs = require("fs");
const path = require("path");

const kissesCountFile = path.join(
  __dirname,
  "../../../data/interactions/counts/kisses.json"
);

// Función para cargar el conteo de besos
function loadKissesCount() {
  if (fs.existsSync(kissesCountFile)) {
    const rawData = fs.readFileSync(kissesCountFile);
    return JSON.parse(rawData);
  } else {
    return {};
  }
}

// Función para guardar el conteo de besos
function saveKissesCount(kissesCount) {
  const dir = path.dirname(kissesCountFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(kissesCountFile, JSON.stringify(kissesCount, null, 2));
}

module.exports = {
  name: "kiss",
  description: "Besa a la persona mencionada.",
  category: "interactions",
  subcategory: "kiss",
  usage: `kiss <usuario> | kiss <número de teléfono> | kiss <citando un mensaje>`,
  cooldown: 5,

  execute: async (totoro, msg, args) => {
    try {
      const sender = msg.messages[0].key.participant;
      const senderName = msg.messages[0].pushName || "Anónimo"; // Obtener el nombre del remitente

      if (msg.messages[0].key.remoteJid.endsWith("@g.us")) {
        const group = msg.messages[0].key.remoteJid;
        let userToAdd;

        // Verificar si hay un usuario citado
        if (
          msg.messages[0].message.extendedTextMessage &&
          msg.messages[0].message.extendedTextMessage.contextInfo &&
          msg.messages[0].message.extendedTextMessage.contextInfo.participant
        ) {
          userToAdd =
            msg.messages[0].message.extendedTextMessage.contextInfo.participant;
        }

        // Verificar si hay un número de teléfono en los argumentos
        if (!userToAdd && args.length > 0 && args[0].includes("@")) {
          userToAdd = args.shift().split("@")[1] + "@s.whatsapp.net";
        }

        if (!userToAdd) {
          await help(
            totoro,
            msg,
            "Kiss user",
            "No se pudo determinar el usuario a besar. Asegúrate de citar el mensaje correctamente o proporcionar un número de teléfono.",
            "kiss <usuario> | kiss <número de teléfono> | kiss <citando un mensaje>"
          );
          return;
        }

        if (userToAdd === sender) {
          await sendWarning(totoro, msg, "No puedes besarte a ti mismo.");
          return;
        }

        const userContact = userToAdd;
        const senderContact = sender;

        const randomKissVideo =
          kissData.kiss[Math.floor(Math.random() * kissData.kiss.length)];

        // Cargar el conteo de besos y actualizarlo
        const kissesCount = loadKissesCount();
        if (!kissesCount[senderName]) {
          kissesCount[senderName] = { numero: senderContact, count: 0 };
        }
        kissesCount[senderName].count += 1;
        kissesCount[senderName].lastKissed = userContact;
        saveKissesCount(kissesCount);

        await totoro.sendMessage(
          group,
          {
            video: { url: randomKissVideo },
            gifPlayback: true,
            caption: `> @${senderContact.split("@")[0]} besó a @${
              userContact.split("@")[0]
            } ${kissesCount[senderName].count} veces`,
            mentions: [senderContact, userContact],
          },
          { quoted: msg.messages[0] }
        );
      }
    } catch (error) {
      console.error(error);
    }
  },
};
