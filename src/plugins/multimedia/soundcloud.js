const { Client } = require("soundcloud-scraper");
const fs = require("fs");
const { pipeline } = require("stream");
const { promisify } = require("util");
const { sendWarning, sendError, help } = require("../../functions/messages");

const pipelineAsync = promisify(pipeline);

module.exports = {
  name: "soundcloud",
  aliases: ["asc", "sca", "scmp3", "sc", "scaudio", "play", "totorosc", "tsc"],
  category: "multimedia",
  subcategory: "sound cloud",
  description: "Descarga audios de SoundCloud.",
  usage: "scmp3 <sc url o nombre>",
  botPermissions: ["SEND_MESSAGES", "ATTACH_FILES"],
  userPermissions: [],
  cooldown: 10,

  cmdPrem: false,

  async execute(totoro, msg, args) {
    const participant = msg.messages?.[0]?.key?.participant;
    const remoteJid = msg.messages?.[0]?.key?.remoteJid;

    if (!args[0]) {
      return help(
        totoro,
        msg,
        "scmp3",
        "Descarga audios de SoundCloud.",
        "scmp3 <sc url o nombre>"
      );
    }

    await msg.react("🔍");
    const query = args.join(" ");
    const client = new Client();
    const isUrl = query.startsWith("http");

    const sendErrorMessage = async () => {
      await sendError(
        totoro,
        msg,
        `${
          isUrl
            ? "No se pudo descargar la canción."
            : "No se encontraron resultados para la búsqueda."
        }`
      );
    };

    const handleDownload = async (song) => {
      try {
        const stream = await song.downloadProgressive();
        const tempFilePath = `./${song.title}.mp3`;
        const writer = fs.createWriteStream(tempFilePath);

        await pipelineAsync(stream, writer);

        // Información del autor
        const authorInfo = song.author;
        const authorDetails =
          `╭─⬣「 *${authorInfo.name}* 」\n` +
          `│  ≡◦ * 👤 *Autor:* ${authorInfo.name || "N/A"} \n` +
          `│  ≡◦ * 📝 *Descripción:* ${authorInfo.description || "N/A"} \n` +
          `│  ≡◦ * ⏱ *Duración:* ${(authorInfo.duration / 60000).toFixed(
            2
          )} minutos \n` +
          `│  ≡◦ * ▶ *Reproducciones:* ${authorInfo.playCount} \n` +
          `│  ≡◦ * 💬 *Comentarios:* ${authorInfo.commentsCount} \n` +
          `│  ≡◦ * ❤ *Likes:* ${authorInfo.likes} \n` +
          `│  ≡◦ * 🎶 *Género:* ${authorInfo.genre} \n` +
          `│  ≡◦ * 📅 *Publicado en:* ${new Date(
            authorInfo.publishedAt
          ).toLocaleDateString()} \n` +
          `│  ≡◦ * 🔗 *URL:* ${authorInfo.url} \n` +
          `╰─⬣\n\n` +
          `> Solicitado por: ${participant.split("@")[0]}`;

        // Detalles de la canción
        const songDetails =
          `╭─⬣「 *${song.title}* 」\n` +
          `│  ≡◦ * 📝 *Descripción:* ${song.description || "N/A"} \n` +
          `│  ≡◦ * ⏱ *Duración:* ${(song.duration / 60000).toFixed(
            2
          )} minutos \n` +
          `│  ≡◦ * ▶ *Reproducciones:* ${song.playCount} \n` +
          `│  ≡◦ * 💬 *Comentarios:* ${song.commentsCount} \n` +
          `│  ≡◦ * ❤ *Likes:* ${song.likes}  \n` +
          `│  ≡◦ * 🎶 *Género:* ${song.genre} \n ` +
          `│  ≡◦ * 📅 *Publicado en:* ${new Date(
            song.publishedAt
          ).toLocaleDateString()} \n` +
          `│  ≡◦ * 🔗 *URL:* ${song.url} \n` +
          `╰─⬣\n\n` +
          `> Solicitado por: @${participant.split("@")[0]}`;

        await totoro.sendMessage(
          remoteJid || participant,
          {
            image: { url: song.thumbnail },
            caption: songDetails,
            mentions: [participant],
          },
          { quoted: msg.messages[0] }
        );

        await msg.react("🎵");
        // Enviar el archivo de audio
        await totoro.sendMessage(
          remoteJid || participant,
          {
            audio: { url: tempFilePath },
            ptt: true,
            mimetype: "audio/mpeg",
          },
          { quoted: msg.messages[0] }
        );

        // Eliminar el archivo temporal después de enviar
        fs.unlinkSync(tempFilePath);
      } catch (error) {
        console.error(error);
        await sendErrorMessage();
      }
    };

    const searchAndDownload = async (query) => {
      try {
        const searchResults = await client.search(query, "track");

        if (searchResults.length > 0) {
          const firstSong = await client.getSongInfo(searchResults[0].url);
          await handleDownload(firstSong);
        } else {
          await totoro.sendMessage(remoteJid || participant, {
            text: "No se han encontrado resultados para la búsqueda.",
          });
        }
      } catch (error) {
        console.error(error);
        await sendErrorMessage();
      }
    };

    if (isUrl) {
      try {
        const song = await client.getSongInfo(query);
        await handleDownload(song);
      } catch (error) {
        console.error(error);
        await sendErrorMessage();
      }
    } else {
      await searchAndDownload(query);
    }
  },
};
