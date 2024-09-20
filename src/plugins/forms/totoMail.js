require("dotenv").config();
const { prefix } = require("../../../settings.json");
const { help, sendError } = require("../../functions/messages");
const totoroLog = require("../../functions/totoroLog");
const nodemailer = require("nodemailer");

module.exports = {
  name: "totoMail",
  category: "forms",
  subcategory: "contact",
  description: "Envía un mensaje a soporte",
  usage: "totoMail <correo> <mensaje>",
  aliases: ["mail"],

  async execute(totoro, msg, args) {
    // Configura el transporte de nodemailer con Mailjet
    const transporter = nodemailer.createTransport({
      host: "in-v3.mailjet.com",
      port: 587,
      auth: {
        user: process.env.MAILJET_API_KEY,
        pass: process.env.MAILJET_SECRET_KEY,
      },
    });

    const email = args[0];
    const mensaje = args.slice(1).join(" ");

    if (!email || !mensaje) {
      await help(
        totoro,
        msg,
        "Contacto",
        "Envía un mensaje a soporte",
        `${prefix}premail <correo> <mensaje>`
      );
      await msg.react("❓");
      return;
    }

    try {
      const remoteJid = msg.messages[0].key.remoteJid;
      msg.react("🍭");
      await totoro.sendMessage(remoteJid, { text: mensaje });

      // Definir las opciones de correo con el remitente dinámico
      const mailOptionsDynamic = {
        from: email,
        to: "totorobot.wa@totorolandia.info",
        cc: "totorobot.wa@gmail.es",
        subject: "Nuevo mensaje de soporte",
        text: `Has recibido un nuevo mensaje: ${mensaje}`,
      };

      // Enviar el mensaje a la dirección de correo proporcionada por el usuario
      await transporter.sendMail(mailOptionsDynamic);

      // Definir las opciones de correo con el remitente fijo
      const mailOptionsFixed = {
        from: "totorobot.wa@totorolandia.info",
        to: email,
        cc: "totorobot.wa@gmail.es",
        subject: "Nuevo mensaje de soporte",
        text: `Has recibido un nuevo mensaje: ${mensaje}`,
      };

      // Enviar el mensaje de confirmación al usuario
      await transporter.sendMail(mailOptionsFixed);

      // Responder confirmando el envío del correo
      await totoro.sendMessage(remoteJid, {
        text: `Correo enviado correctamente a ${email}`,
      });
    } catch (error) {
      sendError(totoro, msg, `${error.message}`);
      totoroLog.error(
        "./logs/functions/messages.log",
        `Error enviando mensaje: ${error.message}`
      );
    }
  },
};
