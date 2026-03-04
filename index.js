import mc from "mineflayer";
import { Vec3 } from "vec3";
import pt from "mineflayer-pathfinder";
import { loader as baritone } from "@miner-org/mineflayer-baritone";
import { loader } from "mineflayer-auto-eat";
import Armor from "mineflayer-armor-manager";
import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import prc from "prismarine-chat";
import { simplify } from "prismarine-nbt";
import { readdirSync } from "fs";
import {
  autoSell,
  refreshInputLine,
  spawners,
  totalxp,
  updateinv,
} from "./src/func.js";
import chokidar from "chokidar";
import config from "./config.json" with { type: "json" };
import cors from "cors";

const pc = prc(config.version);
const app = express();

let sbd = {},
  latestchat = {},
  latestlog = {},
  mcbots = {},
  commands = new Map(),
  wspath = [];
app.use(cors());
app.use(express.static(process.cwd() + "/src/build"));
app.get("/bots", (req, res) => res.json(wspath));
app.get(/.*/, (req, res) => {
  res.sendFile(process.cwd() + "/src/build/index.html");
});
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
global.data = {};
/*
let latestchat = [];
let latestlog = [];
let mcbot,
  commands = new Map();
global.setAv = ["state", "spawnerEnabled", "fishmode", "autoSell"];
*/
global.state = "idle";
server.listen(process.env.SERVER_PORT || 3000);

const { pathfinder, Movements } = pt;

global.load = {
  cmd: async function () {
    for (const file of readdirSync(process.cwd() + "/src/cmd").filter((f) =>
      f.endsWith(".js"),
    )) {
      try {
        const filePath = process.cwd() + "/src/cmd" + "/" + file;
        const modulePath = "file://" + filePath + "?t=" + Date.now();

        const module = await import(modulePath);
        const command = module.default || module;

        if (command.name && command.run) {
          commands.set(command.name, command);

          if (command.aliases) {
            command.aliases.forEach((alias) => {
              commands.set(alias, command);
            });
          }
        }
      } catch (e) {
        console.error("Failed:", file, e.message);
      }
    }
  },
};

async function main(v) {
  const bot = mc.createBot({
    ...v.config,
    host: config.host,
    port: config.port,
    version: config.version,
    plugins: [pathfinder, loader, Armor, baritone],
  });

  bot._client.on("teams", (pkt) => {
    if (!sbd[bot.username]) sbd[bot.username] = [];
    if (!pkt.prefix) return;
    if (!pkt.team.includes("TAB-Sidebar")) return;

    const line = Number(pkt.team.split("-")[2]);

    const msg = new pc(simplify(pkt.prefix));
    sbd[bot.username][line] = msg.toHTML();
  });

  bot.once("login", () => {
    global.data[bot.username] = { inventory: [], invtitle: "" };
    if (!latestchat[bot.username]) latestchat[bot.username] = [];
    if (!latestlog[bot.username]) latestlog[bot.username] = [];
    mcbots[bot.username] = bot;
    if (!wspath.includes(bot.username)) wspath.push(bot.username);
    bot.chat(`/login ${v.data.loginPassword}`);
  });

  bot.on("windowOpen", (w) => {
    updateinv(bot.username, w);
  });

  bot.on("windowClose", () => {
    updateinv(bot.username, bot.inventory);
  });

  bot.on("health", () => {
    if (bot.food >= 20) bot.autoEat.disableAuto();
    // Disable the plugin if the bot is at 20 food points
    else bot.autoEat.enableAuto(); // Else enable the plugin again
  });

  bot.on("respawn", () => {
    bot.chat("/home");
  });

  bot.once("spawn", async () => {
    await bot.waitForTicks(10);

    setInterval(async () => {
      await spawners(bot);
    }, 600000);
  });

  bot._client.on("packet", async (d, m, b) => {
    if (m.name === "open_sign_entity") {
      await bot.updateSign(
        bot.blockAt(new Vec3(d.location.x, d.location.y, d.location.z)),
        [
          totalxp(bot.experience),
          "-----------",
          "Write the new value",
          "in the first line",
        ].join("\n"),
      );
      await bot.waitForTicks(10);
      if (bot.currentWindow) bot.clickWindow(0, 0, 0);
    }
    if (m.name.includes("inv")) console.log(d, m);
  });

  bot.once("spawn", () => {
    global.load.cmd();
    updateinv(bot.username, bot.inventory);
    bot.inventory.on("updateSlot", (_, o, n) => {
      if (!o && n && !bot.currentWindow) updateinv(bot.username, bot.inventory);
    });

    bot.on("playerCollect", async (e, c) => {
      if (
        bot.inventory.slots
          .filter((d, i) => i > 8 && i !== 45)
          .filter((d) => d === null).length < 2 &&
        global.fishmode
      )
        bot.chat("/emf sellall");
    });
    bot.autoEat.options = {
      priority: "foodPoints",
      startAt: 14,
      bannedFood: [],
    };
    bot.on("message", async (m) => {
      if (m.toString().includes("ʙʀᴏᴀᴅᴄᴀsᴛ"))
        bot.chat(`/kupon reedem ${m.toString().split(" ").pop()}`);
      let pos = { start: { x: 0, y: 0, z: 0 }, end: { x: 0, y: 0, z: 0 } };

      const defaultMove = new Movements(bot);
      defaultMove.canDig = false;
      if (m.toString().includes(`[◆] ʜᴀɪ ${bot.username}`)) {
        await bot.waitForTicks(10);
        if (v.modules.shardFarm) bot.chat("/sit");
        spawners(bot);
        autoSell(bot);
      }
      if (
        m
          .toString()
          .includes(
            `Unable to connect you to survival. You reached the maximum of 5 retries.`,
          )
      )
        bot.chat("/queue survival");

      if (m.toString().includes(`Welcome, ${bot.username} to the server`)) {
        await bot.waitForTicks(10);
        bot.chat("/queue survival");
      }
      if (
        m.toString().includes("SᴍᴀʀᴛSᴘᴀᴡɴᴇʀ") &&
        m.toString().includes("ᴇxᴘ ᴄᴏʟʟᴇᴄᴛᴇᴅ")
      ) {
        if (latestlog.length > 50) latestlog.shift();
        latestlog.push(m.toHTML());
      }
      if (m.toString().includes("Shards » ★10 has been added to your account!") && bot.username !== config.main)
        bot.chat(
          `/shard pay ${config.main} 10`,
        );
      if (!m.toString().includes("Mana")) {
        if (latestchat[bot.username].length > 50)
          latestchat[bot.username].shift();
        latestchat[bot.username].push(m.toHTML());
      }
      if (m.toString().includes("/trade accept")) {
        if (
          !["XDaffa_teru", "xAezteru_"].includes(
            m.toString().replace("/trade accept ", ""),
          )
        )
          return;
        bot.chat(`/trade ${m.toString().replace("/trade accept ", "")}`);
        await bot.waitForTicks(10);
        await bot.clickWindow(3, 0, 0);
      }
      const match = m.toString().match(/✉⬇ ᴍᴇꜱꜱᴀɢᴇ \((.*?) → (.*?)\) /)
      if (
        match && config.owners.includes(match[1]) && match[2] === bot.username
      ) {
        const msg = m
          .toString()
          .replace(/✉⬇ ᴍᴇꜱꜱᴀɢᴇ \((.*?) → (.*?)\) /, "");
        const args = msg.split(" ");
        const command = args.shift();
        let d = { m, bot, args, command, pos, defaultMove, config: v };
        if (commands.has(command)) {
          const exe = commands.get(command);
          return await exe.run(d);
        }
      }
    });
  });

  bot.on("kicked", (r) => console.log(new pc(simplify(r)).toAnsi()));
  bot.on("error", console.log);
  bot.on("end", () =>
    setTimeout(() => {
      main(v);
    }, 5000),
  );
}

