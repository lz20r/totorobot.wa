const axios = require("axios");
const { help } = require("../../functions/messages");

module.exports = {
  name: "genius",
  alias: ["genius", "gns"],
  description: "Busca información sobre canciones en Genius",
  use: ".genius [query]",
  category: "information",
  subcategory: "genius",

  async execute(totoro, msg, args) {
    try {
      const message = msg.messages[0];
      const key = message.key || {}; // Verificar que key exista
      const from = key.remoteJid || "defaultJid"; // Asegurar que from tenga un valor válido
      const pushName = message.pushName || "Desconocido";

      // Determinar la consulta de búsqueda
      let query;
      if (args.length > 0) {
        query = args.join(" ");
      } else if (
        message.message?.extendedTextMessage?.contextInfo?.quotedMessage
      ) {
        const quotedMessage =
          message.message.extendedTextMessage.contextInfo.quotedMessage;

        if (quotedMessage?.conversation) {
          query = quotedMessage.conversation;
        } else if (quotedMessage?.extendedTextMessage?.text) {
          query = quotedMessage.extendedTextMessage.text;
        } else {
          query = "No se encontró texto en el mensaje citado";
        }
      } else {
        await help(
          totoro,
          msg,
          "genius",
          "Busca información sobre canciones en Genius",
          ".genius [query]"
        );
        return;
      }

      if (!query) {
        await help(
          totoro,
          msg,
          "genius",
          "Busca información sobre canciones en Genius",
          ".genius [query]"
        );
        return;
      }

      // Enviar reacción de inicio de búsqueda
      msg.react("🔍");

      // Llamar a la API de búsqueda de Genius
      const apiRes = await axios.get("https://api.genius.com/search", {
        params: { q: query },
        headers: {
          Authorization:
            "Bearer TqP_KhRZX8oPfV87RP2tB1zZKD0zjWs9EsnHjY3Ulc3cY0DIsCAVBWhkQ_sAwWqO",
        },
      });

      const data = apiRes.data.response.hits;

      if (data.length === 0) {
        await totoro.sendMessage(
          from,
          {
            text: "🔍 No se encontraron resultados para la consulta proporcionada.",
          },
          { quoted: msg.messages[0] }
        );
        return;
      }

      const song = data[0].result;
      let responseText = `🎵 *Título:* ${song.title}\n`;
      responseText += `🎤 *Artista:* ${song.primary_artist.name} ${song.primary_artist.is_verified ? "✅" : ""}\n`;
      responseText += `🔗 *URL:* ${song.url}\n\n`;
      responseText += `© ᴍᴀᴅᴇ ʙʏ ᴛᴏᴛᴏʀᴏ - ꜱᴏʟɪᴄɪᴛᴀᴅᴏ ᴘᴏʀ: ${pushName}`;

      const imageUrl = song.song_art_image_url || song.header_image_url;
      if (imageUrl) {
        await totoro.sendMessage(
          from,
          {
            image: { url: imageUrl },
            caption: responseText,
          },
          { quoted: msg.messages[0] }
        );
      } else {
        await totoro.sendMessage(
          from,
          {
            text: responseText,
          },
          { quoted: msg.messages[0] }
        );
      }

      await totoro.sendMessage(from, {
        react: { text: "🎶", key: key },
      });
    } catch (error) {
      console.error(error);
      await totoro.sendMessage(
        from,
        {
          text: `❌ Error: ${error.message}`,
        },
        { quoted: msg.messages[0] }
      );
    }
  },
};
