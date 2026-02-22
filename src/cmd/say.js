export default {
  name: "say",
  run: (d) => d.bot.chat(d.args.join(" ")),
};
