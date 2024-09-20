const prefix = require("../../../settings.json").prefix;

module.exports = {
  name: "tictactoe",
  category: "totoEconomy",
  subcategory: "games",
  aliases: ["ttt", "tic-tac-toe", "tateti"],
  description: "Juega al Tic-Tac-Toe con emojis contra otro usuario.",
  usage: `${prefix}tictactoe <@usuario>`,
  cooldown: 5,
  economy: true,
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

      // Verificar si mencionaron a otro usuario para jugar
      if (args.length === 0 || !args[0].includes("@")) {
        return msg.reply({
          text: "Por favor, menciona a un usuario para desafiar al Tic-Tac-Toe.",
        });
      }

      const opponent = args[0].replace("@", "") + "@s.whatsapp.net";
      if (opponent === sender) {
        return msg.reply({
          text: "No puedes jugar contra ti mismo.",
        });
      }

      // Enviar un mensaje de desafío
      await totoro.sendMessage(remoteJid, {
        text: `@${sender.split("@")[0]} ha desafiado a @${
          opponent.split("@")[0]
        } a un juego de Tic-Tac-Toe. Responde con "acepto" o "rechazo".`,
        mentions: [sender, opponent],
      });

      const acceptChallenge = await waitForResponse(
        totoro,
        remoteJid,
        opponent
      );

      if (acceptChallenge.toLowerCase() !== "acepto") {
        return msg.reply({
          text: `@${opponent.split("@")[0]} ha rechazado el desafío.`,
          mentions: [opponent],
        });
      }

      // Iniciar el juego
      let board = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];
      let currentPlayer = sender;
      let winner = null;

      while (!winner) {
        // Mostrar tablero y de quién es el turno
        await totoro.sendMessage(remoteJid, {
          text: `${renderBoard(board)}\n\nEs el turno de @${
            currentPlayer === sender
              ? sender.split("@")[0]
              : opponent.split("@")[0]
          } (${currentPlayer === sender ? "❌" : "⭕"})`,
          mentions: [sender, opponent],
        });

        // Esperar la jugada del jugador actual
        const move = await waitForResponse(totoro, remoteJid, currentPlayer);

        if (isValidMove(move, board)) {
          board[move - 1] = currentPlayer === sender ? "❌" : "⭕";
        } else {
          await totoro.sendMessage(remoteJid, {
            text: "Movimiento inválido. Intenta de nuevo rápidamente.",
          });
          continue;
        }

        // Verificar si hay un ganador
        winner = checkWinner(board);

        if (!winner) {
          currentPlayer = currentPlayer === sender ? opponent : sender;
        }
      }

      // Mostrar el resultado del juego
      await totoro.sendMessage(remoteJid, {
        text:
          winner === "empate"
            ? "El juego terminó en empate."
            : `¡@${
                currentPlayer === sender
                  ? sender.split("@")[0]
                  : opponent.split("@")[0]
              } (${winner}) ha ganado el juego!`,
        mentions: [sender, opponent],
      });
    } catch (error) {
      msg.reply({
        text: `El usuario no respondió a tiempo`,
      });
    }
  },
};

// Función para esperar la respuesta del jugador
async function waitForResponse(totoro, remoteJid, player) {
  return new Promise((resolve, reject) => {
    const onMessage = async (msg) => {
      const newMessage = msg.messages[0];

      // Ignorar mensajes de sistema o mensajes sin texto
      if (newMessage.messageStubType || !newMessage.message) {
        return; // Ignorar este mensaje y continuar esperando
      }

      if (
        newMessage.key.remoteJid === remoteJid &&
        newMessage.key.participant === player
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
    }, 10000); // 10 segundos

    // Registrar listener de mensajes entrantes
    totoro.ev.on("messages.upsert", onMessage);
  });
}

// Renderizar el tablero con emojis
function renderBoard(board) {
  return `
    ${board[0]} | ${board[1]} | ${board[2]}
    ——————  
    ${board[3]} | ${board[4]} | ${board[5]}
    ——————  
    ${board[6]} | ${board[7]} | ${board[8]}
  `;
}

// Verificar si el movimiento es válido
function isValidMove(move, board) {
  const moveIndex = parseInt(move) - 1;
  return board[moveIndex] !== "❌" && board[moveIndex] !== "⭕" && !isNaN(move);
}

// Verificar si hay un ganador
function checkWinner(board) {
  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const combination of winningCombinations) {
    const [a, b, c] = combination;
    if (board[a] === board[b] && board[b] === board[c]) {
      return board[a] === "❌" ? "❌" : "⭕";
    }
  }

  if (board.every((cell) => cell === "❌" || cell === "⭕")) {
    return "empate";
  }

  return null;
}
