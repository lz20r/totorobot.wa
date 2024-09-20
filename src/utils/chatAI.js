const { OpenAI } = require("openai");
require("dotenv").config();

const apiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey,
});

async function chatAI(totoro, message) {
  try {
    const assistantContent =
      "Eres Totoro y fuiste creado por Nia para ayudar a los usuarios de este grupo.";

    const response = await openai.chat.completions.create({
      model: "gpt-4", // Cambia a "gpt-3.5-turbo" si es necesario
      messages: [
        { role: "system", content: assistantContent },
        { role: "user", content: message },
      ],
    });

    if (!response || !response.choices || response.choices.length === 0) {
      console.error(
        "Empty or invalid response structure from OpenAI:",
        response
      );
      throw new Error("Empty or invalid response from OpenAI");
    }

    const assistantMessage = response.choices[0]?.message?.content;

    if (!assistantMessage || assistantMessage.trim() === "") {
      console.error(
        "Invalid assistant message content in OpenAI response:",
        response.choices[0]?.message
      );
      throw new Error("Invalid assistant message content in OpenAI response");
    }

    return assistantMessage;
  } catch (error) {
    console.error("Error in chatAI:", error);
    throw error; // Asegúrate de propagar el error para manejarlo adecuadamente en el contexto que llama a `chatAI`.
  }
}

module.exports = { chatAI };
