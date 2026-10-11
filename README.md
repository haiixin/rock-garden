# 🪨 Rock Garden

**A tiny floating productivity companion for your desktop.**

Rock Garden pairs a Pomodoro timer and a to-do list with a small pet rock that cheers you on. Finish focus sessions and tasks to earn coins, then spend them on hats, colors, and themes for your rock, or on real-life rewards you set for yourself.

## Features

- **Pomodoro timer**: Focus (25 min), Short break (5 min), and Long break (15 min), with start, reset, and skip controls.
- **A mascot with moods**: the rock focuses while you work, rests during breaks, and cheers when you finish something. It grows moss as you level up.
- **To-do list**: add quick tasks and tick them off. Each completed task earns coins.
- **Coins and levels**: earn coins for every focus session and task, and level up every 50 lifetime coins. A daily counter tracks your pomodoros.
- **Shop**: spend coins on accessories, rock colors, and window themes, with a live preview before you buy.
- **My prizes**: add your own rewards (like "New headphones") with a coin price, and claim them when you've earned enough.
- **Desktop pet**: click 🪨 and the rock jumps out of the app to wander your desktop. Drag it anywhere, and send it home when you're done.
- **Always-on-top and compact mode**: keep the small window floating over your work, or shrink it to just the timer.

## Earning coins

| Action | Coins |
| --- | --- |
| Finish a focus session | 5 |
| Finish a focus session without pausing | +10 bonus |
| Complete a to-do | 5 |

## Shop

| Category | Items |
| --- | --- |
| Accessories | Flower, Bow, Party hat, Shades, Top hat, Crown |
| Colors | Granite (default), Sandstone, Rose quartz, Jade, Lapis, Obsidian |
| Themes | Night (default), Forest, Ocean, Sunset, Plum |
| My prizes | Anything you define, at any price |

## Getting started

Rock Garden is an [Electron](https://www.electronjs.org/) app. You'll need [Node.js](https://nodejs.org/) installed.

```bash
git clone <this-repo-url>
cd rock-garden
npm install
npm start
```

The window appears in the bottom-right corner of your primary display. It remembers where you leave it, and your coins, level, to-dos, and purchases are saved locally between sessions.

## Project layout

| File | Purpose |
| --- | --- |
| `main.js` | Electron main process: windows, always-on-top, compact mode, and the desktop pet window |
| `preload.js` | Safe bridge between the app windows and the main process |
| `index.html`, `style.css`, `renderer.js` | The main app: timer, to-dos, points, and shop |
| `pet.html`, `pet.js` | The free-roaming desktop pet |
| `mascot.js`, `mascot.css` | The rock's SVG artwork, moods, and animations |
| `icons.js` | [Phosphor](https://phosphoricons.com) icon set (MIT) and shop accessory previews |
| `fonts/` | Self-hosted Geist variable font (OFL) |

## License

No license has been chosen yet.
