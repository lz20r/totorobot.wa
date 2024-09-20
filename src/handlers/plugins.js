const { readdir } = require("fs/promises");
const totoroLog = require("../functions/totoroLog");

module.exports = async (totoro) => {
  try {
    const directory = await readdir("./src/plugins");
    let pluginCount = 0;

    for (const folder of directory) {
      const files = await readdir(`./src/plugins/${folder}`);

      for (const file of files) {
        const pluginPath = `../plugins/${folder}/${file}`;
        delete require.cache[require.resolve(pluginPath)];

        try {
          const plugin = require(pluginPath);
          if (plugin && plugin.name) {
            if (!totoro.plugins) {
              totoro.plugins = new Map();
            }
            totoro.plugins.set(plugin.name.toLowerCase(), plugin);
            pluginCount++;

            // Añadir aliases (si existen) al mapa de plugins
            if (plugin.aliases && Array.isArray(plugin.aliases)) {
              if (!totoro.aliases) {
                totoro.aliases = new Map();
              }
              for (const alias of plugin.aliases) {
                totoro.aliases.set(alias.toLowerCase(), plugin);
              }
            }
          } else {
            console.log(`Plugin no válido en ${pluginPath}`);
          }
        } catch (error) {
          console.error(`Error al cargar plugin en ${pluginPath}:`, error);
        }
      }
    }

    // Registrar en el log la cantidad de plugins cargados
    totoroLog.info(
      "./logs/handlers/plugins.log",
      `[PLUGINS] ${pluginCount} cargados.`
    );
  } catch (error) {
    console.error("Error al cargar plugins:", error);
    totoroLog.error(
      "./logs/handlers/plugins.log",
      `[ERROR] Error al cargar plugins: ${error.message}`
    );
  }
};
