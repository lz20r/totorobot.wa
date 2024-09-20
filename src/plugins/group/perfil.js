const { sendError, sendWarning } = require("../../functions/messages");
const verifyUser = require("../../utils/verifyuser");
const formatPhoneNumber = require("../../utils/formatPhoneNumber");
const { totoUser, totoAdmin, totoDev } = require("../../models");
const { totoroLog } = require("../../functions/totoroLog");

module.exports = {
  name: "perfil",
  category: "group",
  subcategory: "tools",
  description: "Muestra el perfil de un usuario",
  usage: "perfil <@usuario>",
  aliases: ["profile", "p"],

  async execute(totoro, msg, args) {
    try {
      const participant = msg.messages?.[0]?.key?.participant;
      const remoteJid = msg.messages?.[0]?.key?.remoteJid;

      let user;
      user = await verifyUser(participant, totoro, msg);

      let totoU;
      if (args[0]) {
        const mentionedPhone = args[0];
        totoU =
          (await totoUser.findOne({ where: { phone: mentionedPhone } })) ||
          (await totoUser.findOne({ where: { name: mentionedPhone } })) ||
          (await totoUser.findOne({ where: { id: mentionedPhone } }));

        if (!totoU) {
          msg.react("⚠️");
          msg.reply({
            text:
              `╭─⬣「 *Perfil de @${mentionedPhone}* 」⬣\n` +
              `│  ≡◦ *⚠️  Información no proporcionada*\n` +
              `╰─⬣\n\n` +
              `> 🧩 Totoro no registró a ningún usuario con el número de teléfono, nombre o ID`,

            mentions: [mentionedPhone + "@s.whatsapp.net"],
          });
          return;
        }
      } else {
        totoU = await totoUser.findOne({ where: { phone: user.phone } });
      }

      let profilePicUrl;
      try {
        if (args[0]) {
          const mentionedJid = `${totoU.phone}@s.whatsapp.net`;
          profilePicUrl = await totoro.profilePictureUrl(
            mentionedJid,
            "image",
            5000
          );
        } else {
          profilePicUrl = await totoro.profilePictureUrl(
            participant,
            "image",
            5000
          );
        }
      } catch (profileError) {
        //profilePicUrl = "https://tinyurl.com/2a9gkg8l";
        profilePicUrl = "https://tinyurl.com/24cjylya";
      }

      if (totoU) {
        const formattedPhone = formatPhoneNumber(totoU.phone);
        const profileMessage =
          `╭─⬣「 *Perfil de ${totoU.name}* 」⬣\n` +
          `│  ≡◦ *🍭 ID*: ${totoU.id}\n` +
          `│  ≡◦ *🍭 Nombre*: ${totoU.name}\n` +
          `│  ≡◦ *🍭 Alias*: @${totoU.dataValues.phone}\n` +
          `│  ≡◦ *🍭 Teléfono*: ${formattedPhone}\n` +
          `│  ≡◦ *🍭 País*: ${totoU.country}\n` +
          `│  ≡◦ *🍭 LINK*: wa.me/${totoU.phone.replace(/\D/g, "")}\n` +
          `│  ≡◦ *🍭 Edad*: ${totoU.age} años\n` +
          `│  ≡◦ *🍭 Registrado*: ${totoU.registered ? "Sí" : "No"}\n` +
          `│  ≡◦ *🍭 Premium*: ${totoU.isPremium ? "Sí" : "No"}\n` +
          `│  ≡◦ *🍭 Serial*: ${totoU.serialNumber}\n` +
          `╰─⬣\n\n` +
          `> 🍭 Gracias por usar Totoro`;

        await totoro.sendMessage(remoteJid || participant, {
          image: { url: profilePicUrl },
          caption: profileMessage,
          mentions: [totoU.dataValues.phone + "@s.whatsapp.net"],
        });
      } else {
        return sendWarning(
          totoro,
          msg,
          "No se pudo obtener la información del perfil del usuario."
        );
      }
    } catch (error) {
      await sendError(totoro, msg, `${error.message}`);
      totoroLog.error(
        "./logs/plugins/group/perfil.log",
        `Error en el comando ${this.name}: ${error.message}`
      );
    }
  },
};
