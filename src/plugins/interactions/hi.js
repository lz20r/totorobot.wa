const { help, sendWarning } = require("../../functions/messages");
const hiData = require("../../../data/interactions/videos/hi");
const fs = require("fs");
const path = require("path");

const HiCountFile = path.join(
  __dirname,
  "../../../data/interactions/counts/hiCount.json"
);

// Función para cargar el conteo de besos
function loadHiCount() {
  if (fs.existsSync(HiCountFile)) {
    const rawData = fs.readFileSync(HiCountFile);
    return JSON.parse(rawData);
  } else {
    return {};
  }
}

// Función para guardar el conteo de besos
function saveHiCount(hiCount) {
  fs.writeFileSync(HiCountFile, JSON.stringify(hiCount, null, 2));
}

module.exports = {
  name: "hi",
  description: "Saluda a alguien.",
  category: "interactions",
  subcategory: "hi",
  usage: `hi <usuario> | hi <número de teléfono> | hi <citando un mensaje>`,
  cooldown: 5,

  execute: async (totoro, msg, args) => {
    try {
      const sender = msg.messages[0].key.participant;

      if (msg.messages[0].key.remoteJid.endsWith("@g.us")) {
        const group = msg.messages[0].key.remoteJid;
        let userToAdd;

        // Verificar si existe el mensaje extendido y si hay un usuario citado
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
            "hi user",
            "No se pudo determinar el usuario a saludar. Asegúrate de citar el mensaje correctamente o proporcionar un número de teléfono.",
            "hi <usuario> | hi <número de teléfono> | hi <citando un mensaje>"
          );
          return;
        }

        if (userToAdd === sender) {
          await sendWarning(totoro, msg, "No puedes saludarte a ti mismo.");
          return;
        }

        const userContact = userToAdd;
        const senderContact = sender;

        const randomHiVideo =
          hiData.hi[Math.floor(Math.random() * hiData.hi.length)];

        // Cargar el conteo de besos y actualizarlo
        const hiCount = loadHiCount();
        hiCount[senderContact] = (hiCount[senderContact] || 0) + 1;
        saveHiCount(hiCount);

        await totoro.sendMessage(
          group,
          {
            video: { url: randomHiVideo },
            gifPlayback: true,
            caption: `> @${senderContact.split("@")[0]} saludó a @${
              userContact.split("@")[0]
            } ${hiCount[senderContact]} veces.`,
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
