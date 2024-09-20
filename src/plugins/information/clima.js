const axios = require("axios");
const { help } = require("../../functions/messages");
const prefix = require("../../../settings.json").prefix;

module.exports = {
  name: "clima",
  aliases: ["tiempo"],
  category: "information",
  subcategory: "weather",
  usage: `${prefix}clima <ciudad o país>`,
  example: `${prefix}clima Madrid`,
  description: "Obtén el clima actual de tu ciudad o país.",

  async execute(totoro, msg, args) {
    const city = args.join(" ");

    if (!city) {
      help(
        totoro,
        msg,
        "Clima",
        "Obtén el clima actual de tu ciudad o país.",
        `${prefix}clima Madrid`
      );
    }

    try {
      const desc = {
        "clear sky": "Cielo despejado",
        "few clouds": "Pocas nubes",
        "scattered clouds": "Nubes dispersas",
        "broken clouds": "Nubosidad fragmentada",
        "overcast clouds": "Cielo nublado",
        "light rain": "Lluvia ligera",
        "moderate rain": "Lluvia moderada",
        "heavy rain": "Lluvia intensa",
        "shower rain": "Chubascos",
      };

      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=060a6bcfa19809c2cd4d97a212b19273`
      );
      const res = response.data;
      const name = res.name;
      const country = res.sys.country;
      const weather =
        desc[res.weather[0].description] || res.weather[0].description;
      const temperature = `${res.main.temp}°C`;
      const minimumTemperature = `${res.main.temp_min}°C`;
      const maximumTemperature = `${res.main.temp_max}°C`;
      const humidity = `${res.main.humidity}%`;
      const wind = `${res.wind.speed} m/s`;

      const participant = msg.messages[0]?.key?.participant;
      const wea =
        `╭─⬣「 *Clima Actual* 」\n` +
        `│  ≡◦ 📍 Lugar: \`${name}\`\n` +
        `│  ≡◦ 🗺️ País: \`${country}\`\n` +
        `│  ≡◦ 🌤️ Tiempo: \`${weather}\`\n` +
        `│  ≡◦ 🌡️ Temperatura: \`${temperature}\`\n` +
        `│  ≡◦ 💠 Temperatura mímina: \`${minimumTemperature}\`\n` +
        `│  ≡◦ 📛 Temperatura máxima: \`${maximumTemperature}\`\n` +
        `│  ≡◦ 💦 Humedad: \`${humidity}\`\n` +
        `│  ≡◦ 🌬️ Viento: \`${wind}\`\n` +
        `│  ≡◦ 📌 Unidad: Celsius\n` +
        `│  ≡◦ 📆 Fecha: \`${new Date().toLocaleDateString()}\`\n` +
        `│  ≡◦ 🕒 Hora: \`${new Date().toLocaleTimeString()}\`\n` +
        `╰─⬣\n\n` +
        `> © ᴍᴀᴅᴇ ʙʏ ᴛᴏᴛᴏʀᴏ ꜱᴏʟɪᴄɪᴛᴀᴅᴏ ᴘᴏʀ: @${participant.split("@")[0]}`;

      msg.reply({
        text: wea,
        mentions: [participant],
      });
    } catch (e) {
      console.error(e);
      totoro.sendMessage(msg.messages[0]?.key?.remoteJid, {
        text: `*No se han encontrado resultados, corrobore que haya escrito correctamente su país o ciudad*`,
      });
    }
  },
};
