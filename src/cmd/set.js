export default {
  name: "set",
  run: function ({ ws, bot, args, config }) {
    const set = Object.keys(config.modules);
    if (!set.includes(args[0])) {
      if (ws)
        return ws.send({
          type: "logs",
          data: `SET: available set is ${set.join(", ")}`,
        });
      else bot.chat(`/r SET: available set is ${set.join(", ")}`);
    }
    let key = args[0];
    let value = args.shift();
    config.modules[key] = value.join(" ");
  },
};
