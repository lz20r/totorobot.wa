require("dotenv").config();
const axios = require("axios");
const { prepareWAMessageMedia } = require("@whiskeysockets/baileys");
const { sendWarning, help } = require("../../functions/messages");
const prefix = require("../../../settings.json").prefix; // Asegúrate de que la ruta es correcta y el archivo settings.json contiene tu prefijo

module.exports = {
  name: "tidal",
  aliases: ["tidaldl", "tidal", "tdl", "music", "song"],
  category: "multimedia",
  subcategory: "tidal",
  usage: `${prefix}tidal <nombre de la canción o url>`,
  example: "tidal Blinding Lights",
  description: "Busca información sobre una canción o álbum en Tidal",

  async execute(totoro, msg, args) {
    msg.react("⏳");

    if (!args.length) {
      return help(
        totoro,
        msg,
        this.name,
        "Busca información sobre una canción o álbum en Tidal.",
        `${prefix}${this.name} <nombre de la canción o url>`
      );
    }

    const query = args.join(" ");
    let tidalData;

    try {
      // Obtener el Access Token
      const token = await getTidalAccessToken();
      // Buscar la canción o álbum en Tidal
      tidalData = await searchTidalData(query, token);
    } catch (error) {
      console.error("Error al buscar en Tidal:", error);
      return sendWarning(
        totoro,
        msg,
        `${error.response?.status || "Error"} - Error al buscar en Tidal.`
      );
    }

    if (!tidalData) {
      return sendWarning(
        totoro,
        msg,
        `No se encontró la canción o álbum en Tidal.`
      );
    }

    const songInfo = ` ╭─⬣「 *Tidal Search* 」⬣
    │  ≡◦ *🍭 Nombre ∙* ${tidalData.title}
    │  ≡◦ *🪴 Artista ∙* ${tidalData.artist.name}
    │  ≡◦ *📀 Álbum ∙* ${tidalData.album.title} 
    │  ≡◦ *🕰 Duración ∙* ${formatDuration(tidalData.duration)}
    │  ≡◦ *📅 Publicado ∙* ${tidalData.releaseDate} 
    │  ≡◦ *📊 Popularidad ∙* ${tidalData.popularity} 
    ╰─⬣
`;

    const imageUrl = tidalData.album.cover;

    let media;
    try {
      media = await prepareWAMessageMedia(
        {
          image: { url: imageUrl },
        },
        { upload: totoro.waUploadToServer }
      );
    } catch (mediaError) {
      console.error("Error al preparar media:", mediaError);
      return sendWarning(totoro, msg, `Error al preparar la imagen del álbum.`);
    }

    const message = {
      interactiveMessage: {
        header: {
          hasMediaAttachment: true,
          imageMessage: media.imageMessage,
        },
        body: { text: songInfo },
        footer: { text: "Información obtenida de Tidal 🎶" },
        nativeFlowMessage: {
          buttons: [
            {
              name: "cta_url",
              buttonParamsJson: JSON.stringify({
                display_text: `Ver en Tidal 🎧`,
                url: tidalData.url,
              }),
            },
          ],
          messageParamsJson: "",
        },
      },
    };

    try {
      await totoro.relayMessage(
        msg.messages[0].key.remoteJid,
        { viewOnceMessage: { message } },
        { quoted: msg.messages[0] }
      );
    } catch (relayError) {
      console.error("Error al enviar el mensaje interactivo:", relayError);
      return sendWarning(
        totoro,
        msg,
        `Error al enviar el mensaje interactivo.`
      );
    }

    await msg.react("🎶");
  },
};

// Función para obtener el Access Token de Tidal
async function getTidalAccessToken() {
  const clientId = process.env.TIDAL_CLIENT_ID;
  const clientSecret = process.env.TIDAL_CLIENT_SECRET;

  try {
    const response = await axios.post(
      "https://auth.tidal.com/v1/oauth2/token",
      null,
      {
        params: {
          grant_type: "client_credentials",
          client_id: clientId,
          client_secret: clientSecret,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token } = response.data;
    console.log("Tidal Access Token:", access_token);
    return access_token;
  } catch (error) {
    console.error("Error obteniendo el Access Token:", error.response.data);
    throw error;
  }
}

// Función para buscar una canción o álbum en Tidal
async function searchTidalData(query, token) {
  const response = await axios.get("https://api.tidal.com/v1/search", {
    params: {
      query: query,
      limit: 1, // Limitar la búsqueda a 1 resultado
      types: "tracks",
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = response.data.tracks.items;
  if (data.length === 0) {
    return null;
  }

  const track = data[0];
  return {
    title: track.title,
    artist: track.artists[0].name,
    album: {
      title: track.album.title,
      cover: track.album.cover
        ? `https://resources.tidal.com/images/${track.album.cover}/640x640.jpg`
        : null, // URL de la portada del álbum
    },
    duration: track.duration,
    releaseDate: track.album.release_date,
    popularity: track.popularity,
    url: `https://listen.tidal.com/track/${track.id}`,
  };
}

// Función para formatear la duración de la canción en minutos y segundos
function formatDuration(durationMs) {
  const minutes = Math.floor(durationMs / 60000);
  const seconds = ((durationMs % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}