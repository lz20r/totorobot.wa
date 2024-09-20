const axios = require("axios");
const FormData = require("form-data");
const ffmpeg = require("fluent-ffmpeg");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const { PassThrough } = require("stream");
const { sendError, help } = require("../../functions/messages");
const prefix = require("../../../settings.json").prefix;
// Carga dotenv
require("dotenv").config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

module.exports = {
  name: "stt",
  description: "🎙️ Transcribe un mensaje de audio o video.",
  category: "premium",
  subcategory: "audio",
  usage: `+stt <mensaje de audio o video>`,
  aliases: ["stt"], 
  cmdPrem: true, 
    
  execute: async (totoro, msg, args) => {
    try {
      await msg.react("⏳");
      if (!OPENAI_API_KEY) {
        await sendError(
          totoro,
          msg,
          `El comando ${prefix}stt no está disponible porque no se ha configurado la clave de API de OpenAI.`
        );
        return;
      }
      const participantName = msg.messages[0].pushName || "Usuario desconocido";
      const m =
        msg.messages[0].message.extendedTextMessage?.contextInfo
          ?.quotedMessage || msg.messages[0].message;

      if (!m.audioMessage && !m.videoMessage && args.length === 0) {
        return help(
          totoro,
          msg,
          "stt",
          "Plugin que transcribe un mensaje de audio o video.",
          `${prefix}stt <mensaje citado de audio o video>`
        );
      }

      const mediaType = m.audioMessage ? "audio" : "video";
      const mediaStream = await downloadContentFromMessage(
        m[`${mediaType}Message`],
        mediaType
      );
      const audioBuffer =
        mediaType === "audio"
          ? await OGGaMP3(mediaStream)
          : await videoToMP3(mediaStream);

      if (!audioBuffer) {
        await sendError(totoro, msg, "Error en la conversión del audio.");
        return;
      }

      const transcription = await transcribirAudio(audioBuffer).catch(
        console.error
      );
      if (!transcription) {
        await sendError(totoro, msg, "Error en la transcripción del audio.");
        return;
      }

      await msg.react("🗣️");
      const formattedTranscription = formatTranscription(transcription);
      const message = `*Transcripción del audio para* ${participantName}:\n\n${formattedTranscription}`;
      msg.reply(message);
    } catch (error) {
      await sendError(
        totoro,
        msg,
        "Error al transcribir el audio: " + error.message
      );
    }
  },
};

async function OGGaMP3(inputStream) {
  return new Promise((resolve, reject) => {
    const outputStream = new PassThrough();
    const chunks = [];

    inputStream.on("data", (chunk) => {
      chunks.push(chunk);
    });

    inputStream.on("end", () => {
      if (chunks.length === 0) {
        reject(new Error("El flujo de entrada está vacío."));
        return;
      }

      const buffer = Buffer.concat(chunks);
      const newInputStream = new PassThrough();
      newInputStream.end(buffer);

      outputStream.on("data", (chunk) => chunks.push(chunk));
      outputStream.on("end", () => {
        const buffer = Buffer.concat(chunks);
        if (buffer.length < 100) {
          reject(
            new Error("El archivo de audio convertido es demasiado pequeño.")
          );
        } else {
          resolve(buffer);
        }
      });
      outputStream.on("error", reject);

      ffmpeg(newInputStream)
        .inputFormat("ogg")
        .toFormat("mp3")
        .on("error", reject)
        .pipe(outputStream);
    });

    inputStream.on("error", reject);
  });
}

async function videoToMP3(inputStream) {
  return new Promise((resolve, reject) => {
    const outputStream = new PassThrough();
    const chunks = [];

    inputStream.on("data", (chunk) => {
      chunks.push(chunk);
    });

    inputStream.on("end", () => {
      if (chunks.length === 0) {
        reject(new Error("El flujo de entrada está vacío."));
        return;
      }

      const buffer = Buffer.concat(chunks);
      const newInputStream = new PassThrough();
      newInputStream.end(buffer);

      outputStream.on("data", (chunk) => chunks.push(chunk));
      outputStream.on("end", () => {
        const buffer = Buffer.concat(chunks);
        if (buffer.length < 100) {
          reject(
            new Error("El archivo de audio convertido es demasiado pequeño.")
          );
        } else {
          resolve(buffer);
        }
      });
      outputStream.on("error", reject);

      ffmpeg(newInputStream)
        .inputFormat("mp4")
        .toFormat("mp3")
        .on("error", reject)
        .pipe(outputStream);
    });

    inputStream.on("error", reject);
  });
}

async function transcribirAudio(audioBuffer) {
  if (!audioBuffer || audioBuffer.length < 100) {
    throw new Error("El buffer de audio es demasiado pequeño.");
  }

  const form = new FormData();
  form.append("file", audioBuffer, "audio.mp3");
  form.append("model", "whisper-1");
  form.append("language", "es");

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const transcription = response.data.text;
    return transcription;
  } catch (error) {
    throw error;
  }
}

function formatTranscription(transcription) {
  // Eliminar la línea "Subtítulos por la comunidad de Amara.org"
  transcription = transcription.replace(
    /Subtítulos por la comunidad de Amara\.org/g,
    ""
  );

  // Dividir en fragmentos basados en espacios largos o puntos
  const paragraphs = transcription
    .split(/(?:\.\s|\n\s*\n)/)
    .filter((p) => p.trim() !== "");
  let formattedText = "";
  for (let i = 0; i < paragraphs.length; i++) {
    formattedText += `> ${paragraphs[i].trim()}\n`;
    if ((i + 1) % 2 === 0) {
      formattedText += "\n"; // Añade una línea extra después de cada 3 párrafos
    }
  }
  return formattedText;
}
