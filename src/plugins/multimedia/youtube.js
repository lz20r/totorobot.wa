const axios = require("axios");
const totoroLog = require("../../functions/totoroLog");
const { sendWarning, sendError, help } = require("../../functions/messages");

module.exports = {
  name: "youtube",
  aliases: ["you", "ytbdownload", "ytbd", "ytbdwn", "ytbdl", "y", "yt"],
  category: "multimedia",
  subcategory: "youtube",
  description: `Realiza búsquedas en YouTube y descarga videos de YouTube.`,
  usage: "ytbdownload <video/mp4/search> <yt url o nombre>",  
  cooldown: 10, 
  cmdBlock: true,
  
  async execute(totoro, msg, args) {
    const participant = msg.messages?.[0]?.key?.participant;
    const remoteJid = msg.messages?.[0]?.key?.remoteJid;

    if (!participant && !remoteJid) {
      return sendError(
        totoro,
        msg,
        "No se pudo obtener el número del usuario o el chat."
      );
    }

    if (!args[0] || !args[1]) {
      return help(
        totoro,
        msg,
        "ytbdownload",
        "Descarga videos de YouTube.",
        "ytbdownload <video|mp4|search> <yt url o nombre>"
      );
    }

    const mode = args[0].toLowerCase();
    const query = args.slice(1).join(" ");

    if (!["video", "mp4", "search"].includes(mode)) {
      return sendWarning(
        totoro,
        msg,
        "Modo no válido. Usa 'video', 'mp4' o 'search'."
      );
    }

    try {
      let videoUrl = query;
      let videoInfo = null;

      // Si es 'search', obtenemos la información del video
      if (mode === "search") {
        const searchResponse = await axios.get(
          `http://pelicanode.cinammon.es:5012/info?q=${query}`
        );
        videoInfo = searchResponse.data;

        if (!videoInfo || !videoInfo.videoId) {
          return sendWarning(
            totoro,
            msg,
            "No se encontraron resultados para la búsqueda."
          );
        }

        let img = videoInfo.thumbnailUrl;
        let txt = `         「 *YouTube Search con ${query}* 」\n`;
        txt += `> Si deseas descargarlo, usa el comando con \`video\` o \`mp4\` seguido de la \`url del video\` o su \`nombre\`\n\n`;

        txt += ` \n╭─⬣「 *Resultado de búsqueda* 」⬣`;
        txt += ` │  ≡◦ \`🍭 Titulo ∙ ${videoInfo.title}\``;
        txt += ` │  ≡◦ \`🕜 Duración ∙ ${videoInfo.duration}\``;
        txt += ` │  ≡◦ \`📚 Canal ∙ ${videoInfo.channel}\``;
        txt += ` │  ≡◦ \`👁️ Vistas ∙ ${videoInfo.views}\``; 
        txt += ` ╰──────────⬣\n`;
        txt += `> Solicitado por: @${participant.split("@")[0]}`;

        return totoro.sendMessage(
          remoteJid || participant,
          { image: { url: img }, caption: txt, mentions: [participant] },
          { quoted: msg.messages[0] }
        );
      }

      // Si es 'video' o 'mp4', intentamos descargar el video
      if (!videoUrl.match(/youtu/gi)) {
        const infoResponse = await axios.get(
          `http://pelicanode.cinammon.es:5012/info?q=${query}`
        );
        videoInfo = infoResponse.data;

        if (!videoInfo || !videoInfo.videoId) {
          return sendWarning(
            totoro,
            msg,
            "No se encontraron resultados para la búsqueda."
          );
        }
        videoUrl = videoInfo.videoUrl;
      }

      // Obtener la URL de descarga del video MP4
      const videoResponse = await axios.get(
        `http://pelicanode.cinammon.es:5012/mp4?q=${videoUrl}`
      );
      const videoData = videoResponse.data;

      if (!videoData) {
        return sendWarning(
          totoro,
          msg,
          "No se encontró el video para descargar."
        );
      }

      await msg.react("⏳");

      // Detalles del video que se enviarán con el archivo
      const caption = `╭─⬣「 *YouTube Video Download* 」⬣
│ 🍭 *Titulo* ∙ ${videoInfo.title}
│ 🕜 *Duración* ∙ ${videoInfo.duration}
│ 👁️ *Vistas* ∙ ${videoInfo.views}
│ 📚 *Canal* ∙ ${videoInfo.channel}
╰─⬣`;

      // Enviar el video MP4 con los detalles adicionales
      await totoro.sendMessage(
        remoteJid || participant,
        {
          image: { url: videoInfo.thumbnailUrl },
          document: { url: videoUrl }, // Ahora utilizamos videoUrl directamente
          mimetype: "video/mp4",
          fileName: `${videoInfo.title}.mp4`,
          caption: caption,
        },
        { quoted: msg.messages[0], asDocument: true }
      );
      await msg.react("🎥");

    } catch (error) {
      totoroLog.error(
        "./logs/ytbdownload.log",
        `Error al descargar de YouTube: ${error}`
      );
      console.error(error);
      await sendError(totoro, msg, `${error.message}`);
    }
  },
};
