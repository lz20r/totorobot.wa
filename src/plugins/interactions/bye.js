const { help, sendWarning } = require("../../functions/messages");
const byeData = require("../../../data/interactions/videos/bye");
const fs = require("fs");
const path = require("path");

const ByesCountFile = path.join(
  __dirname,
  "../../../data/interactions/counts/byes.json"
);

// Función para cargar el conteo de besos
function loadByesCount() {
  if (fs.existsSync(ByesCountFile)) {
    const rawData = fs.readFileSync(ByesCountFile);
    return JSON.parse(rawData);
  } else {
    return {};
  }
}

// Función para guardar el conteo de besos
function saveByesCount(byesCount) {
  const dir = path.dirname(ByesCountFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(ByesCountFile, JSON.stringify(byesCount, null, 2));
}

module.exports = {
  name: "bye",
  description: "Decir adiós o despedirse de alguien.",
  category: "interactions",
  subcategory: "bye",
  usage: `bye <usuario> | bye <número de teléfono> | bye <citando un mensaje>`,
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
            "bye user",
            "No se pudo determinar el usuario a despedir. Asegúrate de citar el mensaje correctamente o proporcionar un número de teléfono.",
            "bye <usuario> | bye <número de teléfono> | bye <citando un mensaje>"
          );
          return;
        }

        if (userToAdd === sender) {
          await sendWarning(totoro, msg, "No puedes despedirte a ti mismo.");
          return;
        }

        const userContact = userToAdd;
        const senderContact = sender;

        const randomByesVideo =
          byeData.bye[Math.floor(Math.random() * byeData.bye.length)];

        // Cargar el conteo de besos y actualizarlo
        const byesCount = loadByesCount();
        if (!byesCount[senderName]) {
          byesCount[senderName] = { numero: senderContact, count: 0 };
        }
        byesCount[senderName].count += 1;
        byesCount[senderName].lastbyeed = userContact;
        saveByesCount(byesCount);

        await totoro.sendMessage(
          group,
          {
            video: { url: randomByesVideo },
            gifPlayback: true,
            caption: `> @${senderContact.split("@")[0]} se despidió de @${
              userContact.split("@")[0]
            } ${byesCount[senderName].count} veces`,
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
