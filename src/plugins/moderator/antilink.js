const { sendMessage, help, sendWarning } = require("../../functions/messages");
const totoAntilinks = require("../../models").totoAntilinks;

module.exports = {
  name: "antilink",
  description: "Bloquea o permite enlaces en el grupo.",
  category: "moderator",
  subcategory: "admin",
  aliases: ["antienlace", "antienlaces", "antilinks"],
  usage: "link <allow/deny>",
  cooldown: 5,
  botPermissions: ["SEND_MESSAGES", "MENTION_EVERYONE"],
  userPermissions: [],

  blockcmd: false,

  async execute(totoro, msg, args) {
    if (!msg.messages[0].key.remoteJid.endsWith("@g.us")) {
      sendWarning(totoro, msg, "✨ Este comando solo funciona en grupos. ✨");
      return;
    }

    const groupInfo = await totoro.groupMetadata(msg.messages[0].key.remoteJid);
    const sender =
      msg.messages[0].key.participant || msg.messages[0].key.remoteJid;

    const participant = groupInfo.participants.find((x) => x.id === sender);
    if (!participant || !participant.admin) {
      sendWarning(
        totoro,
        msg,
        "No tienes permisos para ejecutar este comando. Solo los administradores pueden usar este comando."
      );
      return;
    }

    const option = args[0]?.toLowerCase(); // allow / deny
    if (!option) {
      help(
        totoro,
        msg,
        "antilink",
        "Bloquea o permite enlaces en el grupo.",
        "link <allow/deny>"
      );
      return;
    }
    if (!["allow", "deny"].includes(option)) {
      help(
        totoro,
        msg,
        "antilink",
        "Bloquea o permite enlaces en el grupo.",
        "link <allow/deny>"
      );
      return;
    }
    const linkStatus = option === "allow" ? true : false;

    const dataDb = await totoAntilinks.findOne({
      where: { groupId: msg.messages[0].key.remoteJid },
    });
    if (!dataDb) {
      await totoAntilinks.create({
        groupId: msg.messages[0].key.remoteJid,
        allowLinks: linkStatus,
      });
    } else {
      if (dataDb.allowLinks === linkStatus) {
        sendWarning(
          totoro,
          msg,
          `Los enlaces ya están ${
            linkStatus ? "permitidos" : "denegados"
          } en el grupo.`
        );
        return;
      }

      await totoAntilinks.update(
        { allowLinks: linkStatus },
        { where: { groupId: msg.messages[0].key.remoteJid } }
      );
    }

    sendMessage(
      totoro,
      msg,
      `Los enlaces han sido ${
        linkStatus ? "permitidos" : "denegados"
      } en el grupo.`
    );
  },

  verifyContainsURL: async (msg, body) => {
    const dataDb = await totoAntilinks.findOne({
      where: { groupId: msg.messages[0].key.remoteJid },
    });

    if (dataDb == false || dataDb == null) return false;

    // Convertir `body` a cadena si no lo es
    if (typeof body !== "string") {
      if (typeof body === "object" && body !== null) {
        body = JSON.stringify(body);
      } else {
        body = String(body);
      }
    }

    if (body.includes("http://") || body.includes("https://")) {
      return true;
    }
    return false;
  },
};
