export default {
  name: "rc",
  aliases: ["rightclick"],
  run: async function ({ bot, args, ws }) {
    if (args.length > 2)
      bot.activateBlock(
        bot.blockAt(
          new Vec3(parseInt(args[0]), parseInt(args[1]), parseInt(args[2])),
        ),
      );
    if (args.length < 1) bot.activateItem();
  },
};
