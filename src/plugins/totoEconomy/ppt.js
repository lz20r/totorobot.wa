const userState = {}; // Mover userState fuera de la función execute

module.exports = {
  name: "pptls",
  aliases: ["ppt"],
  category: "totoEconomy",
  subcategory: "games",
  description:
    "Juega a Piedra, Papel, Tijera, Lagarto, Codo, Cabeza, Lápiz, Agua o Comodín con Momo y gana totoCoins",
  usage:
    "pptls <fácil|medio|difícil> <piedra|papel|tijera|lagarto|codo|cabeza|lápiz|agua|comodín>",
  cooldown: 5,
  economy: true,

  async execute(totoro, msg, args) {
    const { totoEconomy } = require("../../models"); // Importar el modelo de economía

    const info = msg.messages[0];
    const from = info.key.remoteJid;
    const isGroup = info.key.remoteJid.endsWith("@g.us");
    const sender = isGroup ? info.key.participant : info.key.remoteJid;
    const user = sender;

    // Verificar si el comando se ejecuta en un grupo
    if (!isGroup) {
      return reply("Este comando solo puede ser usado en grupos.");
    }

    const fixedWinAmount = 5000; // Cantidad fija de monedas ganadas o perdidas

    const reply = (text) => {
      totoro.sendMessage(from, { text: text }, { quoted: info });
    };

    if (!userState[user]) {
      if (
        !args[0] ||
        !["fácil", "medio", "difícil"].includes(args[0].toLowerCase())
      ) {
        return reply(
          "*Por favor, elige un nivel de dificultad: fácil, medio, difícil.*"
        );
      } else {
        userState[user] = { difficulty: args[0].toLowerCase() };
        return reply(
          `*Has seleccionado el nivel de dificultad ${args[0].toLowerCase()}. Ahora elige tu jugada: piedra, papel, tijera, lagarto, codo, cabeza, lápiz, agua o comodín.*`
        );
      }
    } else {
      const difficulty = userState[user].difficulty;
      const playerChoice = args[0]?.toLowerCase();

      if (!playerChoice) {
        return reply(
          "*Por favor, elige tu jugada: piedra, papel, tijera, lagarto, codo, cabeza, lápiz, agua o comodín.*"
        );
      }

      const choices = {
        piedra: { emoji: "🪨", price: 1000 },
        papel: { emoji: "📄", price: 1500 },
        tijera: { emoji: "✂️", price: 2000 },
        lagarto: { emoji: "🦎", price: 2500 },
        codo: { emoji: "💪", price: 3000 },
        cabeza: { emoji: "🗣️", price: 3500 },
        lapiz: { emoji: "✏️", price: 4000 },
        agua: { emoji: "💧", price: 4500 },
        comodin: { emoji: "🃏", price: 5000 },
      };

      const validChoices = [
        "piedra",
        "papel",
        "tijera",
        "lagarto",
        "codo",
        "cabeza",
        "lapiz",
        "agua",
        "comodin",
      ];
      if (!validChoices.includes(playerChoice)) {
        return reply(
          "*Momo necesita saber si elegiste 🪨 piedra, 📄 papel, ✂️ tijera, 🦎 lagarto, 💪 codo, 🗣️ cabeza, ✏️ lápiz, 💧 agua, 🃏 comodín.*"
        );
      }

      // Verificar el saldo del usuario en totoEconomy para el grupo específico
      let userEconomy = await totoEconomy.findOne({
        where: { phone: user.split("@")[0], groupId: from }, // Ahora el balance está ligado al grupo
      });

      // Si no existe el usuario en este grupo, crear un nuevo registro con saldo inicial en 0
      if (!userEconomy) {
        userEconomy = await totoEconomy.create({
          phone: user.split("@")[0],
          groupId: from,
          balance: 0,
          banco: 0,
        });
      }

      // Verificar si el usuario tiene saldo suficiente para jugar
      if (userEconomy.balance < choices[playerChoice].price) {
        return reply(
          `*No tienes suficiente saldo para jugar con ${choices[playerChoice].emoji}. Tu saldo actual en este grupo es de ${userEconomy.balance} totoCoins.*`
        );
      }

      const difficultyWeights = {
        fácil: 0.7,
        medio: 0.5,
        difícil: 0.3,
      };

      try {
        const momoChoiceKey =
          validChoices[Math.floor(Math.random() * validChoices.length)];
        const momoChoice = choices[momoChoiceKey].emoji;
        const playerChoiceEmoji = choices[playerChoice].emoji;

        const emote = "🎰";
        const turn0 = `-------------------\n | ${emote} | ${emote} | ${emote} | \n-------------------\n--- *GIRANDO* ---`;
        const turn1 = `-------------------\n | ${playerChoiceEmoji} | ${emote} | ${emote} | \n-------------------\n--- *TURNO 1* ---`;
        const turn2 = `-------------------\n | ${playerChoiceEmoji} | ${momoChoice} | ${emote} | \n-------------------\n--- *TURNO 2* ---`;
        const turn3 = `-------------------\n | ${playerChoiceEmoji} | ${momoChoice} | ${momoChoice} | \n-------------------\n--- *TURNO 3* ---`;

        let { key } = await totoro.sendMessage(
          from,
          { text: turn0 },
          { quoted: info }
        );

        await new Promise((resolve) => setTimeout(resolve, 1500));
        await totoro.sendMessage(
          from,
          { text: turn1, edit: key },
          { quoted: info }
        );

        await new Promise((resolve) => setTimeout(resolve, 1500));
        await totoro.sendMessage(
          from,
          { text: turn2, edit: key },
          { quoted: info }
        );

        await new Promise((resolve) => setTimeout(resolve, 1500));
        await totoro.sendMessage(
          from,
          { text: turn3, edit: key },
          { quoted: info }
        );

        await new Promise((resolve) => setTimeout(resolve, 1500));
        let resultMessage;

        let result;
        if (playerChoice === momoChoiceKey) {
          result = "draw";
        } else {
          result =
            Math.random() < difficultyWeights[difficulty] ? "win" : "lose";
        }

        let userBalance = userEconomy.balance;

        if (result === "win") {
          resultMessage = `🎉 Ganaste ${fixedWinAmount} totoCoins!`;
          userBalance += fixedWinAmount; // Añadir las monedas al saldo del usuario
        } else if (result === "lose") {
          resultMessage = `😢 Perdiste ${choices[playerChoice].price} totoCoins.`;
          userBalance -= choices[playerChoice].price; // Descontar la apuesta del saldo del usuario
        } else {
          resultMessage = `🤝 Es un empate. Mantienes tus totoCoins.`;
        }

        // Actualizar el saldo del usuario en la base de datos para el grupo actual
        await totoEconomy.update(
          { balance: userBalance },
          { where: { phone: user.split("@")[0], groupId: from } } // Asegurarse de actualizar el registro del grupo actual
        );

        delete userState[user]; // Limpiar el estado del usuario después del juego

        return totoro.sendMessage(
          from,
          { text: resultMessage },
          { quoted: info }
        );
      } catch (error) {
        console.error(error);
        return reply("*🏮 Ocurrió un error. Inténtalo más tarde.*");
      }
    }
  },
};
