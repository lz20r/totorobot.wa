const { readdir } = require("fs/promises");
const totoroLog = require("../functions/totoroLog");

module.exports = async (totoro) => {
  const folder = await readdir("./src/events");

  for (const file of folder) {
    const event = require(`../events/${file}`);

    totoro.ev.on(event.name, (...args) => {
      event.load(...args, totoro);
    });
  }

  totoroLog.info(
    "./logs/handlers/events.log",
    `[EVENTS] ${folder.length} cargados.`
  );
};
