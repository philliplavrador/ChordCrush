# ChordCrush

A MIDI-powered piano chord practice game. Plug in a keyboard, pick your chord sets, play the notes. No typing, no multiple choice.

**[chordcrush.philliplavrador.com](https://chordcrush.philliplavrador.com)** &nbsp;·&nbsp; MIT &nbsp;·&nbsp; Node 18+

> Still under active development. The live site may have rough edges.

<br>

![Landing](screenshots/landing.png)

<br>

## Overview

ChordCrush is a browser-based chord recognition game for pianists and music students. It reads input from a MIDI keyboard and only advances when you play the correct chord. The on-screen piano mirrors your input in real time.

72+ chords across all 12 keys, with full enharmonic equivalent support.

<br>

## Game modes

**⏱️ Time Trials**
Race through every chord in your selected sets. Wrong answers add a 5-second penalty. Best time goes on the leaderboard.

**🎯 Training Mode**
No timer. Get a chord wrong and the game shows you exactly which notes to play. Missed chords cycle back to the end of the deck.

<br>

![Menu](screenshots/menu.png)

<br>

## Features

| | |
|---|---|
| **MIDI input** | Auto-detects any connected MIDI keyboard. Last device is remembered between sessions. |
| **Chord library** | Major, minor, augmented, diminished, sus2, sus4 — all 12 keys, both enharmonic spellings. |
| **Training deck** | Spaced-repetition-style. First-try correct answers are done. Chords you needed help on cycle back. |
| **Leaderboards** | Grouped by chord set combination. Stored server-side in a single JSON file. |
| **Countdown** | Time Trials kicks off with a 3-2-1-GO overlay. |

<br>

![Gameplay](screenshots/gameplay.png)

![Training help](screenshots/training-help.png)

![Leaderboard](screenshots/leaderboard.png)

<br>

## Tech stack

<img src="https://skillicons.dev/icons?i=nodejs,express,js,html,css,githubactions" alt="Tech stack">

Vanilla JavaScript (ES6 modules) on the frontend. Express on the backend, serving static files and a single leaderboard POST endpoint backed by a JSON file. Web MIDI API for input. Deployed to Railway.

No database. No auth. No build step.

<br>

## Local development

```bash
git clone https://github.com/philliplavrador/ChordCrush.git
cd ChordCrush
npm install
npm start
```

Requirements: Node 18+, a MIDI keyboard (or virtual MIDI device), and Chrome (for Web MIDI support).

Then open `http://localhost:3001`.

<br>

## Project structure

```
ChordCrush/
├─ server.js                  Express server + leaderboard POST
├─ package.json
├─ Procfile                   Railway process definition
├─ railway.toml               Railway config
├─ data/
│  ├─ chords.json             72+ chord definitions
│  └─ leaderboards.json       Persisted scores
└─ public/
   ├─ index.html              Landing page
   ├─ pages/games/playing-practice.html
   └─ js/
      ├─ playing-practice/    Game engine, UI, MIDI, leaderboard
      └─ shared/              Constants, chord data, piano renderer
```

<br>

---

<sub>Built by [Phillip Lavrador](https://github.com/philliplavrador) · MIT License</sub>
