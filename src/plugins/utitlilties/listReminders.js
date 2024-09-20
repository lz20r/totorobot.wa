const { Op } = require("sequelize");
const moment = require("moment");
const totoRecordatorio = require("../../models/"); // Ajusta la ruta según tu estructura de proyecto
const { sendError } = require("../../functions/messages");
const prefix = require("../../../settings.json").prefix;
const totoroLog = require("../../functions/totoroLog");

module.exports = {
  name: "listReminders",
  category: "utilities",
  subcategory: "recordatorio",
  aliases: ["listreminders", "reminders"],
  description: "Lista los recordatorios próximos.",
  usage: `${prefix}listReminders`,
  cooldown: 5,
  cmdBlock: true,

  execute: async (totoro, msg, args) => {
    const userPhone = msg.sender;
    const now = new Date();

    try {
      const reminders = await totoRecordatorio.findAll({
        where: {
          phone: userPhone,
          remindAt: {
            [Op.gt]: now, // Solo recordatorios futuros
          },
        },
        order: [["remindAt", "ASC"]],
      });

      if (reminders.length === 0) {
        return msg.reply("No tienes recordatorios próximos.");
      }

      let response = "Tus próximos recordatorios:\n";
      reminders.forEach((reminder) => {
        response += `${reminder.type}: ${reminder.message} a las ${moment(
          reminder.remindAt
        ).format("YYYY-MM-DD HH:mm:ss")}\n`;
      });

      return msg.reply(response);
    } catch (error) {
      console.error("Error al listar los recordatorios:", error);
      return sendError(
        totoro,
        msg,
        "Hubo un error al listar los recordatorios. Intenta de nuevo."
      );
    }
  },
};
