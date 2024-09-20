const prefix = require("../../../settings.json").prefix;
let partidas = {}; // Almacenará las partidas activas por grupo
const { help } = require("../../functions/messages");

module.exports = {
  name: "hundirbarco",
  category: "totoGames",
  subcategory: "games",
  aliases: ["battleship", "barcos", "hb"],
  description: "Juega a hundir el barco con más de dos usuarios.",
  usage: `${prefix}hundirbarco <@usuario1> <@usuario2> ...`,
  cooldown: 5,
  execute: async (totoro, msg, args) => {
    const remoteJid = msg.messages[0].key.remoteJid;

    // Si ya hay una partida en curso en este grupo
    if (partidas[remoteJid]) {
      return msg.reply({ text: "Ya hay una partida en curso en este grupo." });
    }

    // Verificar si mencionaron a otros usuarios
    if (args.length < 1 || args.length > 4) {
      help(
        totoro,
        msg,
        "hundirbarco",
        "Juega a hundir el barco con más de dos usuarios.",
        `${prefix}hundirbarco <@usuario1> <@usuario2> ...`
      );
    }

    // Inicializar la partida
    const jugadores = [
      msg.messages[0].key.participant,
      ...args.map((arg) => arg.replace("@", "") + "@s.whatsapp.net"),
    ];

    // Desafiar a los jugadores
    await totoro.sendMessage(remoteJid, {
      text: `@${msg.messages[0].key.participant.split("@")[0]} ha desafiado a ${jugadores
        .map((jugador) => `@${jugador.split("@")[0]}`)
        .join(", ")} a un juego de Hundir el Barco. Responde con "acepto" o "rechazo".`,
      mentions: jugadores,
    });

    // Esperar las respuestas de aceptación de los jugadores
    const aceptaciones = await Promise.all(
      jugadores.map((jugador) => esperarAceptacion(totoro, remoteJid, jugador))
    );

    // Si alguno de los jugadores rechaza o no responde, cancelar el juego
    if (aceptaciones.some((respuesta) => respuesta.toLowerCase() !== "acepto")) {
      await totoro.sendMessage(remoteJid, {
        text: "Al menos uno de los jugadores ha rechazado el desafío o no ha respondido. El juego no comenzará.",
        mentions: jugadores,
      });
      return;
    }

    // Si todos aceptan, comenzar el juego
    partidas[remoteJid] = {
      jugadores: jugadores,
      tableros: {},
      barcos: {},
      turnos: 0,
      enCurso: true,
    };

    // Mostrar reglas antes de comenzar el juego
    await mostrarReglas(totoro, remoteJid);

    // Comenzar la partida
    await comenzarPartida(totoro, msg, remoteJid);
  },
};

// Esperar aceptación o rechazo de los jugadores
async function esperarAceptacion(totoro, remoteJid, jugador) {
  try {
    const respuesta = await waitForResponse(totoro, remoteJid, jugador);
    return respuesta;
  } catch (error) {
    return "rechazo"; // Si el jugador no responde, se considera como rechazo
  }
}

// Comenzar la partida y gestionar la colocación de barcos
async function comenzarPartida(totoro, msg, remoteJid) {
  const partida = partidas[remoteJid];

  // Mostrar un tablero vacío para que los jugadores puedan visualizar dónde colocar sus barcos
  const tableroVacio = renderBoard(createEmptyBoard(8));
  for (const jugador of partida.jugadores) {
    await totoro.sendMessage(remoteJid, {
      text: `@${jugador.split("@")[0]}, este es tu tablero vacío. Coloca tus barcos usando las posiciones (ejemplo: A1 vertical, B2 horizontal, etc.).\n\n${tableroVacio}`,
      mentions: [jugador],
    });

    // Esperar colocación de barcos
    const barcosJugador = await obtenerBarcos(totoro, remoteJid, jugador);
    partida.barcos[jugador] = barcosJugador;
    partida.tableros[jugador] = createEmptyBoard(8); // Crear tablero vacío para el jugador
    placeShips(partida.tableros[jugador], barcosJugador); // Colocar barcos en el tablero
  }

  // Comenzar el ciclo del juego
  await cicloJuego(totoro, msg, remoteJid);
}

// Ciclo principal del juego
async function cicloJuego(totoro, msg, remoteJid) {
  const partida = partidas[remoteJid];

  while (partida.enCurso) {
    const jugadorActual =
      partida.jugadores[partida.turnos % partida.jugadores.length];

    await totoro.sendMessage(remoteJid, {
      text: `Es el turno de @${jugadorActual.split("@")[0]}. Escribe una posición para atacar o escribe "reglas" para ver las reglas del juego.`,
      mentions: [jugadorActual],
    });

    const respuesta = await waitForResponse(totoro, remoteJid, jugadorActual);

    // Si el jugador escribe "reglas", mostrar las reglas
    if (respuesta.toLowerCase() === "reglas") {
      await mostrarReglas(totoro, remoteJid);
      continue; // Seguir el ciclo sin avanzar el turno
    }

    // Procesar ataque si no es "reglas"
    const posicionAtaque = respuesta;
    for (const oponente of partida.jugadores) {
      if (oponente !== jugadorActual) {
        const resultado = processAttack(
          partida.tableros[oponente],
          posicionAtaque
        );

        await totoro.sendMessage(remoteJid, {
          text: `@${jugadorActual.split("@")[0]} atacó la posición ${posicionAtaque}: ${resultado}`,
          mentions: partida.jugadores,
        });

        if (checkGameOver(partida.tableros[oponente])) {
          await totoro.sendMessage(remoteJid, {
            text: `@${jugadorActual.split("@")[0]} ha ganado el juego de Hundir el Barco!`,
            mentions: partida.jugadores,
          });
          partida.enCurso = false;
          delete partidas[remoteJid]; // Eliminar la partida activa
          return;
        }
      }
    }

    partida.turnos++; // Cambiar de turno
  }
}

