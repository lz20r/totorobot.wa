const { DisconnectReason } = require("@whiskeysockets/baileys");
const { connectToTotoro } = require("../index");
const { Boom } = require("@hapi/boom");
const totoroLog = require("../functions/totoroLog");

module.exports = {
  name: "connection.update",

  async load(update) {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect.error instanceof Boom &&
        lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;

      totoroLog.error(
        "./logs/handlers/connection.log",
        `[CONNECTION] ${connection} ${lastDisconnect.error.message}`
      );
      if (shouldReconnect) {
        await connectToTotoro();
      }
    } else if (connection === "open") {
      totoroLog.info(
        "./logs/handlers/connection.log",
        `[CONNECTION] ${connection}`
      );
    }
  },
};