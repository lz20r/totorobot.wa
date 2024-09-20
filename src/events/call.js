const totoroLog = require("../functions/totoroLog");

module.exports = {
  name: "call",
  once: true,

  async load(call, client) {
    const from = call[0].from;

    if ((call[0].status === "ringing") & !call[0].isGroup) {
      client.rejectCall(call[0].id, call[0].from);
      client.sendMessage(call[0].from, {
        text: `Totoro no está disponible en llamadas de voz 🗣\n\n> Las llamadas al bot estan prohibidas, si continuas seras bloqueado`,
      });
    }

    totoroLog.info(
      "./logs/handlers/call.log",
      `[CALL] ${from} ha intentado llamarme.`
    );
  },
};