// Mostrar las reglas del juego
async function mostrarReglas(totoro, remoteJid) {
  const reglas = `
**Reglas de Hundir el Barco:**
1. Cada jugador coloca sus barcos de diferentes tamaños en su tablero.
2. Los barcos pueden colocarse horizontalmente, verticalmente o diagonalmente.
3. Los jugadores se turnan para atacar una posición en el tablero del oponente.
4. Si todos los barcos de un jugador son hundidos, pierde el juego.
5. Puedes usar el comando "reglas" en cualquier momento para ver las reglas durante el juego.
6. Para atacar, usa una posición válida (ejemplo: A1, B3, C5).
  `;
  await totoro.sendMessage(remoteJid, {
    text: reglas,
  });
}

// Obtener posiciones de barcos del jugador
async function obtenerBarcos(totoro, remoteJid, jugador) {
  const barcos = [];
  const tamaños = [5, 4, 3, 3, 2]; // Tamaños de barcos

  for (const tamaño of tamaños) {
    await totoro.sendMessage(remoteJid, {
      text: `@${jugador.split("@")[0]}, coloca un barco de tamaño ${tamaño}.`,
      mentions: [jugador],
    });

    const respuesta = await waitForResponse(totoro, remoteJid, jugador);
    const [posicionInicial, orientacion] = respuesta.split(" ");

    if (validarBarco(posicionInicial, orientacion, tamaño)) {
      barcos.push({ posicionInicial, orientacion, tamaño });
    } else {
      await totoro.sendMessage(remoteJid, {
        text: `Posición o orientación inválida. Intenta de nuevo.`,
        mentions: [jugador],
      });
    }
  }
  return barcos;
}

// Validar que el barco sea colocado correctamente
function validarBarco(posicionInicial, orientacion, tamaño) {
  const letras = "ABCDEFGH";
  const [letra, numero] = [posicionInicial[0], parseInt(posicionInicial[1])];
  const indexLetra = letras.indexOf(letra.toUpperCase());

  // Validar orientación y si cabe en el tablero
  if (orientacion === "horizontal" && indexLetra + tamaño <= 8) return true;
  if (orientacion === "vertical" && numero + tamaño <= 8) return true;
  if (
    orientacion === "diagonal" &&
    indexLetra + tamaño <= 8 &&
    numero + tamaño <= 8
  )
    return true;

  return false;
}

// Crear un tablero vacío
function createEmptyBoard(size) {
  return Array(size)
    .fill()
    .map(() => Array(size).fill("🌊"));
}

// Colocar barcos en el tablero
function placeShips(board, ships) {
  for (const ship of ships) {
    const [row, col] = parsePosition(ship.posicionInicial);
    if (ship.orientacion === "horizontal") {
      for (let i = 0; i < ship.tamaño; i++) board[row][col + i] = "🚢";
    } else if (ship.orientacion === "vertical") {
      for (let i = 0; i < ship.tamaño; i++) board[row + i][col] = "🚢";
    } else if (ship.orientacion === "diagonal") {
      for (let i = 0; i < ship.tamaño; i++) board[row + i][col + i] = "🚢";
    }
  }
}

// Procesar un ataque en el tablero
function processAttack(board, position) {
  const [row, col] = parsePosition(position);
  if (board[row][col] === "🚢") {
    board[row][col] = "💥";
    return "¡Tocado!";
  } else if (board[row][col] === "🌊") {
    board[row][col] = "❌";
    return "Agua.";
  } else {
    return "Ya has atacado esta posición.";
  }
}

// Verificar si todos los barcos han sido hundidos
function checkGameOver(board) {
  return board.every((row) => row.every((cell) => cell !== "🚢"));
}

// Convertir posiciones como "A1" en índices de la matriz
function parsePosition(position) {
  const letras = "ABCDEFGH";
  const row = letras.indexOf(position[0].toUpperCase());
  const col = parseInt(position[1]) - 1;
  return [row, col];
}

// Esperar respuesta de un jugador
async function waitForResponse(totoro, remoteJid, jugador) {
  return new Promise((resolve, reject) => {
    const onMessage = async (msg) => {
      const newMessage = msg.messages[0];
      if (
        newMessage.key.remoteJid === remoteJid &&
        newMessage.key.participant === jugador
      ) {
        let messageText = null;
        if (newMessage.message?.conversation) {
          messageText = newMessage.message.conversation;
        }
        if (messageText) {
          totoro.ev.off("messages.upsert", onMessage);
          clearTimeout(timeout);
          resolve(messageText);
        }
      }
    };

    const timeout = setTimeout(() => {
      totoro.ev.off("messages.upsert", onMessage);
      reject(
        new Error("Tiempo de espera agotado para la respuesta del jugador.")
      );
    }, 60000);

    totoro.ev.on("messages.upsert", onMessage);
  });
}
