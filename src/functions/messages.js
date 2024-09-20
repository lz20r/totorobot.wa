const totoroLog = require("./totoroLog");

async function sendMessage(totoro, msg, message) {
  const mensaje =
    `╭─⬣「 *Mensaje de Totoro* 」⬣\n` +
    `│  ≡◦ *🍭 Totoro dice lo siguiente:*\n` +
    `╰─⬣\n` +
    `> ${message}`;
  try {
    const remoteJid = msg.messages[0].key.remoteJid;
    msg.react("🍭");
    await totoro.sendMessage(
      remoteJid,
      { text: mensaje },
      { quoted: msg.messages[0] }
    );
  } catch (error) {
    totoroLog.error(
      "./logs/functions/messages.log",
      `Error enviando mensaje: ${error}`
    );
  }
}

async function infoGroup(msg, pluginName, message) {
  msg.reply(
    `╭─⬣「 \`${pluginName}\` *en Grupos* 」⬣\n` +
      `│  ≡◦ *🍭 \`${pluginName}\` *no permitido en grupos*\n` +
      `╰─⬣\n` +
      `> ${message}`
  );
  try {
    await msg.react("ℹ️");
  } catch (error) {
    totoroLog.error(
      "./logs/functions/messages.log",
      `Error enviando mensaje de grupos: ${error}`
    );
  }
}

async function sendWarning(totoro, msg, warningMessage) {
  try {
    const remoteJid = msg.messages[0].key.remoteJid;
    await msg.react("⚠️");
    await totoro.sendMessage(
      remoteJid,
      {
        text:
          `╭─⬣「 *Advertencia* 」⬣\n` +
          `│  ≡◦ *⚠️ Totoro te advierte lo siguiente:*\n` +
          `╰─⬣\n` +
          `> ${warningMessage}`,
      },
      { quoted: msg.messages[0] }
    );
  } catch (error) {
    totoroLog.error(
      "./logs/functions/messages.log",
      `Error enviando mensaje de aviso: ${error}`
    );
  }
}

async function sendError(totoro, msg, errorMessage) {
  const mensaje =
    `╭─⬣「 *Error* 」⬣\n` +
    `│  ≡◦ *❌ Totoro ha encontrado un error*\n` +
    `╰─⬣\n` +
    `> ${errorMessage}`;
  try {
    const remoteJid = msg.messages[0].key.remoteJid;
    msg.react("❌");
    await totoro.sendMessage(
      remoteJid,
      { text: mensaje },
      { quoted: msg.messages[0] }
    );
  } catch (error) {
    totoroLog.error(
      "./logs/functions/messages.log",
      `Error enviando mensaje de error: ${error}`
    );
  }
}
async function sendReminder(totoro, msg, nombre, userCount) {
  const remoteJid = msg.messages[0].key.remoteJid;
  const reminderMessage =
    `╭─⬣「 *Recordatorio de Toto para ${nombre}* 」⬣\n` +
    `│  ≡◦  *🍭 ¡${nombre} ya eres un totoUser!*\n` +
    `│  ≡◦  *🍭 Usa +menu para ver mis comandos*\n` +
    `╰─⬣\n\n` +
    `> *Contigo somos ${userCount} totoUsers*`;

  try {
    await msg.react("🐥");
    await totoro.sendMessage(
      remoteJid,
      { text: reminderMessage },
      { quoted: msg.messages[0] }
    );
  } catch (error) {
    totoroLog.error(
      "./logs/functions/messages.log",
      `Error enviando mensaje de recordatorio: ${error}`
    );
  }
}

async function help(totoro, msg, titulo, msgAyuda, ejemplo) {
  const remoteJid = msg.messages[0].key.remoteJid;
  const helpMessage =
    `╭─⬣「 *Ayuda de ${titulo}* 」⬣\n` +
    `│  ≡◦ 🪧 ${msgAyuda}\n` +
    `╰─⬣\n` +
    `> *Ejemplo*: ${ejemplo}`;
  try {
    await msg.react("ℹ️");
    await totoro.sendMessage(
      remoteJid,
      { text: helpMessage },
      { quoted: msg.messages[0] }
    );
  } catch (error) {
    totoroLog.error(
      "./logs/functions/messages.log",
      `Error enviando mensaje de ayuda: ${error}`
    );
  }
}

