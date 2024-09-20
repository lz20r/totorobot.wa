const { Minimal } = require("greetify");
const { totoWelcm, totoGroupSettings } = require("../models");

module.exports = {
  name: "group-participants.update",

  async load(msg, totoro) {
    try {
      const toto = msg;
      const groupId = toto.id;
      const groupConfig = await totoGroupSettings.findOne({
        where: { groupId },
      });

      if (!groupConfig || !groupConfig.welcomeEnabled) {
        return;
      }

      const phone = toto.participants[0];

      if (!phone) {
        return;
      }

      // Determinar la acción a partir del mensaje directamente
      const action = msg.action; // Ejemplo ficticio

      switch (action) {
        case "add":
          try {
            await totoWelcm.create({
              groupId: groupId,
              phone: phone.split("@")[0],
              action: "join",
            });

            let profile;
            try {
              profile = await totoro.profilePictureUrl(phone, "image", 5000);
            } catch (profileError) {
              console.error(
                "Error obteniendo la foto de perfil:",
                profileError
              );
              profile = "https://i.ibb.co/j9N5kj3/image.jpg";
            }

            const card = await greetings(
              profile,
              "BIENVENIDO",
              phone.split("@")[0]
            );

            const prefix = require("../../settings.json").prefix;
            const groupInfo = await totoro.groupMetadata(groupId);
            const groupName = groupInfo.subject;
            const message =
              `> 👋 Bienvenido  @${phone.split("@")[0]} al grupo ${groupName}.\n` +
              `                                 ⭣\n` +
              `> 📜 Lee la descripción para enterarte de las reglas y evitar sanciones :D\n` +
              `> ❗Información importante:\n` +
              `> 🔓 Para poder tener acceso completo al bot sin problemas usa:${prefix}register\n` +
              `> 😃 Si tienes alguna duda, sugerencia o problema no dudes en usar: ${prefix}report, ${prefix}review, ${prefix}suggest\n` +
              `> ❤ Disfruta de tu estancia en Only 3! 🌿🍃\n\n` +
              `> 🪼 Actualmente en *${groupName}* hay ${groupInfo.participants.length} miembros.`;

            await totoro.sendMessage(groupId, {
              image: card,
              caption: message,
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
            await totoWelcm.create({
              groupId: groupId,
              phone: phone.split("@")[0],
              action: "leave",
            });

            let profile;
            try {
              profile = await totoro.profilePictureUrl(toto.id, "image");
            } catch (profileError) {
              console.error(
                "Error obteniendo la foto de perfil:",
                profileError
              );
              profile = "https://i.ibb.co/j9N5kj3/image.jpg";
            }

            const pushname = phone.split("@")[0];
            const card = await greetings(profile, "ADIOS", pushname);

            const message = `*🌳 Adios @${pushname}*`;

            await totoro.sendMessage(groupId, {
              image: card,
              caption: message,
              mentions: [phone],
            });
          } catch (dbError) {
            console.error(
              "Error al agregar el teléfono a la base de datos:",
              dbError
            );
          }
          break;

        case "kick":
          try {
            await totoWelcm.create({
              groupId: groupId,
              phone: phone.split("@")[0],
              action: "kick",
            });

            const message = `*🌳 Expulsado @${phone}*`;

            await totoro.sendMessage(groupId, {
              text: message,
              mentions: [phone],
            });
          } catch (dbError) {
            console.error(
              "Error al agregar el teléfono a la base de datos:",
              dbError
            );
          }
          break;

        case "spam":
          try {
            await totoWelcm.create({
              groupId: groupId,
              phone: phone.split("@")[0],
              action: "spam",
            });

            const message = `*🌳 Mensaje de advertencia por spam a @${phone}*`;

            await totoro.sendMessage(groupId, {
              text: message,
              mentions: [phone],
            });
          } catch (dbError) {
            console.error(
              "Error al agregar el teléfono a la base de datos:",
              dbError
            );
          }
          break;

        case "block":
          try {
            await totoWelcm.create({
              groupId: groupId,
              phone: phone.split("@")[0],
              action: "block",
            });

            const message = `*🌳 Usuario @${phone} bloqueado*`;

            await totoro.sendMessage(groupId, {
              text: message,
              mentions: [phone],
            });
          } catch (dbError) {
            console.error(
              "Error al agregar el teléfono a la base de datos:",
              dbError
            );
          }
          break;

        case "antilinks":
          try {
            await totoWelcm.create({
              groupId: groupId,
              phone: phone.split("@")[0],
              action: "antilinks",
            });

            const message = `*🌳 Advertencia por compartir enlaces a @${phone}*`;

            await totoro.sendMessage(groupId, {
              text: message,
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
