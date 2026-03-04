export default {
    name: "keys",
    run: ({ bot }) => {
        bot.chat('/team echest')

        bot.once('windowOpen', (window) => {
            const items = window.items().filter(i => i.slot > 26 && i.name.includes("candle"))
            for (const item of items) {
                bot.clickWindow(item.slot, 0, 1)
            }
            bot.closeWindow(window)
        })

    }
}