async function sendSuccess(totoro, msg, mensajeExito) {
  const remoteJid = msg.messages[0].key.remoteJid;
  const successMessage =
    `╭─⬣「 *Éxito* 」⬣\n` +
    `│  ≡◦ *🍭 Totoro ha completado la acción*\n` +
    `╰─⬣\n` +
    `> *Éxito*: ${mensajeExito}`;
  try {
    await msg.react("🍭");
    await totoro.sendMessage(
      remoteJid,
      { text: successMessage },
      { quoted: msg.messages[0] }
    );
  } catch (error) {
    totoroLog.error(
      "./logs/functions/messages.log",
      `Error enviando mensaje de éxito: ${error}`
    );
  }
}

async function noCommand(msg, prefix, pluginName, suggestCommand) {
  msg.reply(
    `╭─⬣「 *Comando* \`${prefix}${pluginName}\` *no encontrado* 」⬣\n` +
      `│  ≡◦  *🍭 Totoro no reconoce este comando*\n` +
      `╰─⬣\n` +
      `> ${suggestCommand}`
  );
  try {
    await msg.react("🔍");
  } catch (error) {
    totoroLog.error(
      "./logs/functions/messages.log",
      `Error enviando mensaje de comando no encontrado: ${error}`
    );
  }
}

// Función para verficar que no estas registrado
async function infoRegister(msg, warningMessage) {
  try {
    await msg.react("⚠️");
    msg.reply(
      `╭─⬣「 *TotoUser* 」⬣\n` +
        `│  ≡◦ *ℹ️  No registrado*\n` +
        `╰─⬣\n` +
        `> ${warningMessage}`
    );
  } catch (error) {
    totoroLog.verbose(
      `./logs/functions/messages.log`,
      `Error enviando mensaje de infoRegister: ${error}`
    );
  }
}

// Función para verficar que no eres premium
async function infoPremium(msg, warningMessage) {
  try {
    await msg.reply(
      `╭─⬣「 *TotoPremium* 」⬣\n` +
        `│  ≡◦ *⚠️ No eres Premium*\n` +
        `╰─⬣\n` +
        `> ${warningMessage}`
    );

    await msg.react("ℹ️");
  } catch (error) {
    return;
  }
}

async function infoSerial(msg, warningMessage) {
  try {
    await msg.react("ℹ️");
    await msg.reply(
      `╭─⬣「 *Número de Serie* 」⬣\n` +
        `│  ≡◦ *⚠️ No tienes número de serie*\n` +
        `╰─⬣\n` +
        `> ${warningMessage}`
    );
  } catch (error) {
    totoroLog.error(
      "./logs/functions/messages.log",
      `Error enviando mensaje de aviso: ${error}`
    );
  }
}

async function sendLicence(msg, userName, Licence) {
  try {
    await msg.reply(
      `╭─⬣「 *Número de Serie* 」⬣\n` +
        `│  ≡◦ *ℹ️ ${userName} Obten tu licencia para ser totoPremium*\n` +
        `╰─⬣\n` +
        `> ${Licence}`
    );
  } catch (error) {
    totoroLog.error(
      "./logs/functions/messages.log",
      `Error enviando mensaje de número de serie: ${error}`
    );
  }
}

