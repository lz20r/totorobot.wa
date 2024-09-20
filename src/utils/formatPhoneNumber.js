const { parsePhoneNumberFromString } = require("libphonenumber-js");

module.exports = function formatPhoneNumber(phone) {
  const phoneNumber = parsePhoneNumberFromString(phone);

  if (phoneNumber) {
    // Formatear el número de teléfono en formato internacional
    return phoneNumber.formatInternational();
  }

  return phone; // Devuelve el número original si no se puede formatear
};
