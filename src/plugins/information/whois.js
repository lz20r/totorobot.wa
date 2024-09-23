const axios = require('axios');
const prefix = require("../../../settings.json").prefix;
const { sendError, sendMessage, sendWarning } = require("../../functions/messages");

module.exports = {
  name: "whois",
  aliases: ["wi", "ip", "ipinfo"],
  description: "Obtiene información de una dirección IP.",
  category: "information",
  subcategory: "network",
  usage: `${prefix}ip <dirección_ip>`,
  cooldown: 5, 
  cmdBlock: true,

  execute: async (totoro, msg, args) => {
    try {
      // Verificar si se proporcionó una dirección IP
      if (args.length < 1) {
        await sendMessage(
          totoro,
          msg,
          "Por favor, proporciona una dirección IP."
        );
        return;
      }

      const ip = args[0];
      
      // Realizar la solicitud a la API de IPWhois.io
      const apiKey = "TU_API_KEY"; // Reemplaza con tu clave de API
      const url = `https://ipwhois.app/json/${ip}?key=${apiKey}`;

      const response = await axios.get(url);
      const data = response.data;

      // Verificar si la respuesta contiene algún error
      if (data.success === false) {
        await sendError(totoro, msg, data.message || "Error al obtener información de la IP.");
        return;
      }

      // Construir el mensaje con la información de la IP
      const message = `*Información de la dirección IP:*\n\n` +
        `*Dirección IP:* ${data.ip}\n` +
        `*País:* ${data.country}\n` +
        `*Región:* ${data.region}\n` +
        `*Ciudad:* ${data.city}\n` +
        `*Proveedora de servicios:* ${data.isp}\n` +
        `*Latitud:* ${data.latitude}\n` +
        `*Longitud:* ${data.longitude}\n` +
        `*Zona horaria:* ${data.timezone}\n` +
        `*Código postal:* ${data.zip}\n` +
        `*ASN:* ${data.asn}\n` +
        `*Organización:* ${data.org}`;

      // Enviar el mensaje al chat
      await sendMessage(totoro, msg, message);
      
    } catch (error) {
      console.error(error);
      await sendWarning(totoro, msg, "Ha ocurrido un error al obtener la información de la dirección IP.");
    }
  }
};
