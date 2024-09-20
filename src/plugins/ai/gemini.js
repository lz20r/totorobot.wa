require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { help, sendError } = require("../../functions/messages");

module.exports = {
  name: "gemini",
  category: "inteligencia artificial",
  subcategory: "ia",
  description: "Gemini AI",
  usage: "gemini <message>", 
  cmdBlock: true,

  async execute(totoro, msg, args) {
    try {
      await msg.react("🧩");

      const message = args.join(" ");
      if (!message) {
        await help(
          totoro,
          msg,
          "Gemini AI",
          "Ingresa un mensaje",
          "+gemini <message>"
        );
        await msg.react("❓");
        return;
      }

      // Inicializa el cliente de Google Generative AI correctamente
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

      // Verifica que el cliente se haya inicializado correctamente
      console.log(genAI);

      // Verifica si el método generate está disponible
      if (genAI.models && typeof genAI.models.generate === "function") {
        // Realiza la solicitud a la API usando el método generate
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const chat = model.startChat({
          history: [
            {
              role: "user",
              parts: [{ text: message }],
            },
            {
              role: "assistant",
              parts: [],
            },
          ],
        });

        const response = await genAI.models.generate(chat);

        // Verifica si la respuesta es válida
        if (response && response.candidates && response.candidates.length > 0) {
          // Obtiene la respuesta de la API
          const replyMessage = response.candidates[0].parts
            .map((part) => part.text)
            .join("");

          await msg.react("✅");
          await msg.reply(replyMessage);
        } else {
          throw new Error("La API no devolvió una respuesta válida.");
        }
      } else {
        throw new Error(
          "El método generate no está disponible en el objeto genAI.models."
        );
      }
    } catch (error) {
      console.error("Error capturado:", error);
      await sendError(totoro, msg, error.message);
    }
  },
};
