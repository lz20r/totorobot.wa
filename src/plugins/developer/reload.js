const loadcomponents = require("../../handlers/components");
const loadplugins = require("../../handlers/plugins");
const totoroLog = require("../../functions/totoroLog");

module.exports = {
  name: "reload",
  category: "developer",
  subcategory: "owner",
  usage: "<reload>",
  aliases: ["recargar", "recarga", "rl", "r"],
  description: "Recarga los plugins",
  dev: true,

  async execute(totoro, msg, _) {
    totoro.plugins.clear();
    totoro.components.clear();

    msg.react("⏳");
    await loadplugins(totoro);
    await loadcomponents(totoro);
    if (!totoro.plugins.size && !totoro.components.size && totoro.events.size) {
      totoroLog.error(
        "./logs/plugins/developer/reload.log",
        "[PLUGINS] No se encontraron plugins."
      );
      msg.reply(
        `╭──⬣「 Recargado 」⬣\n` +
          `│  ≡◦ 🪼 Plugins\n` +
          `│  ≡◦ 🧩 Componentes\n` +
          `╰──⬣` +
          `>  No se encontraron:\n` +
          `>  ${totoro.plugins.size} Plugins\n` +
          `>  ${totoro.components.size} Componentes\n`
      );
    }
    msg.reply(
      `╭──⬣「 Totoro recargando 」⬣\n` +
        `│  ≡◦ 🪼 Plugins\n` +
        `│  ≡◦ 🧩 Componentes\n` +
        `╰──⬣\n` +
        `> ${totoro.plugins.size} Plugins recargados.\n` +
        `> ${totoro.components.size} Componentes recargados.`
    );
    await msg.react("🍭");
  },
};
