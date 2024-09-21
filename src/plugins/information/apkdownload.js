const axios = require('axios');
const cheerio = require('cheerio'); // Para hacer scraping
const { help } = require('../../functions/messages');
const prefix = require("../../../settings.json").prefix;
const fs = require('fs');
const path = require('path');
const { cmdBlock } = require('./traductor');
const { tr } = require('../../../data/languages');

module.exports = {
  name: "apkdownload",
  aliases: ["apk", "apkinfo", "searchapk", "apkstore"],
  category: "information",
  subcategory: "apps",
  usage: `${prefix}apkdownload <app_name>`,
  example: `${prefix}apkdownload whatsapp`,
  description: "Busca una aplicación en APKMirror y descarga su archivo APK",
  cmdBlock: true,
  
  async execute(totoro, msg, args) {
    const info = msg.messages[0];
    const from = info.key.remoteJid;
    const reply = (text) => {
      totoro.sendMessage(from, { text: text }, { quoted: info });
    };

    const appName = args.join(" ");

    // Verificar si se ingresó el nombre de la aplicación
    if (!appName) return help(totoro, msg, "APK Download", "Busca una aplicación en APKMirror y descarga el APK.", `${prefix}apkdownload WhatsApp`);

    try {
      // Buscar la aplicación en APKMirror
      const searchUrl = `https://www.apkmirror.com/?post_type=app_release&search=${encodeURIComponent(appName)}`;
      const searchResponse = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        },
      });

      // Cargar el HTML y buscar los enlaces a las páginas de la app
      const $ = cheerio.load(searchResponse.data);
      const appPageLink = $('div[class="appRowTitle"] a').attr('href'); // Extraer el primer enlace de resultado de la búsqueda

      if (!appPageLink) {
        return reply("*No se encontraron resultados para la aplicación proporcionada.*");
      }

      // Ir a la página de la aplicación
      const appPageUrl = `https://www.apkmirror.com${appPageLink}`;
      const appPageResponse = await axios.get(appPageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        },
      });

      // Extraer el enlace de descarga del APK
      const $$ = cheerio.load(appPageResponse.data);
      const downloadPageLink = $$('a[title="Download APK"]').attr('href'); // Enlace a la página de descarga

      if (!downloadPageLink) {
        return reply("*No se pudo encontrar el enlace de descarga para la aplicación.*");
      }

      const downloadPageUrl = `https://www.apkmirror.com${downloadPageLink}`;
      const downloadPageResponse = await axios.get(downloadPageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        },
      });

      // Extraer el enlace final de descarga del APK
      const $$$ = cheerio.load(downloadPageResponse.data);
      const finalApkDownloadLink = $$$('a[class="downloadButton"]').attr('href');

      if (!finalApkDownloadLink) {
        return reply("*No se pudo obtener el enlace final de descarga del APK.*");
      }

      // Descargar el archivo APK
      const apkResponse = await axios({
        method: 'GET',
        url: finalApkDownloadLink,
        responseType: 'arraybuffer',
      });

      const apkFilePath = path.join(`${appName}.apk`);
      fs.writeFileSync(apkFilePath, apkResponse.data); // Guardar el archivo APK temporalmente

      // Enviar el archivo APK como documento
      await totoro.sendMessage(from, {
        document: { url: apkFilePath },
        fileName: `${appName}.apk`,
        mimetype: "application/vnd.android.package-archive",
        caption: `Aquí está el archivo APK de la aplicación ${appName}`,
      }, { quoted: info });

      // Borrar el archivo después de enviarlo
      fs.unlinkSync(apkFilePath);

    } catch (error) {
      console.error("Error al buscar o descargar la aplicación:", error.message);
      reply("*Ocurrió un error al buscar o descargar la aplicación. Asegúrate de que la aplicación existe y es pública.*");
    }
  }
};
