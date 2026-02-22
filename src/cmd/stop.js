export default {
  name: "stop",
  run: function ({ ws, bot }) {
    if (ws)
      ws.send(
        JSON.stringify({
          type: "logs",
          data: `set state from ${global.state} to idle`,
        }),
      );
    else bot.chat(`/r set state from ${global.state} to idle`);
    global.state = "idle";
  },
};
