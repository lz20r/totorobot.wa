const { prefix } = require("../../../settings.json");
const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
  name: "prueba",
  category: "developer",
  subcategory: "prueba",
  description: "Prueba de plugin.",
  aliases: ["prueba", "test"],
  usage: `${prefix}prueba`,
  cooldown: 5,

  execute: async (totoro, msg, args) => {
    getDefinition("amor");
  }

};


async function getDefinition(word) {
  try {
    const response = await axios.get(`https://es.wiktionary.org/wiki/${word}`);
    const $ = cheerio.load(response.data);

    const definitions = [];
    $(' ol li').each((i, el) => { 
      definitions.push($(el).text());
    });

    if (definitions.length === 0) {
      console.log("No se encontraron definiciones.");
    } else {
      console.log(`Definiciones de "${word}":`);
      definitions.forEach((def, index) => {
        console.log(`${index + 1}. ${def}`);
      });
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}