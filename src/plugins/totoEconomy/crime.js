const { totoEconomy } = require(`../../models`);
const { economyCooldown } = require(`../../functions/messages`);
const prefix = require(`../../../settings.json`).prefix;
const convertTime = require(`../../functions/convertTime`);

module.exports = {
  name: "crime",
  category: "totoEconomy",
  subcategory: "ganancias",
  aliases: ["crimen", "delito", "criminal", "criminalidad"],
  description: "Intenta cometer un crimen para ganar totoCoins.",
  usage: `${prefix}crime`,
  cooldown: 600000,
  economy: true,

  execute: async (totoro, msg, args) => {
    try {
      const info = msg.messages[0];
      const isGroup = info.key.remoteJid.endsWith(`@g.us`);
      const sender = isGroup ? info.key.participant : info.key.remoteJid;
      const user = sender.split(`@`)[0];
      const groupId = isGroup ? info.key.remoteJid : sender;
    const groupInfo = await totoro.groupMetadata(groupId);
    const groupName = groupInfo.subject;
      if (!msg.messages[0].key.remoteJid.endsWith("@g.us")) {
        sendWarning(
          totoro,
          msg,
          "Este comando solo puede ser utilizado en grupos."
        );
        return;
      }

      // Buscar al usuario en la base de datos
      let economy = await totoEconomy.findOne({
        where: { phone: user, groupId: groupId },
      });

      const timeout = 600000; // 10 minutos

      // Verificar si el usuario ya cometió un crimen recientemente (cooldown)
      if (economy && economy.lastCrime) {
        const lastCrimeTime = economy.lastCrime;
        const timeDifference = Date.now() - lastCrimeTime;

        if (timeDifference < timeout) {
          const timeLeft = convertTime(timeout - timeDifference);
          await economyCooldown(
            msg,
            "crime",
            `Espera ${timeLeft} para cometer otro crimen.`
          );
          return;
        }
      }

      // Lista de crímenes posibles
      const crimes = [
        "> Robaste una joyería y conseguiste @coins totoCoins.",
        "> Asaltaste un banco y conseguiste @coins totoCoins.",
        "> Secuestraste a una persona y conseguiste @coins totoCoins.",
        "> Robaste un vehículo y conseguiste @coins totoCoins.",
        "> Entraste a una casa y robaste objetos de valor, consiguiendo @coins totoCoins.",
        "> Realizaste vandalismo en una propiedad pública y conseguiste @coins totoCoins.",
        "> Participaste en una pelea callejera y conseguiste @coins totoCoins.",
        "> Cometiste fraude bancario y conseguiste @coins totoCoins.",
        "> Hackeaste una empresa y conseguiste @coins totoCoins.",
        "> Realizaste un asalto a mano armada y conseguiste @coins totoCoins.",
        "> Estafaste a varias personas y conseguiste @coins totoCoins.",
        "> Te escapaste de la cárcel y conseguiste @coins totoCoins.",
        "> Tomaste rehenes en un edificio y conseguiste @coins totoCoins.",
        "> Destruiste propiedad pública y conseguiste @coins totoCoins.",
        "> Realizaste contrabando ilegal y conseguiste @coins totoCoins.",
        "> Participaste en una red de tráfico de drogas y conseguiste @coins totoCoins.",
        "> Hackeaste cuentas bancarias y conseguiste @coins totoCoins.",
        "> Iniciaste una pelea en un bar y conseguiste @coins totoCoins.",
        "> Cometiste un robo a mano armada en un vehículo y conseguiste @coins totoCoins.",
        "> Extorsionaste a alguien y conseguiste @coins totoCoins.",
        "> Realizaste fraude fiscal y conseguiste @coins totoCoins.",
        "> Iniciaste un incendio provocado y conseguiste @coins totoCoins.",
        "> Participaste en una red de tráfico humano y conseguiste @coins totoCoins.",
        "> Realizaste robo de identidad y conseguiste @coins totoCoins.",
        "> Falsificaste documentos importantes y conseguiste @coins totoCoins.",
        "> Cometiste un acto de piratería informática y conseguiste @coins totoCoins.",
        "> Sobornaste a un oficial de policía y conseguiste @coins totoCoins.",
        "> Realizaste un ataque con ácido y conseguiste @coins totoCoins.",
        "> Participaste en una pelea clandestina de animales y conseguiste @coins totoCoins.",
        "> Realizaste un ataque a una instalación gubernamental y conseguiste @coins totoCoins.",
        "> Iniciaste una persecución policial y conseguiste @coins totoCoins.",
        "> Cometiste fraude de seguros y conseguiste @coins totoCoins.",
        "> Secuestraste a un político importante y conseguiste @coins totoCoins.",
        "> Cometiste un asesinato por encargo y conseguiste @coins totoCoins.",
        "> Participaste en una red de tráfico de armas y conseguiste @coins totoCoins.",
        "> Iniciaste una revuelta en una prisión y conseguiste @coins totoCoins.",
        "> Realizaste un atraco a un tren y conseguiste @coins totoCoins.",
        "> Extorsionaste a un empresario y conseguiste @coins totoCoins.",
        "> Participaste en una red de contrabando de animales exóticos y conseguiste @coins totoCoins.",
        "> Realizaste un secuestro exprés y conseguiste @coins totoCoins.",
        "> Iniciaste un motín en un centro de detención y conseguiste @coins totoCoins.",
        "> Robaste material de una construcción y conseguiste @coins totoCoins.",
        "> Secuestraste a un miembro de la realeza y conseguiste @coins totoCoins.",
        "> Cometiste fraude electoral y conseguiste @coins totoCoins.",
        "> Iniciaste un disturbio en una manifestación pacífica y conseguiste @coins totoCoins.",
        "> Realizaste sabotaje en una empresa y conseguiste @coins totoCoins.",
        "> Participaste en una red de trata de personas y conseguiste @coins totoCoins.",
        "> Hackeaste sistemas de seguridad y conseguiste @coins totoCoins.",
        "> Iniciaste un incendio forestal intencional y conseguiste @coins totoCoins.",
        "> Participaste en una red de tráfico de órganos y conseguiste @coins totoCoins.",
        "> Realizaste un ataque a una embajada y conseguiste @coins totoCoins.",
        "> Secuestraste a un famoso y conseguiste @coins totoCoins.",
        "> Cometiste un robo a un museo y conseguiste @coins totoCoins.",
      ];

      // Seleccionar crimen y cantidad de monedas ganadas
      const randomCrime = crimes[Math.floor(Math.random() * crimes.length)];
      const min = 100; // Cambiar mínimo a 100
      const max = 100000; // Cambiar máximo a 100,000
      const amount = Math.floor(Math.random() * (max - min + 1)) + min;

      // Formatear el valor de amount con separadores de miles
      const formattedAmount = amount.toLocaleString("es-ES");

      // Reemplazar @coins con el valor formateado
      const crimeMessage = randomCrime.replace("@coins", formattedAmount);

      // Responder al usuario con el crimen cometido y las monedas ganadas
      msg.reply({
        text: crimeMessage,
      });

      // Si el usuario no existe en la base de datos, creamos su registro
      if (!economy) {
        await totoEconomy.create({
          groupId: groupId,
          groupName: groupName,
          phone: user,
          balance: amount,
          banco: 0,
          lastCrime: Date.now(), // Actualizamos el tiempo de último crimen
        });
      } else {
        // Actualizamos su balance y el tiempo del último crimen
        economy.balance += amount;
        economy.lastCrime = Date.now(); // Actualizamos el timestamp de último crimen
        await economy.save();
      }
    } catch (error) {
      console.error(`Error en el comando crime: ${error.message}`);
      return await economyCooldown(
        msg,
        "crime",
        "Hubo un error al intentar cometer el crimen. Intenta de nuevo más tarde."
      );
    }
  },
};
