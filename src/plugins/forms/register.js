const { createHash } = require("crypto");
const totoUser = require("../../models/totoUser");
const totoWhitelist = require("../../models/totoWhiteList");
const countTotoUsers = require("../../functions/countTotoUsers");
const forbiddenWords = require("../../../data/forbiddenWords");
const urlRegex = /https?:\/\/[^\s]+/;
const domainRegex = /[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+/;
const numberRegex = /\d/;
const invalidCharsRegex = /[^a-zA-Z0-9]/;
const repeatedCharsRegex = /(.)\1{2,}/;
const totoroLog = require("../../functions/totoroLog");
const {
  sendWarning,
  sendError,
  sendReminder,
  help,
  sendReg,
} = require("../../functions/messages");
const registerNewUser = require("../../functions/registerTotoUser");
const getCountryFromPhoneNumber = require("../../functions/countryNumber");

module.exports = {
  name: "register",
  category: "forms",
  subcategory: "register",
  description: "Registra un totoUser en la base de datos",
  usage: "register <nombre>.<edad>",

  async execute(totoro, msg, args) {
    try {
      const remoteJid = msg.messages[0].key.remoteJid;
      const participant = msg.messages[0].key.participant;

      const [nombre, edad] = args.join(" ").split(".");
      if (!nombre || !edad || isNaN(edad)) {
        await help(
          totoro,
          msg,
          "Registro",
          "Ingresa tu nombre y edad",
          "+register Nia.22"
        );
        await msg.react("❓");
        return;
      }

      // Validación de edad
      const edadInt = parseInt(edad, 10);
      if (edadInt < 12 || edadInt > 40) {
        await sendWarning(
          totoro,
          msg,
          `No puede registrarse a totoUser con ${edadInt} años.`
        );
        return;
      }

      // Validación de longitud de nombre, palabras obscenas, URLs, fragmentos de dominios, números en el nombre y caracteres no permitidos
      if (
        nombre.length > 10 ||
        urlRegex.test(nombre) ||
        domainRegex.test(nombre) ||
        numberRegex.test(nombre) ||
        invalidCharsRegex.test(nombre) ||
        repeatedCharsRegex.test(nombre) ||
        forbiddenWords.forbidenWords.some((word) => nombre.includes(word))
      ) {
        await sendWarning(
          totoro,
          msg,
          "El nombre debe tener un máximo de 10 caracteres y no contener palabras no permitidas, URLs, fragmentos de dominios, números, caracteres inválidos o repeticiones de caracteres."
        );
        return;
      }

      // Obtener número de teléfono directamente
      let telf = participant || remoteJid;
      const phone = telf.split("@")[0];

      const country = getCountryFromPhoneNumber(phone);
      if (!country) {
        await sendWarning(
          totoro,
          msg,
          `No se pudo obtener el país del número de teléfono ${phone}.`
        );
        return;
      }

      // Generar un hash MD5 del nombre para el serialNumber
      const serialNumber = createHash("md5").update(nombre).digest("hex");
      const userCount = await countTotoUsers();

      // Buscar el usuario
      let user = await totoUser.findOne({ where: { phone: phone } });
      if (user) {
        await sendReminder(totoro, msg, nombre, userCount);
        await msg.react("ℹ️");
        return;
      }

      // Registrar nuevo usuario
      user = await registerNewUser(
        phone,
        nombre,
        edadInt,
        serialNumber,
        country
      );

      // Agregar el usuario a la tabla de whitelist
      await totoWhitelist.create({
        userId: user.id,
        userPhone: user.phone,
      });

      await sendReg(
        totoro,
        msg,
        phone,
        nombre,
        edadInt,
        serialNumber,
        country,
        userCount
      );
      await msg.react("🍭");
    } catch (error) {
      if (error.message === "Este número de teléfono ya está registrado.") {
        await sendWarning(
          totoro,
          msg,
          "Este número de teléfono ya está registrado."
        );
      } else {
        totoroLog.error(
          "./logs/plugins/forms/register.log",
          `Error al registrar usuario: ${error}`
        );
        await sendError(totoro, msg, "Error al registrar usuario.");
      }
    }
  },
};
