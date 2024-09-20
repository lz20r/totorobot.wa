const { totoShop, reusableIds } = require("../../models");
const prefix = require("../../../settings.json").prefix;

module.exports = {
  name: "manageproduct",
  category: "totoEconomy",
  subcategory: "admin",
  aliases: ["addproduct", "editproduct", "deleteproduct"],
  description: "Gestionar productos de la tienda (agregar, editar, eliminar).",
  usage: `${prefix}manageproduct`,
  cooldown: 5,
  economy: true,
  cdmBlock: true,
  execute: async (totoro, msg, args) => {
    try {
      const message = msg.messages[0];
      const remoteJid = message.key.remoteJid;
      const sender = message.key.participant;

      // Verificar si el comando se usa en un grupo
      if (!remoteJid.endsWith("@g.us")) {
        return msg.reply({
          text: "Este comando solo se puede usar en grupos.",
        });
      }

      // Verificar si el usuario es administrador
      const groupInfo = await totoro.groupMetadata(remoteJid);
      const admins = groupInfo.participants.filter((member) => member.admin);
      const isAdmin = admins.some((admin) => admin.id === sender);

      if (!isAdmin) {
        return msg.reply({
          text: "Solo los administradores pueden gestionar productos.",
        });
      }

      // Mostrar el menú interactivo
      await totoro.sendMessage(remoteJid, {
        text: `*Gestión de Productos:*\n1. Agregar Producto\n2. Editar Producto\n3. Eliminar Producto\nPor favor, responde con el número de la opción que deseas:`,
      });

      const seleccion = await waitForUserResponse(totoro, remoteJid, sender);

      switch (seleccion.trim()) {
        case "1":
          await handleAddProduct(totoro, remoteJid, sender, message);
          break;
        case "2":
          await handleEditProductFlow(totoro, remoteJid, sender, message);
          break;
        case "3":
          await handleDeleteProductFlow(totoro, remoteJid, sender, message);
          break;
        default:
          return msg.reply({
            text: "Selección inválida. Por favor, intenta de nuevo.",
          });
      }
    } catch (error) {
      console.error(`Error en el comando 'manageproduct': ${error.message}`);
      return msg.reply({
        text: "Hubo un error al gestionar el producto. Inténtalo más tarde.",
      });
    }
  },
};

// Flujo para agregar un producto
async function handleAddProduct(totoro, remoteJid, sender, message) {
  try {
    // Solicitar nombre, precio, cantidad, categoría y descripción
    const nombreRespuesta = await promptUser(
      totoro,
      remoteJid,
      sender,
      message,
      "Ingresa el *nombre* del producto:"
    );
    if (!nombreRespuesta) throw new Error("Nombre inválido.");

    const precioRespuesta = await promptUser(
      totoro,
      remoteJid,
      sender,
      message,
      "Ingresa el *precio* del producto:"
    );
    const itemPrice = parseFloat(precioRespuesta);
    if (isNaN(itemPrice) || itemPrice <= 0) throw new Error("Precio inválido.");

    const cantidadRespuesta = await promptUser(
      totoro,
      remoteJid,
      sender,
      message,
      "Ingresa la *cantidad* del producto:"
    );
    const quantity = parseInt(cantidadRespuesta);
    if (isNaN(quantity) || quantity < 0) throw new Error("Cantidad inválida.");

    const categoriaRespuesta = await promptUser(
      totoro,
      remoteJid,
      sender,
      message,
      "Ingresa la *categoría* del producto:"
    );
    if (!categoriaRespuesta) throw new Error("Categoría inválida.");

    const descripcionRespuesta = await promptUser(
      totoro,
      remoteJid,
      sender,
      message,
      "Ingresa la *descripción* (opcional, escribe 'no' para omitir):"
    );
    const description =
      descripcionRespuesta.toLowerCase() === "no"
        ? "Sin descripción"
        : descripcionRespuesta;

    // Buscar si hay IDs reutilizables
    const reusableId = await reusableIds.findOne();
    let productId;
    if (reusableId) {
      productId = reusableId.id; // Reutiliza el ID eliminado
      await reusableId.destroy(); // Elimina el registro del ID reutilizado
    } else {
      const lastProduct = await totoShop.findOne({ order: [["id", "DESC"]] });
      productId = lastProduct ? lastProduct.id + 1 : 1;
    }

    // Crear el producto en la base de datos
    await totoShop.create({
      id: productId,
      itemName: nombreRespuesta,
      category: categoriaRespuesta,
      itemPrice: itemPrice,
      quantity: quantity,
      description: description,
    });

    return totoro.sendMessage(remoteJid, {
      text: `Producto *${nombreRespuesta}* agregado con ID ${productId}, precio ${itemPrice} totoCoins, cantidad ${quantity}, categoría: ${categoriaRespuesta}, descripción: ${description}.`,
    });
  } catch (error) {
    return totoro.sendMessage(remoteJid, {
      text: `Error al agregar el producto: ${error.message}`,
    });
  }
}

// Flujo para editar un producto
async function handleEditProductFlow(totoro, remoteJid, sender, message) {
  try {
    const productId = await promptUser(
      totoro,
      remoteJid,
      sender,
      message,
      "Por favor, ingresa el *ID* del producto que deseas editar:"
    );
    await handleEditProduct(totoro, remoteJid, sender, message, productId);
  } catch (error) {
    return totoro.sendMessage(remoteJid, {
      text: `Error al editar el producto: ${error.message}`,
    });
  }
}

