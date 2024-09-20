const totoroLog = require("../../functions/totoroLog");

module.exports = {
  name: "bash",
  category: "developer",
  subcategory: "owner",
  usage: "<bash>",
  description: "Run bash commands on the server",
  dev: true,

  execute(totoro, msg, args) {
    const plugins = args.join(" ");

    msg.react("⏳");
    if (!plugins) return;

    const { exec } = require("child_process");

    exec(plugins, async (error, stdout, stderr) => {
      if (error) {
        msg.reply(
          "```\n" + JSON.stringify({ error: error.message }, null, 2) + "\n```"
        );
        return;
      }

      if (stdout) {
        try {
          const parsedStdout = JSON.parse(stdout);
          msg.reply("```\n" + JSON.stringify(parsedStdout, null, 2) + "\n```");
        } catch (e) {
          msg.reply("```\n" + stdout + "\n```");
        }
      }

      if (stderr) {
        msg.reply("```" + stderr + "```");
      }

      await msg.react("🔍");
    });
  },
};
