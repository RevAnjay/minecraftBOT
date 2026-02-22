import { pathfinder } from "mineflayer-pathfinder";
import pt from "mineflayer-pathfinder";
import { Vec3 } from "vec3";

const { GoalBlock, GoalNear } = pt.goals;

export default {
  name: "goto",
  run: async ({ args, bot, defaultMove }) => {
    if (args.length < 3) return bot.chat("?USAGE: goto x y z");

    try {
      // Parse koordinat
      const x = parseInt(args[0]);
      const y = parseInt(args[1]);
      const z = parseInt(args[2]);

      if (isNaN(x) || isNaN(y) || isNaN(z)) {
        return bot.chat("?Koordinat harus angka!");
      }

      const targetPos = new Vec3(x, y, z);
      console.log("=== DEBUG GOTO ===");
      console.log("Target:", targetPos);
      console.log("Posisi bot:", bot.entity.position);
      console.log("Jarak:", bot.entity.position.distanceTo(targetPos));

      // CEK 1: Apakah pathfinder terload?
      console.log("Pathfinder loaded:", !!bot.pathfinder);

      if (!bot.pathfinder) {
        bot.chat("?Pathfinder tidak terload!");
        return;
      }

      // CEK 2: Apakah defaultMove ada?
      console.log("DefaultMove ada:", !!defaultMove);

      // Setup movements
      if (defaultMove) {
        console.log("Mengkonfigurasi movements...");
        console.log("- allowSwimming (sebelum):", defaultMove.allowSwimming);

        defaultMove.allowSwimming = true;
        defaultMove.allowParkour = true;
        defaultMove.allowSprinting = true;
        defaultMove.canDig = false;

        console.log("- allowSwimming (sesudah):", defaultMove.allowSwimming);

        // Set movements ke pathfinder
        bot.pathfinder.setMovements(defaultMove);
        console.log("Movements sudah di-set");
      } else {
        console.log("WARNING: defaultMove tidak ada!");
        // Buat movements baru jika defaultMove tidak ada
        const mcData = await import("minecraft-data")(bot.version);
        const Movements = await import("mineflayer-pathfinder").Movements;
        const newMove = new Movements(bot, mcData);
        newMove.allowSwimming = true;
        newMove.allowParkour = true;
        bot.pathfinder.setMovements(newMove);
        console.log("Movements baru dibuat");
      }

      // CEK 3: Hentikan pathfinding sebelumnya
      console.log("Menghentikan pathfinding sebelumnya...");
      bot.pathfinder.stop();

      // CEK 4: Buat goal
      const goal = new GoalNear(targetPos.x, targetPos.y, targetPos.z, 2);
      console.log("Goal dibuat:", goal);

      // CEK 5: Event listeners untuk monitoring

      bot.once("goal_reached", () => {
        console.log("EVENT: goal_reached");
        bot.chat(`✅ Sampai!`);
      });

      bot.on("path_error", (error) => {
        console.log("EVENT: path_error", error);
        bot.chat(`?Error: ${error.message}`);
      });

      bot.on("path_stop", () => {
        console.log("EVENT: path_stop - Pathfinding berhenti");
      });

      // CEK 6: Set goal dan mulai bergerak
      console.log("Memulai pathfinding...");
      bot.pathfinder.setGoal(goal);

      // CEK 7: Cek apakah bot mulai bergerak setelah 2 detik
      setTimeout(async () => {
        const newPos = bot.entity.position;
        const moved = newPos.distanceTo(bot.entity.position) > 0.1;
        console.log("Cek pergerakan setelah 2 detik:");
        console.log("- Posisi sekarang:", newPos);
        console.log("- Bergerak?", moved ? "YA" : "TIDAK");

        if (!moved) {
          console.log("BOT TIDAK BERGERAK! Mencoba alternatif...");

          // Coba dengan goal berbeda
          console.log("Mencoba GoalBlock...");
          const blockGoal = new GoalBlock(
            targetPos.x,
            targetPos.y,
            targetPos.z,
          );
          bot.pathfinder.setGoal(blockGoal);

          setTimeout(() => {
            const posAfterBlock = bot.entity.position;
            console.log("Setelah GoalBlock:", {
              moved: posAfterBlock.distanceTo(newPos) > 0.1,
              pos: posAfterBlock,
            });
          }, 2000);
        }
      }, 2000);
    } catch (error) {
      console.log("ERROR CATCH:", error);
      bot.chat(`?${error.message}`);
    }
  },
};
