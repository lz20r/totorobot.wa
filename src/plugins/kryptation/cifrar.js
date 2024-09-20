const { help, sendError, sendWarning } = require("../../functions/messages");
const totoroLog = require("../../functions/totoroLog");
const prefix = require("../../../settings.json").prefix;
const crypto = require("crypto");
const totoCifrar = require("../../models/totoCifrar");
const totoUser = require("../../models/totoUser.js");
const { error } = require("console");
module.exports = {
  name: "cifrar",
  category: "kryptation",
  subcategory: "cifrar",
  aliases: ["encriptar", "cf", "crypt"],
  description: "Cifra un mensaje con una clave secreta.",

  async execute(totoro, msg, args) {
    const tlfn = msg.messages[0].key.participant
      ? msg.messages[0].key.participant.split("@")[0]
      : msg.messages[0].key.remoteJID.split("@")[0];
    const user = await totoUser.findOne({ where: { phone: tlfn } });
    const casex = args[0];
    await msg.react("⏳");
    const obtenerDatabase = (
      await totoCifrar.findOne({
        where: { telefono: tlfn },
      })
    )?.key;
    const participant = msg.messages[0]?.key?.participant;
    let content;
    let mensaje;
    let key;
    let mensajeError;
    let posibleError;
    switch (casex) {
      case "genKey":
        await totoCifrar.upsert({
          userId: user.id,
          telefono: tlfn,
          key: crypto.randomBytes(32).toString("hex"),
        });

        msg.reply({
          text: "Clave generada con éxito.",
          mentions: [participant],
        });
        break;

      case "descifrar":
        args.shift();
        content = args.join(" ");
        if (!content)
          return help(
            totoro,
            msg,
            "Descifrar",
            "Descifra un mensaje con una clave secreta.",
            `${prefix}cifra <mensaje>`
          );

        const mensaje2 = [
          "El mensaje ha sido descifrado con éxito, aquí tienes el mensaje descifrado:",
        ];
        const mensajeError2 = ["Ha habido un problema con el descifrado."];

        if (obtenerDatabase) key = Buffer.from(obtenerDatabase, "hex");
        else
          return help(
            totoro,
            msg,
            "Descifrar",
            "Necesitas una key. Genérala encriptando algo",
            `${prefix}cifra <mensaje>`
          );

        posibleError = false;
        try {
          mensaje2.push(this.decryptText(content, key.toString("hex")));
        } catch (e) {
          posibleError = e;
        }
        console.log(posibleError);
        if (posibleError) return;

        msg.reply({
          text: mensaje2.join("\n\n"),
          mentions: [participant],
        });
        break;
      case "obtenerClave":
        const msgx = obtenerDatabase
          ? "Aquí tienes tu clave secreta: " + obtenerDatabase
          : "No tienes una clave secreta asignada. Puedes crear una encriptando algo con " +
            prefix +
            "cifrar <mensaje>.";
        msg.reply({
          text: msgx,
          mentions: [participant],
        });
        break;
      case "importarClave":
        await totoCifrar.upsert({
          userId: user.id,
          telefono: tlfn,
          key: args[1],
        });

        msg.reply({
          text: "Clave importada con éxito.",
          mentions: [participant],
        });
        break;
      case "cifrar":
        args.shift();
        content = args.join(" ");
        if (!content)
          return help(
            totoro,
            msg,
            "Cifrar",
            "Cifra un mensaje con una clave secreta.",
            `${prefix}cifra <mensaje>`
          );

        const mensaje = [
          "El mensaje ha sido cifrado con éxito, aquí tienes el mensaje cifrado:",
        ];
        const mensajeError = ["Ha habido un problema con el cifrado."];
        let prvt = false;

        if (obtenerDatabase) {
          key = Buffer.from(obtenerDatabase, "hex");
        } else {
          key = crypto.randomBytes(32);
          await totoCifrar.upsert({
            userId: user.id,
            telefono: tlfn,
            key: key.toString("hex"),
          });
          prvt = true;
        }

        if (prvt) {
          mensaje.push(
            "Advertencia: Se generó una clave nueva, puede obtenerla con " +
              prefix +
              "cifrar obtenerClave."
          );
          mensajeError.push(
            "Advertencia: Se generó una clave nueva, puede obtenerla con " +
              prefix +
              "cifrar obtenerClave."
          );
        }

        posibleError = false;
        try {
          mensaje.push(this.encryptText(content, key.toString("hex")));
        } catch (e) {
          posibleError = true;
        }

        if (posibleError) return;

        msg.reply({
          text: mensaje.join("\n\n"),
          mentions: [participant],
        });
        break;
    }
  },

  encryptText(text, key) {
    const algorithm = "aes-256-cbc";
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      algorithm,
      Buffer.from(key, "hex"),
      iv
    );
    let encrypted = cipher.update(text, "utf-8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
  },
  decryptText(text, key) {
    const algorithm = "aes-256-cbc";
    const textParts = text.split(":");
    const iv = Buffer.from(textParts.shift(), "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    const decipher = crypto.createDecipheriv(
      algorithm,
      Buffer.from(key, "hex"),
      iv
    );
    let decrypted = decipher.update(encryptedText, "hex", "utf-8");
    decrypted += decipher.final("utf-8");
    return decrypted;
  },
};
