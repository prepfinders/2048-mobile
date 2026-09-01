# 2048

Hybrid iOS / Android 2048 game built with Expo and React Native. Swipe to slide tiles, merge matching numbers, and reach the 2048 tile.

## Install

Requires Node 18+ (Node 20+ recommended).

```bash
npm install
```

## Run

Start the Expo dev server:

```bash
npx expo start
```

Then pick a target:

- **Expo Go** — scan the QR code with the Expo Go app (this project uses Expo SDK 54, which matches current store builds of Expo Go).
- **iOS Simulator** — press `i` in the terminal (macOS with Xcode).
- **Android emulator** — press `a` in the terminal (Android Studio emulator running).
- **Web** — press `w` for keyboard play in a browser (`arrow keys` or `WASD`).

You can also target a platform directly:

```bash
npx expo start --ios
npx expo start --android
npx expo start --web
```

## Play

- Swipe on the board (or use arrow keys / WASD in the simulator and web).
- Equal tiles merge once per move. Score increases by the merged value.
- **NEW** starts a fresh game. **UNDO** reverts the last move.
- Best score and the current game are saved on device.
- Reaching 2048 wins (you can keep playing). The game ends when no moves remain.

## Tests

```bash
npm test
```

Unit tests cover sliding across empty cells, double-merges in one row, spawning after a successful move, and undo.
