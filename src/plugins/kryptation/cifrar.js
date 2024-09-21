const { sendError, sendWarning } = require("../../functions/messages");
const crypto = require("crypto");
const totoCifrar = require("../../models/totoCifrar");
const totoUser = require("../../models/totoUser.js");

module.exports = {
  name: "cifrar",
  category: "kryptation",
  subcategory: "cifrar",
  aliases: ["encriptar", "cf", "crypt"],
  description: "Cifra un mensaje con una clave secreta.",
  
  execute: async (totoro, msg, args) => {
    try {
      const message = msg.messages[0];
      const remoteJid = message.key.remoteJid;
      const sender = message.key.participant || message.key.remoteJid;

      // Obtener usuario desde la base de datos
      const tlfn = message.key.participant
        ? message.key.participant.split("@")[0]
        : message.key.remoteJID.split("@")[0];
      const user = await totoUser.findOne({ where: { phone: tlfn } });

      if (!user) {
        return msg.reply({
          text: "No estás registrado en el sistema. Por favor, regístrate primero.",
        });
      }

      const existingKey = (
        await totoCifrar.findOne({
          where: { userId: user.id },
        })
      )?.key;

      // Mostrar el menú interactivo adornado
      const menuMessage = `
✨ *Menú de Cifrado* ✨

🔑 1️⃣ *Generar Clave*: _Crea una nueva clave secreta._
   Ejemplo: *Escribe '1' o 'generar clave' para crear una clave nueva.*

🔒 2️⃣ *Cifrar Mensaje*: _Cifra un mensaje utilizando tu clave secreta._
   Ejemplo: *Escribe '2' o 'cifrar' para cifrar un mensaje con tu clave.*

🔓 3️⃣ *Descifrar Mensaje*: _Descifra un mensaje utilizando tu clave secreta._
   Ejemplo: *Escribe '3' o 'descifrar' seguido del mensaje cifrado.*

📜 4️⃣ *Obtener Clave*: _Obtén tu clave secreta actual._
   Ejemplo: *Escribe '4' o 'obtener clave' para ver tu clave actual.*

✍️ 5️⃣ *Importar Clave*: _Importa una clave secreta manualmente._
   Ejemplo: *Escribe '5' o 'importar clave' seguido de la clave a importar.*

❓ _Por favor, responde con el número o el nombre de la opción que deseas seleccionar._ Ejemplo: "1" o "generar clave"
__________________________
💡 _Tip: ¡Mantén tu clave en un lugar seguro!_
      `;

      await totoro.sendMessage(remoteJid, {
        text: menuMessage,
        mentions: [sender],
      });

      const selectedOption = await waitForUserResponse(totoro, remoteJid, sender);

      switch (selectedOption.trim()) {
        case "1":
        case "generar clave":
          await handleGenerateKey(totoro, remoteJid, sender, user);
          break;
        case "2":
        case "cifrar":
          await handleEncryptMessage(totoro, remoteJid, sender, existingKey);
          break;
				case "3":
				case "descifrar":
					await handleDecryptMessage(totoro, remoteJid, sender, existingKey);
					break;
        case "4":
        case "obtener clave":
          await handleGetKey(totoro, remoteJid, sender, existingKey);
          break;
        case "5":
        case "importar clave":
          await handleImportKey(totoro, remoteJid, sender, user);
          break;
        default:
          return msg.reply({
            text: "❗ Opción inválida. Por favor selecciona una opción válida del menú.",
            mentions: [sender],
          });
      }
    } catch (error) {
      console.error(`Error en el comando 'cifrar': ${error.message}`);
      return msg.reply({
        text: "El usuario no respondió a tiempo o ocurrió un error en el proceso.",
      });
    }
  },
};

// Función para manejar la generación de clave
async function handleGenerateKey(totoro, remoteJid, sender, user) {
  try {
    const newKey = crypto.randomBytes(32).toString("hex");

    // Actualizar o crear un nuevo registro de clave
    const [record, created] = await totoCifrar.upsert(
      {
        userId: user.id,
        key: newKey,
      },
      {
        where: { userId: user.id },
      }
    );

    return totoro.sendMessage(remoteJid, {
      text: `🔑 Se ha generado una nueva clave secreta: ${newKey}`,
    });
  } catch (error) {
    return totoro.sendMessage(remoteJid, {
      text: `Error al generar la clave: ${error.message}`,
    });
  }
}

// Función para manejar el cifrado de un mensaje
async function handleEncryptMessage(totoro, remoteJid, sender, key) {
  try {
    if (!key) {
      return totoro.sendMessage(remoteJid, {
        text: "No tienes una clave generada. Por favor, genera una clave primero.",
      });
    }

    const messageToEncrypt = await promptUser(
      totoro,
      remoteJid,
      sender,
      "🔒 Por favor, ingresa el mensaje que deseas cifrar:"
    );

    const encryptedMessage = encryptText(messageToEncrypt, key);

    return totoro.sendMessage(remoteJid, {
      text: `🔒 Mensaje cifrado: ${encryptedMessage}`,
    });
  } catch (error) {
    return totoro.sendMessage(remoteJid, {
      text: `Error al cifrar el mensaje: ${error.message}`,
    });
  }
}

