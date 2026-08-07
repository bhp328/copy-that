# Codex Log

## 2026-08-07 - Overtake decision experiment foundation

### Task goal

Prepare the next gameplay hypothesis without implementing its player command or
outcome logic: put the player in a low Driver Feed, give the Engineer only the
information needed to read one upcoming right-hander, and stage one opponent with
two deterministic defense setups.

### Relationship to the rejected TTC experiment

- The first TTC / LATE BRAKE prototype remains an experimental, rejected design,
  not the game's approved core mechanic.
- Its source files and Git history are preserved, but its command button,
  PREPARED/RUSHED/EMERGENCY feedback, TTC display, reactions, and pace controls
  are no longer instantiated in normal play.
- The old controller currently contributes only the competent automatic
  no-command corner baseline at the fixed NORMAL pace.

### Driver Feed and Engineer Panel

- Replaced the active chase presentation with a low, close onboard/hood Driver
  Feed. The chase-camera function remains in code for engineering comparison but
  has no player-facing selector.
- The desktop composition is an exact 75% Driver Feed / 25% Engineer Panel split.
- The compact panel contains only three information cards: NEXT RIGHT plus
  distance, OPPONENT DEFENDING INSIDE/OUTSIDE, and approximate GAP in seconds.
- The panel reports observable facts and does not expose a command, recommended
  answer, timing threshold, speed, pace, outcome, score, or hidden TTC value.
- Added English and natural Korean panel text, including `인사이드` and
  `아웃사이드` motorsport terminology.

### Opponent and deterministic A/B setup

- Added exactly one visually distinct cyan primitive opponent ahead of the player.
- Explicit scenario metadata defines approach start, defense start, corner entry,
  apex, recovery end, staging gap, entry gap, and defense offset.
- The scripted gap closes smoothly from 28 m to 8.5 m approaching the existing
  sharp right test corner, then recovers without collision or overtake resolution.
- Scenario A defends the inside line; Scenario B defends the outside line. The
  sequence alternates by corner occurrence/lap with no randomness, and the panel
  reads the same state used to place the opponent on its actual line.
- Architecture rule preserved in code and documentation: **Driver can save the
  car. He cannot save the Engineer's decision.** No save, retirement, or DNF
  behavior was implemented in this foundation.

### Files changed

- `src/main.ts` - active Driver Feed composition, fixed NORMAL baseline, opponent
  integration, and disconnected command UI.
- `src/overtakeScenario.ts` - explicit metadata, one primitive opponent, closing
  gap staging, and alternating inside/outside defense lines.
- `src/engineerPanel.ts` - compact information-only panel and language toggle.
- `src/localization.ts` - English/Korean Driver Feed and Engineer Panel strings.
- `src/style.css` - 75/25 desktop layout, onboard-feed treatment, panel styling,
  and compact narrow-screen arrangement.
- `docs/codex-log.md` - this implementation and test record.

### Commands and tests run

- `npm run build` (TypeScript and Vite production build).
- Local Vite server and browser inspection at 1280x720.
- Measured the rendered split as 960 px Driver Feed and 320 px Engineer Panel.
- Verified one visible opponent ahead, a closing gap from about 0.9 s to 0.3 s,
  Scenario A / DEFENDING INSIDE, Scenario B / DEFENDING OUTSIDE, and alternating
  occurrences across laps.
- Verified the opponent moved to the corresponding visible line in each scenario,
  the NEXT RIGHT distance wrapped, and the baseline car remained stable through
  the corner.
- Verified English and Korean text, exactly three panel information cards, no old
  command/pace/feedback elements in the active DOM, and zero browser runtime
  warnings or errors.
- Reviewed the narrow-screen CSS arrangement; the available browser surface was
  fixed at 1280x720, so a separate device-sized visual pass remains advisable.

### Problems encountered and solutions

- Initial camera smoothing let the mount lag inside the player model, causing the
  roof to obscure the feed. The onboard camera position is now locked to the car,
  while only the look target is lightly smoothed; the hood remains visible without
  clipping and speed/closing motion reads clearly.
- Vite retains its existing non-blocking advisory for the Three.js bundle being
  above 500 kB. Build and runtime behavior are otherwise clean.

### Manual inspection result

The foundation is technically ready for the next decision experiment: the Driver
Feed is primary, the Engineer Panel is compact and non-prescriptive, the single
opponent is easy to distinguish, both deterministic defense setups are legible,
and their labels match their lines. No command or overtake outcome was added.
This work is intentionally left uncommitted for review.

## 2026-08-07 - HUMAN PLAYTEST / DESIGN DECISION: TTC braking-call experiment rejected

### Status

