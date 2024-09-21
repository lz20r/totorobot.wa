const axios = require('axios');
const { help } = require("../../functions/messages");
const prefix = require("../../../settings.json").prefix;

async function getDefinition(word) {
  try {
    const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    return response.data;
  } catch (error) {
    console.error("Error:", error.message);
    return null;
  }
}

module.exports = {
  name: "dictionary",
  aliases: ["diccionario", "dictionary", "dic", "rae", "def"],
  category: "information",
  subcategory: "dictionary",
  usage: `${prefix}def <word>`,
  example: `${prefix}def love`,
  description: "Obtén la definición de una palabra del diccionario en inglés.",

  async execute(totoro, msg, args) {
    const word = args.join(" ");

    if (!word) {
      return help(
        totoro,
        msg,
        "Dictionary",
        "Get the definition of a word from the dictionary.",
        `${prefix}dictionary love`
      );
    }

    try {
      const result = await getDefinition(word);

      if (!result || result.length === 0) {
        throw new Error("No definition found.");
      }

      const definitions = result[0].meanings.map((meaning) =>
        `*Part of Speech:* _${meaning.partOfSpeech}_\n` +
        meaning.definitions.map((def, index) =>
          `\n${index + 1}. *Definition:* ${def.definition}\n` +
          (def.example ? `> _Example:_ ${def.example}\n` : "")
        ).join("")
      ).join("\n\n");

      const def =
        `*📚 Definition of:* _${word}_\n\n` +
        `${definitions}`;

      msg.reply(def);
    } catch (error) {
      msg.reply("An error occurred while fetching the definition.");
    }
  },
};
