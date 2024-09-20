const { totoInventory } = require("../../models");
const prefix = require("../../../settings.json").prefix;

module.exports = {
  name: "bag",
  category: "totoEconomy",
  subcategory: "inventory",
  aliases: ["inventory", "inventario", "mochila", "bolsa", "items", "bag"],
  description: "Muestra el inventario de un usuario.",
  usage: `${prefix}bag [página]`,
  cooldown: 5,
  economy: true,

  execute: async (totoro, msg, args) => {
    try {
      const message = msg.messages[0];
      const remoteJid = message.key.remoteJid;
      const sender = message.key.participant || message.key.remoteJid; // Identificador único del usuario

      // Verificar si el comando se usa en un grupo
      if (!remoteJid.endsWith("@g.us")) {
        return msg.reply({
          text: "Este comando solo se puede usar en grupos.",
        });
      }

      // Extraer el número del usuario sin el dominio
      const userWithoutDomain = sender.split("@")[0];

      // Obtener el inventario del usuario
      const userInventory = await totoInventory.findAll({
        where: { userPhone: userWithoutDomain }, // Buscar por el campo 'userPhone' definido en el modelo
      });

      // Verificar si el inventario está vacío
      if (userInventory.length === 0) {
        return msg.reply({
          text:
            `╭──⬣「 🎒 @${userWithoutDomain}'s Bag 」\n` +
            `│\n` +
            `│  📦 *Empty*\n` +
            `│\n` +
            `╰──⬣\n\n` +
            `> Puedes comprar artículos en la tienda con \`${prefix}shop\``,
          mentions: [sender],
        });
      }

      // Definir el número de artículos por página
      const itemsPerPage = 5;
      const totalPages = Math.ceil(userInventory.length / itemsPerPage);

      // Obtener la página solicitada (si no se proporciona, por defecto es la página 1)
      const page = args[0] ? parseInt(args[0], 10) : 1;

      // Validar que la página sea un número válido
      if (isNaN(page) || page < 1 || page > totalPages) {
        return msg.reply({
          text: `Por favor, ingresa un número de página válido (1-${totalPages}).`,
        });
      }

      // Calcular los límites de los items que se van a mostrar en la página actual
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const itemsOnPage = userInventory.slice(startIndex, endIndex);

      // Formatear el inventario en un mensaje
      let inventoryMessage = `╭───⬣ 「 *🎒 @${userWithoutDomain}' bag'* 」 ────⬣\n`;
      itemsOnPage.forEach((item, index) => {
        const orig = item.origin === "🛒" ? "🛒" : "⛏️";
        const origin =
          item.origin === "comprado" ? "🛒 Comprado" : "⛏️ Encontrado";
        inventoryMessage += ` │  ${orig} *${startIndex + index + 1}. ${
          item.itemName
        }*\n`;
        inventoryMessage += ` │      🆔 ID: ${item.itemId}\n`;
        inventoryMessage += ` │      💰 Precio: ${item.price} totoCoins\n`;
        inventoryMessage += ` │      📦 Cantidad: ${item.quantity}\n`;
        inventoryMessage += ` │      📜 Origen: ${origin}\n`; // Mostrar el origen del item
        inventoryMessage += ` │\n`;
      });
      inventoryMessage += `╰───────────────────⬣\n`;
      inventoryMessage += `Página ${page} de ${totalPages}\n`;
      inventoryMessage += `> Puedes comprar artículos en la tienda con \`${prefix}shop\`\n`;

      if (page < totalPages) {
        inventoryMessage += `Para ver la siguiente página, usa \`${prefix}bag ${
          page + 1
        }\``;
      }
      return msg.reply({ text: inventoryMessage, mentions: [sender] });
    } catch (error) {
      console.error(`Error en el comando 'bag': ${error.message}`);
      return msg.reply({ text: "Hubo un error al mostrar tu inventario." });
    }
  },
};
