const Scraper = require("@SumiFX/Scraper");
const totoroLog = require("../../functions/totoroLog");
const { sendWarning, sendError, help } = require("../../functions/messages");

module.exports = {
  name: "youtube",
  aliases: ["you", "ytbdownload", "ytbd", "ytbdwn", "ytbdl", "y", "yt"],
  category: "multimedia",
  subcategory: "youtube",
  description: `Realiza busquedas en YouTube y descarga audios o videos de YouTube.`,
  usage:
    "ytbdownload <audio / mp3 / video / mp4 / both / search> <yt url o nombre>",
  botPermissions: ["SEND_MESSAGES", "ATTACH_FILES"],
  userPermissions: [],
  cooldown: 10,

  cmdPrem: false,
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
        "Descarga audios o videos de YouTube.",
        "ytbdownload <audio|mp3|video|mp4|both|search> <yt url o nombre>"
      );
    }

    const mode = args[0].toLowerCase();
    const query = args.slice(1).join(" ");

    if (
      !["audio", "mp3", "video", "mp4", "both", "search", "metadatos"].includes(
        mode
      )
    ) {
      return sendWarning(
        totoro,
        msg,
        "Modo no válido. Usa 'audio', 'mp3', 'video', 'mp4', 'both', 'search' o 'metadatos'."
      );
    }

    try {
      if (mode === "search") {
        const searchResults = await Scraper.ytsearch(query);
        if (searchResults.length === 0) {
          return sendWarning(
            totoro,
            msg,
            "No se encontraron resultados para la búsqueda."
          );
        }

        let img = searchResults[0].thumbnail;
        let txt = `         「 *YouTube Search con ${query}* 」\n`;
        txt += `> si deseas descargarlo puedes usarlo con el mismo comando solo que en vez de \`search\` puedes usar \`audio o mp3 o mp4\` seguido de la \`url del video\` o su \`nombre\``;
        txt += `\n\n`;
        searchResults.slice(0, 5).forEach((video, index) => {
          txt += ` ╭─⬣「 *YouTube Search ${index + 1}* 」⬣\n`;
          txt += ` │  ≡◦ \`🍭 Titulo ∙ ${video.title}\`\n`;
          txt += ` │  ≡◦ \`🕜 Duración ∙ ${video.duration}\`\n`;
          txt += ` │  ≡◦ \`🪴 Publicado ∙ ${video.published}\`\n`;
          txt += ` │  ≡◦ \`📚 Autor ∙ ${video.author}\`\n`;
          txt += ` │  ≡◦ \`⛓ Url ∙ ${video.url}\`\n`;
          txt += ` ╰──────────⬣`;
          txt += `\n\n`;
        });

        return totoro.sendMessage(
          remoteJid || participant,
          { image: { url: img }, caption: txt },
          { quoted: msg.messages[0] }
        );
      }

      let videoUrl = query;
      if (!videoUrl.match(/youtu/gi)) {
        const searchResults = await Scraper.ytsearch(query);
        if (searchResults.length === 0) {
          return sendWarning(
            totoro,
            msg,
            "No se encontraron resultados para la búsqueda."
          );
        }
        videoUrl = searchResults[0].url;
      }

      const { title, size, quality, thumbnail, dl_url, views } =
        mode === "mp4" || mode === "video"
          ? await Scraper.ytmp4(videoUrl)
          : await Scraper.ytmp3(videoUrl);

      if (size.includes("GB") || parseFloat(size.replace(" MB", "")) > 100) {
        return sendWarning(
          totoro,
          msg,
          "El archivo pesa más de 100 MB, se canceló la descarga."
        );
      }

      await msg.react("⏳");

      // Asegúrate de que `views` esté definido o usa un valor predeterminado
      const viewCount = views || "N/A";

      let metadata = `*Titulo:* ${title}\n*Calidad:* ${quality}\n*Peso:* ${size}\n*Vistas:* ${viewCount}`;
      let caption = `╭─⬣「 *YouTube Download* 」⬣\n`;
      caption += `│  ≡◦ *🍭 Titulo ∙* ${title}\n`;
      caption += `│  ≡◦ *🪴 Calidad ∙* ${quality}\n`;
      caption += `│  ≡◦ *⚖ Peso ∙* ${size}\n`;
      caption += `╰─⬣`;

      if (mode === "audio") {
        console.log(dl_url);
        await totoro.sendMessage(
          remoteJid || participant,
          {
            audio: { url: dl_url },
            mimetype: "audio/mpeg",
            ptt: true,
            caption: metadata,
          },
          { quoted: msg.messages[0] }
        );
        await msg.react("🎙️");
      } else if (mode === "mp3") {
        console.log(dl_url);
        await totoro.sendMessage(
          remoteJid || participant,
          {
            image: { url: thumbnail },
            document: { url: dl_url },
            mimetype: "audio/mpeg",
            fileName: `${title}.mp3`,
            caption: caption,
          },
          { quoted: msg.messages[0], asDocument: true }
        );
        await msg.react("🎙️");
      } else if (mode === "mp4" || mode === "video") {
        console.log("Descargando video...");
        await totoro.sendMessage(
          remoteJid || participant,
          {
            image: { url: thumbnail },
            document: { url: dl_url },
            mimetype: "video/mp4",
            fileName: `${title}.mp4`,
            caption: caption,
          },
          { quoted: msg.messages[0], asDocument: true }
        );
        await msg.react("🎥");
      } else if (mode === "both") {
        await totoro.sendMessage(
          remoteJid || participant,
          {
            audio: { url: dl_url },
            mimetype: "audio/mpeg",
            ptt: true,
            caption: metadata,
          },
          { quoted: msg.messages[0] }
        );
        await msg.react("🎙️");

        await totoro.sendMessage(
          remoteJid || participant,
          {
            image: { url: thumbnail },
            document: { url: dl_url },
            mimetype: "audio/mpeg",
            fileName: `${title}.mp3`,
            caption: caption,
          },
          { quoted: msg.messages[0], asDocument: true }
        );
        await msg.react("🎙️");
      } else if (mode === "metadatos") {
        await totoro.sendMessage(
          remoteJid || participant,
          { text: metadata },
          { quoted: msg.messages[0] }
        );
      }
    } catch (error) {
      totoroLog.error(
        "./logs/ytbdownload.log",
        `Error al descargar de YouTube: ${error}`
      );
      console.error(error);
      await sendError(totoro, msg, `${error}`);
    }
  },
};
