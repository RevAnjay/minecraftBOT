import { totalxp } from "../func.js";

export default {
  name: "xp",
  run: async function (d) {
    if (d.ws)
      d.ws.send(
        JSON.stringify({
          type: "logs",
          data: `EXP: ${d.bot.experience.level}|${totalxp(
            d.bot.experience,
          )} (${d.bot.experience.progress.toFixed(2) * 100}%)`,
        }),
      );
    else
      d.bot.chat(
        `/r ${d.bot.experience.level}|${totalxp(
          d.bot.experience,
        )} (${d.bot.experience.progress.toFixed(2) * 100}%)`,
      );
  },
};
