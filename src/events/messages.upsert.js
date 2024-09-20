const { Collection } = require("@discordjs/collection");
const { deletemessage } = require("@whiskeysockets/baileys");
const { matcher } = require("../functions/matcher");
const totoroLog = require("../functions/totoroLog");
const {
  noCommand,
  infoRegister,
  infoPremium,
  dev,
} = require("../functions/messages");
const {
  totoUser,
  totoDev,
  totoCounter,
  totoGroupMantainance,
  totoGroupEcononmy,
} = require("../models");

module.exports = {
  name: "messages.upsert",

  async load(msg, totoro) {
    if (!msg.messages[0]?.message) return;

    if (msg.type !== "notify") return;

    //if (msg.messages[0].key?.fromMe) return;

    if (msg.sender && msg.sender.is_bot) {
      return;
    }

    const { message: toto, key } = msg.messages[0];

    require("../utils/messageUtils")(totoro, msg);

    const btn =
      toto?.templateButtonReplyMessage || toto?.buttonsResponseMessage;

    if (btn && typeof btn === "object") {
      const selected = btn?.selectedId || btn?.selectedButtonId;
      const [id, ...args] = selected.split("+");

      const component = totoro.components.get(id);
      if (!component) return;

      return component.execute(totoro, msg, args);
    }

    const body =
      toto?.extendedTextMessage?.text ||
      toto?.ephemeralMessage?.message?.extendedTextMessage?.text ||
      toto?.conversation ||
      toto?.imageMessage?.caption ||
      toto?.videoMessage?.caption ||
      toto?.templateButtonReplyMessage?.selectedId ||
      toto?.buttonsResponseMessage?.selectedButtonId;
    if (!body) return;

    // Verificar si el usuario está en modo AFK e ignorar si es desarrollador
    require("../plugins/set up/afk").verify(msg, body);

    const antilink = require("../models/totoAntilinks");
    const antilinkStatus = await antilink.findOne({ where: { active: 1 } });
    if (antilinkStatus && antilinkStatus.status === "active") {
      const isLink = require("../plugins/moderator/antilink").verifyContainsURL(
        msg,
        body.toLowerCase()
      );
      if (isLink(body)) {
        await msg.reply("No se permiten enlaces en este grupo");
        await deletemessage(totoro, key.remoteJid, [msg.key.id]);
        return;
      }
    }
    //  Mencionar a Totoro solo y solo si no es un grupo con el comando "Totoro" o "Toto" o "Toto " o "@Totoro" o "@totoro"

    const keywords = [
      "@toto",
      "@totoro",
      "@totorohelp",
      "@totohelp",
      "toto",
      "totohelp",
      "toto help",
    ];

    const bodyLowerCase = body.toLowerCase();
    const containsKeyword = keywords.some((keyword) =>
      bodyLowerCase.includes(keyword)
    );

    if (containsKeyword) {
      if (!key.remoteJid.endsWith("@g.us")) {
        const Tprefix = totoro.config.prefix;
        return msg.reply({
          text:
            `╭─⬣「 @447360497992 」\n` +
            ` │ ≡◦ Hola, soy @447360497992, un bot multifuncional.\n` +
            ` │ ≡◦ Para ver la lista de comandos, usa \`${Tprefix}help\`.\n` +
            ` │ ≡◦ Para más información, usa \`${Tprefix}info\`.\n` +
            ` │ ≡◦ Si tienes alguna duda, usa \`${Tprefix}faq\`.\n` +
            ` │ ≡◦ Si necesitas ayuda, usa \`${Tprefix}support\`.\n` +
            ` │ ≡◦ Si quieres registrarte, usa \`${Tprefix}register\`.\n` +
            ` │ ≡◦ Si quieres ser premium, usa \`${Tprefix}regprem\`.\n` +
            `╰─⬣`,
          mentions: ["447360497992@s.whatsapp.net"],
        });
      }
    }

    if (!body.startsWith("+") && !body.startsWith(",")) {
      if (key.remoteJid.endsWith("@g.us")) return;
      let user = key.remoteJid;
      const verifypremium = require("../utils/verifypremium");
      const ispremium = await verifypremium(user, totoro, msg);
      if (!ispremium && !totoro.config.dev.includes(user)) {
        return;
      }

      const { chatAI } = require("../utils/chatAI");

      await totoro.sendPresenceUpdate("composing", key.remoteJid);

      const response = await chatAI(totoro, body);

      return msg.reply(response);
    }

    const totoStatus = require("../models/totoStatus");
    const totoMantainance = require("../models/totoMantainance");
    const totoBlock = require("../models/totoBlock");

    const isGroupMessage = key.remoteJid.endsWith("@g.us");
    const userJid = key.remoteJid.includes("@g.us")
      ? key.participant
      : key.remoteJid;
    const participant = userJid.split("@")[0];

    // verificar si el bot está activo o no
    const status = await totoStatus.findOne({ where: { statusId: 1 } });
    if (
      status &&
      status.status === "off" &&
      !totoro.config.dev.includes(userJid)
    ) {
      msg.reply({
        text:
          `╭─⬣「 Totoro desactivado 」\n` +
          `│ ≡◦ Aguarda, esto lleverá un tiempo.\n` +
          `│ ≡◦ Disculpa las molestias.\n` +
          `│ ≡◦ Para más información, contacta a @34638579630\n` +
          `╰─⬣\n` +
          `> @${participant}, el bot está desactivado. Inténtalo más tarde.`,
        mentions: [userJid, "34638579630@s.whatsapp.net"],
      });
      return;
    }

    // verificar si el bot está en mantenimiento
    const maintenance = await totoMantainance.findOne({
      where: { maintenanceId: 1 },
    });
    if (
      maintenance &&
      maintenance.status === "on" &&
      !totoro.config.dev.includes(userJid)
    ) {
      msg.reply({
        text:
          `╭─⬣「 Totoro en mantenimiento 」\n` +
          `│ ≡◦ Aguarda, esto lleverá un tiempo.\n` +
          `│ ≡◦ Disculpa las molestias.\n` +
          `│ ≡◦ Para más información, contacta a @34638579630\n` +
          `╰─⬣\n` +
          `> @${participant}, el bot está en mantenimiento. Inténtalo más tarde.`,
        mentions: [userJid, "34638579630@s.whatsapp.net"],
      });
      return;
    }
    // verificar si el bot está bloqueado en el grupo actual y sin bloquear a todo el bot
    if (isGroupMessage) {
      const groupId = key.remoteJid;
      const block = await totoBlock.findOne({ where: { groupId } });

      if (
        block &&
        block.status === "on" &&
        !totoro.config.dev.includes(userJid) &&
        !groupId.includes("@broadcast")
      ) {
        msg.reply({
          text:
            `╭─⬣「 Totoro bloqueado 」\n` +
            `│ ≡◦ Totoro ha sido bloqueado en este ${
              isGroupMessage ? "grupo" : "chat"
            }.\n` +
            `│ ≡◦ Disculpa las molestias.\n` +
            `│ ≡◦ Los administradores pueden desbloquear el bot.\n` +
            `│ ≡◦ Para más información, contacta a @34638579630\n` +
            `╰─⬣\n` +
            `> @${participant}, el bot está bloqueado en este grupo. Inténtalo más tarde.`,
          mentions: [userJid, "34638579630@s.whatsapp.net"],
        });
        return;
      }

      const groupMantainance = await totoGroupMantainance.findOne({
        where: { groupId },
      });

      if (
        groupMantainance &&
        groupMantainance.status === "on" &&
        !totoro.config.dev.includes(userJid)
      ) {
        msg.reply({
          text:
            `╭─⬣「 ${isGroupMessage ? "Grupo" : "Chat"} en mantenimiento 」\n` +
            `│ ≡◦ Totoro está en mantenimiento en este ${
              isGroupMessage ? "grupo" : "chat"
            }.\n` +
            `│ ≡◦ Disculpa las molestias.\n` +
            `│ ≡◦ Para más información, contacta a @34638579630\n` +
            `╰─⬣\n` +
            `> @${participant}, el bot está en mantenimiento. Inténtalo más tarde.`,
          mentions: [userJid, "34638579630.s.whatsapp.net"],
        });
        return;
      }
    }

    const args = body.slice(1).trim().split(/\s+/);
    const pluginName = args.shift().toLowerCase();
    const Tprefix = totoro.config.prefix;
    const plugin =
      totoro.plugins.get(pluginName) ||
      totoro.plugins.find((v) => v.aliases && v.aliases.includes(pluginName));

    if (!plugin) {
      if (!totoro.aliases) {
        totoro.aliases = new Map();
      }

      const pluginEntry = [
        ...Array.from(totoro.plugins.keys()),
        ...Array.from(totoro.aliases.keys()),
      ];

      const matcherx = matcher(pluginName, pluginEntry).filter(
        (v) => v.accuracy >= 60
      );

      if (matcherx.length > 0) {
        return noCommand(
          msg,
          Tprefix,
          pluginName,
          `${matcherx
            .map((v) => `\`🐥 ${Tprefix}${v.string} (${v.accuracy}%)\``)
            .join("\n> ")}`
        );
      }
    }

    if (!plugin) {
      return;
    }

    let user = key.remoteJid;
    if (user.includes("@g.us")) user = key.participant;

    // Verificación del propietario
    if (plugin.dev && !totoro.config.dev.includes(user)) {
      return dev(
        msg,
        pluginName,
        `Este comando es exclusivo para el propietario del bot.`
      );
    }

    // Verificación de si economía está activada
    if (plugin.economy && !totoro.config.dev.includes(user)) {
      const groupEconomy = await totoGroupEcononmy.findOne({
        where: { groupId: key.remoteJid },
      });

      if (groupEconomy && groupEconomy.status === "off") {
        return msg.reply(
          `╭─⬣「 totoEconomy 」\n` +
            `│ ≡◦ La economía está desactivada en este grupo.\n` +
            `│ ≡◦ Los administradores pueden activarla con \`${Tprefix}economy on\`.\n` +
            `╰─⬣\n` +
            `> @${participant}, la economía está desactivada en este grupo.`
        );
      }
    }
    // Verificación de bloqueo de comandos
    if (plugin.cmdBlock && !totoro.config.dev.includes(user)) {
      msg.reply({
        text:
          `╭─⬣「 🐥 Comando bloqueado 」\n` +
          `│ ≡◦ Este comando ha sido bloqueado temporalmente.\n` +
          `│ ≡◦ Disculpa las molestias.\n` +
          `│ ≡◦ Para más información, contacta a @34638579630\n` +
          `╰─⬣\n` +
          `> @${participant}, el comando está bloqueado temporalmente. Inténtalo más tarde.`,
        mentions: [user, "34638579630@.s.whatsapp.net"],
      });
      return;
    }

    // Verificación de cooldown
    if (!totoro.cooldowns) {
      totoro.cooldowns = new Map();
    }

    if (!totoro.cooldowns.has(plugin.name)) {
      totoro.cooldowns.set(plugin.name, new Collection());
    }

    const now = Date.now();
    const timestamps = totoro.cooldowns.get(plugin.name);
    const cooldownAmount = (plugin.cooldown || 3) * 1000;

    if (timestamps.has(userJid)) {
      const expirationTime = timestamps.get(userJid) + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return cooldown(
          msg,
          pluginName,
          `Espera ${timeLeft.toFixed(
            1
          )} segundos antes de volver a usar el comando \`${Tprefix}${pluginName}\``
        );
      }
    }

    // Verificación de registro
    const verifyuser = require("../utils/verifyuser");
    const isVerified = await verifyuser(user, totoro, msg);
    if (
      !isVerified &&
      plugin.name !== "register" &&
      !totoro.config.dev.includes(user)
    ) {
      return infoRegister(
        msg,
        `Te invitamos Totorolandia con ${Tprefix}register <nombre>.<edad>`
      );
    }

    // cmdPremium
    const verifypremium = require("../utils/verifypremium");
    const ispremium = await verifypremium(user, totoro, msg);
    if (!ispremium && plugin.cmdPrem && !totoro.config.dev.includes(user)) {
      return infoPremium(
        msg,
        `Te invitamos a Totorolandia Premium con el comando ${Tprefix}regprem <serial>`
      );
    }

    // Incrementar el contador del comando actual si no es un desarrollador ni el teléfono específico
    const specificPhoneToExclude = "34638579630";
    const currentUser = await totoUser.findOne({
      where: {
        phone: user.split("@")[0],
      },
    });

    const devUsers = await totoDev.findAll({ attributes: ["phone"] });
    const totoCounterActivate = require("../models/totoCounterActivate");
    const devPhones = devUsers.map((dev) =>
      dev.phone.replace("@s.whatsapp.net", "")
    );

    const activateCounter = await totoCounterActivate.findOne({
      where: { counterId: 1 },
    });

    if (
      !currentUser ||
      !activateCounter ||
      activateCounter.status !== "on" ||
      devPhones.includes(user.split("@")[0]) ||
      user.split("@")[0] === specificPhoneToExclude
    ) {
      return plugin.execute(totoro, msg, args);
    } else {
      const counterRecord = await totoCounter.findOne({
        where: {
          totoUserId: currentUser.id,
          pluginName: plugin.name,
        },
      });

      if (counterRecord) {
        await counterRecord.increment("count");
      } else {
        await totoCounter.create({
          totoUserId: currentUser.id,
          pluginName: plugin.name,
          count: 1,
        });
      }
    }

    plugin.execute(totoro, msg, args)?.catch((error) => {
      msg
        .reply(
          `🐥 Ocurrió un error al ejecutar el comando *${pluginName}* 🐥\n\n> ${error.message}`
        )
        .then((msg) => {
          msg.react("❌");
        });

      totoroLog.error(
        "./logs/events/messages.upsert.log",
        `Error ejecutando ${pluginName}: ${error.message}`
      );
      console.error(error);
    });
  },
};
