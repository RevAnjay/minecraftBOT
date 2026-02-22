export default {
  name: "setstate",
  run: ({ args }) => {
    global.state = args.join(" ");
  },
};
