const axios = require("axios");
const { sendWarning, sendError, help } = require("../../functions/messages");

module.exports = {
  name: "tts",
  category: "audio",
  subcategory: "voz",
  usage: "tts <texto>",
  aliases: ["tts"],
  description: "Convierte texto a voz y envía un audio",

  async execute(totoro, msg, args) {
    const info = msg.messages[0];
    const from = info.key.remoteJid;

    let text = args.join(" ");

    if (!text) {
      const quotedMessage =
        info.message.extendedTextMessage?.contextInfo?.quotedMessage;
      if (quotedMessage) {
        if (quotedMessage.conversation) {
          text = quotedMessage.conversation;
        } else if (quotedMessage.extendedTextMessage?.text) {
          text = quotedMessage.extendedTextMessage.text;
        }
      }
    }

    if (!text) {
      return help(
        totoro,
        msg,
        "tts",
        "Debes escribir un texto o citar un mensaje para convertir a voz",
        "+tts <texto>"
      );
    }

    msg.react("⌛");

    const voices = ["Elena", "Tomas"];
    const selectedVoice = voices[Math.floor(Math.random() * voices.length)];

    const apiUrl = `https://api.kastg.xyz/api/ai/tts?lang=Spanish&voice=${selectedVoice}&input=${encodeURIComponent(
      text
    )}`;

    try {
      const response = await axios.get(apiUrl);
      if (response.data.status === "true" && response.data.result.length > 0) {
        const audioUrl = response.data.result[0].url;
        const audioResponse = await axios.get(audioUrl, {
          responseType: "arraybuffer",
        });
        const audioBuffer = Buffer.from(audioResponse.data, "binary");

        await totoro.sendMessage(
          from,
          {
            audio: audioBuffer,
            mimetype: "audio/mp4",
            ptt: true,
          },
          { quoted: msg.messages[0] }
        );

        await msg.react("🔊");
      } else {
        sendWarning(totoro, msg, `${response.data.message}`);
      }
    } catch (error) {
      console.error(error);
      sendError(totoro, msg, `Error convirtiendo texto a voz: ${error}`);
    }
  },
};
