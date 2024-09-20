const fs = require("fs");
const path = require("path");

const settingsPath = path.join(__dirname, "settings.json");

async function readSettings() {
  const settingsData = await fs.promises.readFile(settingsPath, "utf8");
  return JSON.parse(settingsData);
}

async function writeSettings(settings) {
  await fs.promises.writeFile(settingsPath, JSON.stringify(settings, null, 2));
}

async function addCmdBlock(cmdBlockValue) {
  const settings = await readSettings();

  // Inicializa cmdBlock si no existe
  if (!Array.isArray(settings.cmdBlock)) {
    settings.cmdBlock = [];
  }

  // Agrega el nuevo valor si no está ya presente
  if (!settings.cmdBlock.includes(cmdBlockValue)) {
    settings.cmdBlock.push(cmdBlockValue);
    await writeSettings(settings);
  }
}

module.exports = {
  addCmdBlock,
};
