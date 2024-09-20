const axios = require('axios');
const totoroLog = require("../functions/totoroLog");

module.exports = {
    async scrapeMediafire(getUrl) {
        try {
            const url = "https://cinapis.cinammon.es/mediafire/index.php?url="
            const response = await axios.get(url+getUrl);
            const data = response.data;
            const { Nombre, Subido, MimeType, Peso, Link } = await response.data;

            const error = response.data.error ? true : !Link ? true : false;
            return [error, {
                title: Nombre,
                uploadDate: Subido,
                ext: MimeType,
                size: Peso,
                dl_url: Link
            }];
            
        } catch (e) {
            totoroLog.error(
                './logs/modules/scrapeMediaFire.log', 
                `[MODULE - SCRAPE MEDIAFIRE] ${e.message} ${e.stack} ${e.response.data.error} ${e.response.data.message} ${e.response.data.stack} ${e.response.data}`
            );
            return [true, null];
        }
    }
}