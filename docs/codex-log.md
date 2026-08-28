# Codex Log

## 2026-08-28 - COPY THAT? 2.0 Phase 0 actual audit

### Evidence, not assumption

- Created safe pre-rebuild checkpoint `2b981b0` from the submitted vertical
  slice before any architectural change.
- Played the current local production build through complete and focused browser
  paths and inspected the submitted public URL. NO INPUT finished normally in
  P3 at 2:25.9; silence misses the objective but causes no incident or terminal
  failure. This falsifies Engineer necessity in the current build.
- Counted only three player calls across two decision sequences in a complete
  run. The gap between the opening call and final overtake is nearly 100 seconds,
  so the current race fails the no-empty-racing law.
- Reproduced the protected overtake at runtime. Correct OUTSIDE + NOW succeeded
  with defense-readable/intent/prep/NOW/outcome timestamps of
  0.898/1.069/2.065/3.901/6.633 s. Wrong INSIDE + NOW produced a readable blocked
  result, but safely aborted rather than creating a severe consequence.
- Confirmed that UI copy exposes the rival's exact defense side, the rival is
  seeded rather than position-reactive, PUSH/HOLD has no persistent race-state
  tradeoff, the circuit has no meaningful blind crest, and the runtime does not
  enforce legal corridor bounds.
- Recorded the rejected placeholder-quality visual/audio findings and corrected
  the stale ~2:06 race-duration claim. Build, command-parser, and overtake-model
  tests remain useful regression evidence but are not treated as fun proof.

### Decision

- Keep `docs/north-star.md` and all release gates unchanged.
- Preserve the approved pure overtake timing model while incrementally replacing
  the surrounding race with a fixed-step deterministic simulation, explicit
  information split, track-corridor assertions, and a dense sequence of causal
  communication beats.
- Do not deploy during the rebuild. Secure Realtime voice is feasible through a
  same-origin server broker, but live voice and external asset generation are
  deferred only at the exact unavailable-credential boundary.
- Added an exact `RESUME HERE` section to `docs/current.md` so work can continue
  from repository truth after any usage-limit interruption.

## 2026-08-27 - Stable North Star established

- Established `docs/north-star.md` as the stable product and design constitution
  after red-team/adversarial review, falsification-test design, and platform-
  strategy review. It is separate from current implementation truth and may
  change only through explicit user direction or strong playtest evidence
  reviewed with the user.

## 2026-08-26 - Submission vertical slice release candidate

### Durable product decisions

- Converted the approved encounter into one complete three-lap fictional race,
  Meridian Sprint, with a P3 start, P2 target, beginning, escalation, overtake
  climax, finish, debrief, and full Retry.
- Preserved the exact approved overtake parameters and pure model. The larger
  circuit changes only its physical placement inside the race.
- Added one lightweight opening PUSH/HOLD decision to establish the
  Engineer/Driver rhythm before the final-lap line and timing calls. It remains
  deterministic and adds no fuel, tire, pit, or setup simulation.
- Established the fictional Apex Vector / Car 27 identity and a dark race-ops
  workstation presentation with the onboard feed as the dominant surface.
- Replaced generic road-car silhouettes with primitive open-wheel cars, built a
  designed closed circuit and venue language, and added procedural WebAudio.
  These choices avoid an external asset or physics dependency.
- Voice remains intentionally omitted because neither SpeechRecognition nor
  webkitSpeechRecognition is available in the QA browser. Text and buttons map
  into the same deterministic command path.

### Verification evidence

- The original ten-case overtake matrix and 30/60/120 FPS classifications pass;
  the approved 3.75-4.70 s viable NOW interval is unchanged.
- The command parser passes 23 English/Korean recognition and rejection cases,
  including the new PUSH/HOLD family.
- Screenshot-led browser QA covered title, normal racing, opening call, defense
  reveal, preparation, NOW, successful P3-to-P2 pass, Too Soon, Too Late,
  blocked, no-call, both result states, Retry, English/Korean, desktop, and
  390x844 mobile. The production preview has no console warnings or errors.
- The completed success-path race/debrief duration is about 2:06, inside the
  target short-session range. Vite's existing Three.js chunk-size advisory
  remains non-blocking and was not used to justify an unrelated refactor.

## 2026-08-25 - Communication Feel experiment (pre-Fun Gate)

### Goal and implementation

- Added a compact Driver Radio text affordance to the Engineer Panel while
  retaining the approved INSIDE / OUTSIDE / NOW buttons as the reliable path.
- Added a deliberately narrow, deterministic parser for clear English and
  Korean variants of INSIDE, OUTSIDE, and NOW. Ambiguous or conversational
  input is rejected rather than becoming freeform Driver behavior.
