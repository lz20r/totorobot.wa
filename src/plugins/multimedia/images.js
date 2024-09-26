const axios = require("axios");
const cheerio = require("cheerio");
const { prepareWAMessageMedia } = require("@whiskeysockets/baileys");
const { help, sendWarning, sendError } = require("../../functions/messages");
const prefix = require("../../../settings.json").prefix;

module.exports = {
  name: "images",
  aliases: ["img", "imagen", "imagenes"],
  description: "Busca imágenes en Bing.",
  category: "multimedia",
  subcategory: "images",
  usage: `${prefix}images <búsqueda>`,
  cooldown: 5,

  async execute(totoro, msg, args) {
    const info = msg.messages[0];
    const from = info.key.remoteJid;

    // Función para enviar un mensaje de respuesta al usuario
    const reply = (text) => {
      totoro.sendMessage(from, { text: text }, { quoted: info });
    };

    if (!args.join(" ")) {
      await help(
        totoro,
        msg,
        "images",
        "Busca imágenes en Bing.",
        `${prefix}images <búsqueda>`
      );
      return;
    }

    msg.react("⏳");
    const query = args.join(" ");
    const imagenes = await buscarImagenesBing(query);

    if (imagenes.length === 0) {
      sendWarning(
        totoro,
        from,
        `No se encontraron imágenes para la búsqueda *${query}*.`
      );
    }

    msg.react("🔍");

    try {
      // Mezclar imágenes y seleccionar las primeras 5
      const imgsAleatorias = shuffle(imagenes).slice(0, 10000);

      // Preparamos las imágenes válidas
      const imgsValid = await Promise.all(
        imgsAleatorias.map(async (img, index) => {
          try {
            const message = await prepareWAMessageMedia(
              { image: { url: img } },
              { upload: totoro.waUploadToServer }
            );

            return {
              header: {
                hasMediaAttachment: true,
                imageMessage: message.imageMessage
              },
              headerType: "IMAGE",
              body: {
                text: `🔍 Resultados de la búsqueda: *${query}*`
              },
              footer: {
                text: `Totoro Bot - Imagen ${index + 1}`
              },
              nativeFlowMessage: {
                buttons: []
              }
            };
          } catch (e) {
            console.error("Error preparando imagen:", e);
            return null;
          }
        })
      );

      msg.react("🎞️");

      // Filtrar solo las imágenes válidas
      const cards = imgsValid.filter((img) => img !== null);

      await totoro.relayMessage(
        msg.messages[0].key.remoteJid,
        {
          interactiveMessage: {
            body: { text: `🔍 Resultados de la búsqueda: *${query}*` },
            carouselMessage: {
              cards
            }
          }
        },
        {}
      );
    } catch (e) {
      console.error(e);
      reply(`Ocurrió un error al buscar imágenes para la búsqueda *${query}*.`);
    }
  }
};

// Función para buscar imágenes en Bing usando axios y cheerio
async function buscarImagenesBing(query) {
  const url = `https://www.bing.com/images/search?q=${encodeURIComponent(
    query
  )}&form=HDRSC2`;

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const imagenes = [];
    $("a.iusc").each((i, elem) => {
      const jsonData = $(elem).attr("m");
      const imageUrl = JSON.parse(jsonData).murl;
      imagenes.push(imageUrl);
      if (imagenes.length >= 10) {
        // Limitar la cantidad de imágenes
        return false;
      }
    });

    return imagenes;
  } catch (error) {
    console.error("Error buscando imágenes en Bing:", error);
    return [];
  }
}

// Función para mezclar el array de imágenes
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
