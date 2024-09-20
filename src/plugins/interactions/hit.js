const { help, sendWarning } = require("../../functions/messages");
const hitData = require("../../../data/interactions/videos/hit");
const fs = require("fs");
const path = require("path");

const HiCountFile = path.join(
  __dirname,
  "../../../data/interactions/counts/hitCount.json"
);

// Función para cargar el conteo de besos
function loadHitCount() {
  if (fs.existsSync(HiCountFile)) {
    const rawData = fs.readFileSync(HiCountFile);
    return JSON.parse(rawData);
  } else {
    return {};
  }
}

// Función para guardar el conteo de besos
function saveHiCount(hitCount) {
  fs.writeFileSync(HiCountFile, JSON.stringify(hitCount, null, 2));
}

module.exports = {
  name: "hit",
  description: "Golpea a alguien.",
  category: "interactions",
  subcategory: "hit",
  usage: `hit <usuario> | hit <número de teléfono> | hit <citando un mensaje>`,
  cooldown: 5,

  execute: async (totoro, msg, args) => {
    try {
      const sender = msg.messages[0].key.participant;

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
            "hit user",
            "No se pudo determinar el usuario a golpear. Asegúrate de citar el mensaje correctamente o proporcionar un número de teléfono.",
            "hit <usuario> | hit <número de teléfono> | hit <citando un mensaje>"
          );
          return;
        }

        if (userToAdd === sender) {
          await sendWarning(totoro, msg, "No puedes golpearte a ti mismo.");
          return;
        }

        const userContact = userToAdd;
        const senderContact = sender;

        const randomHtiVideo =
          hitData.hit[Math.floor(Math.random() * hitData.hit.length)];

        // Cargar el conteo de besos y actualizarlo
        const hitCount = loadHitCount();
        hitCount[senderContact] = (hitCount[senderContact] || 0) + 1;
        saveHiCount(hitCount);

        await totoro.sendMessage(
          group,
          {
            video: { url: randomHtiVideo },
            gifPlayback: true,
            caption: `> @${senderContact.split("@")[0]} golpeó a @${
              userContact.split("@")[0]
            } ${hitCount[senderContact]} veces.`,
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
