const { totoShop, totoInventory } = require("../models");

async function comprarItem(userPhone, itemId, itemName, customItem = false) {
  try {
    let item;

    // Si el item es personalizado (no está en el shop)
    if (customItem) {
      // Crear un objeto de item personalizado
      item = {
        id: itemId, // Asignamos el id proporcionado
        itemName: itemName,
        quantity: 1, // Siempre 1 ya que es un item personalizado
      };
    } else {
      // Buscar el artículo en el shop
      item = await totoShop.findOne({
        where: { id: itemId },
      });

      if (!item) {
        return {
          success: false,
          message: "El artículo no existe en la tienda.",
        };
      }

      // Verificar si el artículo tiene stock
      if (item.quantity <= 0) {
        return { success: false, message: "El artículo está agotado." };
      }

      // Reducir la cantidad disponible en la tienda
      item.quantity -= 1;
      await item.save();
    }

    // Verificar si el usuario ya tiene el artículo en su inventario
    let inventoryItem = await totoInventory.findOne({
      where: { userPhone: userPhone, itemId: item.id },
    });

    if (!inventoryItem) {
      // Si no tiene el artículo, lo añadimos por primera vez al inventario
      await totoInventory.create({
        userPhone: userPhone,
        itemId: item.id,
        itemName: item.itemName,
        quantity: 1,
      });
    } else {
      // Si ya tiene el artículo, simplemente incrementamos la cantidad
      inventoryItem.quantity += 1;
      await inventoryItem.save();
    }

    return {
      success: true,
      message: `Has comprado o recibido ${item.itemName}.`,
    };
  } catch (error) {
    console.error("Error en la compra:", error);
    return {
      success: false,
      message: "Error en la compra. Intenta nuevamente.",
    };
  }
}

module.exports = comprarItem;
