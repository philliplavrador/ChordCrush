# ChordCrush 🎹

> Master every chord. Crush every challenge.

A MIDI-powered piano chord practice game that tests your music theory knowledge in real time. No typing. No multiple choice. You play the actual notes.

<p align="center">
  <img src="https://cdn.undraw.co/illustrations/music_3vas.svg" alt="ChordCrush hero" width="420">
</p>

<p align="center">
  <a href="https://chordcrush.philliplavrador.com"><img src="https://img.shields.io/badge/play_now-chordcrush.philliplavrador.com-4f46e5?style=for-the-badge" alt="Play now"></a>
  <img src="https://img.shields.io/badge/node-18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node 18+">
  <img src="https://img.shields.io/badge/license-MIT-22c55e?style=for-the-badge" alt="MIT License">
</p>

> Work in progress. The live site may have bugs or half-built features. Feedback welcome.

---

## What it is

ChordCrush is a chord recognition game built for pianists and music students. Plug in a MIDI keyboard, pick which chord families you want to drill, and start playing. The on-screen piano lights up with your input in real time, and the game only advances when you hit the right chord.

![Landing page](screenshots/landing.png)

---

## Game modes

| Mode | What it does |
|------|--------------|
| **⏱️ Time Trials** | Race through every chord in your selected sets as fast as possible. Wrong answers add a five-second penalty. Your best time lands on the leaderboard. |
| **🎯 Training Mode** | No timer. Get a chord wrong and ChordCrush shows you exactly which notes to play on a visual piano. Missed chords cycle back until you nail them. |

![Playing practice menu](screenshots/menu.png)

---

## Features

**Live MIDI input.** Plug in any MIDI keyboard and ChordCrush detects it automatically. Notes light up on the on-screen piano as you play. Your last device is remembered between sessions.

**72+ chords, 6 categories, all 12 keys.** Major and minor triads, augmented and diminished, suspended 2nd and suspended 4th. Enharmonic equivalents (C♯ = D♭) are fully supported, so any valid spelling is accepted.

**Smart training deck.** Training Mode uses a spaced-repetition style system. Play a chord right on the first try and it's done. Ask for help and it cycles back to the end of the deck. Notes you got right stay visually locked on the piano.

**Leaderboards per chord set.** Scores are grouped by which combinations you played, so you can track progress across drill sets. A name dropdown remembers your most-used player names.

![Gameplay](screenshots/gameplay.png)

![Training help popup](screenshots/training-help.png)

![Leaderboard](screenshots/leaderboard.png)

---

## Tech stack

<p>
  <img src="https://cdn.simpleicons.org/nodedotjs/339933" alt="Node.js" width="36" height="36">
  <img src="https://cdn.simpleicons.org/express/000000" alt="Express" width="36" height="36">
  <img src="https://cdn.simpleicons.org/javascript/F7DF1E" alt="JavaScript" width="36" height="36">
  <img src="https://cdn.simpleicons.org/html5/E34F26" alt="HTML5" width="36" height="36">
  <img src="https://cdn.simpleicons.org/css3/1572B6" alt="CSS3" width="36" height="36">
  <img src="https://cdn.simpleicons.org/railway/0B0D0E" alt="Railway" width="36" height="36">
</p>

- **Frontend:** Vanilla JavaScript (ES6 modules), HTML, CSS
- **Backend:** Node.js + Express (static file serving + JSON-file leaderboard API)
- **MIDI:** Web MIDI API
- **Deployment:** Railway

No database. No auth. No build step. Just open the page and play.

---

## Run it locally

**Prerequisites**

- Node.js 18 or newer
- A MIDI keyboard (or a virtual MIDI device)
- A browser with Web MIDI support (Chrome recommended)

**Install**

```bash
git clone https://github.com/philliplavrador/ChordCrush.git
cd ChordCrush
npm install
npm start
```

Then open `http://localhost:3001` in Chrome.

---

## Project layout

```
ChordCrush/
├── server.js                   Express server + leaderboard save endpoint
├── package.json
├── Procfile                    Railway process definition
├── railway.toml                Railway config
├── data/
│   ├── chords.json             72+ chord definitions
│   └── leaderboards.json       Persisted scores
├── public/
│   ├── index.html              Landing page
│   ├── pages/games/playing-practice.html
│   └── js/
│       ├── playing-practice/   Game engine, UI, MIDI, leaderboard
│       └── shared/             Constants, chord data, piano renderer
└── screenshots/
```

---

## License

MIT. Built by [Phillip Lavrador](https://github.com/philliplavrador).
