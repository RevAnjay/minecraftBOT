export default {
  name: "spawner",
  aliases: ["sp"],
  run: async function ({ bot, args, ws }) {
    const coor = new Vec3(
      parseFloat(args[0]),
      parseFloat(args[1]),
      parseFloat(args[2]),
    );
    if (bot.entity.position.distanceTo(coor) > 4)
      return bot.chat("/r cant reach");
    bot.activateBlock(bot.blockAt(coor));
    bot.once("windowOpen", async (w) => {
      bot.clickWindow(15, 0, 0);
      await bot.waitForTicks(10);
      bot.clickWindow(11, 0, 0);
      await bot.waitForTicks(10);
      const match =
        bot.currentWindow?.title?.value?.text?.value.match(/\[1\/(\d+)\]/);
      if (match) {
        for (let i = 0; i < match[1]; i++) {
          bot.clickWindow(51, 0, 0);
          await bot.waitForTicks(20);
        }
      }
      bot.closeWindow(w);
    });
  },
};
