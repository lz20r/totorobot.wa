const { help, sendWarning } = require("../../functions/messages");
const {totoCounterActivate, totoCounter} = require("../../models");
const settings = require("../../../settings.json"); 

module.exports = {
  name: "Contador Totoro",
  category: "developer",
  subcategory: "settings",
  aliases: ["counter", "totoCounter", "contador"],
  usage: `${settings.prefix}counter <on/off/reset>`,
  description:
    "Activa, desactiva o reinicia el contador del bot de manera global",
  dev: true,

  async execute(totoro, msg, args) {
    // Obtener el número de teléfono del participante
    const participant = msg.messages[0].key.participant.split("@")[0];
    const userWithDomain = `${participant}@s.whatsapp.net`;

    // Verificación de si el participante es un desarrollador autorizado
    if (!settings.dev.includes(userWithDomain)) {
      if (typeof msg.react === "function") {
        await msg.react("⚠️");
      }
      return msg.reply({
        text: `${userWithDomain}, solo los desarrolladores pueden ejecutar este comando.`,
        mentions: [userWithDomain],
      });
    }

    // Verificar si se ha proporcionado el argumento necesario
    if (args.length < 1) {
      return help(
        totoro,
        msg,
        `Activar Contador Totoro`,
        "Falta el estado de activación",
        `${settings.prefix}counter <on/off/reset>`
      );
    }

    if (typeof msg.react === "function") {
      await msg.react("⌛");
    }

    const status = args[0].toLowerCase();

    if (status !== "on" && status !== "off" && status !== "reset") {
      return msg.reply({
        text: `@${participant}, ${status} no es un estado válido. Debe ser 'on', 'off' o 'reset'.`,
        mentions: [participant],
      });
    }

    // Obtener el estado actual del contador
    let currentStatus = await totoCounterActivate.findOne({
      where: { counterId: 1 },
    });

    // Si no existe un estado actual, crearlo con estado "off" por defecto
    if (!currentStatus) {
      currentStatus = await totoCounterActivate.create({
        counterId: 1,
        status: "off",
      });
    }

    // Almacenar los conteos actuales solo si el estado es "on"
    let countsMap = [];
    if (currentStatus.status === "on") {
      const currentCounts = await totoCounter.findAll();
      countsMap = currentCounts.map((counter) => ({
        totoUserId: counter.totoUserId,
        pluginName: counter.pluginName,
        count: counter.count,
      }));
    }

    if (status === "reset") {
      try {
        // Eliminar todos los registros de contadores
        await totoCounter.destroy({ where: {} });

        msg.react("✅");
        // Obtener la fecha y hora actual en la zona horaria de Madrid
        const now = new Date();
        const date = now.toLocaleDateString("es-ES", {
          timeZone: "Europe/Madrid",
        });
        const time = now.toLocaleTimeString("es-ES", {
          timeZone: "Europe/Madrid",
        });

        // Enviar mensaje de confirmación
        return msg.reply({
          text:
            `╭─⬣「 Counter Totoro 」\n` +
            `│  ≡◦ Estado: reset\n` +
            `│  ≡◦ Acción: reiniciado\n` +
            `│  ≡◦ Moderador: @${participant}\n` +
            `│  ≡◦ Fecha: ${date}\n` +
            `│  ≡◦ Hora: ${time}\n` +
            `╰──────────────`,
          mentions: [userWithDomain],
        });
      } catch (error) {
        console.error("Error eliminando contadores:", error);
        return msg.reply({
          text: `@${participant}, hubo un error al intentar eliminar los contadores.`,
          mentions: [participant],
        });
      }
    }

    // Verificar si el estado solicitado ya está establecido
    if (status === currentStatus.status) {
      if (typeof msg.react === "function") {
        await msg.react("⚠️");
      }
      return sendWarning(
        totoro,
        msg,
        `El contador ya está ${status === "on" ? "activado" : "desactivado"}`
      );
    }

    // Actualizar el estado del contador
    await currentStatus.update({ status });

    msg.react("✅");
    // Obtener la fecha y hora actual en la zona horaria de Madrid
    const now = new Date();
    const date = now.toLocaleDateString("es-ES", { timeZone: "Europe/Madrid" });
    const time = now.toLocaleTimeString("es-ES", { timeZone: "Europe/Madrid" });

    // Restaurar los conteos si el estado es "on"
    if (status === "on" && countsMap.length > 0) {
      for (const counter of countsMap) {
        try {
          await totoCounter.create(counter);
        } catch (error) {
          console.error("Error restaurando contadores:", error);
        }
      }
    }

    // Enviar mensaje de confirmación
    let confirmationMessage =
      `╭─⬣「 Counter Totoro 」\n` +
      `│  ≡◦ Estado: ${status}\n` +
      `│  ≡◦ Acción: ${status === "on" ? "activado" : "desactivado"}\n` +
      `│  ≡◦ Moderador: @${participant}\n` +
      `│  ≡◦ Fecha: ${date}\n` +
      `│  ≡◦ Hora: ${time}\n`;

    if (status === "on") {
      // Obtener y mostrar el valor actual del contador si está activado
      const counters = await totoCounter.findAll();
      let total = 0;
      confirmationMessage += `│  ≡◦ Contadores:\n`;
      counters.forEach((counter) => {
        confirmationMessage += `│    - ${counter.pluginName}: ${counter.count}\n`;
        total += counter.count;
      });
      confirmationMessage += `│  ≡◦ Total: ${total}\n`;
    }

    confirmationMessage += `╰──────────────`;

    msg.reply({
      text: confirmationMessage,
      mentions: [userWithDomain],
    });
  },
};