for (const botdata of config.bots) {
  main(botdata);
}

wss.on("connection", (ws, req) => {
  const [_, current] = req.url.split("/");
  if (!wspath.includes(current)) return;
  const mcbot = mcbots[current];
  ws.send(JSON.stringify({ type: "bot", data: { username: mcbot.username } }));
  ws.send(JSON.stringify({ type: "info", data: data[current] }));
  ws.send(JSON.stringify({ type: "chat", data: latestchat[current] }));
  ws.send(JSON.stringify({ type: "logs", data: latestlog[current] }));
  ws.send(JSON.stringify({ type: "scoreboard", data: sbd[current] }));
  mcbot?.on("message", (m) => {
    if (!m.toString().includes("Mana"))
      ws.send(JSON.stringify({ type: "chat", data: m.toHTML() }));
    if (
      m.toString().includes("SᴍᴀʀᴛSᴘᴀᴡɴᴇʀ") &&
      m.toString().includes("ᴇxᴘ ᴄᴏʟʟᴇᴄᴛᴇᴅ")
    )
      ws.send(JSON.stringify({ type: "logs", data: m.toHTML() }));
  });
  let latest = {};

  const isEqual = (obj1, obj2) => {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  };

  const interval = setInterval(() => {
    if (!isEqual(latest, data)) {
      ws.send(JSON.stringify({ type: "info", data: data[current] }));
      latest = JSON.parse(JSON.stringify(data));
    }
  }, 100);

  mcbot?._client?.on("teams", (pkt) => {
    if (!pkt.prefix) return;
    if (!pkt.team.includes("TAB-Sidebar")) return;

    const line = Number(pkt.team.split("-")[2]);

    const msg = new pc(simplify(pkt.prefix));
    sbd[line] = msg.toHTML();
    ws.send(JSON.stringify({ type: "scoreboard", data: sbd[current] }));
  });

  ws.onmessage = async function (e) {
    const msg = JSON.parse(e.data);
    if (msg.type === "invclick") {
      if (mcbot?.entity)
        mcbot.clickWindow(msg.data.slot, msg.data.type, msg.data.mode);
      updateinv(
        mcbot.username,
        mcbot.currentWindow ? mcbot.currentWindow : mcbot.inventory,
      );
      ws.send(JSON.stringify({ type: "info", data: data[current] }));
    } else if (msg.type === "message") {
      if (!msg.data.startsWith(",")) mcbot.chat(msg.data);
      else if (msg.data.startsWith(",")) {
        const prefix = msg.data.replace(",", "");
        const args = prefix.split(" ");
        const command = args.shift();
        if (commands.has(command)) {
          const exe = commands.get(command);
          await exe.run({
            m: null,
            bot: mcbot,
            args,
            command,
            pos: global.pos,
            defaultMove: new Movements(mcbot),
            ws,
            config: config.bots.find(
              (b) => b.config.username === mcbot.username,
            ),
          });
        }
      }
    }
  };

  ws.onclose = () => clearInterval(interval);
});

chokidar
  .watch(process.cwd() + "/src/cmd", {
    ignoreInitial: true,
    usePolling: true,
    interval: 300,
    awaitWriteFinish: {
      stabilityThreshold: 200,
      pollInterval: 100,
    },
    depth: 2,
  })
  .on("all", async (e, f) => {
    if (f.endsWith(".js")) {
      global.load.cmd();
      for (const bot of Object.keys(mcbots)) {
        mcbots[bot].chat(`?Reloaded all commands`);
      }
    }
  });

process.on("uncaughtException", console.log);
process.on("unhandledRejection", console.log);
