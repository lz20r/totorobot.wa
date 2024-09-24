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


/*
const axios = require("axios");
const { search } = require("yt-search");
const totoroLog = require("../../functions/totoroLog");
const { sendWarning, sendError, help } = require("../../functions/messages");

module.exports = {
	name: "youtube",
	aliases: ["you", "ytbdownload", "ytbd", "ytbdwn", "ytbdl", "y", "yt"],
	category: "multimedia",
	subcategory: "youtube",
	description: `Realiza búsquedas en YouTube y descarga audios o videos de YouTube.`,
	usage:
		"ytbdownload <audio / mp3 / video / mp4 / both / search / metadatos> <yt url o nombre>",
	botPermissions: ["SEND_MESSAGES", "ATTACH_FILES"],
	userPermissions: [],
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
				"Descarga audios o videos de YouTube.",
				"ytbdownload <audio|mp3|video|mp4|both|search|metadatos> <yt url o nombre>"
			);
		}

		const mode = args[0].toLowerCase();
		const url = args.slice(1).join(" ");

		if (!["audio", "mp3", "video", "mp4", "both", "search", "metadatos"].includes(mode)) {
			return sendWarning(
				totoro,
				msg,
				"Modo no válido. Usa 'audio', 'mp3', 'video', 'mp4', 'both', 'search' o 'metadatos'."
			);
		}

		try {
			await msg.react("🔍");
			let videoUrl = url;

			// Verifica si es una URL válida de YouTube
			if (!videoUrl.match(/youtu/gi)) {
				// Realiza una búsqueda en YouTube
				const searchResponse = await search(url); // Llamada a la API yt-search, ahora asíncrona
				const searchResults = searchResponse.videos; // Asegúrate de obtener los videos de los resultados

				if (searchResults.length === 0) {
					return sendWarning(totoro, msg, "No se encontraron resultados para la búsqueda.");
				}

				// Tomamos el primer resultado de la búsqueda
				videoUrl = searchResults[0].url;
			}

			if (mode === "mp3" || mode === "audio") { 

				// Llamada a la API ytmp3-2 para convertir YouTube a MP3, usando arraybuffer
				const response = await axios.get(`http://185.221.20.212:5006/ytmp3-2?url=${videoUrl}`, {
					responseType: 'arraybuffer', // Para manejar datos binarios
				});

				if (!response.data) {
					return sendWarning(totoro, msg, "Error al obtener los datos del video.");
				}

				const { title, duration, author, views, thumbnail } = response.headers; 
				
				console.log('Response Headers:', response.headers);
				
				const dl_url = response.request.responseURL; 
				console.log('Response Request:', response.request);
				if (!dl_url) {
					return sendWarning(totoro, msg, "Error al obtener el enlace de descarga.");
				} 

				let caption = `╭─⬣「 *YouTube MP3 Download* 」⬣\n`;
				caption += `│  ≡◦ *🎵 Título ∙* ${title}\n`;
				caption += `│  ≡◦ *🕒 Duración ∙* ${duration}\n`;
				caption += `│  ≡◦ *👤 Autor ∙* ${author}\n`;
				caption += `│  ≡◦ *👁️‍🗨️ Vistas ∙* ${views}\n`;
				caption += `╰─⬣`;

				await msg.react("⏳"); // Reacción mientras se realiza el proceso

				// Enviar el archivo MP3 descargado
				await totoro.sendMessage(
					remoteJid || participant,
					{
						image: { url: thumbnail }, // Miniatura del video
						document: Buffer.from(response.data, "binary"), // Convertimos el arraybuffer a buffer
						mimetype: "audio/mpeg",
						fileName: `${title}.mp3`,
						caption: caption,
					},
					{ quoted: msg.messages[0], asDocument: true }
				);
				await msg.react("🎙️"); // Reacción después de enviar el archivo
			} else if (mode === "mp4" || mode === "video") {
				
				const response = await axios.get(`http://185.221.20.212:5006/ytmp4?url=${videoUrl}`, {
					responseType: 'arraybuffer', 
				});
				
				console.log('Response Data:', response.data);

				if (!response.data) {
					return sendWarning(totoro, msg, "Error al obtener los datos del video.");
				}

				const { title, duration, author, views, thumbnail } = response.headers;

				const dl_url = response.request.responseURL;

				if (!dl_url) {
					return sendWarning(totoro, msg, "Error al obtener el enlace de descarga.");
				}

				let caption = `╭─⬣「 *YouTube MP4 Download* 」⬣\n`;
				caption += `│  ≡◦ *🎥 Título ∙* ${title}\n`;
				caption += `│  ≡◦ *🕒 Duración ∙* ${duration}\n`;
				caption += `│  ≡◦ *👤 Autor ∙* ${author}\n`;
				caption += `│  ≡◦ *👁️‍🗨️ Vistas ∙* ${views}\n`;
				caption += `╰─⬣`;

				// Enviar el archivo MP4 descargado
				await totoro.sendMessage(
					remoteJid || participant,
					{ 
						document: Buffer.from(response.data, "binary"),
						mimetype: "video/mp4",
						fileName: `${title}.mp4`,
						caption: caption,
					},
					{ quoted: msg.messages[0]} 
				);
				await msg.react("🎥"); // Reacción después de enviar el archivo
			} else if (mode === "both") { 
				// Llamada a la API para obtener MP3 y MP4
				const audioResponse = await axios.get(`http://185.221.20.212:5006/ytmp3-2?url=${videoUrl}`, {
					responseType: 'arraybuffer',
				});
				const videoResponse = await axios.get(`http://185.221.20.212:5006/ytmp4?url=${videoUrl}`, {
					responseType: 'arraybuffer',
				});
 
				if (!audioResponse.data || !videoResponse.data) {
					return sendWarning(totoro, msg, "Error al obtener los datos del video.");
				}

				const { title, duration, author, views, thumbnail } = audioResponse.headers;

				let caption = `╭─⬣「 *YouTube MP3 & MP4 Download* 」⬣\n`;
				caption += `│  ≡◦ *🎵 Título ∙* ${title}\n`;
				caption += `│  ≡◦ *🕒 Duración ∙* ${duration}\n`;
				caption += `│  ≡◦ *👤 Autor ∙* ${author}\n`;
				caption += `│  ≡◦ *👁️‍🗨️ Vistas ∙* ${views}\n`;
				caption += `╰─⬣`;

				await msg.react("⏳");

				// Enviar MP3 y MP4 juntos
				await totoro.sendMessage(
					remoteJid || participant,
					{
						image: { url: thumbnail }, // Miniatura del video
						document: [
							{ url: Buffer.from(audioResponse.data, "binary"), mimetype: "audio/mpeg", fileName: `${title}.mp3` },
							{ url: Buffer.from(videoResponse.data, "binary"), mimetype: "video/mp4", fileName: `${title}.mp4` }
						],
						caption: caption,
					},
					{ quoted: msg.messages[0], asDocument: true }
				);
				await msg.react("🎶"); // Reacción después de enviar los archivos
			} else if (mode === "metadatos") {
				// Solo obtenemos los metadatos del video
				const response = await axios.get(`http://185.221.20.212:5006/ytmp3-2?url=${videoUrl}`, {
					responseType: 'arraybuffer',
				});
  
				if (!response.data) {
					return sendWarning(totoro, msg, "Error al obtener los metadatos del video.");
				}

				const { title, duration, author, views, thumbnail } = response.data;

				let caption = `╭─⬣「 *YouTube Video Info* 」⬣\n`;
				caption += `│  ≡◦ *🎵 Título ∙* ${title}\n`;
				caption += `│  ≡◦ *🕒 Duración ∙* ${duration}\n`;
				caption += `│  ≡◦ *👤 Autor ∙* ${author}\n`;
				caption += `│  ≡◦ *👁️‍🗨️ Vistas ∙* ${views}\n`;
				caption += `╰─⬣`;

				// Enviar los metadatos del video
				await totoro.sendMessage(
					remoteJid || participant,
					{
						image: { url: thumbnail }, // Miniatura del video
						caption: caption,
					},
					{ quoted: msg.messages[0] }
				);
				await msg.react("ℹ️");
 			}
		} catch (error) {
			totoroLog.error(
				"./logs/ytbdownload.log",
				`Error al interactuar con la API: ${error}`
			);
			console.error(error);
			await sendError(totoro, msg, `Error: ${error.message}`);
		}
	},
};
*/