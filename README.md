# 2048

Hybrid iOS / Android 2048 game built with Expo and React Native. Swipe to slide tiles, merge matching numbers, and reach the 2048 tile.

Package id: `com.prepfinders.game2048`

## Install (JavaScript)

Requires Node 18+ (Node 20+ recommended).

```bash
npm install
```

## Run with Expo

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

Native `android/` and `ios/` projects are committed, so you can also build with:

```bash
npx expo run:android
npx expo run:ios
```

## Install the Android APK (sideload)

A signed, installable ARM release APK is in [`dist/2048.apk`](dist/2048.apk) (also copied to this agent’s artifacts). It is signed with the standard Android debug keystore so it sideloads without Play App Signing. Architectures: `armeabi-v7a` and `arm64-v8a` (typical phones).

### On a phone

1. Copy `dist/2048.apk` to the device (USB, Drive, chat, etc.).
2. Open the file. If Android blocks it, allow installs from that source: **Settings → Security → Install unknown apps** (wording varies by OEM) and enable the app you used to open the APK.
3. Install and launch **2048**.

### With adb

```bash
adb install -r dist/2048.apk
```

Rebuild it locally (Android Studio or the SDK command-line tools; Gradle reads `sdk.dir` from `android/local.properties` on your machine):

```bash
npm install
npm run apk
# output: android/app/build/outputs/apk/release/app-release.apk
```

## Build iOS in Xcode (macOS)

You compile this on a Mac. There is no IPA in the repo.

1. Install Xcode, CocoaPods (`sudo gem install cocoapods` or Homebrew), and Node.
2. From the repo root:

   ```bash
   npm install
   cd ios
   pod install
   ```

   CocoaPods creates `ios/2048.xcworkspace`. Always open the **workspace**, not the `.xcodeproj` alone, after `pod install`.

3. Open it:

   ```bash
   open ios/2048.xcworkspace
   ```

   Or in Xcode: **File → Open** → `ios/2048.xcworkspace`.

   Before the first `pod install`, only `ios/2048.xcodeproj` exists. After pods, use the workspace.

4. Select the **2048** scheme, pick an iPhone simulator or a signed development device, then **Product → Run** (⌘R).

Bundle identifier: `com.prepfinders.game2048`. To run on a physical iPhone, choose your Team under **Signing & Capabilities**.

From the repo root you can also run:

```bash
npx expo run:ios
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
