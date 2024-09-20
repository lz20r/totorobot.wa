const axios = require("axios");

module.exports = {
  name: "char",
  category: "genshin",
  subcategory: "characters",
  description: "See the details of a Genshin Impact character",

  blockcmd: false,

  async execute(totoro, msg, args) {
    const remoteJid = msg.messages[0].key.remoteJid;

    try {
      // Verifica si el usuario proporcionó un nombre de personaje
      if (args.length === 0) {
        await totoro.sendMessage(remoteJid, {
          text: "Please provide the name of the character.",
        });
        return;
      }

      msg.react("🔍");

      // Obtiene el nombre del personaje y lo convierte a minúsculas
      const characterName = args.join(" ").toLowerCase();

      // Realiza la solicitud a la API
      const response = await axios.get(
        `https://cinapis.cinammon.es/genshin/index.php?name=${encodeURIComponent(
          characterName
        )}`
      );

      // Verifica si la respuesta contiene información del personaje
      if (
        response.data &&
        response.data.characters &&
        response.data.characters.length > 0
      ) {
        const character = response.data.characters.find(
          (c) => c.name.toLowerCase() === characterName
        );

        if (!character) {
          await totoro.sendMessage(remoteJid, {
            text: "Character not found.",
          });
          return;
        }

        // Formatear el mensaje con la información del personaje
        const message = `
        *Name:* ${character.name}
        *Description:* ${character.description}
        `;

        // Enviar la información al usuario
        await totoro.sendMessage(
          remoteJid,
          { text: message },
          { quoted: msg.messages[0] }
        );

        // Crear un array de imágenes para enviarlas juntas
        const images = [
          { url: character.images.Carta, caption: "Character Card" },
          { url: character.images.Arte, caption: "Character Art" },
          { url: character.images.Modelo, caption: "Character Model" },
        ];

        // Enviar todas las imágenes juntas en un solo mensaje
        for (const image of images) {
          await totoro.sendMessage(remoteJid, {
            image: { url: image.url },
            caption: image.caption,
          });
        }
      } else {
        await totoro.sendMessage(remoteJid, {
          text: "Character not found or API did not return data.",
        });
      }
      msg.react("✅");
    } catch (error) {
      await totoro.sendMessage(
        remoteJid,
        { text: `An error occurred: ${error.message}` },
        { quoted: msg.messages[0] }
      );
    }
  },
};
