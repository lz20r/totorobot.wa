const { totoEconomy } = require("../../models");
const { sendError, sendWarning, help } = require("../../functions/messages");
const prefix = require("../../../settings.json").prefix;
const totoroLog = require("../../functions/totoroLog");

module.exports = {
  name: "slot",
  category: "totoEconomy",
  subcategory: "ganancias",
  aliases: ["slots", "maquina", "apostar"],
  description: "Apuesta totoCoins en la máquina de slots.",
  usage: `${prefix}slot`,
  cooldown: 5, // Cooldown en minutos
  economy: true,
  execute: async (totoro, msg, args) => {
    try {
      const message = msg.messages[0];

      // Verificar si el comando se ejecuta en un grupo
      if (!msg.messages[0].key.remoteJid.endsWith("@g.us")) {
        sendWarning(
          totoro,
          msg,
          "Este comando solo puede ser utilizado en grupos."
        );
        return;
      }

      const mentionedJid =
        message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      const quotedParticipant =
        message.message?.extendedTextMessage?.contextInfo?.participant;
      const groupId = message.key.remoteJid;
      const groupInfo = await totoro.groupMetadata(groupId);
      const groupName = groupInfo.subject;
      const remoteJid = message.key.remoteJid;
      let targetPhone = message.key.participant?.split("@")[0];

      if (mentionedJid) {
        targetPhone = mentionedJid.split("@")[0];
      } else if (quotedParticipant) {
        targetPhone = quotedParticipant.split("@")[0];
      } else {
        targetPhone = message.key.participant?.split("@")[0];
      }

      // Verificar si el usuario tiene suficiente saldo en este grupo
      let user = await totoEconomy.findOne({
        where: { phone: targetPhone, groupId: groupId },
      });

      // Si no existe el usuario para este grupo, creamos un nuevo registro
      if (!user) {
        user = await totoEconomy.create({
          groupId: groupId,
          groupName: groupName,
          phone: targetPhone,
          balance: 0,
          banco: 0,
        });
      }

      // Establecer la cantidad de apuesta automática como el 10% del saldo
      let amount = Math.floor(user.balance * 0.1);

      // Verificar que la cantidad esté dentro del rango permitido (100 - 60,000)
      if (amount < 100) amount = 100;
      if (amount > 60000) amount = 60000; // Establecer apuesta máxima

      if (user.balance < amount) {
        sendWarning(
          totoro,
          msg,
          `No tienes suficiente saldo para apostar ${amount} totoCoins.`
        );
        return;
      }

      // Definir los símbolos del slot con probabilidad
      const choices = [
        ["🤑", 3000],
        ["💎", 1000],
        ["💰", 1500],
        ["🪙", 2500],
        ["💲", 2000],
      ];
      const emote = "🎰";
      const emoji1 = pick(choices);
      const emoji2 = pick(choices);
      const emoji3 = pick(choices);

      // Mensajes de animación del slot
      let spin0 = `-------------------\n | ${emote} | ${emote} | ${emote} | \n-------------------\n--- *GIRANDO* ---`;
      const spin1 = `-------------------\n | ${emoji1} | ${emote} | ${emote} | \n-------------------`;
      const spin2 = `-------------------\n | ${emoji1} | ${emoji2} | ${emote} | \n-------------------`;
      let spin3 = `-------------------\n | ${emoji1} | ${emoji2} | ${emoji3} | \n-------------------`;

      let { key } = await totoro.sendMessage(
        remoteJid,
        { text: spin0 },
        { quoted: message }
      );

      await new Promise((resolve) =>
        setTimeout(async () => {
          await totoro.sendMessage(
            remoteJid,
            { text: spin1, edit: key },
            { quoted: message }
          );
          resolve();
        }, 1500)
      );

      await new Promise((resolve) =>
        setTimeout(async () => {
          await totoro.sendMessage(
            remoteJid,
            { text: spin2, edit: key },
            { quoted: message }
          );
          resolve();
        }, 1500)
      );

      await new Promise((resolve) =>
        setTimeout(async () => {
          await totoro.sendMessage(
            remoteJid,
            { text: spin3, edit: key },
            { quoted: message }
          );
          resolve();
        }, 1500)
      );

      // Calcular el resultado del slot
      const arrayEmojis = [emoji1, emoji2, emoji3];
      const dollar = arrayEmojis.filter((emoji) => emoji === "💲").length;
      const coin = arrayEmojis.filter((emoji) => emoji === "🪙").length;
      const moneybag = arrayEmojis.filter((emoji) => emoji === "💰").length;
      const gem = arrayEmojis.filter((emoji) => emoji === "💎").length;
      const money_mouth = arrayEmojis.filter((emoji) => emoji === "🤑").length;

      let winnings = 0;
      if (dollar === 3)
        winnings = 5; // Mayor ganancia si obtienes 3 símbolos de $.
      else if (coin === 3) winnings = 3.5;
      else if (moneybag === 3)
        winnings = 7; // Alta ganancia si obtienes 3 bolsas de dinero.
      else if (gem === 3) winnings = 10; // Gemas otorgan las mayores ganancias.
      else if (money_mouth === 3) winnings = 2.5;
      else if (dollar === 2 || moneybag === 2)
        winnings = 2; // Pequeña ganancia si obtienes 2 símbolos.
      else if (gem === 2) winnings = 5;
      else if (coin === 2) winnings = 1.5; // Menor ganancia.
      else if (money_mouth === 2) winnings = 0.5; // Menor ganancia en caso de 2 caras de dinero.

      const profit = parseInt(amount * winnings);

      if (profit > 0) {
        spin3 += `\nGanas ${profit} totoCoins`;
        await totoEconomy.update(
          { balance: user.balance + profit },
          { where: { phone: targetPhone, groupId: groupId } }
        );
        return totoro.sendMessage(
          remoteJid,
          { text: spin3, edit: key },
          { quoted: message }
        );
      } else {
        spin3 += `\nPierdes ${amount} totoCoins`;
        await totoEconomy.update(
          { balance: user.balance - amount },
          { where: { phone: targetPhone, groupId: groupId } }
        );
        return totoro.sendMessage(
          remoteJid,
          { text: spin3, edit: key },
          { quoted: message }
        );
      }
    } catch (error) {
      totoroLog.error("./logs/plugins/economy/slot", `${error}`);
      sendError(
        totoro,
        msg,
        "Ocurrió un error al ejecutar el comando de slot."
      );
    }
  },
};

// Función para seleccionar emojis según probabilidad
function pick(data, luck = 1) {
  const values = data.map((d) => d[0]);
  const weights = data.map((d) => d[1]);

  let acc = 0;
  const sum = weights.reduce((acc, element) => acc + element, 0);
  const weightsSum = weights.map((element) => {
    acc = element + acc;
    return acc;
  });
  const rand = Math.random() * sum * luck;
  let index = weightsSum.filter((element) => element <= rand).length;
  index = index >= weights.length ? weights.length - 1 : index;
  return values[index];
}
