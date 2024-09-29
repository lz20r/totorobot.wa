const { sendWarning } = require("../../functions/messages");
const { totoEconomy, totoShop, totoInventory } = require("../../models");
const prefix = require("../../../settings.json").prefix;
const { Op } = require("sequelize");
const { cmdBlock } = require("../multimedia/youtube");

module.exports = {
  name: "shop",
  category: "totoEconomy",
  subcategory: "tienda",
  aliases: ["store", "tienda", "shop"],
  description:
    "Muestra la tienda de artículos donde puedes comprar usando totoCoins.",
  usage: `${prefix}shop [comprar <id>]`,
  cooldown: 5,
  economy: true,
  cmdBlock: true,
  
  execute: async (totoro, msg, args) => {
    try {
      const message = msg.messages[0];
      const remoteJid = message.key.remoteJid;
      const userId = message.key.participant; 
      const groupId = message.key.id;
      const groupInfo = await totoro.groupMetadata(groupId);
      const groupName = groupInfo.subject;        

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
          where: { phone: userId, groupId: groupId },
        });

        if (!economyRecord || economyRecord.balance < item.itemPrice) {
          economyRecord = await totoEconomy.create({
            groupId: groupId,            
            groupName: groupName,
            phone: userId,
            balance: 0,
          });
        } else if (economyRecord.balance < 0) {
          return sendWarning(
            totoro,
            msg,
            "¡Tu balance de totoCoins es negativo! Por favor, contacta a un administrador."
          );
        }

        economyRecord.balance -= item.itemPrice;
        await economyRecord.save();


        if (item.quantity > 0) {
          item.quantity -= 1;
          await item.save();
        }


        const inventoryRecord = await totoInventory.findOne({
          where: { userId: userId, productId: itemId },
        });

        if (inventoryRecord) {
          inventoryRecord.quantity += 1;
          await inventoryRecord.save();
        } else {
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
      return msg.reply(shopMessage);
    } catch (error){
        msg.reply(`${error.message} || Unknown`)
    }
  },
};
