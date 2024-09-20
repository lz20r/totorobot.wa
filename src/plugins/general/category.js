const { sendWarning } = require("../../functions/messages");

module.exports = {
  name: "category",
  description: "Muestra la ayuda de los comandos o las categorías solicitadas.",
  aliases: ["categoría", "categorias", "cat"],
  category: "general",
  subcategory: "information",
  usage: "category <categoría>",
  cooldown: 5,

  async execute(totoro, msg, args) {
    const info = msg.messages[0];
    const from = info.key.remoteJid;
    const prefix = totoro.prefix || "+";

    const reply = (text) => {
      totoro.sendMessage(from, { text: text }, { quoted: info });
    };

    // Obtener todas las categorías disponibles
    const categories = [
      ...new Set(totoro.plugins.map((plugin) => plugin.category)),
    ].filter(Boolean);

    // Si no se proporciona un argumento, mostrar la lista de categorías
    if (!args[0]) {
      let categoryListMessage = `╭─🪼 *${"categories"}* ─✧\n`;

      categories.forEach((category, index) => {
        categoryListMessage += `│ ➙ ${index + 1}. ${
          category.charAt(0).toUpperCase() + category.slice(1)
        }\n`;
      });
      categoryListMessage += `╰────────✧\n`;
      categoryListMessage += `\n> Ejemplo: ${prefix}category 1 `;

      return reply(categoryListMessage);
    }

    // Si se proporciona un número como argumento
    const categoryIndex = parseInt(args[0], 10) - 1;

    // Validar el número ingresado
    if (
      isNaN(categoryIndex) ||
      categoryIndex < 0 ||
      categoryIndex >= categories.length
    ) {
      return sendWarning(
        totoro,
        msg,
        "Selección inválida",
        "Por favor, ingresa un número válido correspondiente a una categoría."
      );
    }

    // Obtener la categoría seleccionada
    const selectedCategory = categories[categoryIndex].toLowerCase();

    // Filtrar por la categoría seleccionada
    const commandsInCategory = totoro.plugins.filter(
      (plugin) =>
        plugin.category && plugin.category.toLowerCase() === selectedCategory
    );

    if (commandsInCategory.size > 0) {
      let categoryMessage = `╭─🪼 *${
        selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)
      }* ─✧\n`;

      // Agrupar por subcategoría
      const subcategories = {};

      commandsInCategory.forEach((plugin) => {
        if (!subcategories[plugin.subcategory]) {
          subcategories[plugin.subcategory] = [];
        }
        subcategories[plugin.subcategory].push(plugin.name);
      });

      // Crear el mensaje agrupado y ordenado por subcategoría
      Object.keys(subcategories).forEach((subcategory) => {
        // Ordenar los comandos alfabéticamente
        subcategories[subcategory].sort();

        categoryMessage += `│ ➙ ${subcategory}\n`;
        subcategories[subcategory].forEach((command) => {
          categoryMessage += `│    » ${prefix}${command}\n`;
        });
      });

      categoryMessage += "╰────────✧";
      return reply(categoryMessage);
    } else {
      return sendWarning(
        totoro,
        msg,
        "Categoría no encontrada",
        `La categoría seleccionada no tiene comandos.`
      );
    }
  },
};
