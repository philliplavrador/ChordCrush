# ChordCrush

Master every chord. Crush every challenge.

[![Play now](https://img.shields.io/badge/play_now-chordcrush.philliplavrador.com-4f46e5?style=for-the-badge)](https://chordcrush.philliplavrador.com)
[![Node](https://img.shields.io/badge/node-18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![License](https://img.shields.io/badge/license-MIT-22c55e?style=for-the-badge)](#license)

> Work in progress. The live site may have bugs or half-built features. Feedback welcome.

---

## What it is

ChordCrush is a web-based chord recognition game for pianists and music students. Plug in a MIDI keyboard, pick which chord families you want to drill, and play the actual notes. The on-screen piano mirrors your input in real time and the game only advances when you hit the right chord.

No typing. No multiple choice.

---

## Game modes

**Time Trials.** Race the clock through every chord in your selected sets. Wrong answers add a 5-second penalty. Your best time goes on the leaderboard.

**Training Mode.** No timer. Get a chord wrong and ChordCrush shows you exactly which notes to play. Missed chords cycle back to the end of the deck until you nail them.

![Playing practice menu](screenshots/menu.png)

---

## Features

**Live MIDI input.** Plug in any MIDI keyboard and ChordCrush detects it automatically. Notes light up on the on-screen piano in real time as you play. Your last device is remembered between sessions.

**72+ chords across 6 categories, all 12 keys.** Major and minor triads, augmented and diminished, suspended 2nd and suspended 4th. Full enharmonic equivalent support (C♯ = D♭) so any valid spelling is accepted.

**Smart training deck.** Training Mode uses a spaced-repetition style system. First-try correct answers are done. Chords you needed help on cycle back to the end. Notes you've gotten right so far stay visually locked on the piano.

**Leaderboards per chord set.** Scores are grouped by which combinations you played, so you can track progress across drill sets. A name dropdown remembers your most-used player names.

---

## Tech stack

- Frontend: Vanilla JavaScript (ES6 modules), HTML, CSS
- Backend: Node.js + Express (static files + JSON-file leaderboard API)
- MIDI: Web MIDI API
- Deployment: Railway

No database. No auth. No build step.

---

## Run it locally

Prerequisites:

- Node.js 18 or newer
- A MIDI keyboard (or a virtual MIDI device)
- A browser with Web MIDI support (Chrome recommended)

```bash
git clone https://github.com/philliplavrador/ChordCrush.git
cd ChordCrush
npm install
npm start
```

Then open `http://localhost:3001` in Chrome.

---

## License

MIT. Built by [Phillip Lavrador](https://github.com/philliplavrador).
