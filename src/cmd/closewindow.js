export default {
  name: "cwin",
  run: ({ bot, ws }) => {
    if (bot.currentWindow) bot.closeWindow(bot.currentWindow);
    else {
      if (ws)
        ws.send(
          JSON.stringify({ type: "logs", data: "CWIN: no window is opened!" }),
        );
      else bot.chat("/r CWIN: no window is opened!");
    }
  },
};