- Parsed commands route to the existing `issueIntent` / `issueNow` calls; the
  overtake model, timing parameters, and approved balance are unchanged.

### Verification

- The command-parser regression script covers recognized English/Korean calls
  plus ambiguous and conversational rejection cases.
- Focused browser smoke testing verified radio heading/layout, rejected input,
  accepted OUTSIDE and NOW routing, existing Driver acknowledgement, retained
  buttons, and zero browser console warnings/errors.
- At this stage, this was not a human Fun Gate or an approved gameplay
  checkpoint. No commit was created; audio and voice recognition were
  intentionally deferred.

### Release-focused presentation pass (2026-08-26)

- Added a compact in-world Engineer Brief so the opening immediately explains
  the role without revealing the correct answer. It disappears after an intent
  is issued and returns on Retry.
- Reworked the narrow/mobile Engineer Panel layout so its radio, tactical
  facts, intent buttons, and NOW control remain simultaneously visible. Driver
  replies use the existing radio-status line on mobile so an acknowledgement
  cannot push the timing control off-screen.
- Strengthened only state-driven copy: acknowledgement, too-soon, too-late,
  no-room, no-call, and successful-pass responses describe the Driver's actual
  situation. The pure overtake model and its tuning are unchanged.
- Native browser speech recognition was unavailable in the local QA browser;
  voice was deliberately omitted rather than adding an unreliable, secret- or
  backend-dependent path.
- Verified `npm run test:commands`, `npm run sim:overtake`, `npm run build`,
  a production-preview success path via typed OUTSIDE then NOW, a too-early
  failure followed by Retry, English/Korean radio parsing, desktop/mobile
  layout, and clean browser console output.

### Human Fun Gate (2026-08-26)

- The human approved the Communication Feel milestone: the radio affordance,
  contextual Driver reply, briefing, and button fallback successfully make the
  approved overtake loop feel like communication with a capable Driver.
- This approval authorizes a checkpoint for the completed Communication Feel
  and submission-preparation work. The overtake balance remains unchanged.

## 2026-08-08 - Core-loop human-timing correction (uncommitted)

### Correction

- Removed the frozen 1.5-second information hold. The race now moves through an
  explicit reveal/read phase, Driver preparation phase, and later execution
  phase with no visible pause.
- Intent unlocks only after the opponent's actual lateral state crosses the
  shared readability threshold. The existing delayed, smooth Driver preparation
  is preserved, and NOW requires real 80% preparation at call time rather than
  crediting movement that would happen after an instant call.
- Retimed the longer event kinematically: matched-speed formation protects the
  read phase, later tow acceleration builds pressure, and live speed, gap,
  clearance, preparation, and road remaining create a 3.75-4.70 s viable NOW
  interval rather than a fixed success timer.
- Normal play now selects each already-determined defense from a seeded hashed
  event sequence instead of forced A/B alternation. Debug retains forced Scenario
  A/B and repeatable `seed` support. Outcome failure/success remains deterministic.
- Replaced the clamped GAP display with live `BEHIND / SIDE BY SIDE / AHEAD`
  relation and signed player-centric seconds, localized as
  `뒤처짐 / 나란히 / 앞섬` in Korean.
- Tactical markers now follow the existing curved road path using actual local
  longitudinal and lateral state, making overlap and the player's crossing ahead
  visually legible. Debug reports now include the complete causal timestamp chain.

### Verification

- Human-reaction sweeps starting only after defense readability pass at 0.6,
  1.0, and 1.4 s observation-to-intent delays. Both forced sides retain the same
  state-derived 0.95 s NOW opportunity; immediate/early, viable, late,
  wrong-line, and no-call results remain distinct and deterministic.
- The ten-case matrix and 30/60/120 FPS classification checks pass. Browser tests
  confirmed moving cue gating, good forced A/B passes, causal early/late/blocked
  failures, safe no-call, seeded `inside, inside, outside` Retry sequence,
  English/Korean AHEAD state, visible tactical crossing, timestamped debug report,
  and no console warnings/errors.
- `npm run sim:overtake` and `npm run build` pass. The only build warning is the
  existing Vite advisory for a JavaScript chunk over 500 kB.

This work corrects the existing **uncommitted Core Loop experiment** directly.
It is not a stable or approved checkpoint, and no commit was created.

## 2026-08-07 - HUMAN PLAYTEST / DESIGN DECISION: Core-loop payoff promising, human timing rejected

### Human playtest findings

- Successfully passing the opponent felt fun. The overtake payoff itself is the
  strongest result of this iteration and should be preserved.
- Reactive play was effectively impossible. Waiting to visually identify the
  opponent's defense, selecting the opposite intent, and calling NOW shortly
  afterward often produced `Too late.`