// Función para editar un producto
async function handleEditProduct(
  totoro,
  remoteJid,
  sender,
  message,
  productId
) {
  const product = await totoShop.findByPk(productId);
  if (!product) {
    return totoro.sendMessage(remoteJid, {
      text: `Producto con ID ${productId} no encontrado.`,
    });
  }

  const nuevoPrecio = await promptUser(
    totoro,
    remoteJid,
    sender,
    message,
    "Ingresa el nuevo *precio* del producto:"
  );
  const itemPrice = parseFloat(nuevoPrecio);
  if (isNaN(itemPrice) || itemPrice <= 0) throw new Error("Precio inválido.");

  const nuevaCantidad = await promptUser(
    totoro,
    remoteJid,
    sender,
    message,
    "Ingresa la nueva *cantidad* disponible:"
  );
  const quantity = parseInt(nuevaCantidad);
  if (isNaN(quantity) || quantity < 0) throw new Error("Cantidad inválida.");

  const nuevaCategoria = await promptUser(
    totoro,
    remoteJid,
    sender,
    message,
    "Ingresa la nueva *categoría* del producto:"
  );
  if (!nuevaCategoria) throw new Error("Categoría inválida.");

  const nuevaDescripcion = await promptUser(
    totoro,
    remoteJid,
    sender,
    message,
    "Ingresa la nueva *descripción* del producto (opcional, escribe 'no' para omitir):"
  );
  const description =
    nuevaDescripcion.toLowerCase() === "no"
      ? product.description
      : nuevaDescripcion;

  // Actualizar el producto en la base de datos
  await product.update({
    itemPrice: itemPrice,
    quantity: quantity,
    category: nuevaCategoria,
    description: description,
  });

  return totoro.sendMessage(remoteJid, {
    text: `Producto con ID ${productId} actualizado. Nuevo precio: ${itemPrice}, nueva cantidad: ${quantity}, nueva categoría: ${nuevaCategoria}, nueva descripción: ${description}.`,
  });
}

// Flujo para eliminar un producto
async function handleDeleteProductFlow(totoro, remoteJid, sender, message) {
  try {
    const productId = await promptUser(
      totoro,
      remoteJid,
      sender,
      message,
      "Por favor, ingresa el *ID* del producto que deseas eliminar:"
    );
    await handleDeleteProduct(totoro, remoteJid, sender, message, productId);
  } catch (error) {
    return totoro.sendMessage(remoteJid, {
      text: `Error al eliminar el producto: ${error.message}`,
    });
  }
}

// Función para eliminar un producto
async function handleDeleteProduct(
  totoro,
  remoteJid,
  sender,
  message,
  productId
) {
  const product = await totoShop.findByPk(productId);
  if (!product) {
    return totoro.sendMessage(remoteJid, {
      text: `Producto con ID ${productId} no encontrado.`,
    });
  }

  await product.destroy();
  await reusableIds.create({ id: productId }); // Almacenar el ID eliminado

  return totoro.sendMessage(remoteJid, {
    text: `Producto con ID ${productId} eliminado.`,
  });
}

// Función para esperar la respuesta del usuario
async function promptUser(totoro, remoteJid, sender, message, promptText) {
  await totoro.sendMessage(
    remoteJid,
    { text: promptText },
    { quoted: message }
  );
  return await waitForUserResponse(totoro, remoteJid, sender);
}

// Función para esperar la respuesta del usuario mejorada

async function waitForUserResponse(totoro, remoteJid, sender) {
  return new Promise((resolve, reject) => {
    const onMessage = async (msg) => {
      const newMessage = msg.messages[0];

      // Ignorar mensajes de sistema o mensajes sin texto
      if (newMessage.messageStubType || !newMessage.message) {
        return; // Ignorar este mensaje y continuar esperando
      }

      if (
        newMessage.key.remoteJid === remoteJid &&
        newMessage.key.participant === sender
      ) {
        let messageText = null;

        try {
          // Capturar texto en mensajes efímeros
          if (
            newMessage.message?.ephemeralMessage?.message?.extendedTextMessage
              ?.text
          ) {
            messageText =
              newMessage.message.ephemeralMessage.message.extendedTextMessage
                .text;
          }
          // Capturar texto normal
          else if (newMessage.message?.conversation) {
            messageText = newMessage.message.conversation;
          } else if (newMessage.message?.extendedTextMessage?.text) {
            messageText = newMessage.message.extendedTextMessage.text;
          } else if (newMessage.message?.imageMessage?.caption) {
            messageText = newMessage.message.imageMessage.caption;
          } else if (newMessage.message?.videoMessage?.caption) {
            messageText = newMessage.message.videoMessage.caption;
          } else if (
            newMessage.message?.buttonsResponseMessage?.selectedButtonId
          ) {
            messageText =
              newMessage.message.buttonsResponseMessage.selectedButtonId;
          } else if (
            newMessage.message?.listResponseMessage?.singleSelectReply
              ?.selectedRowId
          ) {
            messageText =
              newMessage.message.listResponseMessage.singleSelectReply
                .selectedRowId;
          }

          // Verificar si se extrajo texto
          if (messageText) {
            totoro.ev.off("messages.upsert", onMessage); // Remover listener
            clearTimeout(timeout); // Limpiar timeout
            resolve(messageText);
          } else {
            throw new Error("El mensaje no contiene texto válido.");
          }
        } catch (error) {
          totoro.ev.off("messages.upsert", onMessage); // Remover listener en caso de error
          clearTimeout(timeout); // Limpiar timeout
          reject(
            new Error(`Error capturando texto del mensaje: ${error.message}`)
          );
        }
      }
    };

    // Timeout para esperar la respuesta del usuario
    const timeout = setTimeout(() => {
      totoro.ev.off("messages.upsert", onMessage); // Remover listener cuando tiempo expira
      reject(
        new Error("Tiempo de espera agotado para la respuesta del usuario.")
      );
    }, 30000); // 10 segundos

    // Registrar listener de mensajes entrantes
    totoro.ev.on("messages.upsert", onMessage);
  });
}
