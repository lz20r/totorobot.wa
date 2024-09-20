const { sendWarning } = require("../../functions/messages");
const { totoEconomy, totoShop, totoInventory } = require("../../models");
const prefix = require("../../../settings.json").prefix;
const { Op } = require("sequelize");

module.exports = {
  name: "shop",
  category: "totoEconomy",
  subcategory: "tienda",
  aliases: ["store", "tienda"],
  description:
    "Muestra la tienda de artículos donde puedes comprar usando totoCoins.",
  usage: `${prefix}shop [comprar <id>]`,
  cooldown: 5,
  economy: true,
  execute: async (totoro, msg, args) => {
    try {
      const message = msg.messages[0];
      const remoteJid = message.key.remoteJid;
      const userId = message.key.participant; // Identificador del usuario

      // Verificar si el mensaje proviene de un grupo
      if (!remoteJid.endsWith("@g.us")) {
        return msg.reply({
          text: "Este comando solo se puede usar en grupos.",
        });
      }

      // Si el comando es para comprar un artículo
      if (args[0] === "comprar") {
        const itemId = parseInt(args[1], 10);
        if (isNaN(itemId)) {
          return msg.reply({
            text: "Por favor, proporciona un ID de artículo válido para comprar.",
          });
        }

        // Buscar el artículo en la tienda
        const item = await totoShop.findOne({ where: { id: itemId } });

        if (!item) {
          return sendWarning(
            totoro,
            msg,
            "El artículo que intentas comprar no existe."
          );
        }

        // Verificar si el artículo está agotado
        if (item.quantity <= 0) {
          return sendWarning(totoro, msg, "Este artículo está agotado.");
        }

        // Buscar el balance del usuario en la economía
        const economyRecord = await totoEconomy.findOne({
          where: { phone: userId, groupId: remoteJid },
        });

        if (!economyRecord || economyRecord.balance < item.itemPrice) {
          return sendWarning(
            totoro,
            msg,
            "No tienes suficientes totoCoins para comprar este artículo."
          );
        }

        // Realizar la compra: descontar el precio del artículo del balance del usuario
        economyRecord.balance -= item.itemPrice;
        await economyRecord.save();

        // Descontar la cantidad del artículo si tiene un stock limitado
        if (item.quantity > 0) {
          item.quantity -= 1;
          await item.save();
        }

        // Añadir el artículo al inventario del usuario
        const inventoryRecord = await totoInventory.findOne({
          where: { userId: userId, productId: itemId },
        });

        if (inventoryRecord) {
          // Si el artículo ya está en el inventario, aumentar la cantidad
          inventoryRecord.quantity += 1;
          await inventoryRecord.save();
        } else {
          // Si el artículo no está en el inventario, agregar un nuevo registro
          await totoInventory.create({
            userId: userId,
            productId: itemId,
            quantity: 1,
          });
        }

        return sendWarning(
          totoro,
          msg,
          `¡Has comprado *${item.itemName}* por ${item.itemPrice} totoCoins!`
        );
      }

      // Mostrar la tienda
      const shopItems = await totoShop.findAll({
        where: {
          quantity: { [Op.gt]: 0 }, // Mostrar solo los artículos que tienen stock
        },
      });

      if (shopItems.length === 0) {
        return sendWarning(
          totoro,
          msg,
          `La tienda está vacía en este momento. ¡Vuelve más tarde!
          \n> Solo los administradores pueden agregar artículos usando ${prefix}addProduct.`
        );
      }

      // Formatear el mensaje de la tienda con solo categoría (sin subcategoría)
      let shopMessage = `╭── 🎁 *Tienda de Artículos* ────⬣\n`;
      shopMessage += `│\n`;
      shopItems.forEach((item, index) => {
        shopMessage += `│ 🔹 *${index + 1}. ${item.itemName}*\n`;
        shopMessage += `│    🆔 ID: ${item.id}\n`;
        shopMessage += `│    🏷️ Categoría: ${
          item.category || "No especificada"
        }\n`;
        shopMessage += `│    💰 Precio: ${item.itemPrice} totoCoins\n`;
        shopMessage += `│    📦 Stock: ${item.quantity} disponibles\n`;
        shopMessage += `│    📜 Descripción: ${
          item.description || "Sin descripción"
        }\n`;
        shopMessage += `│\n`;
        shopMessage += `├─────────────────────────────\n`;
      });
      shopMessage += `╰───⬣\n`;
      shopMessage += `🛍️ Usa \`!shop comprar <id>\` para adquirir un artículo.`;

      // Enviar el mensaje de la tienda
      return msg.reply({ text: shopMessage });
    } catch (error) {
      return msg.reply({
        text: "Hubo un error al mostrar la tienda. Inténtalo más tarde.",
      });
    }
  },
};
