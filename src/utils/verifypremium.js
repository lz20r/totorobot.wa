const totoUser = require("../models/totoUser");
const { infoPremium } = require("../functions/messages");
const totoroLog = require("../functions/totoroLog");

/**
 * Verifica si un usuario tiene membresía premium.
 *
 * @param {string} participant - El identificador del participante.
 * @param {object} totoro - La instancia del bot.
 * @param {object} msg - El mensaje recibido.
 * @returns {object|null} El objeto del usuario si es premium, de lo contrario null.
 */
async function verifyPremium(participant, totoro, msg) {
  try {
    const phone = participant.split("@")[0];
    const user = await totoUser.findOne({ where: { phone } });
    if (!user || !user.premium) {
      await infoPremium(
        totoro,
        msg,
        `> Por favor, adquiere una membresía premium para poder utilizar este comando.`
      );

      return null;
    }
    return user;
  } catch (error) {
    console.error("Error verificando membresía premium:", error);
    await infoPremium(
      totoro,
      msg,
      `> Hubo un error al verificar tu membresía premium. Por favor, inténtalo de nuevo más tarde.`
    );

    totoroLog.error(
      "./logs/utils/verifypremium.log",
      `Error verificando membresía premium: ${error}`
    );
    return null;
  }
}

module.exports = verifyPremium;
