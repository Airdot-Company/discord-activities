# Gamecord.js

<p align="center">
  <img src="https://cdn.discordapp.com/attachments/945497781982887966/945497833761562644/banner.png" alt="gamecordjs banner" />
</p>

</br>

<p align="center">
  <a href="https://www.npmjs.com/package/discord-gamecord">
    <img src="https://img.shields.io/npm/dt/gamecord.js?style=for-the-badge" alt="npm" />
  </a>
  <a href="https://discord.gg/invite/GaczkwfgV9">
    <img src="https://img.shields.io/discord/834199640702320650?color=5865F2&label=Discord&style=for-the-badge" alt="Discord Server" />
  </a>
</p>

> **🎮 Intergrate games right into your Discord bot!**

## ⚠️ Beta
This package is still in the works! Be sure to join our [discord server](#discord) for updates!

## 📦 Installation
```
npm i gamecord.js
```

## ✨ Features
- 🍃 Simple & Easy to use.
- 👋 Beginner friendly.
- 📦 Easy to Implement.
- ⚙️ Slash command & Message command support.

## 📄 Examples

### 🪨 Rock Paper Scissors
```js
    const Gamecordjs = reuqire("gamecord.js"); //Import Package

    //Using slash commands
    await new Gamecordjs.RPS({
        //You can add some options here
        RockButton: {
            label: "Rock",
            style: "BLURPLE", //If you change the style it might look really weird!
            emoji: "🪨"
        },
        //You can also add `ScissorButton` and `PaperButton`
        //...
    }, {
        //Here you can set your custom embeds'
        WinMessage: new Gamecordjs.Payload({
            content: `You won {{playerMention}}!`,
            embeds: [
                new Gamecordjs.Embed() //You can only use the gamecord Embed class.
                .setTitle(`Won!`)
            ]
            //More payload options
            //...
        })
        //You can also have `LostMessage`, `TieMessage`, and `StartGameMessage`
        //...
    }).start(interaction.channel, interaction, true);
```

## 📸 Images
### 🪨 Rock Paper Scissors
![Image](https://turtlepaw.is-from.space/r/Discord_x4pPd4Tlfc.png)
![GIF](https://turtlepaw.is-from.space/r/Discord_q3V5E5hx20.gif)

## ❓ Support
[![Discord Server](http://invidget.switchblade.xyz/834199640702320650)](https://discord.gg/BMBUcJvV4Q)