This is an experimental, rejected gameplay iteration. It is being committed for
historical reference and is not an approved stable gameplay checkpoint.

### Human playtest findings

- All four states were manually tested: NO CALL, PREPARED, RUSHED, and EMERGENCY.
- The system works technically, but the current mechanic is not fun enough.
- PREPARED is too forgiving: `TTC >= 2.5 s` has no upper bound, so calling very
  early is an obvious dominant strategy. Precise timing is therefore not rewarded,
  undermining the "Timing is Gameplay" thesis.
- RUSHED, and especially EMERGENCY, are too narrow and difficult to encounter
  naturally.
- A static one-corner LATE BRAKE experiment makes the correct action too obvious.
- The AI Driver currently feels too safe and invulnerable. Do not add
  retirement/DNF yet; failure severity will be revisited after the core timing
  mechanic works.
- NO CALL being better than a bad EMERGENCY call is intentional and should remain.

### Desired outcome hierarchy

`PERFECT CALL > NO CALL > BAD CALL > CATASTROPHIC FAILURE`

### Terminology decision

LATE BRAKE is semantically confusing because late braking is a driving technique,
while a late call is a communication-timing failure. Korean automotive terminology
should avoid awkward literal translations; if this concept returns, prefer
`레이트 브레이킹` over `늦은 제동`.

### Next design hypothesis

Replace this test mechanic in the next iteration with one direct `BRAKE!` call and
an explicit optimal timing window:

- TOO EARLY -> safe but slower
- PERFECT -> fastest successful entry
- LATE -> unstable / time loss
- CRITICAL -> severe deterministic failure

Do not implement this redesign until explicitly requested.

## 2026-08-07 - LATE BRAKE timing gameplay prototype

### Task goal

Test whether one Race Engineer command is fun when the same LATE BRAKE input
produces different deterministic driving outcomes based on when it is given.

### Gameplay logic implemented

- Selected the existing track's sharpest right-hand corner as the one explicit
  gameplay corner. Its approach, entry, apex, and recovery progress values are
  `0.70`, `0.88`, `0.93`, and `0.99`; the track shape itself was not changed.
- Added a continuously wrapping NEXT / RIGHT / distance HUD readout.
- Added exactly one command button: LATE BRAKE.
- Recorded distance, current speed, and TTC once at command receipt, then latched
  the command to that specific upcoming corner occurrence.
- Added competent automatic no-call braking, a faster stable PREPARED line, a
  delayed hard-braking RUSHED line with controlled wobble, and an EMERGENCY
  outside overshoot with heavy speed loss and deterministic recovery.
- Added temporary Driver reactions and persistent last-call feedback explaining
  the recorded TTC, timing classification, and result.
- Added English and Korean text through the existing localization dictionary.
- Reset the command after the target corner exit so every lap is independently
  testable; commands issued after entry correctly target the next lap.

### Final TTC thresholds

- PREPARED: TTC greater than or equal to `2.5 s`.
- RUSHED: TTC greater than or equal to `1.0 s` and less than `2.5 s`.
- EMERGENCY: TTC less than `1.0 s`.

The original prototype values were retained because browser testing confirmed
that all three windows are reachable at SAFE, NORMAL, and PUSH speeds.

### Important implementation decisions

- `CornerGameplayController` owns timing, occurrence targeting, default corner
  braking, temporary outcome profiles, and reset behavior outside `main.ts`.
- `CarController` now exposes unwrapped total progress and accepts small per-frame
  arcade modifiers for target speed, response, lateral offset, and yaw.
- The good call delays braking and keeps a substantially higher corner speed than
  the competent baseline; no randomness or realistic tire physics was added.
- The temporary Driver reaction is displayed for 2.4 seconds. The call feedback
  remains visible for comparison after the command behavior resets.

### Files changed

- `src/cornerGameplay.ts` - timing math, corner state, classifications, outcomes.
- `src/carController.ts` - total lap progress and deterministic driving modifiers.
- `src/track.ts` - explicit metadata for the one gameplay test corner.
- `src/main.ts` - connects controller, car, camera, HUD, and reaction duration.
- `src/hud.ts` - next-corner, command, reaction, and debug-feedback UI.
- `src/localization.ts` - English/Korean strings for the new UI and reactions.
- `src/style.css` - responsive layout for the added prototype HUD elements.
- `docs/codex-log.md` - this task record.

### Commands and tests run

- `npm run build` (TypeScript and Vite production build).
- Local Vite server with an HTTP 200 startup check.
- Browser checks for the no-call baseline and PREPARED, RUSHED, and EMERGENCY.
- Verified next-corner countdown/wrap, one-occurrence command latching, reset and
  repeatability, post-entry next-lap targeting, SAFE/NORMAL/PUSH, English/Korean,
  no console errors, 390x844 mobile layout, and 900x450 landscape layout.
