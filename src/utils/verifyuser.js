const totoUser = require("../models/totoUser");
const totoroLog = require("../functions/totoroLog");
const { infoRegister, sendError } = require("../functions/messages");
const config = require("../../settings.json");

async function verifyUser(participant, totoro, msg) {
  try {
    const totoroPrefix = config.prefix;
    const phone = participant.split("@")[0];
    const user = await totoUser.findOne({ where: { phone } });

    if (!user) {
      await infoRegister(
        totoro,
        msg,
        `Por favor, regístrate con el siguiente comando: ${totoroPrefix}register nombre.edad`
      );

      totoroLog.verbose
        ? totoroLog.verbose(
            "./logs/utils/verifyuser.log",
            `El ${user} con el número de teléfono ${phone} no está registrado.`
          )
        : null;
    } else {
      totoroLog.verbose
        ? totoroLog.verbose(
            "./logs/utils/verifyuser.log",
            `El ${user} con el número de teléfono ${phone} está registrado.`
          )
        : null;
    }
    return user;
  } catch (error) {
    console.error("Error verificando ${user}:", error);
    await sendError(
      totoro,
      msg,
      `Hubo un error al verificar tu registro. Por favor, inténtalo de nuevo más tarde. Gracias.\n ${error}`
    );

    // Asegúrate de que el primer argumento es un string y no una función
    totoroLog.error(
      "./logs/utils/verifyuser.log",
      `Error verificando ${user}: ${error.message || error}`
    );
    return null;
  }
}

module.exports = verifyUser;
