const { Op } = require("sequelize");
const moment = require("moment");
const totoRecordatorio = require("../../models/"); // Ajusta la ruta según tu estructura de proyecto
const { sendError, sendWarning, help } = require("../../functions/messages");
const prefix = require("../../../settings.json").prefix;

module.exports = {
  name: "addReminder",
  category: "utilities",
  subcategory: "recordatorio",
  aliases: ["addreminder", "addremind"],
  description: "Crea un recordatorio para una fecha y hora específicas.",
  usage: `${prefix}addReminder <tipo> <fecha y hora> <mensaje>`,
  cooldown: 5,
  cmdBlock: true,

  execute: async (totoro, msg, args) => {
    const [type, remindAtStr, ...messageParts] = args;
    const reminderMessage = messageParts.join(" ");
    const userPhone = msg.sender;
    const groupId = msg.groupId; // Asegúrate de que msg.groupId esté disponible
    const groupName = msg.groupName; // Asegúrate de que msg.groupName esté disponible

    if (!type || !remindAtStr || !reminderMessage) {
      return await help(
        totoro,
        msg,
        `addReminder`,
        `Para agregar un recordatorio, debes proporcionar el tipo, la fecha y hora, y el mensaje.`,
        `${prefix}addReminder cumpleaños 31/12/22 23:59 No olvidar felicitar a Juan.`
      );
    }

    const remindAt = moment(remindAtStr, "DD/MM/YY HH:mm").toDate();

    if (!moment(remindAtStr, "DD/MM/YY HH:mm", true).isValid()) {
      return sendWarning(
        totoro,
        msg,
        "Fecha y hora no válida. Usa el formato DD/MM/YY HH:mm."
      );
    }

    try {
      await totoRecordatorio.create({
        phone: userPhone,
        groupId: groupId,
        groupName: groupName,
        message: reminderMessage,
        remindAt: remindAt,
        isNotified: false,
        type: type,
      });

      return msg.reply(
        `Recordatorio agregado: ${reminderMessage} para ${moment(
          remindAt
        ).format("DD/MM/YY HH:mm")}`
      );
    } catch (error) {
      console.error("Error al agregar el recordatorio:", error);
      return sendError(
        totoro,
        msg,
        "Hubo un error al agregar el recordatorio. Intenta de nuevo."
      );
    }
  },
};
