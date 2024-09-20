const totoRecordatorio = require("../../models/"); // Ajusta la ruta según tu estructura de proyecto
const { sendError, sendWarning } = require("../../functions/messages");
const prefix = require("../../../settings.json").prefix;

module.exports = {
  name: "deleteReminder",
  category: "utilities",
  subcategory: "recordatorio",
  aliases: ["delreminder", "deletereminder"],
  description: "Elimina un recordatorio específico por su ID.",
  usage: `${prefix}deleteReminder <id>`,
  cooldown: 5,
  cmdBlock: true,

  execute: async (totoro, msg, args) => {
    const reminderId = args[0]; // Obtiene el primer argumento como el ID del recordatorio
    const userPhone = msg.sender;

    if (!reminderId) {
      return sendWarning(
        totoro,
        msg,
        "Uso incorrecto. Proporciona el ID del recordatorio que deseas eliminar."
      );
    }

    try {
      const reminder = await totoRecordatorio.findOne({
        where: {
          id: reminderId,
          phone: userPhone,
        },
      });

      if (!reminder) {
        return sendWarning(
          totoro,
          msg,
          "No se encontró un recordatorio con el ID proporcionado."
        );
      }

      await reminder.destroy();

      return msg.reply(`Recordatorio con ID ${reminderId} ha sido eliminado.`);
    } catch (error) {
      console.error("Error al eliminar el recordatorio:", error);
      return sendError(
        totoro,
        msg,
        "Hubo un error al eliminar el recordatorio. Intenta de nuevo."
      );
    }
  },
};
