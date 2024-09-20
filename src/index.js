const whatsapp = require("@whiskeysockets/baileys");
const discord = require("@discordjs/collection");
const pino = require("pino");
const fs = require("fs");
const path = require("path");

// Importar base de datos y sincronización
const totoDB = require("./libs/db/totoDB");
const syncTotoDB = require("./scripts/sync");
const totoroLog = require("./functions/totoroLog");

// Crear instancia de la base de datos y sincronización
const db = new totoDB();
const sync = new syncTotoDB();

// Función para conectar a WhatsApp y sincronizar la base de datos
async function connectToTotoro() {
  const authDir = path.join(__dirname, ".." , "auth", "Totoro-auth");
  const { state, saveCreds } = await whatsapp.useMultiFileAuthState(authDir);
  const Totoro = whatsapp.makeWASocket({
    logger: pino({ level: "silent" }),
    printQRInTerminal: true,
    auth: state,
  });
  Totoro.plugins = new discord.Collection();
  Totoro.components = new discord.Collection();
  Totoro.cooldonws = new discord.Collection();
  const folderPath = path.join(__dirname, "handlers");
  let folder;
  try {
    folder = await fs.promises.readdir(folderPath);
  } catch (err) {
    totoroLog.error(
      "./logs/handlers.log",
      `[HANDLERS] Error al leer la carpeta ${folderPath}: ${err}`
    );
    return;
  }

  for (const file of folder) {
    const handlerPath = path.join(folderPath, file);

    try {
      const handler = require(handlerPath);
      if (typeof handler === "function") {
        handler(Totoro);
      }
    } catch (err) {
      totoroLog.error(
        "./logs/handlers.log",
        `[HANDLERS] Error al cargar el archivo ${file}: ${err}`
      );
    }
  }
  Totoro.ev.on("creds.update", saveCreds);
  try {
    Totoro.config = require(path.join(__dirname, "..", "settings.json"));
  } catch (err) {
    totoroLog.error(
      "./logs/settings.log",
      "[SETTINGS] Error al cargar el archivo settings.json."
    );
  }
  try {
    await db.isConnected();
  } catch (err) {
    console.error("Error conectando a la base de datos:", err);
  }
  try {
    await sync.sync();
  } catch (err) {
    totoroLog.error(
      "./logs/sync.log",
      `[SYNC] Error sincronizando la base de datos: ${err}`
    );
  }
}
connectToTotoro()
  .then(() => {
    return;
  })
  .catch((err) => {
    totoroLog.error(
      "./logs/index.log",
      `[INDEX] Error al conectar a WhatsApp: ${err}`
    );
  });
module.exports = { connectToTotoro };
