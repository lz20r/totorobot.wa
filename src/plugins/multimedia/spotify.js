const { downloadTrack } = require("@nechlophomeriaa/spotifydl");
const { prepareWAMessageMedia } = require("@whiskeysockets/baileys");
const { sendWarning } = require("../../functions/messages");

module.exports = {
  name: "spotify",
  aliases: ["spotifydl", "spot", "spdl", "sdl", "music", "song"],
  category: "multimedia",
  subcategory: "spotify",
  usage: "<url>",
  example:
    "spotify https://open.spotify.com/track/2spJ8VgV43N4NzosKAYARt?si=9gfCWO2GSUmOU74M0lZrvg",
  description: "Descarga música con metadatos de Spotify",

  cmdPrem: false,
  async execute(totoro, msg, args) {
    msg.react("⏳");

    if (!args.length) {
      return sendWarning(
        totoro,
        msg,
        "🚩 Ingresa una URL o nombre para descargar."
      );
    }

    const tkurl = args.join(" ");
    let spotify;

    try {
      spotify = await downloadTrack(tkurl);
    } catch (error) {
      console.error("Error al descargar la canción:", error);
      return sendWarning(
        totoro,
        msg,
        `No se pudo descargar la canción. Inténtalo de nuevo más tarde.`
      );
    }

    if (!spotify.status) {
      if (
        spotify.message?.includes("400") ||
        spotify.message?.includes("external_urls")
      ) {
        return sendWarning(totoro, msg, `La URL de Spotify no es válida.`);
      } else {
        return sendWarning(
          totoro,
          msg,
          `${spotify.message || "No se pudo descargar la canción."}`
        );
      }
    }

    const songInfo = ` ╭─⬣「 *Spotify Download* 」⬣
    │  ≡◦ *🍭 Nombre ∙* ${spotify.title}
    │  ≡◦ *🪴 Artista ∙* ${spotify.artists}
    │  ≡◦ *📀 Álbum ∙* ${spotify.album} 
    │  ≡◦ *🕰 *Duración*: ${spotify.duration}
    │  ≡◦ *📅 Publicado ∙* ${spotify.release_date} 
    │  ≡◦ *📊 Popularidad ∙* ${spotify.popularity} 
    ╰─⬣
`;

    const imageUrl = spotify.imageUrl;
    const audioBuffer = spotify.audioBuffer;

    if (!audioBuffer || !(audioBuffer instanceof Buffer)) {
      console.error("audioBuffer no válido o ausente:", audioBuffer);
      return sendWarning(
        totoro,
        msg,
        `No se pudo descargar la canción. Inténtalo de nuevo más tarde.`
      );
    }

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

    const songName = spotify.title.toLowerCase();

    const message = {
      interactiveMessage: {
        header: {
          hasMediaAttachment: true,
          imageMessage: media.imageMessage,
        },
        body: { text: songInfo },
        footer: { text: "Descargado por totoro 🎶" },
        nativeFlowMessage: {
          buttons: [
            {
              name: "quick_reply",
              buttonParamsJson: JSON.stringify({
                display_text: `Reproducir mp3 🎵`,
                id: `spotmp3+${songName}`,
              }),
            },
            {
              name: "quick_reply",
              buttonParamsJson: JSON.stringify({
                display_text: `Reproducir audio 🎵`,
                id: `spotaudio+${songName}`,
              }),
            },
            {
              name: "cta_url",
              buttonParamsJson: JSON.stringify({
                display_text: `Ver en Spotify 🎧`,
                url: tkurl,
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

    // Guardamos el audioBuffer en algún almacenamiento temporal usando el nombre de la canción
    totoro.audioBuffers = totoro.audioBuffers || {};
    totoro.audioBuffers[songName] = audioBuffer;

    await msg.react("🎶");
  },
};
