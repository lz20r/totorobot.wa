const { help, sendWarning } = require("../../functions/messages");
const ShootData = require("../../../data/interactions/videos/shoot");
const fs = require("fs");
const path = require("path");

const shootsCountFile = path.join(
  __dirname,
  "../../../data/interactions/counts/shootsCount.json"
);

// Función para cargar el conteo de besos
function loadShootsCount() {
  if (fs.existsSync(shootsCountFile)) {
    const rawData = fs.readFileSync(shootsCountFile);
    return JSON.parse(rawData);
  } else {
    return {};
  }
}

// Función para guardar el conteo de besos
function saveShootsCount(shootsCount) {
  fs.writeFileSync(shootsCountFile, JSON.stringify(shootsCount, null, 2));
}

module.exports = {
  name: "shoot",
  description: "Dispara a alguien.",
  category: "interactions",
  subcategory: "shoot",
  usage: `shoot <usuario> | shoot <número de teléfono> | shoot <citando un mensaje>`,
  cooldown: 5,

  execute: async (totoro, msg, args) => {
    try {
      const sender = msg.messages[0].key.participant;
      const groupInfo = await totoro.groupMetadata(
        msg.messages[0].key.remoteJid
      );

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
            "shoot user",
            "No se pudo determinar el usuario a disparar. Asegúrate de citar el mensaje correctamente o proporcionar un número de teléfono.",
            "shoot <usuario> | shoot <número de teléfono> | shoot <citando un mensaje>"
          );
          return;
        }

        if (userToAdd === sender) {
          await sendWarning(totoro, msg, "No puedes dispararte a ti mismo.");
          return;
        }

        const userContact = userToAdd;
        const senderContact = sender;

        const randomShootVideo =
          ShootData.shoot[Math.floor(Math.random() * ShootData.shoot.length)];

        // Cargar el conteo de besos y actualizarlo
        const shootsCount = loadShootsCount();
        shootsCount[senderContact] = (shootsCount[senderContact] || 0) + 1;
        saveShootsCount(shootsCount);

        await totoro.sendMessage(
          group,
          {
            video: { url: randomShootVideo },
            gifPlayback: true,
            caption: `> @${senderContact.split("@")[0]} disparó a @${
              userContact.split("@")[0]
            } ${shootsCount[senderContact]} veces.`,
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
