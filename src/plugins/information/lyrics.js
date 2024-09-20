const Genius = require("genius-lyrics");
const axios = require("axios");
const { help } = require("../../functions/messages");
const prefix = require("../../../settings.json").prefix;

// Inicializa el cliente de Genius con el token de acceso
const client = new Genius.Client(
  "mgkdJXTk4ACib-AQ8ReFu4sxlDcNLuNOTjCclFdq54kqCBo70y75OBOv3k6PuLmm"
);

module.exports = {
  name: "lyrics",
  aliases: ["letras", "letra", "ly"],
  description: "Muestra la letra de una canción",
  usage: "Usa !letra [nombre de la canción]",
  category: "information",
  subcategory: "genius",

  async execute(socket, msg, args) {
    try {
      // Verificar que se proporcionó una consulta de búsqueda
      if (!args.length) {
        help(
          socket,
          msg,
          "lyrics",
          "Muestra la letra de una canción",
          `${prefix}lyrics [nombre de la canción]`
        );
        return;
      }
      const query = args.join(" ");

      // Maneja la respuesta de búsqueda y los errores potenciales
      let searches;
      searches = await client.songs.search(query);

      if (!searches || searches.length === 0) {
        help(
          socket,
          msg,
          "lyrics",
          "Muestra la letra de una canción",
          `${prefix}lyrics [nombre de la canción]`
        );
      }

      msg.react("🔍");
      // Seleccionar el primer resultado
      const song = searches[0];

      let lyrics;
      try {
        lyrics = await song.lyrics();
        if (!lyrics) {
          throw new Error("No se pudieron obtener las letras.");
        }
      } catch (lyricsError) {
        console.error("Error al obtener la letra:", lyricsError);
        throw new Error("No se pudo obtener la letra de la canción.");
      }

      // Obtener la imagen de la portada usando la API de Genius
      let imageUrl;
      try {
        const apiRes = await axios.get("https://api.genius.com/search", {
          params: { q: query },
          headers: {
            Authorization:
              "Bearer mgkdJXTk4ACib-AQ8ReFu4sxlDcNLuNOTjCclFdq54kqCBo70y75OBOv3k6PuLmm",
          },
        });

        const data = apiRes.data.response.hits;
        if (data.length === 0) {
          throw new Error(
            "No se encontraron resultados para la consulta proporcionada."
          );
        }

        const songData = data[0].result;
        imageUrl = songData.song_art_image_url || songData.header_image_url;
      } catch (apiError) {
        console.error("Error al obtener datos de la API de Genius:", apiError);
        imageUrl = null; // Si falla la API, no uses una imagen
      }

      msg.react("📜");
      // Formatear la información de la canción y la letra
      const caption = `🎵 *Título:* ${song.title}\n
🎤 *Artista:* ${song.artist.name}\n\n
📝 *Letra:*\n${lyrics}`;

      if (imageUrl) {
        await socket.sendMessage(
          msg.messages[0].key.remoteJid,
          {
            image: { url: imageUrl },
            caption: caption,
          },
          {
            quoted: msg.messages[0],
          }
        );
      } else {
        await socket.sendMessage(msg.messages[0].key.remoteJid, {
          text: caption,
        });
      }
    } catch (error) {
      console.error("Error al obtener la letra de la canción:", error);
      await socket.sendMessage(msg.messages[0].key.remoteJid, {
        text: "Error al obtener la letra de la canción: " + error.message,
      });
    }
  },
};
