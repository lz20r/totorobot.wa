const { parsePhoneNumberFromString } = require("libphonenumber-js");
const paises = require("../../data/paises");

function countryNumber(phoneNumber) {
  if (!phoneNumber) return "Desconocido";

  const extract = parsePhoneNumberFromString("+" + phoneNumber);

  return paises[extract?.countryCallingCode] || "Desconocido";
}

module.exports = countryNumber;
