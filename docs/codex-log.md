# Codex Log

## 2026-08-07 - HUMAN PLAYTEST / DESIGN DECISION: Step 2 intent structure approved

### Decision

The INSIDE / OUTSIDE communication structure is approved for continued testing,
with information-design and spatial-readability corrections required before an
execution cue is added.

### Human playtest findings

- INSIDE / OUTSIDE intent calls, Driver acknowledgement, and preparation behavior
  function correctly.
- The preparation movement exists but is difficult to feel clearly from the
  Driver Feed. The approach corridor is narrow, straight-line staging is limited,
  and the onboard view has weak lateral-position reference.
- Explicit `DEFENDING INSIDE` / `DEFENDING OUTSIDE` text caused the player to
  concentrate on the Engineer Panel, read an interpreted answer, and immediately
  prepare the opposite lane. The panel currently over-explains the tactical
  situation instead of presenting raw information for judgment.
- The Driver Feed also makes the opponent's defensive side too difficult to
  recognize independently. Information asymmetry should give the Engineer earlier
  and clearer context, not make the Driver Feed unreadable.
- Positive result: after calling an intent and watching the Driver prepare, the
  closing cars created a strong desire for an execution command. The player said,
  “I want to press NOW already.” This is useful anticipation evidence, not approval
  to implement NOW yet.

### Active hypothesis

Continue testing the intended sequence:

`information -> judgment -> intent -> acknowledgement -> preparation -> future execution cue`

Step 2.5 will correct the information and spatial presentation before any
execution cue or overtake outcome is implemented. Preserve the rule: **Driver can
save the car. He cannot save the Engineer's decision.**

## 2026-08-07 - Step 2: INSIDE / OUTSIDE intent-call prototype

### Step 1 approval and checkpoint

- The human game director approved the Driver Feed, Engineer Panel, and
  deterministic opponent-defense foundation as useful.
- That exact reviewed foundation was preserved before Step 2 at commit
  `5f4926cdd31870deb23a4bd184a41665655ad039` with message
  `Prototype: driver feed and overtake scenario foundation`.
- The rejected TTC / LATE BRAKE experiment remains historical source only and was
  not revived.

### Step 2 goal

Test only whether INSIDE / OUTSIDE feels like an Engineer communicating a tactical
plan to a skilled Driver, followed by a visible acknowledgement and preparation.
This iteration intentionally stops before execution, success, failure, or timing.

### Intent-call implementation

- Added exactly two active Engineer calls: INSIDE and OUTSIDE.
- Both buttons are disabled outside the staged overtake approach. During the
  approach they become available together; accepting one records and locks one
  plan for that occurrence, preventing command spamming or plan changes.
- The Driver immediately acknowledges with temporary text: `Copy. Inside.` or
  `Copy. Outside.` The compact Engineer panel retains the committed PLAN after the
  acknowledgement disappears.
- The opponent defense remains independent. It continues alternating INSIDE /
  OUTSIDE by occurrence and never reads or reacts to the Engineer's chosen plan.
- No correct/incorrect assessment, hidden offset, timing answer, outcome, score,
  collision, pass, or execution cue is shown or calculated.

### Preparation versus direct steering

- A call does not teleport or instantly push the car sideways. A small response
  delay follows acknowledgement, then the Driver smoothly interpolates toward a
  stable attack-setup corridor while retaining the automatic speed and corner
  baseline.
- The scripted opponent always remains ahead, so preparation cannot accidentally
  execute an overtake.
- The plan is locked even when it places the Driver behind the defended lane:
  **Driver can save the car. He cannot save the Engineer's decision.**

### Right-corner geometry mapping

- CarController's track-relative lateral basis points toward visual track-left on
  this right-hander.
- INSIDE preparation therefore uses the negative basis direction, moving the car
  toward the physical inside/right corridor.
- OUTSIDE uses the positive basis direction, moving toward the physical
  outside/left corridor. No world-space left/right assumption is used.

### Reset and repeatability

- After the staged recovery marker, the committed intent and acknowledgement are
  cleared, the Driver smoothly returns toward the baseline lane, and the controls
  wait for the next approach window.
- This supports A+INSIDE, A+OUTSIDE, B+INSIDE, and B+OUTSIDE across repeated laps
  without refreshing and without changing the deterministic opponent sequence.

### Files changed

- `src/intentCall.ts` - per-occurrence availability, commitment, acknowledgement,
  smooth track-relative preparation, and reset state.
- `src/main.ts` - combines automatic corner driving with the preparation modifier
  and connects intent state to the panel.
- `src/engineerPanel.ts` - two gated intent buttons, compact PLAN readout, and
  temporary Driver acknowledgement.
- `src/localization.ts` - English/Korean labels for the intent UI and plan names.
- `src/style.css` - compact intent controls, availability/selection states, radio
  acknowledgement, and narrow-screen accommodation.
- `docs/codex-log.md` - this Step 2 implementation and playtest record.

### Commands and tests run

- Created and verified the approved Step 1 Git checkpoint before editing Step 2.
- `npm run build` (TypeScript and Vite production build).
- Browser-tested disabled controls outside the approach, both controls becoming
  available during the approach, immediate acknowledgement, one-call locking,
  persistent PLAN feedback, and reset on subsequent occurrences.
- Tested without refreshing: defending INSIDE + INSIDE, defending OUTSIDE +
  INSIDE, defending INSIDE + OUTSIDE, and defending OUTSIDE + OUTSIDE.
- Visually confirmed smooth delayed preparation in both physical corridors, the
  opponent remaining ahead, and the opponent defense/label staying independent of
  the selected plan.
- Verified the 75/25 Driver Feed layout, NORMAL source baseline, English/Korean,
  exactly two intent buttons, no old gameplay HUD, no outcome/timing state in the
  active DOM, and zero browser runtime warnings or errors.

### Problems encountered and solutions

- The first compile identified that the nullable committed plan was not narrowed
  across a derived boolean. The active plan is now captured locally before target
  calculation, preserving strict TypeScript safety without a non-null assertion.
- Vite retains its existing non-blocking advisory for the bundled Three.js chunk
  being above 500 kB.

### Manual playtest instructions

Run the prototype and wait for the two intent buttons to activate on approach.
Test this four-occurrence sequence without refreshing:

1. OPPONENT DEFENDING INSIDE -> call INSIDE.
2. OPPONENT DEFENDING OUTSIDE -> call INSIDE.
3. OPPONENT DEFENDING INSIDE -> call OUTSIDE.
4. OPPONENT DEFENDING OUTSIDE -> call OUTSIDE.

For each case, inspect whether the acknowledgement is immediate, the car waits
briefly before moving, the preparation is smooth and readable from the Driver
Feed, the plan remains locked, the opponent does not react, neither car completes
an overtake, and the plan clears before the next approach. The subjective question
for the game director is whether this feels like communicating a plan rather than
pressing a steering direction.

Step 2 remains deliberately uncommitted pending human playtest approval.

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
