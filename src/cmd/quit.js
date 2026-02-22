export default {
  name: "quit",
  aliases: ["q", "exit"],
  run: async function () {
    process.exit();
  },
};
