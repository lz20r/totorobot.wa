const { totoEconomy } = require("../../models");
const { economyCooldown, sendWarning } = require("../../functions/messages");
const prefix = require("../../../settings.json").prefix;
const convertTime = require("../../functions/convertTime");

module.exports = {
  name: "work",
  category: "totoEconomy",
  subcategory: "ganancias",
  description: "Realiza un trabajo para ganar totoCoins.",
  usage: `${prefix}work`,
  cooldown: 600000, // 10 minutos de cooldown
  economy: true,
  execute: async (totoro, msg, args) => {
    try {
      const info = msg.messages[0];
      const isGroup = info.key.remoteJid.endsWith(`@g.us`);
      const sender = isGroup ? info.key.participant : info.key.remoteJid;
      const user = sender.split(`@`)[0];
      const groupId = isGroup ? info.key.remoteJid : sender;
      const groupInfo = await totoro.groupMetadata(groupId);
      const groupName = groupInfo.subject;

      // Buscar al usuario en la base de datos
      let economy = await totoEconomy.findOne({
        where: { phone: user, groupId: groupId },
      });

      const timeout = 600000; // 10 minutos

      // Verificar si el usuario ya trabajó recientemente (cooldown)
      if (economy && economy.lastWork) {
        const lastWorkTime = economy.lastWork;
        const timeDifference = Date.now() - lastWorkTime;

        if (timeDifference < timeout) {
          const timeLeft = convertTime(timeout - timeDifference);
          await economyCooldown(
            msg,
            "work",
            `Espera ${timeLeft} antes de trabajar nuevamente.`
          );
          return;
        }
      }

      // Lista de trabajos posibles
      const jobs = [
        "> Trabajaste como bartender y ganaste @coins totoCoins.",
        "> Fuiste jardinero por un día y ganaste @coins totoCoins.",
        "> Hiciste reparaciones en una casa y ganaste @coins totoCoins.",
        "> Trabajaste en una tienda y ganaste @coins totoCoins.",
        "> Fuiste conductor de entrega y ganaste @coins totoCoins.",
        "> Hiciste trabajos de limpieza y ganaste @coins totoCoins.",
        "> Trabajaste en un café y ganaste @coins totoCoins.",
        "> Fuiste tutor y ganaste @coins totoCoins.",
        "> Hiciste trabajos freelance y ganaste @coins totoCoins.",
        "> Trabajaste en una oficina y ganaste @coins totoCoins.",
        "> Fuiste asistente administrativo y ganaste @coins totoCoins.",
        "> Trabajaste en una biblioteca y ganaste @coins totoCoins.",
        "> Hiciste tareas de mantenimiento y ganaste @coins totoCoins.",
        "> Fuiste cajero en un supermercado y ganaste @coins totoCoins.",
        "> Trabajaste como diseñador gráfico y ganaste @coins totoCoins.",
        "> Fuiste escritor de contenido y ganaste @coins totoCoins.",
        "> Trabajaste como fotógrafo y ganaste @coins totoCoins.",
        "> Hiciste consultoría y ganaste @coins totoCoins.",
        "> Fuiste recepcionista y ganaste @coins totoCoins.",
        "> Trabajaste como traductor y ganaste @coins totoCoins.",
        "> Hiciste reparaciones de computadoras y ganaste @coins totoCoins.",
        "> Trabajaste en un centro de llamadas y ganaste @coins totoCoins.",
        "> Fuiste asistente de ventas y ganaste @coins totoCoins.",
        "> Trabajaste como animador de eventos y ganaste @coins totoCoins.",
        "> Hiciste trabajos de jardinería y ganaste @coins totoCoins.",
        "> Trabajaste como redactor de textos y ganaste @coins totoCoins.",
        "> Fuiste vigilante de seguridad y ganaste @coins totoCoins.",
        "> Trabajaste como organizador de eventos y ganaste @coins totoCoins.",
        "> Hiciste pruebas de software y ganaste @coins totoCoins.",
        "> Fuiste desarrollador web y ganaste @coins totoCoins.",
        "> Trabajaste como operario de producción y ganaste @coins totoCoins.",
        "> Hiciste tareas de logística y ganaste @coins totoCoins.",
        "> Fuiste ayudante de cocina y ganaste @coins totoCoins.",
        "> Trabajaste como asistente de investigación y ganaste @coins totoCoins.",
        "> Hiciste auditoría y ganaste @coins totoCoins.",
        "> Fuiste entrenador personal y ganaste @coins totoCoins.",
        "> Trabajaste como guía turístico y ganaste @coins totoCoins.",
        "> Hiciste diseño de interiores y ganaste @coins totoCoins.",
        "> Fuiste gestor de redes sociales y ganaste @coins totoCoins.",
        "> Trabajaste en una tienda de ropa y ganaste @coins totoCoins.",
        "> Hiciste servicios de catering y ganaste @coins totoCoins.",
        "> Fuiste técnico de sonido y ganaste @coins totoCoins.",
        "> Trabajaste como asistente de dirección y ganaste @coins totoCoins.",
        "> Hiciste trabajos de carpintería y ganaste @coins totoCoins.",
        "> Fuiste coordinador de proyectos y ganaste @coins totoCoins.",
        "> Trabajaste en una empresa de limpieza y ganaste @coins totoCoins.",
        "> Hiciste trabajos de pintura y ganaste @coins totoCoins.",
        "> Fuiste agente de bienes raíces y ganaste @coins totoCoins.",
        "> Trabajaste como montador de muebles y ganaste @coins totoCoins.",
        "> Hiciste tareas de asesoría financiera y ganaste @coins totoCoins.",
        "> Fuiste instructor de yoga y ganaste @coins totoCoins.",
        "> Trabajaste como coordinador de eventos y ganaste @coins totoCoins.",
        "> Hiciste trabajos de traducción y ganaste @coins totoCoins.",
        "> Fuiste programador de aplicaciones y ganaste @coins totoCoins.",
        "> Trabajaste como conductor de taxi y ganaste @coins totoCoins.",
        "> Hiciste asesoría legal y ganaste @coins totoCoins.",
        "> Fuiste diseñador de moda y ganaste @coins totoCoins.",
        "> Trabajaste como productor de video y ganaste @coins totoCoins.",
        "> Hiciste análisis de datos y ganaste @coins totoCoins.",
        "> Fuiste guía de montaña y ganaste @coins totoCoins.",
        "> Trabajaste como terapeuta y ganaste @coins totoCoins.",
        "> Hiciste asesoría de marketing y ganaste @coins totoCoins.",
        "> Fuiste gestor de proyectos y ganaste @coins totoCoins.",
        "> Trabajaste como especialista en SEO y ganaste @coins totoCoins.",
        "> Hiciste tareas de ingeniería y ganaste @coins totoCoins.",
        "> Fuiste administrador de sistemas y ganaste @coins totoCoins.",
        "> Trabajaste como analista de mercado y ganaste @coins totoCoins.",
        "> Hiciste diseño gráfico para redes sociales y ganaste @coins totoCoins.",
        "> Fuiste asesor en recursos humanos y ganaste @coins totoCoins.",
        "> Trabajaste como gestor de relaciones públicas y ganaste @coins totoCoins.",
        "> Hiciste pruebas de usabilidad y ganaste @coins totoCoins.",
        "> Fuiste profesor de música y ganaste @coins totoCoins.",
        "> Trabajaste como asesor de ventas y ganaste @coins totoCoins.",
        "> Hiciste producción de eventos y ganaste @coins totoCoins.",
        "> Fuiste técnico en redes y ganaste @coins totoCoins.",
        "> Trabajaste como editor de video y ganaste @coins totoCoins.",
        "> Hiciste asesoría en salud y bienestar y ganaste @coins totoCoins.",
        "> Fuiste analista de datos y ganaste @coins totoCoins.",
        "> Trabajaste como planificador financiero y ganaste @coins totoCoins.",
        "> Hiciste servicios de transporte y ganaste @coins totoCoins.",
        "> Fuiste operador de maquinaria y ganaste @coins totoCoins.",
        "> Trabajaste como diseñador de productos y ganaste @coins totoCoins.",
        "> Hiciste servicios de asesoría técnica y ganaste @coins totoCoins.",
        "> Fuiste especialista en atención al cliente y ganaste @coins totoCoins.",
        "> Trabajaste como coordinador de logística y ganaste @coins totoCoins.",
        "> Hiciste trabajos de producción audiovisual y ganaste @coins totoCoins.",
        "> Fuiste organizador de ferias y ganaste @coins totoCoins.",
        "> Trabajaste como promotor de ventas y ganaste @coins totoCoins.",
        "> Hiciste tareas de planificación estratégica y ganaste @coins totoCoins.",
        "> Fuiste asesor de inversión y ganaste @coins totoCoins.",
        "> Trabajaste como guía de viajes y ganaste @coins totoCoins.",
        "> Hiciste servicios de administración de propiedades y ganaste @coins totoCoins.",
        "> Fuiste especialista en investigación y ganaste @coins totoCoins.",
        "> Trabajaste como profesor de matemáticas y ganaste @coins totoCoins.",
        "> Hiciste labores de atención al cliente y ganaste @coins totoCoins.",
        "> Fuiste técnico en mantenimiento y ganaste @coins totoCoins.",
        "> Trabajaste como redactor técnico y ganaste @coins totoCoins.",
        "> Hiciste consultoría en TI y ganaste @coins totoCoins.",
        "> Fuiste coordinador de actividades recreativas y ganaste @coins totoCoins.",
      ];

      // Seleccionar trabajo y cantidad de monedas ganadas
      const randomJob = jobs[Math.floor(Math.random() * jobs.length)];
      const min = 100;
      const max = 500;
      const amount = Math.floor(Math.random() * (max - min + 1)) + min;

      const jobMessage = randomJob.replace("@coins", amount);

      // Responder al usuario con el trabajo realizado y las monedas ganadas
      msg.reply({
        text: jobMessage,
      });

      // Si el usuario no existe en la base de datos, creamos su registro
      if (!economy) {
        await totoEconomy.create({
          groupId: groupId,
          groupName: groupName,
          phone: user,
          balance: amount,
          banco: 0,
          lastWork: Date.now(), // Actualizamos el tiempo de último trabajo
        });
      } else {
        // Actualizamos su balance y el tiempo del último trabajo
        economy.balance += amount;
        economy.lastWork = Date.now(); // Actualizamos el timestamp de último trabajo
        await economy.save();
      }
    } catch (error) {
      console.error(`Error en el comando work: ${error.message}`);
      return await sendWarning(
        totoro,
        msg,
        "Hubo un error al intentar realizar el trabajo. Intenta de nuevo."
      );
    }
  },
};
