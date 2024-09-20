const totoUser = require("../models/totoUser");
const totoroLog = require("../functions/totoroLog");

async function registerTotoUser(phone, nombre, edad, serialNumber, country) {
  try {
    // Crear un nuevo usuario en la base de datos con los datos proporcionados
    const user = await totoUser.create({
      phone: phone,
      name: nombre,
      age: edad,
      serialNumber: serialNumber,
      country: country,
      status: "whitelist", // Añadir a la lista blanca por defecto
    });

    // Retornar el usuario creado
    return user;
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      // Registrar el error de restricción única
      totoroLog.error(
        "./logs/functions/registerTotoUser.log",
        `Error de restricción única al registrar usuario: ${error}`
      );
      throw new Error("Este número de teléfono ya está registrado.");
    } else {
      // Registrar otros errores
      console.error(error);
      throw error;
    }
  }
}

module.exports = registerTotoUser;
