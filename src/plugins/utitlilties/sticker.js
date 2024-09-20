const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const ffmpeg = require("fluent-ffmpeg");
const { tmpdir } = require("os");
const { join } = require("path");
const { writeFileSync, unlinkSync, readFileSync } = require("fs");
const { sendWarning } = require("../../functions/messages");

module.exports = {
  name: "sticker",
  aliases: ["sticker", "s"],
  category: "utilities",
  subcategory: "sticker",
  description:
    "Crea un sticker a partir de una imagen o video, o convierte un sticker a una imagen o video.",
  usage: `sticker`,
  cmdPrem: false,

  async execute(totoro, msg) {
    const info = msg.messages[0];
    const from = info.key.remoteJid;
    const reply = (text) => {
      totoro.sendMessage(from, { text: text }, { quoted: info });
    };

    await msg.react("🧩");

    const isQuotedImage =
      !!info.message?.imageMessage ||
      !!info.message?.extendedTextMessage?.contextInfo?.quotedMessage
        ?.imageMessage;
    const isQuotedVideo =
      !!info.message?.videoMessage ||
      !!info.message?.extendedTextMessage?.contextInfo?.quotedMessage
        ?.videoMessage;
    const isQuotedSticker =
      !!info.message?.stickerMessage ||
      !!info.message?.extendedTextMessage?.contextInfo?.quotedMessage
        ?.stickerMessage;

    try {
      if (!isQuotedImage && !isQuotedVideo && !isQuotedSticker) {
        return reply("*🚩 Etiqueta una imagen, video o sticker*");
      }

      let buffer = Buffer.from([]);
      if (isQuotedImage || isQuotedVideo || isQuotedSticker) {
        const message = isQuotedImage
          ? info.message?.imageMessage ||
            info.message?.extendedTextMessage?.contextInfo?.quotedMessage
              ?.imageMessage
          : isQuotedVideo
          ? info.message?.videoMessage ||
            info.message?.extendedTextMessage?.contextInfo?.quotedMessage
              ?.videoMessage
          : info.message?.stickerMessage ||
            info.message?.extendedTextMessage?.contextInfo?.quotedMessage
              ?.stickerMessage;

        const type = isQuotedImage
          ? "image"
          : isQuotedVideo
          ? "video"
          : "sticker";

        try {
          const stream = await downloadContentFromMessage(message, type);

          // Manejar descarga del stream
          for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
          }
        } catch (e) {
          if (e.status === 410) {
            return reply(
              "*🚩 El contenido multimedia ya no está disponible (error 410)*"
            );
          } else {
            throw e;
          }
        }

        if (isQuotedVideo && message?.seconds > 10) {
          return sendWarning(
            totoro,
            from,
            "*🚩 El video debe durar menos de 10 segundos*",
            info
          );
        }

        if (isQuotedVideo) {
          const tempVideoPath = join(tmpdir(), `video-${Date.now()}.mp4`);
          writeFileSync(tempVideoPath, buffer);
          buffer = readFileSync(tempVideoPath);
          unlinkSync(tempVideoPath);
        } else if (isQuotedSticker && message.isAnimated) {
          const tempStickerPath = join(tmpdir(), `sticker-${Date.now()}.webp`);
          const tempVideoPath = join(tmpdir(), `sticker-${Date.now()}.mp4`);
          writeFileSync(tempStickerPath, buffer);

          await new Promise((resolve, reject) => {
            ffmpeg(tempStickerPath)
              .inputFormat("webp")
              .outputOptions(["-vcodec libx264", "-pix_fmt yuv420p", "-crf 28"])
              .output(tempVideoPath)
              .on("end", resolve)
              .on("error", reject)
              .run();
          });

          buffer = readFileSync(tempVideoPath);
          unlinkSync(tempStickerPath);
          unlinkSync(tempVideoPath);
        }
      }

      if (isQuotedImage || isQuotedVideo) {
        const sticker = new Sticker(buffer, {
          pack: "Made by",
          author: "Totoro Bot ⚡",
          type: isQuotedImage ? StickerTypes.DEFAULT : StickerTypes.FULL,
          categories: ["⚡"],
          quality: 50,
        });

        const result = await sticker.toMessage();
        totoro.sendMessage(from, result, { quoted: info });
      } else if (isQuotedSticker) {
        if (info.message?.stickerMessage?.isAnimated) {
          totoro.sendMessage(
            from,
            { video: buffer, mimetype: "mp4" },
            { quoted: info }
          );
        } else {
          totoro.sendMessage(from, { image: buffer }, { quoted: info });
        }
      }

      await msg.react("✅");
    } catch (e) {
      console.log(e);
      msg.react("❌");
      sendWarning(totoro, from, "*🚩 Ocurrió un error al procesar el sticker*");
    }
  },
};
