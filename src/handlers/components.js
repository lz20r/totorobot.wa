const { readdir } = require("fs/promises");
const totoroLog = require("../functions/totoroLog");
module.exports = async (totoro) => {
  const directory = await readdir("./src/components");

  for (const file of directory) {
    const component = require(`../components/${file}`);
    if (!component) continue;

    totoro.components.set(component.id, component);
  }
 
  totoroLog.info(
    "./logs/handlers/components.log",
    `[COMPONENTS] ${directory.length} cargados.`
  );
};
