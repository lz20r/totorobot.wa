require("@nechlophomeriaa/spotifydl");

module.exports = {
  id: "spotmp3",
  name: "spotmp3",

  async execute(totoro, msg, args) {
    await msg.react("⏳");
    const cancion = args[0];
    const { remoteJid, participant } = msg.messages[0].key;

    const audioBuffer = totoro.audioBuffers
      ? totoro.audioBuffers[cancion]
      : null;

    if (!audioBuffer) {
      console.error("audioBuffer no encontrado para el ID:", cancion);
      return totoro.sendMessage(remoteJid || participant, {
        text: "No se pudo enviar la canción.",
        quoted: msg.messages[0],
      });
    }

    // Sanitizar el nombre de la canción para asegurar que sea un nombre de archivo válido
    function sanitizeFileName(name) {
      return name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    }

    // Obtener el nombre de la canción y sanitizarlo
    const songName = audioBuffer.songName
      ? sanitizeFileName(audioBuffer.songName)
      : `song`;

    try {
      await totoro.sendMessage(
        remoteJid || participant,
        {
          document: audioBuffer,
          mimetype: "audio/mp3",
          fileName: `${songName}.mp3`,
          caption: "🎵 Aquí está tu canción",
        },
        { quoted: msg.messages[0], asDocument: true }
      );
    } catch (sendError) {
      console.error("Error al enviar la canción:", sendError);
      return totoro.sendMessage(remoteJid || participant, {
        text: "No se pudo enviar la canción.",
        quoted: msg.messages[0],
      });
    }

    await msg.react("📼");
  },
};
