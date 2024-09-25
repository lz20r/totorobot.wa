const axios = require("axios");
const { help } = require("../../functions/messages");
const { cmdPrem } = require("../multimedia/youtube");
const prefix = require("../../../settings.json").prefix;

// Variable para contar las solicitudes
let requestCount = 0; // Contador inicializado en 0
const maxRequests = 300; // Límite de solicitudes permitidas

module.exports = {
  name: "lyrics",
  description: "Busca y muestra la letra de una canción usando la API de AudD.io.",
  aliases: ["lyrics", "l"],
  usage: `${prefix}lyrics [nombre de la canción]`,
  category: "premium",
  subcategory: "lyrics",
  cmdPrem: true,

  async execute(socket, msg, args) {
    try {
      // Verificar si se superó el límite de solicitudes
      if (requestCount >= maxRequests) {
        return socket.sendMessage(msg.messages[0].key.remoteJid, {
          text: "El límite de solicitudes de búsqueda de letras ha sido alcanzado (300 solicitudes). Inténtalo de nuevo más tarde.",
        });
      }

      // Verificar que se proporcionó una consulta de búsqueda
      if (!args.length) {
        return help(
          socket,
          msg,
          "lyrics",
          "Muestra la letra de una canción",
          `${prefix}lyrics [nombre de la canción]\n\nEjemplo: ${prefix}lyrics Imagine`
        );
      }

      const query = args.join(" ");
      msg.react("🔍");

      // Realizar la solicitud a la API de AudD.io para buscar la canción
      const response = await axios.get("https://api.audd.io/findLyrics/", {
        params: {
          q: query, // La frase que el usuario quiere buscar
          api_token: process.env.AUDD_API_KEY, // Tu clave API desde las variables de entorno
        },
      });

      const result = response.data.result;

      // Verificar si se encontró alguna canción
      if (!result || result.length === 0) {
        return help(
          socket,
          msg,
          "lyrics",
          "No se encontró ninguna canción con esa frase. Por favor intenta con otra.",
          `${prefix}lyrics [nombre de la canción]\n\nEjemplo: ${prefix}lyrics Imagine`
        );
      }

      // Obtener la primera coincidencia
      const song = result[0];

      // Formatear el resultado
      const caption = `🎵 *Título:* ${song.title}\n🎤 *Artista:* ${song.artist}\n\n📝 *Letra:*\n${song.lyrics || "Letra no disponible"}`;

      // Verificar si hay imagen de la portada
      const imageUrl = song.album && song.album.cover ? song.album.cover : null;

      // Enviar la imagen y la letra si la imagen está disponible
      if (imageUrl) {
        await socket.sendMessage(msg.messages[0].key.remoteJid, {
          image: { url: imageUrl },
          caption: caption,
        });
      } else {
        // Si no hay imagen, solo enviar la letra
        await socket.sendMessage(msg.messages[0].key.remoteJid, {
          text: caption,
        });
      }

      // Aumentar el contador de iiisolicitudes
      requestCount += 1;

      msg.react("📜");

    } catch (error) {
      console.error("Error al obtener la letra de la canción:", error);

      // Manejo de errores con un mensaje amigable al usuario
      await socket.sendMessage(msg.messages[0].key.remoteJid, {
        text: "Error al obtener la letra de la canción. Por favor intenta nuevamente más tarde.",
      });
    }
  },
};
