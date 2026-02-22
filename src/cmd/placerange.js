import pt from "mineflayer-pathfinder";

const { GoalBlock } = pt.goals;

export default {
  name: "placeRange",
  aliases: ["pr"],
  run: async function ({ bot, args, defaultMove, ws }) {
    const [xs, ys, zs, xe, ye, ze, blockName] = args;
    let pos = {
      start: { x: +xs, y: +ys, z: +zs - 1 },
      end: { x: +xe, y: +ye, z: +ze - 1 },
    };

    const min = (a, b) => Math.min(a, b);
    const max = (a, b) => Math.max(a, b);

    const minX = min(pos.start.x, pos.end.x);
    const maxX = max(pos.start.x, pos.end.x);
    const minY = min(pos.start.y, pos.end.y);
    const maxY = max(pos.start.y, pos.end.y);
    const minZ = min(pos.start.z, pos.end.z);
    const maxZ = max(pos.start.z, pos.end.z);
    global.state = "running | placeRange " + JSON.stringify(pos);

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        for (let z = minZ; z <= maxZ; z++) {
          if (global.state === "idle") return;

          const target = new Vec3(x, y, z);
          const block = bot.blockAt(target);
          const below = bot.blockAt(target.offset(0, -1, 0));
          if (!below) continue;

          const standPos = [
            new Vec3(x + 1, y, z),
            new Vec3(x - 1, y, z),
            new Vec3(x, y, z + 1),
            new Vec3(x, y, z - 1),
          ].find((p) => {
            const b = bot.blockAt(p);
            const f = bot.blockAt(p.offset(0, -1, 0));
            return b && b.name === "air" && f && f.name !== "air";
          });

          if (!standPos) continue;

          await bot.pathfinder.goto(
            new GoalBlock(standPos.x, standPos.y, standPos.z),
          );

          if (block && block.name !== "air" && block.name !== blockName) {
            const tool = bot.inventory
              .items()
              .find((i) => i.name.includes("pickaxe"));
            if (tool) await bot.equip(tool, "hand");
            await bot.waitForTicks(1);
            await bot.dig(block);
          }

          if (block.name === blockName) continue;

          await bot.waitForTicks(1);
          let item = bot.inventory
            .items()
            .find((i) => i.name.includes(blockName));

          if (!item) {
            if (ws)
              ws.send(
                JSON.stringify({
                  type: "logs",
                  data: `PlaceRange: ${blockName} is not in my inventory, please drop some!`,
                }),
              );
            else
              bot.chat(
                `/r PlaceRange: ${blockName} is not in my inventory, please drop some!`,
              );
            const t0 = Date.now();
            while (!item && Date.now() - t0 < 300000) {
              await bot.waitForTicks(20);
              item = bot.inventory
                .items()
                .find((i) => i.name.includes(blockName));
            }
            if (!item) {
              if (ws)
                ws.send(
                  JSON.stringify({
                    type: "logs",
                    data: "PlaceRange: there is no dropped items from player, quitting..",
                  }),
                );
              else
                bot.chat(
                  "/r PlaceRange: there is no dropped items from player, quitting..",
                );
              global.state = "idle";
              return;
            }
          }
          await bot.equip(item, "hand");
          await bot.waitForTicks(1);
          if (!bot.heldItem || bot.heldItem.name !== item.name)
            await bot.equip(item, "hand");
          await bot.waitForTicks(1);
          await bot.placeBlock(below, new Vec3(0, 1, 0));

          await new Promise((r) => setTimeout(r, 100));
        }
      }
    }

    if (ws)
      ws.send(JSON.stringify({ type: "logs", data: `PlaceRange: finished` }));
    else bot.chat("/r PlaceRange: finished");
    global.state = "idle";
  },
};
