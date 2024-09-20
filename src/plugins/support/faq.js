const prefix = require("../../../settings.json").prefix;

module.exports = {
  name: "faq",
  category: "totoSupport",
  subcategory: "info",
  description: "Mostrar preguntas frecuentes (FAQ).",
  usage: `${prefix}faq`,
  cooldown: 5,
  execute: async (totoro, msg, args) => {
    try {
      const message = msg.messages[0];
      const remoteJid = message.key.remoteJid;

      const faqText = `*📋 Preguntas Frecuentes (FAQ):*
*1️⃣ ¿Cómo puedo iniciar un comando con el bot?*
💬 Solo escribe el comando correspondiente precedido por el prefijo *'${prefix}'* seguido del comando que deseas usar.  
Ejemplo: *${prefix}help* para obtener ayuda.

*2️⃣ ¿El bot puede funcionar en grupos privados o solo en públicos?*
🔒 El bot puede funcionar tanto en grupos privados como públicos, siempre que se le otorguen los permisos necesarios.

*3️⃣ ¿Cómo puedo agregar el bot a mi grupo?*
➕ Un administrador del grupo debe invitar al bot a través de su número o enlace de invitación.  
Asegúrate de que el bot esté habilitado para recibir invitaciones.

*4️⃣ ¿Cómo puedo asegurarme de que el bot siga las reglas del grupo?*
⚙️ El bot está programado para respetar las reglas del grupo. Sin embargo, puedes configurarlo para que realice solo ciertas acciones o desactivar funciones si es necesario.

*5️⃣ ¿Qué puedo hacer si el bot deja de funcionar?*
❌ Verifica que el bot aún esté en línea y tenga los permisos correctos.  
Si el problema persiste, intenta expulsarlo y volver a agregarlo al grupo.

*6️⃣ ¿Puedo personalizar los comandos del bot?*
🛠️ Actualmente, solo los desarrolladores tienen acceso para modificar o agregar nuevos comandos.  
Puedes enviar sugerencias sobre funciones adicionales que te gustaría ver.

*7️⃣ ¿Cómo puedo configurar el bot para que solo responda a los administradores?*
👮‍♂️ El bot puede configurarse para que solo los administradores del grupo puedan utilizar ciertos comandos.  
Revisa la documentación del bot para ver cómo activar esta opción.

*8️⃣ ¿El bot guarda alguna información personal?*
🔐 El bot solo almacena información relacionada con los comandos que se utilizan.  
No se recopila ni almacena información personal fuera de lo necesario para su funcionamiento.

*9️⃣ ¿Qué hago si el bot envía mensajes no deseados o spam?*
🚨 Si el bot está enviando mensajes no deseados, puede deberse a una configuración errónea o un malentendido de los comandos.  
Puedes pausar el bot temporalmente con el comando de pausa o contactar a un administrador.

*🔟 ¿Cómo puedo detener al bot de ejecutar un comando?*
🛑 Para detener al bot, un administrador del grupo puede utilizar el comando *${prefix}pause* para pausar temporalmente sus funciones.  
Puedes activarlo de nuevo usando *${prefix}resume*.

*1️⃣1️⃣ ¿Puedo usar el bot en varios grupos al mismo tiempo?*
🌐 Sí, el bot puede estar en múltiples grupos al mismo tiempo, pero sus respuestas estarán limitadas a cada grupo de manera independiente.

*1️⃣2️⃣ ¿El bot responde a mensajes privados?*
📲 Por lo general, el bot está diseñado para funcionar en grupos.  
Si el bot tiene activado el soporte para mensajes privados, puedes usarlo de forma individual, pero esto depende de su configuración.`;

      return totoro.sendMessage(remoteJid, { text: faqText });
    } catch (error) {
      return totoro.sendMessage(remoteJid, {
        text: `⚠️ *Error al mostrar las FAQ:* ${error.message}`,
      });
    }
  },
};
