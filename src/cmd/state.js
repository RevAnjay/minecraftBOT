export default {
  name: "state",
  run: function (d) {
    if (d.ws)
      d.ws.send(
        JSON.stringify({ type: "logs", data: `state: ${global.state}` }),
      );
    else d.bot.chat(`/r state: ${global.state}`);
  },
};
