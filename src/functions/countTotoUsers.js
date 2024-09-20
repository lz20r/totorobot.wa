const totoUser = require("../models/totoUser");
const totoroLog = require("../functions/totoroLog");
async function countTotoUsers() {
  try {
    const count = await totoUser.count();
    return count;
  } catch (error) {
    totoroLog.error(
      "./logs/functions/countTotoUsers.log",
      `Error al contar usuarios: ${error}`
    );
    throw error;
  }
}

module.exports = countTotoUsers;
