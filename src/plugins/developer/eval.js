const { sendError, help } = require("../../functions/messages");
const totoroLog = require("../../functions/totoroLog");

module.exports = {
  name: "eval",
  aliases: ["e"],
  category: "developer",
  subcategory: "owner",
  description: "Ejecuta código",
  usage: "< código >",
  example: 'eval console.log("Hello World")',
  dev: true,

  async execute(totoro, msg, args) {
    const info = msg.messages[0];
    const from = info.key.remoteJid;
    msg.react("⏳");
    const reply = (text) => {
      totoro.sendMessage(from, { text: text }, { quoted: info });
    };

    if (!args.join(" ")) {
      return help(totoro, msg, "Eval", "Ejecuta código", "+eval <codigo>");
    }

    try {
      const code = args.join(" ");
      /* eslint no-eval: 0 */
      let evaled = eval(code);

      if (typeof evaled !== "string") {
        evaled = require("util").inspect(evaled);
      }

      reply(clean(evaled));

      msg.react("🔍");
    } catch (e) {
      totoroLog.error(
        "./logs/plugins/developer/eval.log",
        `Error ejecutando eval: ${e}`
      );
      sendError(totoro, msg, e);
    }
  },
};

function clean(text) {
  if (typeof text === "string") {
    return text
      .replace(/`/g, '\`${String.fromCharCode(8203)}')
      .replace(/`@/g, '\`@\`${String.fromCharCode(8203)}');
  }
  return text;
}
