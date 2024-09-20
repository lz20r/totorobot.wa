const axios = require("axios");

async function getData(sock, query, path, type = "json") {
  try {
    const { data } = await axios({
      method: "GET",
      url: sock.config.api + path,
      params: { query },
      responseType: type,
      headers: {
        authorization: `TOKEN ${process.env.TOKEN}`,
      },
    });

    return data;
  } catch (error) {
    throw error;
  }
}

module.exports = { getData };
