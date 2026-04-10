<div align="center">

# 🎹 ChordCrush

**Master every chord. Crush every challenge.**

A sleek, MIDI-powered piano chord practice game that tests your music theory knowledge in real time.

[![Live Demo](https://img.shields.io/badge/Play%20Now-chordcrush.philliplavrador.com-blue?style=for-the-badge)](https://chordcrush.philliplavrador.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](#license)
[![Node](https://img.shields.io/badge/Node-18%2B-brightgreen?style=for-the-badge)](https://nodejs.org)

> ⚠️ **Note:** ChordCrush is actively under development. The live site may have bugs or incomplete features. Feedback is welcome!

</div>

---

## 🎯 What is ChordCrush?

ChordCrush is a web-based chord recognition game designed for pianists and music students who want to sharpen their chord knowledge. Connect a MIDI keyboard, pick your chord sets, and start playing.

No typing. No multiple choice. **You play the actual notes.**

---

## ✨ Features

### 🏁 Two Game Modes

| Mode | Description |
|------|-------------|
| **⏱️ Time Trials** | Race through every chord in your selected sets as fast as possible. Wrong answers add a 5-second penalty. Your time gets saved to the leaderboard. |
| **🎯 Training Mode** | Practice at your own pace with no timer. Get a chord wrong and ChordCrush shows you exactly which notes to play on a visual piano. Missed chords cycle back for another attempt. |

![Game Modes](screenshots/game-modes.png)

### 🎹 Live MIDI Input

Plug in any MIDI keyboard and ChordCrush detects it automatically. Notes light up on the on-screen piano in real time as you play. Your last-used device is remembered between sessions.

![MIDI Input](screenshots/midi-input.png)

### 📚 Comprehensive Chord Library

72+ chords across 6 categories, all 12 keys:

- **Major & Minor Triads**
- **Augmented & Diminished Triads**
- **Suspended 2nd & Suspended 4th**

Full enharmonic equivalent support (C♯ = D♭, etc.) so any valid spelling is accepted.

### 🏆 Leaderboards

Save your Time Trials scores with your name. Leaderboards are grouped by which chord sets you played, so you can track progress across different combinations. A name dropdown remembers your most-used player names. Scores persist on the server in a simple JSON file.

![Leaderboard](screenshots/leaderboard.png)

### 🎓 Smart Training System

In Training Mode, ChordCrush uses a spaced-repetition-style deck system:
- Play a chord correctly on the first try and it is done
- Need help, and ChordCrush shows the answer, then sends that chord to the back of the deck for another round
- Notes you have gotten right so far lock in visually on the piano

![Training Help](screenshots/training-help.png)

### ⏳ Countdown & Polish

Time Trials kicks off with a 3-2-1-GO countdown to get you focused. Correct and incorrect feedback flashes on screen. The timer runs live with penalty time baked in.

---

## 🛠️ Tech Stack

- **Frontend:** Vanilla JavaScript (ES6 modules), HTML, CSS
- **Backend:** Node.js + Express (static file serving + JSON-file leaderboard API)
- **MIDI:** Web MIDI API
- **Deployment:** Railway

No database. No auth. No build step. Just open the page and play.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or newer
- A MIDI keyboard (or virtual MIDI device)
- A browser that supports the Web MIDI API (Chrome recommended)

### Run Locally

```bash
git clone https://github.com/philliplavrador/ChordCrush.git
cd ChordCrush
npm install
npm start
```

Then open `http://localhost:3001` in Chrome.

### Environment Variables

Copy `.env.example` to `.env`. The only variable used is `PORT` (defaults to 3001).

---

## 🌐 Live Site

ChordCrush is deployed at **[chordcrush.philliplavrador.com](https://chordcrush.philliplavrador.com)**.

This is a work-in-progress build. You may encounter bugs, incomplete features, or rough edges. If something breaks, that is just the current state of things, not the final product.

---

## 📁 Project Structure

```
ChordCrush/
├── server.js                   # Express server + leaderboard save endpoint
├── package.json
├── Procfile                    # Railway process definition
├── railway.toml                # Railway config
├── .env.example                # Environment variable template
├── data/
│   ├── chords.json             # 72+ chord definitions
│   └── leaderboards.json       # Persisted leaderboard scores
├── public/
│   ├── index.html              # Landing page
│   ├── assets/styles/main.css
│   ├── pages/games/playing-practice.html
│   └── js/
│       ├── playing-practice/
│       │   ├── script.js
│       │   ├── game.js
│       │   ├── ui.js
│       │   ├── midi.js
│       │   ├── leaderboard.js
│       │   ├── file-sync.js
│       │   └── file-writer.js
│       └── shared/
│           ├── constants.js
│           ├── data.js
│           ├── piano.js
│           └── error-handler.js
└── screenshots/                # README images
```

---

## 📝 License

MIT

---

<div align="center">

**Built by [Phillip Lavrador](https://github.com/philliplavrador)**

</div>
