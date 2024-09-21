const {
  generateWAMessageFromContent,
  proto,
} = require("@whiskeysockets/baileys");
const { sendWarning } = require("../../functions/messages");

module.exports = {
  name: "help",
  description: "Muestra la ayuda de los comandos.",
  aliases: ["ayuda", "ayudas", "a"],
  category: "general",
  subcategory: "information",
  usage: "help <comando>",
  cooldown: 5,

  blockcmd: false,

  async execute(totoro, msg, args) {
    const info = msg.messages[0];
    const from = info.key.remoteJid;
    const prefix = totoro.prefix || "+";

    const reply = (text) => {
      totoro.sendMessage(from, { text: text }, { quoted: info });
    };

    if (args[0]) {
      const plugin =
        totoro.plugins.get(args[0].toLowerCase()) ||
        totoro.plugins.find(
          (p) => p.aliases && p.aliases.includes(args[0].toLowerCase())
        );

      if (!plugin) {
        await sendWarning(
          totoro,
          msg,
          "Comando no encontrado",
          `El comando "${args[0]}" no existe.`
        );
        return;
      }

      let embed =
        `╭─⬣「 *Propiedades del comando* \`${plugin.name}\`」\n` +
        `│  ≡◦ *Descripción:* \`${plugin.description}\`\n` +
        `│  ≡◦ *Categoría:* \`${plugin.category}\`\n` +
        `│  ≡◦ *Subcategoría:* \`${plugin.subcategory}\`\n`;

      if (plugin.aliases) {
        embed += `│  ≡◦ *Aliases*: \`${
          plugin.aliases.map((a) => a).join(", ") || "Sin Alias"
        }\`\n`;
      }

      if (plugin.usage) {
        var usage = plugin.usage.split("\n").map((i) => {
          return prefix + i;
        });
        embed += `│  ≡◦ *Uso:* \`${usage.join("\n")}\`\n`;
      }

      if (plugin.example && plugin.example.length > 0) {
        embed += `│  ≡◦ *Ejemplo:* \`${prefix}${plugin.example}\`\n`;
      }

      embed +=
        `│  ≡◦ *Dev:* \`${plugin.dev ? "Sí" : "No"}\`\n` +
        `│  ≡◦ *Admin:* \`${plugin.admin ? "Sí" : "No"}\`\n` +
        `│  ≡◦ *Premium:* \`${plugin.cmdPrem ? "Sí" : "No"}\`\n` +
        `│  ≡◦ *Bloqueo:* \`${plugin.blockcmd ? "Sí" : "No"}\`\n` +
        `│  ≡◦ *Economy:* \`${plugin.economy ? "Sí" : "No"}\`\n` +
        `│  ≡◦ *Cooldown:* \`${plugin.cooldown || 3} segundos\`\n` +
        `╰─────────────────────`;

      return reply(embed);
    } else {
      return reply(
        `Uso correcto: ${prefix}ayuda < comando >\nEjemplo: ${prefix}ayuda menu`
      );
    }
  },
};
