// functions/incrementTotoCounter.js

const totoCounter = require("../models/totoCounter");
const totoroLog = require("./totoroLog");

async function incrementTotoCounter(totoUserId, pluginName) {
  try {
    const [counter, created] = await totoCounter.findOrCreate({
      where: { totoUserId, pluginName },
      defaults: { count: 0 },
    });

    counter.count += 1;
    await counter.save();

    totoroLog.info(
      "./logs/functions/totoCounter.log",
      `[COMMAND COUNTER] El comando '${pluginName}' ejecutado ${counter.count} veces por el usuario con ID ${totoUserId}.`
    );
  } catch (error) {
    totoroLog.error(
      "./logs/functions/totoCounter.log",
      `Error incrementando el contador para el comando '${pluginName}' y el usuario con ID ${totoUserId}: ${error.message}`
    );
  }
}

module.exports = incrementTotoCounter;
