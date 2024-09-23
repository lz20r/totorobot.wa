const { sendWarning } = require("../../functions/messages");
const { generateWAMessageFromContent, proto } = require("@whiskeysockets/baileys");
const dev = require("../../../settings.json").dev[0];
const prefix = require("../../../settings.json").prefix;

module.exports = {
  name: "category",
  description: "Muestra la ayuda de los comandos o las categorías solicitadas.",
  aliases: ["categoría", "categorias", "cat"],
  category: "general",
  subcategory: "information",
  usage: `${prefix}category <número>`,
  cooldown: 5,

  async execute(totoro, msg, args) {
    const info = msg.messages[0];
    const from = info.key.remoteJid;

    const reply = (text) => {
      totoro.sendMessage(from, { text: text }, { quoted: info });
    };

    // Obtener todas las categorías disponibles
    const categories = [
      ...new Set(totoro.plugins.map((plugin) => plugin.category)),
    ].filter(Boolean);

    // Si no se proporciona un argumento, mostrar la lista de categorías
    if (!args[0]) {
      let categoryListMessage = `╭─🪼 *${"Categorías disponibles"}* ─✧\n`;

      categories.forEach((category, index) => {
        categoryListMessage += `│ ➙ ${index + 1}. ${category.charAt(0).toUpperCase() + category.slice(1)}\n`;
      });

      categoryListMessage += `╰────────✧\n`; 

      // Crear el texto del mensaje con forward y mención
      const txt = `> Ejemplo: ${prefix}category 1`;
      const messageContent = {
        extendedTextMessage: {
          text: categoryListMessage + txt,
          contextInfo: {
            mentionedJid: [dev], // Añadir el JID del owner a las menciones
            isForwarded: true,  // Indicar que es un mensaje reenviado
            forwardingScore: 1, // Especificar que ha sido reenviado
            isForwardedMessage: true, // Marcar como mensaje reenviado
            forwardedNewsletterMessageInfo: {
              newsletterJid: "120363322372961284@newsletter", // ID del canal de Totoro 🪼
              newsletterName: "Canal de Totoro 🪼", // Nombre del canal
              serverMessageId: -1, // ID del mensaje original (si es necesario)
            },
          },
        },
      };

      const protoMessage = proto.Message.fromObject(messageContent);
      const message = generateWAMessageFromContent(from, protoMessage, {
        quoted: msg.messages[0],  // Referenciar el mensaje original
      });

      // Enviar el mensaje reenviado con la lista de categorías
      await totoro.relayMessage(from, message.message, {
        messageId: message.key.id,
      });

      return;
    }

    // Si se proporciona un número como argumento
    const categoryIndex = parseInt(args[0], 10) - 1;

    // Validar el número ingresado
    if (isNaN(categoryIndex) || categoryIndex < 0 || categoryIndex >= categories.length) {
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

    // **Ahora procesamos los comandos en la categoría seleccionada**
    if (commandsInCategory.length > 0) {
      let categoryMessage = `╭─🪼 *${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}* ─✧\n`;

      // Agrupar por subcategoría
      const subcategories = {};

      commandsInCategory.forEach((plugin) => {
        if (!subcategories[plugin.subcategory]) {
          subcategories[plugin.subcategory] = [];
        }
        subcategories[plugin.subcategory].push(plugin);
      });

      // Crear el mensaje agrupado y ordenado por subcategoría
      Object.keys(subcategories).forEach((subcategory) => {
        subcategories[subcategory].sort((a, b) => a.name.localeCompare(b.name));

        categoryMessage += `│ ➙ ${subcategory}\n`;
        subcategories[subcategory].forEach((plugin) => {
          categoryMessage += `│    » \`${prefix}${plugin.name}\` - ${plugin.description}\n`;
        });
      });

      categoryMessage += "╰────────✧";

      // Crear el mensaje reenviado con los comandos de la categoría seleccionada
      const txt = "Estos son los comandos disponibles en la categoría seleccionada.";
      const messageContent = {
        extendedTextMessage: {
          text: categoryMessage + txt,
          contextInfo: {
            mentionedJid: [dev], // Añadir el JID del owner a las menciones
            isForwarded: true,  // Indicar que es un mensaje reenviado
            forwardingScore: 1, // Especificar que ha sido reenviado
            isForwardedMessage: true, // Marcar como mensaje reenviado
            forwardedNewsletterMessageInfo: {
              newsletterJid: "120363322372961284@newsletter", // ID del canal de Totoro 🪼
              newsletterName: "Canal de Totoro 🪼", // Nombre del canal
              serverMessageId: -1, // ID del mensaje original (si es necesario)
            },
          },
        },
      };

      const protoMessage = proto.Message.fromObject(messageContent);
      const message = generateWAMessageFromContent(from, protoMessage, {
        quoted: msg.messages[0],  // Referenciar el mensaje original
      });

      // Enviar el mensaje reenviado con los comandos de la categoría seleccionada
      await totoro.relayMessage(from, message.message, {
        messageId: message.key.id,
      });
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