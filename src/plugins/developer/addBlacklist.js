module.exports = {
  name: "addBlacklist",
  description: "Añadir un usuario a la lista negra.",
  category: "developer",
  subcategory: "blacklist",
  usage: "addb <usuario>",
  cooldown: 5,
  botPermissions: ["SEND_MESSAGES"],
  userPermissions: [],
  aliases: ["addb", "blacklist", "blacklistadd"],
  dev: true,

  async execute(msg, totoro) {},
};
