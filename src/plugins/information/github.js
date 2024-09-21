const axios = require('axios');
const { help } = require('../../functions/messages');
const prefix = require("../../../settings.json").prefix;
const fs = require('fs');
const path = require('path');

module.exports = {
  name: "github",
  aliases: ["githubsearch", "githubinfo", "searchgithub", "github", "githubstore", "git"],
  category: "information",
  subcategory: "apps",
  usage: `${prefix}github <url>`,
  example: `${prefix}github https://github.com/lz20r/totorobot.wa`,
  description: "Busca un repositorio en GitHub y obtén su información y descarga su archivo ZIP",

  async execute(totoro, msg, args) {
    const info = msg.messages[0];
    const from = info.key.remoteJid;
    const reply = (text) => {
      totoro.sendMessage(from, { text: text }, { quoted: info });
    };

    const ghurl = args.join(" ");

    // Verificar si se ingresó una URL
    if (!ghurl) return help(totoro, msg, "GitHub", "Busca un repositorio en GitHub y obtén su información", `${prefix}github https://github.com/lz20r/totorobot.wa`);

    // Verificar que la URL sea válida
    const ghRegExp = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/([^\/:]+)/i;
    const match = ghurl.match(ghRegExp);

    if (!match) {
      return reply("*URL inválida. Por favor, ingresa una URL válida de un repositorio de GitHub.*");
    }

    const [_, user, repo] = match;
    const repoName = repo.replace(/.git$/, '');

    try {
      // Obtener la información del repositorio desde la API de GitHub
      const metadata = await axios.get(`https://api.github.com/repos/${user}/${repoName}`);
      const repoData = metadata.data;

      // Preparar el mensaje con la información del repositorio
      const responseMessage = `*GitHub Repo Info:*\n\n` +
        `📛 *Nombre:* ${repoData.full_name}\n` +
        `💬 *Descripción:* ${repoData.description || "No disponible"}\n` +
        `⭐ *Estrellas:* ${repoData.stargazers_count}\n` +
        `🍴 *Forks:* ${repoData.forks_count}\n` +
        `👨‍💻 *Lenguaje Principal:* ${repoData.language || "No especificado"}\n` +
        `🔗 *URL:* ${repoData.html_url}\n`;

      // Descargar el archivo ZIP del repositorio
      const branch = repoData.default_branch || 'main'; // Obtener la rama por defecto o usar 'main'
      const zipUrl = `https://api.github.com/repos/${user}/${repoName}/zipball/${branch}`;

      const response = await axios({
        method: 'GET',
        url: zipUrl,
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Node.js',
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      const zipFilePath = path.join(`${repoName}.zip`);
      fs.writeFileSync(zipFilePath, response.data); // Guardar el archivo ZIP temporalmente

      // Enviar el archivo ZIP como documento
      await totoro.sendMessage(from, {
        document: { url: zipFilePath },
        fileName: `${repoName}.zip`,
        mimetype: "application/zip",
        caption: `${responseMessage}`,
      }, { quoted: info });

      // Borrar el archivo después de enviarlo
      fs.unlinkSync(zipFilePath);

    } catch (error) {
      console.error("Error al buscar o descargar el repositorio:", error.message);
      reply("*Ocurrió un error al buscar o descargar el repositorio. Asegúrate de que el repositorio existe y es público.*");
    }
  }
};
