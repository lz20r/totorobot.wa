const dns = require('dns');
const { parse } = require('tldts'); // Librería para analizar dominios
const prefix = require("../../../settings.json").prefix;
const { sendError, help } = require("../../functions/messages");

module.exports = {
	name: "checkcloudflare",
	aliases: ["cfcheck", "iscloudflare", "cloudflare"],
	description: "Verifica si un dominio o subdominio está usando Cloudflare.",
	category: "information",
	subcategory: "network",
	usage: `${prefix}checkcloudflare <dominio/subdominio>`,
	cooldown: 5,

	execute: async (totoro, msg, args) => {
		if (args.length < 1) {
			await help(
				totoro,
				msg,
				"checkcloudflare",
				"Verifica si un dominio o subdominio está usando Cloudflare.",
				`${prefix}checkcloudflare <dominio/subdominio>`
			);
			return;
		}

		const domain = args[0];

		// Usamos la librería tldts para analizar el dominio y determinar si es un subdominio
		const parsedDomain = parse(domain);
		const isSubdomain = parsedDomain.subdomain !== '';

		// Enviar el mensaje inicial "verificando"
		let message;
		try {
			message = await totoro.sendMessage(msg.messages[0].key.remoteJid, {
				text: `🔍 Verificando ${isSubdomain ? 'el subdominio' : 'el dominio'} *${domain}*...`,
			});

			// Agregar una reacción de "reloj de arena" para indicar que está trabajando
			msg.react('⏳');

		} catch (err) {
			console.error("Error enviando el mensaje inicial:", err);
			return;
		}

		// Función para resolver los registros NS del dominio o subdominio
		const resolveNsRecords = (domainToCheck) => {
			return new Promise((resolve, reject) => {
				dns.resolveNs(domainToCheck, (err, addresses) => {
					if (err || !addresses.length) {
						reject(err); // Si hay error o no hay registros, rechazamos
					} else {
						resolve(addresses); // Si hay registros NS, los resolvemos
					}
				});
			});
		};

		try {
			// Intentamos resolver los registros NS del subdominio
			let addresses;
			try {
				addresses = await resolveNsRecords(domain);
			} catch (err) {
				// Si no se encuentran registros para el subdominio, tomamos los del dominio principal automáticamente
				if (isSubdomain) {
					const mainDomain = parsedDomain.domain; // Extraemos el dominio principal
					addresses = await resolveNsRecords(mainDomain); // Intentamos resolver los registros NS del dominio principal
				} else {
					throw err; // Si no es subdominio y hay error, lanzamos el error original
				}
			}

			// Verificar si alguno de los registros NS pertenece a Cloudflare
			const usesCloudflare = addresses.some(address => address.toLowerCase().includes("cloudflare"));

			// Crear el texto usando el nuevo diseño
			const text =
				`🔎 *Resultado de la Verificación de Cloudflare*:\n\n` +
				`🌐 *URL*: ${domain}\n` +
				`🔖 *Tipo*: ${isSubdomain ? 'Subdominio' : 'Dominio'}\n` +
				`☁️ *Usa Cloudflare*: ${usesCloudflare ? 'Sí, protegido por Cloudflare.' : 'No, no está protegido por Cloudflare.'}\n\n` +
			
				`📋 *Nameservers encontrados*:\n` +
				`${addresses.map((address, index) => `🔹 ${index + 1}. ${address}`).join("\n")}\n\n` +
				
				`${usesCloudflare ?
					`✅ El ${isSubdomain ? 'Subdominio' : 'Dominio'} *${domain}* está usando Cloudflare.` :
					`🚫 El ${isSubdomain ? 'Subdominio' : 'Dominio'} *${domain}* no está usando Cloudflare.`}`;

			// Editar el mensaje inicial con el resultado final
			try {
				await totoro.sendMessage(msg.messages[0].key.remoteJid, {
					text: text,
					edit: message.key, // Editar el mensaje enviado
				});

				msg.react('✅');

			} catch (editError) {
				console.error("Error editando el mensaje con el resultado:", editError);
			}

		} catch (err) {
			// Si no se encuentran registros NS ni para el dominio principal
			let errorMessage = `Error al verificar *${domain}*: ${err.message}`;

			// Si hay un error resolviendo NS, editamos el mensaje inicial para mostrar el error
			try {
				await totoro.sendMessage(msg.messages[0].key.remoteJid, {
					text: errorMessage,
					edit: message.key, // Editar el mensaje enviado
				});

				// Agregar una reacción de ❌ en caso de error
				msg.react('❌');

			} catch (editError) {
				console.error("Error editando el mensaje con el error:", editError);
			}
		}
	},
};
