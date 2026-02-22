import readline from "readline";
import mcdata from "minecraft-data";
import prc from "prismarine-chat";
import { simplify } from "prismarine-nbt";
import { Vec3 } from "vec3";

const pc = prc("1.21.1");
const mcData = mcdata("1.21.1");

export function refreshInputLine() {
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);
  process.stdout.write("> " + global.info.chat);
}

export function updateinv(u, w) {
  global.data[u].inventory = w.slots.map((d) => {
    if (!d) return;
    return {
      displayName: d.components.find((d) => d.type === "custom_name")?.data
        ? new pc(
            simplify(d.components.find((d) => d.type === "custom_name")?.data),
          ).toHTML()
        : d.displayName,
      slot: d.slot,
      type: d.type,
      count: d.count,
      lore: d?.components?.find((d) => d.type === "lore")?.data
        ? d?.components
            ?.find((d) => d.type === "lore")
            ?.data?.map((d) => new pc(simplify(d)).toHTML())
        : [],
      enchant: d?.components?.find((d) => d.type === "enchantments")?.data
        ? d?.components
            ?.find((d) => d.type === "enchantments")
            ?.data.enchantments.map((d) => {
              return {
                name: mcData.enchantments[d.id].displayName,
                level: toRoman(d.level),
              };
            })
        : [],
      name: d.name,
    };
  });
  global.data[u].invtitle =
    typeof w.title === "object" ? new pc(simplify(w.title)).toHTML() : w.title;
}

export function countxp(level) {
  if (level <= 16) {
    return level * level + 6 * level;
  } else if (level <= 31) {
    return 2.5 * level * level - 40.5 * level + 360;
  } else {
    return 4.5 * level * level - 162.5 * level + 2220;
  }
}

export function totalxp(xp) {
  return (
    countxp(xp.level) +
    xp.progress * (countxp(xp.level + 1) - countxp(xp.level))
  ).toFixed(0);
}

export function toRoman(num) {
  const map = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];

  let result = "";

  for (const [value, roman] of map) {
    while (num >= value) {
      result += roman;
      num -= value;
    }
  }

  return result;
}

export async function spawners(bot) {
  if (!global.spawnerEnabled) return;
  for (const { sell, x, y, z } of [
    { x: 5915, y: -46, z: 4280 },
    { x: 5916, y: -46, z: 4285, sell: true },
    { x: 5916, y: -47, z: 4285, sell: true },
    { x: 5915, y: -45, z: 4285, sell: true },
    { x: 5915, y: -46, z: 4285, sell: true },
    { x: 5915, y: -47, z: 4285, sell: true },
  ]) {
    const blockPromise = new Promise((resolve) => {
      bot.once("windowOpen", resolve);
      setTimeout(() => resolve(null), 2000);
    });

    bot.activateBlock(bot.blockAt(new Vec3(x, y, z)));

    const w = await blockPromise;
    if (w) {
      await bot.waitForTicks(20);
      if (!sell) {
        bot.clickWindow(15, 0, 0);
        await bot.waitForTicks(10);
        bot.clickWindow(11, 0, 0);
        await bot.waitForTicks(10);
        bot.clickWindow(51, 0, 0);

        bot.closeWindow(w);
      } else {
        bot.clickWindow(13, 0, 0);
      }
    }

    await bot.waitForTicks(40);
  }
}

export async function autoSell(bot) {
  while (global.autoSell) {
    let block = bot.blockAt(new Vec3(5917, -58, 4280));
    bot.dig(block);
    await bot.waitForTicks(40);
  }
}
