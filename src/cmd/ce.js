export default {
  name: "ce",
  aliases: ["enchant"],
  run: async function ({ bot, args, ws }) {
    if (args.length < 2) {
      if (ws)
        return ws.send(
          JSON.stringify({ type: "logs", data: `USAGE: ce [NAME] [AMOUNT]` }),
        );
      else return bot.chat("/r USAGE: ce [NAME] [AMOUNT]");
    }
    let ce = {
      simple: 2,
      unique: 3,
      elite: 4,
      ultimate: 5,
      legendary: 6,
      heroic: 13,
    };
    bot.chat("/ce");
    bot.once("windowOpen", async (w) => {
      for (let i = 0; i < args[1]; i++) {
        await bot.clickWindow(ce[args[0]], 0, 0);
        await bot.waitForTicks(5);
        await bot.clickWindow(0, 0, 0);
        await bot.waitForTicks(5);
      }
      await bot.closeWindow(w);

      if (ws)
        ws.send(
          JSON.stringify({
            type: "logs",
            data: `CE: bought ${args[1]} ce of ${args[0]} Enchantment`,
          }),
        );
      else bot.chat(`/r CE: bought ${args[1]} ce of ${args[0]} Enchantment`);
    });
    await bot.toss(
      1113,
      null,
      bot.inventory.slots.find((d) => d?.name === "firework_star")?.count,
    );
  },
};