- Success became practical mainly by memorizing the deterministic A/B alternation
  and pre-entering the next answer. That tests sequence memory rather than reading
  and communicating the live race situation.
- The simulator technically found a viable machine-input window, but it omitted
  the time a human needs to receive, interpret, and communicate the information.
- After a pass, GAP incorrectly remained around zero instead of clearly showing
  that the player was ahead.
- Tactical-map markers consumed longitudinal state, but their scale made that
  movement visually weak; the map still read mostly as lateral dots.

### Design decision

**PAYOFF IS PROMISING. HUMAN COMMUNICATION TIMING MODEL IS WRONG.**

Correct the existing uncommitted Core Loop directly. Replace the frozen
information hold with moving reveal/read, intent/preparation, and execution
phases; simulate reaction latency from the moment defense becomes readable; use
seeded non-alternating defense selection in normal play while retaining forced
A/B debug cases; and repair the signed gap and tactical-map crossing. Do not add
new commands, failure systems, audio, or polish, and do not checkpoint this
broken-timing version.

## 2026-08-07 - First complete overtake core-loop experiment

### Goal and implementation

- Built the first complete test of `information -> intent -> acknowledgement ->
  preparation -> NOW -> pass / failed attempt -> retry`.
- Added a deterministic shared overtake model used by both the browser runtime
  and `npm run sim:overtake`; the useful NOW region is predicted from tow speed,
  gap, preparation/lateral clearance, opponent velocity, and road remaining.
- Staged the event earlier and added a short information hold so the Engineer can
  read the opponent, call a lane, see the Driver prepare, and then choose NOW.
- A correct viable call produces a visible pass and `Got him.`; early, late, and
  blocked-side calls produce readable safe aborts with `Too soon.`, `Too late.`,
  or `No room.`. No call remains safely behind.
- Added actual longitudinal and lateral tactical-map motion, one-call NOW/`지금`,
  an alternating fast Retry control, and developer-only `?debug=1` telemetry with
  a copyable plain-text report. Normal play contains no timing meter or answer.

### Simulation and verification

- The approved Step 2.5 seed produced no viable NOW region. After evidence-led
  scenario tuning, both mirrored correct-lane cases produce one contiguous
  `0.90-1.85 s` model-relative region (about `0.95 s`).
- The ten-case A/B matrix passes, wrong-line calls never pass, and no-call stops at
  the deterministic 7 m following gap. Early/good/late classifications match at
  30, 60, and 120 FPS.
- `npm run build` succeeds. Browser testing verified the visible success, all
  failure reactions, no-call, A/B Retry, English/Korean controls, debug copy,
  responsive 720p layout, and zero runtime warnings/errors.
- Full model assumptions, before/after values, parameter rationale, and sweep
  evidence are recorded in `docs/overtake-sim.md`.

This core loop is an **uncommitted gameplay experiment pending human fun
testing**, not an approved stable checkpoint.

## 2026-08-07 - HUMAN PLAYTEST / DESIGN DECISION: Step 2.5 approved for core-loop work

### Human playtest findings

- Opponent defensive lateral movement is now much easier to perceive in the
  Driver Feed, and the wider, clearer local approach successfully improved
  left/right readability.
- INSIDE / OUTSIDE preparation is readable enough to continue.
- Because Driver preparation is deliberately not instantaneous, the communication
  window can still feel compressed. The player needs more time to read, call an
  intent, watch preparation, and reach the execution opportunity.
- The tactical-map concept is useful, but its current markers mostly communicate
  lateral displacement. They do not convincingly progress longitudinally through
  the local race situation, so the map can feel like the old explicit defense
  label converted into a diagram.
- Improve the map and communication staging inside the complete core loop rather
  than creating another isolated micro-step.
- Most importantly, preparation again produced a strong desire for the missing
  execution cue: the player wants to call NOW.

### Decision

Proceed to the first complete core-loop test:

`information -> intent -> acknowledgement -> preparation -> NOW -> pass / failed attempt -> retry`

The upcoming implementation must simulate first, derive the opportunity from a
shared state/kinematic model, and preserve: **Driver can save the car. He cannot
save the Engineer's decision.**

## 2026-08-07 - Step 2.5: tactical-information and approach-readability correction

### Preserved Step 2 checkpoint

The completed INSIDE / OUTSIDE intent-call prototype and its human-playtest
decision were committed before this correction as
`c9994be64e049c488348ba2049104440f985461b` with message
`Prototype: intent calls and driver preparation`.

### Step 2.5 goal

Keep the approved intent, acknowledgement, preparation, locking, reset, and A/B
opponent systems unchanged while correcting three presentation problems: the
Engineer gave away the interpreted answer, the local approach was compressed,
and lateral preparation was difficult to read from the Driver Feed.

### Tactical information instead of an answer

