<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:667EEA,100:764BA2&height=200&section=header&text=ChordCrush&fontSize=70&fontColor=ffffff&animation=fadeIn&desc=Master%20every%20chord.%20Crush%20every%20challenge.&descSize=18&descAlignY=72" alt="ChordCrush" width="100%">

[![Play now](https://img.shields.io/badge/play_now-chordcrush.philliplavrador.com-667eea?style=for-the-badge&labelColor=764ba2)](https://chordcrush.philliplavrador.com)
[![Node](https://img.shields.io/badge/node-18%2B-48bb78?style=for-the-badge&logo=nodedotjs&logoColor=white&labelColor=2f855a)](https://nodejs.org)
[![License](https://img.shields.io/badge/license-MIT-764ba2?style=for-the-badge&labelColor=553c9a)](#license)

> Work in progress. The live site may have bugs or half-built features. Feedback welcome.

</div>

---

## What it is

<table>
<tr>
<td width="60%" valign="middle">

ChordCrush is a web-based chord recognition game for pianists and music students. Plug in a MIDI keyboard, pick which chord families you want to drill, and play the actual notes. The on-screen piano mirrors your input in real time and the game only advances when you hit the right chord.

No typing. No multiple choice.

</td>
<td width="40%" valign="middle" align="center">

<img src="https://cdn.undraw.co/illustrations/compose-music_9403.svg" alt="" width="240">

</td>
</tr>
</table>

---

## Game modes

<table>
<tr>
<td width="50%" valign="top" align="center">

### ⏱️ Time Trials

![Time Trials](https://img.shields.io/badge/race_the_clock-667eea?style=for-the-badge&labelColor=5a67d8)

Race through every chord in your selected sets. Wrong answers add a 5-second penalty. Your best time goes on the leaderboard.

</td>
<td width="50%" valign="top" align="center">

### 🎯 Training Mode

![Training Mode](https://img.shields.io/badge/learn_at_your_pace-48bb78?style=for-the-badge&labelColor=38a169)

No timer. Get a chord wrong and ChordCrush shows you exactly which notes to play. Missed chords cycle back to the end of the deck until you nail them.

</td>
</tr>
</table>

<p align="center">
  <img src="screenshots/menu.png" alt="Playing practice menu" width="85%">
</p>

---

## Features

<table>
<tr>
<td valign="top" width="50%">

### 🎹 Live MIDI input

Plug in any MIDI keyboard and ChordCrush detects it automatically. Notes light up on the on-screen piano in real time as you play. Your last device is remembered between sessions.

</td>
<td valign="top" width="50%">

### 📚 72+ chords, 12 keys

Major and minor triads, augmented and diminished, suspended 2nd and suspended 4th. Full enharmonic equivalent support (C♯ = D♭) so any valid spelling is accepted.

</td>
</tr>
<tr>
<td valign="top" width="50%">

### 🧠 Smart training deck

Spaced-repetition style. First-try correct answers are done. Chords you needed help on cycle back to the end. Notes you've gotten right so far stay visually locked on the piano.

</td>
<td valign="top" width="50%">

### 🏆 Per-set leaderboards

Scores are grouped by which combinations you played, so you can track progress across drill sets. A name dropdown remembers your most-used player names.

</td>
</tr>
</table>

---

## Color palette

The app uses an indigo-to-purple gradient with green and red accents:

![#667eea](https://img.shields.io/badge/%23667eea-667eea?style=for-the-badge&labelColor=667eea)
![#764ba2](https://img.shields.io/badge/%23764ba2-764ba2?style=for-the-badge&labelColor=764ba2)
![#48bb78](https://img.shields.io/badge/%2348bb78-48bb78?style=for-the-badge&labelColor=48bb78)
![#f56565](https://img.shields.io/badge/%23f56565-f56565?style=for-the-badge&labelColor=f56565)

---

## Tech stack

<p>
  <img src="https://skillicons.dev/icons?i=nodejs,express,js,html,css&theme=dark" alt="Tech stack">
  <img src="https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white" alt="Railway" height="48">
</p>

- **Frontend:** Vanilla JavaScript (ES6 modules), HTML, CSS
- **Backend:** Node.js + Express (static files + JSON-file leaderboard API)
- **MIDI:** Web MIDI API
- **Deployment:** Railway

No database. No auth. No build step.

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

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:667EEA,100:764BA2&height=120&section=footer" alt="" width="100%">

MIT License · Built by [Phillip Lavrador](https://github.com/philliplavrador)

</div>
