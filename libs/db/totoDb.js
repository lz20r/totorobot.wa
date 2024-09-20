const { Sequelize } = require("sequelize");
require("dotenv").config();
const totoroLog = require("../../functions/totoroLog");

class TotoDB {
  constructor() {
    this.sequelize = new Sequelize(
      process.env.TOTORO_DATABASE, // Nombre de la base de datos
      process.env.TOTORO_USERNAME, // Nombre de usuario
      process.env.TOTORO_PASSWORD, // Contraseña
      {
        host: process.env.TOTORO_HOST, // Host
        port: process.env.TOTORO_PORT, // Puerto
        dialect: "mysql", // Especifica el dialecto aquí
        logging:
          `${process.env.TOTORO_LOGGING}` === "true" ? console.log : false,
      }
    );
  }

  async isConnected() {
    try {
      await this.sequelize.authenticate();
      totoroLog.info(
        "./logs/libs/totoDB.log",
        `[${process.env.TOTORO_DATABASE}] Conectado a la base de datos.`
      );
      return true;
    } catch (error) {
      totoroLog.error(
        "./logs/libs/totoDB.log",
        `[LIBS] ${process.env.TOTORO_DATABASE} Error al conectar a la base de datos: ${error.message}`
      );
      return false;
    }
  }
}

module.exports = TotoDB;