// Función para importar una clave manualmente
async function handleImportKey(totoro, remoteJid, sender, user) {
  try {
    const importedKey = await promptUser(
      totoro,
      remoteJid,
      sender,
      "✍️ Por favor, ingresa la clave que deseas importar:"
    );

    // solo actualiza la clave si ya existe
		const [record] = await totoCifrar.upsert(
			{
				userId: user.id,
				key: importedKey,
			},
			{
				where: { userId: user.id },
			}
		);

		record.key = importedKey;
		await record && record.save();


    return totoro.sendMessage(remoteJid, {
      text: `🔑 Clave importada exitosamente: ${importedKey}`,
    });
  } catch (error) {
    return totoro.sendMessage(remoteJid, {
      text: `Error al importar la clave: ${error.message}`,
    });
  }
}

// Función para manejar el descifrado de un mensaje
async function handleDecryptMessage(totoro, remoteJid, sender, existingKey) {
  try {
    let keyToUse = existingKey;
    
    if (existingKey) {
      // Preguntar al usuario si quiere usar la clave existente o importar una nueva
      const keyOption = await promptUser(
        totoro,
        remoteJid,
        sender,
        "🔑 Tienes una clave guardada. ¿Deseas usarla o importar una nueva?\n\nResponde con 'usar' para usar la clave guardada o 'importar' para ingresar una nueva clave:"
      );

      if (keyOption.trim().toLowerCase() === "importar") {
        // El usuario ha elegido importar una nueva clave
        keyToUse = await promptUser(
          totoro,
          remoteJid,
          sender,
          "✍️ Por favor, ingresa la clave que deseas usar para descifrar el mensaje:"
        );
      }
    } else {
      // No hay clave existente, forzar la importación de una nueva clave
      keyToUse = await promptUser(
        totoro,
        remoteJid,
        sender,
        "🔑 No tienes una clave guardada. Por favor, ingresa la clave que deseas usar para descifrar el mensaje:"
      );
    }

    if (!keyToUse) {
      return totoro.sendMessage(remoteJid, {
        text: "No has ingresado ninguna clave. No se puede descifrar el mensaje.",
      });
    }

    const messageToDecrypt = await promptUser(
      totoro,
      remoteJid,
      sender,
      "🔓 Por favor, ingresa el mensaje cifrado que deseas descifrar:"
    );

    const decryptedMessage = decryptText(messageToDecrypt, keyToUse);

    return totoro.sendMessage(remoteJid, {
      text: `🔓 Mensaje descifrado: ${decryptedMessage}`,
    });
  } catch (error) {
    return totoro.sendMessage(remoteJid, {
      text: `Error al descifrar el mensaje: ${error.message}`,
    });
  }
}


async function handleGetKey(totoro, remoteJid, sender, existingKey) {
  try {
    if (!existingKey) {
      return await totoro.sendMessage(remoteJid, {
        text: "❌ No tienes una clave generada. Por favor, genera una clave primero.",
        mentions: [sender], // Para mencionar al usuario si es necesario
      });
    }

    return await totoro.sendMessage(remoteJid, {
      text: `🔑 Tu clave secreta actual es: ${existingKey}`,
      mentions: [sender], // Para mencionar al usuario si es necesario
    });
  } catch (error) {
    // Manejar cualquier error que ocurra en el proceso
    return await totoro.sendMessage(remoteJid, {
      text: `❗ Ocurrió un error al obtener tu clave: ${error.message}`,
      mentions: [sender], // Para mencionar al usuario si es necesario
    });
  }
}

// Función para importar una clave manualmente
async function handleImportKey(totoro, remoteJid, sender, user) {
  try {
    const importedKey = await promptUser(
      totoro,
      remoteJid,
      sender,
      "✍️ Por favor, ingresa la clave que deseas importar:"
    );

    await totoCifrar.upsert({
      userId: user.id,
      key: importedKey,
    });

    return totoro.sendMessage(remoteJid, {
      text: `🔑 Clave importada exitosamente: ${importedKey}`,
    });
  } catch (error) {
    return totoro.sendMessage(remoteJid, {
      text: `Error al importar la clave: ${error.message}`,
    });
  }
}

// Función para cifrar texto
function encryptText(text, key) {
  const algorithm = "aes-256-cbc";
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, "hex"), iv);
  let encrypted = cipher.update(text, "utf-8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

// Función para descifrar texto
function decryptText(text, key) {
  const algorithm = "aes-256-cbc";
  const textParts = text.split(":");
  const iv = Buffer.from(textParts.shift(), "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key, "hex"), iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
}

// Función para solicitar respuestas del usuario
async function promptUser(totoro, remoteJid, sender, promptText) {
  await totoro.sendMessage(
    remoteJid,
    { text: promptText }
  );
  return await waitForUserResponse(totoro, remoteJid, sender);
}

// Función mejorada para esperar la respuesta del usuario
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