- Removed active `DEFENDING INSIDE` / `DEFENDING OUTSIDE` text from the Engineer
  interface. The historical localization entries remain unused rather than being
  aggressively deleted.
- Added one lightweight SVG tactical map of the local approach and upcoming
  right-hand corner. It is not a full-track minimap.
- The map shows a yellow player marker, cyan opponent marker, local road shape,
  and their relative lateral positions. The opponent marker consumes the same
  signed lateral offset that places the physical opponent; the player marker uses
  the Driver's actual preparation offset.
- The map contains no named side, recommended lane, open-line highlight, correct
  answer, timing information, or command suggestion. NEXT RIGHT, distance, GAP,
  and the existing intent controls remain compact factual information.

### Local approach and track changes

- Adjusted only the control points leading into the existing gameplay right-hander
  to produce a clearer short near-straight staging section.
- Added a smooth local road-width profile: the normal circuit remains 8.5 m wide,
  while the overtake approach expands to 12.4 m and tapers back after the corner.
- Road edges and kerbs now follow that local width rather than widening the entire
  circuit.
- Added subdued dashed centre references only through the overtake approach so
  lateral position is readable without adding general telemetry or visual polish.
- The opponent now begins its deterministic defensive movement earlier in the
  staging area and reaches a more legible track-relative offset. A/B alternation
  and independence from the Engineer's plan are unchanged.

### Driver Feed and preparation readability

- Kept the hood/onboard camera as the primary view and raised it only slightly to
  reveal more road width and reference markings without becoming overhead.
- Increased the controlled preparation offset modestly within the wider local
  corridor. The acknowledgement delay and smooth interpolation remain, so an
  intent still reads as a Driver-executed plan rather than direct steering.
- INSIDE continues toward the physical right/inside corridor; OUTSIDE continues
  toward the physical left/outside corridor using track-local orientation.
- No NOW, execution, pass, collision, success/failure, score, or high-G effect was
  added. **Driver can save the car. He cannot save the Engineer's decision.**

### Files changed

- `src/track.ts` - local curve alignment, width profile, matching edges/kerbs, and
  approach reference marks.
- `src/overtakeScenario.ts` - earlier/more legible defensive movement and the live
  opponent lateral offset in the scenario snapshot.
- `src/intentCall.ts` - modestly larger preparation offset within the wider zone.
- `src/engineerPanel.ts` - position-only SVG tactical map driven by live offsets.
- `src/main.ts` - supplies actual player/opponent positions and local road width to
  the map, plus a small onboard-camera height adjustment.
- `src/localization.ts` - English/Korean tactical-map and car-identity labels.
- `src/style.css` - compact tactical-map presentation and marker styling.
- `docs/codex-log.md` - this Step 2.5 record.

### Commands and tests run

- `npm run build` (TypeScript and Vite production build).
- Browser-tested the 75/25 Driver Feed layout, local near-straight, widened
  corridor, centre references, closing gap, acknowledgement, locked intent,
  smooth INSIDE and OUTSIDE preparation, reset behavior, and the opponent staying
  ahead.
- Ran a controlled consecutive A -> B cycle. The physical opponent and cyan map
  marker moved to map-right together in A and map-left together in B; the scenario
  continued alternating deterministically.
- Verified the player marker followed actual delayed preparation in both
  directions, while the opponent remained independent of the selected intent.
- Verified one tactical map, exactly two intent buttons, English/Korean, no active
  explicit defense answer, no old gameplay HUD, no NOW/execution/outcome text, and
  zero browser runtime warnings or errors.

### Problems encountered and solutions

- The first visual map scale made real defensive displacement too subtle. Marker
  scaling was increased within the schematic road bounds, and defensive movement
  was started earlier in the existing approach so the change becomes legible
  before corner entry.
- Vite retains its existing non-blocking advisory for the bundled Three.js chunk
  exceeding 500 kB.

### Manual inspection instructions

In the Driver Feed, inspect whether the local road clearly opens into a short
near-straight, the centre references make left/right position readable, the
opponent visibly covers alternating sides, and INSIDE/OUTSIDE produce a delayed,
smooth setup without passing. Confirm that the rest of the circuit does not feel
globally widened and that the camera remains an onboard view.

In the Engineer Panel, compare the cyan marker directly with the opponent's
physical side, confirm the yellow marker follows the Driver's preparation, read
the upcoming right-turn shape, and decide whether this is clearer tactical context
without naming the correct answer. Also verify Korean, plan locking, acknowledgement,
and reset across consecutive A/B occurrences.

Following human approval, this Step 2.5 state and its playtest decision were
preserved as commit `6c29d839fe24b766cd57cae287d0df5a675ba88b` with message
`Prototype: readable overtake staging and tactical information` before core-loop
implementation began.

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
