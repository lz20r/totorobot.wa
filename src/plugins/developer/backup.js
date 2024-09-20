require("dotenv").config();
const path = require("path");
const fs = require("fs");
const { Sequelize } = require("sequelize");
const sqlite3 = require("sqlite3").verbose();
const totoroLog = require("../../functions/totoroLog");
const { sendError } = require("../../functions/messages");
const TotoDB = require("../../libs/db/totoDB");

module.exports = {
  name: "backup",
  category: "developer",
  subcategory: "system",
  description: "Realizar una copia de seguridad de la base de datos.",
  usage: "<backup>",

  async execute(totoro, msg) {
    const remoteJid = msg?.messages?.[0]?.key?.remoteJid;
    if (!remoteJid) {
      return;
    }

    const db = new TotoDB();

    try {
      const isConnected = await db.isConnected();
      if (!isConnected) {
        throw new Error("No se pudo conectar a la base de datos.");
      }

      const { username, password, database, host, port } = db.sequelize.config;

      await totoro.sendMessage(remoteJid, {
        text:
          `╭─⬣「 Totoro 」⬣\n` +
          `│  ≡◦  🍭 Realizando copia de seguridad de la base de datos...\n` +
          `╰─⬣\n` +
          `> Realizando copia de seguridad de la base de datos...`,
      });

      const backupDir = path.join(__dirname, "..", "..", "..", "database");
      const backupFile = path.join(backupDir, "totoroDB.sqlite");

      // Verificar y crear el directorio si no existe
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      // Eliminar el archivo de backup si ya existe
      if (fs.existsSync(backupFile)) {
        fs.unlinkSync(backupFile);
      }

      // Crear la base de datos SQLite
      const sqliteDb = new sqlite3.Database(backupFile);

      const sequelize = new Sequelize(database, username, password, {
        host: host,
        port: port,
        dialect: "mysql",
      });

      // Obtener todas las tablas
      const [tables] = await sequelize.query("SHOW TABLES");
      const tableNames = tables.map((table) => Object.values(table)[0]);

      for (const tableName of tableNames) {
        const [rows] = await sequelize.query(`SELECT * FROM ${tableName}`);
        if (rows.length > 0) {
          const columns = Object.keys(rows[0]);

          // Crear tabla en SQLite
          const createTableQuery = `
            CREATE TABLE IF NOT EXISTS ${tableName} (
              ${columns.map((col) => `\`${col}\` TEXT`).join(", ")}
            );
          `;
          await new Promise((resolve, reject) => {
            sqliteDb.run(createTableQuery, (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          });

          // Insertar datos en SQLite
          const insertQuery = `
            INSERT INTO ${tableName} (${columns.join(", ")})
            VALUES (${columns.map(() => "?").join(", ")});
          `;
          const stmt = sqliteDb.prepare(insertQuery);

          for (const row of rows) {
            const values = columns.map((col) =>
              row[col] === null ? null : row[col].toString()
            );
            await new Promise((resolve, reject) => {
              stmt.run(values, (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              });
            });
          }
          stmt.finalize();
        }
      }

      sqliteDb.close((err) => {
        if (err) {
          totoroLog.error(
            "./logs/plugins/developer/backup.log",
            `Error al cerrar la base de datos SQLite: ${err.message}`
          );
          sendError(
            totoro,
            msg,
            `Error al cerrar la base de datos SQLite: ${err.message}`
          );
          return;
        }

        totoro.sendMessage(remoteJid, {
          text:
            `╭─⬣「 Totoro 」⬣\n` +
            `│  ≡◦  🍭 Copia de seguridad de la base de datos realizada con éxito.\n` +
            `╰─⬣\n` +
            `> Copia de seguridad de la base de datos realizada con éxito.`,
        });
      });
    } catch (error) {
      totoroLog.error(
        "./logs/plugins/developer/backup.log",
        `Error al realizar la copia de seguridad de la base de datos: ${error.message}`
      );
      sendError(
        totoro,
        msg,
        `Error al realizar la copia de seguridad de la base de datos: ${error.message}`
      );
    }
  },
};