async function sendReg(
  totoro,
  msg,
  phone,
  nombre,
  edad,
  serialNumber,
  country,
  userCount
) {
  const registrationMessage =
    `–  *R E G I S T R O  - T O T O  U S E R*   –\n` +
    `┌  ✩  *Nombre* : ${nombre}\n` +
    `│  ✩  *Edad* : ${edad}\n` +
    `│  ✩  *Teléfono* : ${phone}\n` +
    `│  ✩  *País* : ${country}\n` +
    `│  ✩  *Número Serial* : ${serialNumber}\n` +
    `│  ✩  *Fecha de Registro* : ${new Date().toLocaleString("es-ES", {
      timeZone: "UTC",
      hour12: true,
    })}\n` +
    `└  ✩  *Registrado* : ✅\n` +
    `> *¡Bienvenido a la comunidad de Totorolandia contigo ya ${userCount} totoUsers*!`;

  try {
    const remoteJid = msg.messages[0].key.remoteJid;
    await totoro.sendMessage(
      remoteJid,
      { text: registrationMessage },
      { quoted: msg.messages[0] }
    );
  } catch (error) {
    totoroLog.error(
      "./logs/functions/messages.log",
      `Error enviando mensaje de registro: ${error}`
    );
  }
}

async function sendPrem(
  totoro,
  msg,
  phone,
  nombre,
  edad,
  serialNumber,
  country,
  userCount
) {
  const registrationPremiumMessage =
    `–  *R E G I S T R O  - T O T O  P R E M I U M  U S E R*   –\n` +
    `┌  ✩  *Nombre* : ${nombre}\n` +
    `├  ✩  *Edad* : ${edad}\n` +
    `├  ✩  *Teléfono* : ${phone}\n` +
    `├  ✩  *País* : ${country}\n` +
    `├  ✩  *Serial* : ${serialNumber}\n` +
    `│  ✩  *Fecha de Registro* : ${new Date().toLocaleString("es-ES", {
      timeZone: "UTC",
      hour12: true,
    })}\n` +
    `└  ✩  *Premium* : ✅\n` +
    `> *¡Bienvenido a la Membresía Premiun de Totoro contigo ya ${userCount} totoPremium*!`;
  try {
    const remoteJid = msg.messages[0].key.remoteJid;
    await totoro.sendMessage(
      remoteJid,
      { text: registrationPremiumMessage },
      { quoted: msg.messages[0] }
    );
  } catch (error) {
    totoroLog.error(
      "./logs/functions/messages.log",
      `Error enviando mensaje de registro: ${error}`
    );
  }
}

async function dev(msg, pluginName, devMessage) {
  try {
    const settings = require("../../settings.json");
    const dev = settings.dev[0];

    await msg.react("👑");

    const mentionText =
      `╭─⬣「 \`${pluginName}\`」⬣\n` +
      `│  ≡◦ *🔒 Este comando es solo para* @${dev.replace(/@.+/, "")}\n` +
      `╰─⬣\n` +
      `> ${devMessage}`;

    msg.reply({
      text: mentionText,
      quoted: msg.messages[0],
      mentions: [dev],
    });
  } catch (error) {
    console.error(`Error enviando mensaje de aviso: ${error}`);
  }
}

async function cooldown(msg, pluginName, cooldownMessage) {
  try {
    await msg.reply(
      `╭─⬣「 \`${pluginName}\`」⬣\n` +
        `│  ≡◦ *🕒 Espera un momento*\n` +
        `╰─⬣\n` +
        `> ${cooldownMessage}`
    );
    await msg.react("🕒");
  } catch (error) {
    console.error(`Error enviando mensaje de aviso: ${error}`);
  }
}

async function economyCooldown(msg, pluginName, cooldownMessage) {
  try {
    await msg.reply({
      text:
        `╭─⬣「 \`${pluginName}\`」⬣\n` +
        `│  ≡◦ *🕒 Espera un momento*\n` +
        `╰─⬣\n` +
        `> ${cooldownMessage}`,
    });
    await msg.react("🕒");
  } catch (error) {
    console.error(`Error enviando mensaje de economyCooldown: ${error}`);
  }
}
module.exports = {
  dev,
  help,
  cooldown,
  infoRegister,
  sendReminder,
  sendWarning,
  sendSuccess,
  sendMessage,
  infoPremium,
  infoSerial,
  infoGroup,
  sendLicence,
  noCommand,
  sendError,
  sendPrem,
  sendReg,
  economyCooldown,
};
