const { Minimal } = require("greetify");
const { totoWelcm, totoGroupSettings } = require("../models");

module.exports = {
  name: "group-participants.update",

  async load(msg, totoro) {
    try {
      const groupId = msg.id; 
      const groupConfig = await totoGroupSettings.findOne({
        where: { groupId },
      }); 
      if (!groupConfig || groupConfig.status !== "on") {
        return;
      }

      if (!msg.participants || msg.participants.length === 0) {
        return;
      }

      const phone = msg.participants[0]; // Primer participante
      if (!phone) {
        return;
      }

      const action = msg.action;

      switch (action) {
        case "add":
          try {
            const groupInfo = await totoro.groupMetadata(groupId);
            const groupName = groupInfo.subject;

            await totoWelcm.create({
              groupId: groupId,
              groupName: groupName,
              phone: phone.split("@")[0],
              action: "join",
            });

            let profile;
            try {
              profile = await totoro.profilePictureUrl(phone, "image", 5000);
            } catch {
              profile = "https://i.ibb.co/j9N5kj3/image.jpg";
            }

            const card = await greetings(
              profile,
              "Bienvenido/a",
              phone.split("@")[0]
            );
            const prefix = require("../../settings.json").prefix;

            const welcomeMessage =
              `╭───⬣ 〘 *🎉 Bienvenido/a @${phone.split("@")[0]} 🎉* 〙\n` +
              `│\n` +
              `│ 🌟 *¡Qué gusto tenerte en* *${groupName}*!* 🌟\n` +
              `│\n` +
              `│ 📋 *Recuerda echarle un vistazo a la descripción del grupo para conocer nuestras reglas.*\n` +
              `│\n` +
              `│ 🔑 *Acceso completo al bot:*\n` +
              `│    - Usa *${prefix}register* para activar todas las funcionalidades del bot.\n` +
              `│\n` +
              `│ ❓ *¿Tienes alguna duda, problema o sugerencia?*\n` +
              `│    - Reporta con: *${prefix}faq report*\n` +
              `│    - Haz sugerencias con: *${prefix}faq suggest*\n` +
              `│\n` +
              `│ 💬 *Deja tu reseña con:* *${prefix}faq review*\n` +
              `│\n` +
              `│ 👥 *Actualmente somos* *${groupInfo.participants.length}* *miembros en el grupo.*\n` +
              `╰───⬣ ¡Disfruta y sé parte de esta gran comunidad! 🌿🍃`;

            await totoro.sendMessage(groupId, {
              image: card,
              caption: welcomeMessage,
              mentions: [phone],
            });
          } catch (dbError) {
            console.error(
              "Error al agregar el teléfono a la base de datos:",
              dbError
            );
          }
          break;

        case "remove":
          try {
            const groupInfo = await totoro.groupMetadata(groupId);
            const groupName = groupInfo.subject;

            await totoWelcm.create({
              groupId: groupId,
              groupName: groupName,
              phone: phone.split("@")[0],
              action: "leave",
            });

            let profile;
            try {
              profile = await totoro.profilePictureUrl(groupId, "image");
            } catch {
              profile = "https://i.ibb.co/j9N5kj3/image.jpg";
            }

            const pushname = phone.split("@")[0];
            const card = await greetings(profile, "Hasta Pronto", pushname);
            const farewellMessage =
              `╭───⬣ 〘 *🌟 ¡Adiós  @${phone.split("@")[0]}!* 🌟 〙\n` +
              `│\n` +
              `│ 😢 *Lamentamos verte partir de* *${groupName}*.\n` +
              `│\n` +
              `│ 🍃 *Esperamos que te haya gustado tu tiempo con nosotros y que regreses pronto.*\n` +
              `│\n` +
              `│ 🙌 *Recuerda que siempre serás bienvenido/a a unirte de nuevo.*\n` +
              `│\n` +
              `│ 👥 *Ahora somos* *${groupInfo.participants.length}* *miembros en el grupo.*\n` +
              `╰───⬣ ¡Cuídate y hasta pronto! 👋`;

            await totoro.sendMessage(groupId, {
              image: card,
              caption: farewellMessage,
              mentions: [phone],
            });
          } catch (dbError) {
            console.error(
              "Error al agregar el teléfono a la base de datos:",
              dbError
            );
          }
          break;

        default:
          break;
      }
    } catch (e) {
      console.error("Error en el módulo de bienvenida:", e);
    }
  },
};

async function greetings(avatar, type, name) {
  const card = await Minimal({
    avatar: avatar,
    backgroundImage: "https://i.ibb.co/wrkjsVt/image.jpg",
    name: type,
    nameColor: "#e19FFF",
    type: name,
    message: "Made by Totoro",
  });
  return card;
}
