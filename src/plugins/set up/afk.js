const { totoAfk, totoUser, totoDev } = require("../../models");
const { sendError } = require("../../functions/messages");
const totoroPrefix = require("../../../settings.json").prefix;
module.exports = {
  name: "afk",
  category: "settings",
  subcategory: "setup",
  usage: "afk <razón>",
  description: "Ponte en modo ausente.",
  example: "afk Estoy ocupado.",

  blockcmd: false,
  cmdPrem: false,
  async execute(totoro, msg, args) {
    let remoteJid = "";
    try {
      // Asegurar que msg y sus propiedades están definidos
      const message = msg.messages[0];
      const key = message.key || {};
      remoteJid = key.remoteJid;
      const participant = key.participant || "";

      await msg.react("🔔");
      const phoneNumber = participant.split("@")[0];

      const reason = args.length
        ? args.join(" ")
        : "No se proporcionó una razón.";

      const user = await totoUser.findOne({ where: { phone: phoneNumber } });

      const dev = await totoDev.findOne({ where: { phone: phoneNumber } });

      if (!user) {
        msg.react("⚠️");
        await msg.reply({
          text:
            `╭─⬣「 *@${participant.split("@")[0]}* 」⬣\n` +
            `│  ≡◦ *No estás registrado en Totorolandia*\n` +
            `│  ≡◦ *Regístrate con ${totoroPrefix}registrar*\n` +
            `╰─⬣\n` +
            `> Ejemplo: ${totoroPrefix}registrar Nombre.edad`,
          mentions: [participant],
        });
        return;
      }
      // Encuentra el registro AFK para el usuario, o crea uno nuevo si no existe
      let afkRecord = await totoAfk.findOne({ where: { userId: user.id } });
      const timex = Math.floor(Date.now() / 1000);
      if (!afkRecord) {
        afkRecord = await totoAfk.create({
          userId: user.id,
          userPhone: phoneNumber,
          userName: user.name,
          reason: reason,
          status: "AFK",
          time: timex,
        });
      } else {
        // Si el registro AFK ya existe, actualiza la razón y el estado
        afkRecord.reason = reason;
        afkRecord.status = "AFK";
        afkRecord.time = Math.floor(Date.now() / 1000);
        await afkRecord.save();
      }

      await msg.react("🔕");
      await totoro.sendMessage(
        remoteJid,
        {
          text:
            `╭─⬣「 *AFK* 」⬣\n` +
            `│  ≡◦ *🔕 ${user.name}(@${
              participant.split("@")[0]
            }) está ahora en modo AFK*\n` +
            `│  ≡◦ *Fecha:* ${new Date().toLocaleString("es-ES")}\n` +
            `╰─⬣\n` +
            `> ${reason}`,
          mentions: [participant],
        },
        { quoted: msg.messages[0] }
      );
    } catch (error) {
      if (remoteJid) {
        sendError(totoro, msg, error);
      }
    }
  },
  async verify(msg, content) {
    const message = msg.messages[0];
    const key = message.key || {};
    const participant = key.participant || "";
    const user = await totoAfk.findAll({ where: { status: "AFK" } });

    for (const userx of user) {
      if (participant.split("@")[0] === userx.dataValues.userPhone) {
        msg.react("🔔");
        const time = Math.floor(Date.now() / 1000);
        const timee = time - parseInt(userx.dataValues.time);
        const hours = Math.floor(timee / 3600);
        const min = Math.floor((timee % (60 * 60)) / 60);
        const sec = Math.floor(timee % 60);

        const formattedTime = [];

        if (hours == 1) formattedTime.push("1 hora");
        else if (hours > 1) formattedTime.push(`${hours} horas`);
        if (min == 1) formattedTime.push("1 minuto");
        else if (min > 1) formattedTime.push(`${min} minutos`);
        if (sec == 1) formattedTime.push("1 segundo");
        else if (sec > 1) formattedTime.push(`${sec} segundos`);
        await msg.reply({
          text:
            `╭─⬣「 *NO AFK* 」⬣\n` +
            `│  ≡◦ *🔔 ${userx.dataValues.userName} (@${userx.dataValues.userPhone}) ha vuelto de su modo AFK*\n` +
            `│  ≡◦ *Fecha:* ${new Date().toLocaleString("es-ES")}\n` +
            `│  ≡◦ *Total de menciónes:* ${userx.dataValues.mentOnAFK}\n` +
            `│  ≡◦ *Tiempo transcurrido:* ${formattedTime.join(", ")}\n` +
            `╰─⬣\n` +
            `> ${userx.reason}`,
          mentions: [userx.dataValues.userPhone + "@s.whatsapp.net"], // Menciona a la persona en modo AFK
        });

        await totoAfk.upsert({
          userId: userx.dataValues.userId,
          userPhone: userx.dataValues.userPhone,
          userName: userx.dataValues.userName,
          reason: userx.dataValues.reason,
          status: "NO AFK",
          time: 0,
          mentOnAFK: 0,
        });
        return;
      }

      if (content.includes(userx.dataValues.userPhone)) {
        //  si funciona, no lo toques
        const time = Math.floor(Date.now() / 1000);
        const timee = time - parseInt(userx.dataValues.time);
        const hours = Math.floor(timee / 3600);
        const min = Math.floor((timee % (60 * 60)) / 60);
        const sec = Math.floor(timee % 60);

        const formattedTime = [];

        if (hours == 1) formattedTime.push("1 hora");
        else if (hours > 1) formattedTime.push(`${hours} horas`);
        if (min == 1) formattedTime.push("1 minuto");
        else if (min > 1) formattedTime.push(`${min} minutos`);
        if (sec == 1) formattedTime.push("1 segundo");
        else if (sec > 1) formattedTime.push(`${sec} segundos`);

        await totoAfk.upsert({
          userId: userx.dataValues.userId,
          userPhone: userx.dataValues.userPhone,
          userName: userx.dataValues.userName,
          reason: userx.dataValues.reason,
          status: userx.dataValues.status,
          time: userx.dataValues.time,
          mentOnAFK: userx.dataValues.mentOnAFK + 1,
        });

        await msg.reply({
          text:
            `╭─⬣「 *AFK* 」⬣\n` +
            `│  ≡◦ *🔕 ${userx.dataValues.userName} (@${userx.dataValues.userPhone}) está ahora en modo AFK*\n` +
            `│  ≡◦ *Fecha:* ${new Date().toLocaleString("es-ES")}\n` +
            `│  ≡◦ *@${userx.dataValues.userPhone} te han mencionado: ${userx.dataValues.mentOnAFK} veces*\n` +
            `│  ≡◦ *Tiempo transcurrido:* ${formattedTime.join(", ")}\n` +
            `╰─⬣\n` +
            `> ${userx.reason}`,
          mentions: [userx.dataValues.userPhone + "@s.whatsapp.net"], // Menciona a la persona en modo AFK
        });
      }
    }
    return null;
  },
};
