# iTab Quest — playable MVP

This is the first real-guitar gameplay prototype.

## Core loop

1. The game shows one TAB note.
2. The player reads the string line and fret number.
3. The player plays that note on a real guitar.
4. The browser listens through the device microphone.
5. Pitch detection judges the note as correct / too low / too high.
6. Correct notes earn score, streak, and stars and advance the mission.

## Run it

Serve the repository over HTTPS or on localhost and open:

`/game/index.html`

Microphone access normally requires HTTPS (or localhost). Opening the file directly from disk may block mic permissions.

Examples:

- VS Code Live Server
- `python -m http.server 8080` on localhost
- Any static web host with HTTPS

## Important MVP limitation

A normal microphone can identify pitch, but not which physical guitar string produced a pitch when the same pitch exists in more than one fretboard position. Therefore the MVP gives pitch feedback (correct / high / low) and teaches the intended string/fret from the TAB itself.

## Files

- `index.html` — game UI
- `styles.css` — responsive visual design using the approved gameplay background
- `app.js` — mission progression, TAB rendering, Web Audio microphone input, YIN-style pitch detection, scoring, hints, saved local progress

## Next build targets

- Two- and three-note TAB phrases
- Rhythm timing
- Better noisy-room pitch confidence
- Tavi feedback poses after alpha cleanup
- Level map progression
- Teacher mode / adjustable string and fret range
- Optional MIDI/audio-interface input for advanced accuracy
