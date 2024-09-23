const axios = require('axios');
const prefix = require("../../../settings.json").prefix;
const { sendError, sendMessage, sendWarning, help } = require("../../functions/messages");

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
            if (args.length < 1) {
                await help(
                    totoro,
                    msg,
                    "whois",
                    "Obtiene información de una dirección IP.",
                    `${prefix}ip <dirección_ip>` 
                )
                return;
            }
            
            const ip = args[0];
            const url = `http://ip-api.com/json/${ip}`;
            
            const response = await axios.get(url);
            const data = response.data;
            
            if (data.status === "fail") {
                await sendError(totoro, msg, data.message || "Error al obtener información de la IP.");
                return;
            }
            
            const message = `╭─── 🌐 *Info de la Dirección IP* ───╮\n` +
            `│   📍 *Dirección IP:* \`${data.query}\`\n` +
            `│   🌍 *País:* ${data.country}\n` +
            `│   🏞️ *Región:* ${data.regionName}\n` +
            `│   🏙️ *Ciudad:* ${data.city}\n` +
            `│   🏷️ *Código Postal:* ${data.zip}\n` +
            `│   📏 *Latitud:* ${data.lat}\n` +
            `│   📏 *Longitud:* ${data.lon}\n` +
            `│   📡 *Proveedor:* ${data.isp}\n` +
            `╰───────────────────╯\n` +
            `✨ *Consulta realizada con éxito!* ✨\n`;
    
            
            await msg.reply(message);
        } catch (error) {
            console.error(error);
            await sendWarning(totoro, msg, "Ha ocurrido un error al obtener la información de la dirección IP.");
        }
    }
};