- `git diff --check` and `git status --short`; no Git commit was created.

### Problems encountered and solutions

- This terminal did not initially resolve `npm` from PATH. The installed Node/npm
  directory was added to PATH for the build command; the project itself required
  no dependency or configuration change.
- The first PREPARED tuning reached the same corner speed as the no-call baseline.
  Its braking was delayed further and its stable corner-speed advantage increased;
  retesting measured about 128 km/h at entry versus about 93 km/h without a call.
- The first RUSHED tuning braked harder but began at the normal braking marker.
  Its braking start was moved deeper into the approach; retesting kept 130 km/h
  until late in the approach before a sharp drop to about 50 km/h and a wobble.
- Vite still reports its existing non-blocking advisory for a JavaScript chunk
  above 500 kB because Three.js is bundled into this small single-page prototype.

## 2026-08-07 - First stable Git checkpoint

- Initialized the local Git repository and committed the stable prototype as
  `bf279b54318f1c4889df5a97115cfd56af927f88`.
- No remote repository was added and nothing was connected or pushed to GitHub.

## 2026-08-07 - Browser-based 3D foundation

### Task goal

Create the first reliable, playable foundation for COPY THAT? with Three.js,
TypeScript, Vite, deterministic automatic driving, a chase camera, pace controls,
a speed display, and minimal English/Korean localization.

### Implementation summary

- Initialized a vanilla TypeScript Vite project with no framework or backend.
- Built a closed Catmull-Rom track with a road ribbon, ground, edge markers,
  pylons, a start line, shadows, and basic lighting using primitive geometry.
- Built a low-poly primitive car and a deterministic curve-based controller.
- Added smooth, frame-rate-independent transitions between 60 km/h SAFE,
  130 km/h NORMAL, and 230 km/h PUSH targets.
- Added a smoothed third-person chase camera and responsive resizing.
- Added a DOM HUD with current speed, three pace buttons, selected-state and
  keyboard-focus feedback, and an `EN | Korean` language toggle.
- Added a small typed localization dictionary for the UI text that exists now.
- Verified desktop and narrow mobile layouts, pace transitions, localization,
  default state, animation, and browser console output.

### Files created or changed

- `.gitignore` - ignores installed packages and generated build output.
- `AGENTS.md` - stores the persistent project and collaboration rules.
- `index.html` - provides the Vite page shell and application mount point.
- `package.json` / `package-lock.json` - define scripts and lock dependencies.
- `tsconfig.json` - enables strict TypeScript checking for the browser project.
- `src/main.ts` - creates the scene, renderer, car, camera, animation loop, and HUD.
- `src/track.ts` - defines the curve and builds the primitive track environment.
- `src/carController.ts` - builds and deterministically moves the car.
- `src/hud.ts` - creates and updates the speed, pace, and language controls.
- `src/localization.ts` - contains the English/Korean UI dictionary and types.
- `src/style.css` - lays out the full-screen game and responsive HUD.
- `src/vite-env.d.ts` - loads Vite's browser and CSS import declarations.
- `docs/codex-log.md` - records this implementation work.
- `dist/` - generated production output from the successful build (ignored).

### Commands run

- `npm install three`
- `npm install --save-dev typescript vite`
- `npm install --save-dev @types/three`
- `npm run build` (rerun after fixes; final run succeeded)
- `npm run dev -- --host 127.0.0.1 --port 4174 --strictPort`
- `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4173 --strictPort`
- Local HTTP and in-browser desktop/mobile interaction checks against the dev server.

### Problems encountered

- The attached brief contained corrupted Korean characters. The implemented UI
  strings were restored as valid UTF-8 text.
- Node and npm were installed but not present on this terminal's PATH. Commands
  were run through the installed Node/npm location with a temporary PATH update.
- The sandbox initially blocked npm registry access. The dependency commands were
  rerun after the required download approval was granted.
- The first TypeScript integration build lacked Three.js declarations and Vite's
  CSS import declaration, and retained a nullable app reference inside a callback.
- Browser testing reported deprecated `THREE.Clock` and `PCFSoftShadowMap` usage.

### Solutions

- Installed `@types/three`, added `src/vite-env.d.ts`, and explicitly narrowed the
  application element before using it in callbacks.
- Replaced `THREE.Clock` with a small `performance.now()` frame timer and used
  `PCFShadowMap`, removing all browser console warnings and errors.
- Kept the generated Three.js bundle intact for this small prototype. Vite still
  prints a non-blocking chunk-size advisory because the single Three.js entry
  chunk is slightly above 500 kB; it does not affect playability or build success.
