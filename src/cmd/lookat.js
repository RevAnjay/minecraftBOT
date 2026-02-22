export default {
  name: "lookat",
  aliases: ["la"],
  run: async function ({ bot, args, ws }) {
    bot.lookAt(
      new Vec3(parseInt(args[0]), parseInt(args[1]), parseInt(args[2])),
    );
  },
};
