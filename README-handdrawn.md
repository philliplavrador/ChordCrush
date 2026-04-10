```
  ___ _                _  ___               _
 / __| |_  ___ _ _ __| |/ __|_ _ _  _ ___| |_
| (__| ' \/ _ \ '_/ _` | (__| '_| || (_-< ' \
 \___|_||_\___/_| \__,_|\___|_|  \_,_/__/_||_|

   ♪  a little piano chord practice game  ♪
```

> ~ *master every chord. crush every challenge.* ~

hey ✏️ i'm building a chord recognition game for pianists. plug in a MIDI keyboard, pick your chord sets, and play the actual notes. no typing, no multiple choice, no vibes-based guessing.

[![play now](https://img.shields.io/badge/%E2%86%92_play_now-chordcrush.philliplavrador.com-eeeeee?style=plastic&labelColor=555555)](https://chordcrush.philliplavrador.com)
[![node](https://img.shields.io/badge/node-18%2B-9cb380?style=plastic&labelColor=555555)](https://nodejs.org)
[![license](https://img.shields.io/badge/license-MIT-a3a3ff?style=plastic&labelColor=555555)](#license)

> heads up ✎ chordcrush is still being scribbled together. the live site may have bugs or half-finished bits. if something's broken it's probably just me working on it.

```
───────────────────────────────────────────────────────────
```

## so what is it

it's a chord recognition game i made because i wanted to drill chords without quizzes asking me to "type the answer". you plug in a MIDI keyboard, pick which chord families you wanna practice, and the game waits for you to play the actual correct notes. the on-screen piano mirrors whatever you're doing in real time.

![the landing page](screenshots/landing.png)

```
───────────────────────────────────────────────────────────
```

## ✎ the two modes

**⏱️ time trials**
> race through every chord in your selected sets. wrong answers cost you 5 seconds. best time goes on the leaderboard.

**🎯 training mode**
> no timer. get a chord wrong and the game shows you exactly which notes to play on a little visual piano. missed chords cycle back to the end of the deck until you've got them down.

![the menu](screenshots/menu.png)

```
───────────────────────────────────────────────────────────
```

## ✎ the features, scribbled out

    ♪ live MIDI input
      plug in any keyboard, chordcrush finds it automatically.
      last-used device is remembered between sessions.

    ♪ 72+ chords across 6 categories
      major · minor · augmented · diminished · sus2 · sus4
      all 12 keys, with full enharmonic support (C♯ = D♭ etc)

    ♪ a leaderboard per chord set
      grouped by which combinations you played so you can
      track progress across different drill sets.

    ♪ smart training deck
      first-try correct → done.
      needed help → cycles back around.
      correct notes so far → visually locked on the piano.

    ♪ countdown and polish
      time trials kicks off with a 3 - 2 - 1 - GO overlay
      because the abrupt start felt bad.

![mid-game](screenshots/gameplay.png)

![training help](screenshots/training-help.png)

![leaderboard](screenshots/leaderboard.png)

```
───────────────────────────────────────────────────────────
```

## ✎ the stack

    frontend   vanilla javascript (ES6 modules), HTML, CSS
    backend    Node.js + Express (static files + a JSON
               file leaderboard API)
    midi       Web MIDI API
    deploy     Railway

no database. no auth. no build step. just open the page and play.

```
───────────────────────────────────────────────────────────
```

## ✎ run it yourself

you'll need node 18+, a MIDI keyboard (or a virtual one), and a browser with Web MIDI support (Chrome is your friend).

```bash
git clone https://github.com/philliplavrador/ChordCrush.git
cd ChordCrush
npm install
npm start
```

then open `http://localhost:3001` and go.

```
───────────────────────────────────────────────────────────
```

## ✎ project layout

```
ChordCrush/
│
├── server.js              ← express server + leaderboard POST
├── package.json
├── Procfile               ← railway process definition
├── railway.toml           ← railway config
│
├── data/
│   ├── chords.json        ← 72+ chord definitions
│   └── leaderboards.json  ← persisted scores
│
└── public/
    ├── index.html         ← landing page
    ├── pages/games/playing-practice.html
    └── js/
        ├── playing-practice/   ← game engine, UI, MIDI, leaderboard
        └── shared/             ← constants, chord data, piano renderer
```

```
───────────────────────────────────────────────────────────
```

## license

MIT. scribbled together by [phillip lavrador](https://github.com/philliplavrador) ✏️
