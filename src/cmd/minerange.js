import pt from "mineflayer-pathfinder";
const { GoalGetToBlock } = pt.goals;

export default {
  name: "mineRange",
  aliases: ["mr"],
  run: async function ({ bot, args, defaultMove, ws }) {
    let pos = {
      start: {
        x: parseInt(args[0]),
        y: parseInt(args[1]),
        z: parseInt(args[2]) - 1,
      },
      end: {
        x: parseInt(args[3]),
        y: parseInt(args[4]),
        z: parseInt(args[5]) - 1,
      },
    };
    const min = (a, b) => Math.min(a, b);
    const max = (a, b) => Math.max(a, b);

    const minX = min(pos.start.x, pos.end.x);
    const maxX = max(pos.start.x, pos.end.x);
    const minY = min(pos.start.y, pos.end.y);
    const maxY = max(pos.start.y, pos.end.y);
    const minZ = min(pos.start.z, pos.end.z);
    const maxZ = max(pos.start.z, pos.end.z);
    global.state = "running | mineRange " + JSON.stringify(pos);

    for (let y = maxY; y >= minY; y--) {
      for (let x = minX; x <= maxX; x++) {
        for (let z = minZ; z <= maxZ; z++) {
          if (global.state === "idle") return;

          const blockPos = new Vec3(x, y, z);
          const block = bot.blockAt(blockPos);
          if (!block || !block.diggable) continue;

          bot.pathfinder.setMovements(defaultMove);

          if (bot.entity.position.distanceTo(blockPos) > 4) {
            await bot.pathfinder.goto(new GoalGetToBlock(x, y, z));
          }

          try {
            await bot.dig(block);
            await new Promise((r) => setTimeout(r, 100));
          } catch {}
        }
      }
    }
    if (ws)
      ws.send(JSON.stringify({ type: "logs", data: `MineRange: finished` }));
    else bot.chat("/r MineRange: finished");
    global.state = "idle";
  },
};
