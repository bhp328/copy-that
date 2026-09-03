# COPY THAT? — Current Project Truth

`docs/north-star.md` is the product constitution and remains unchanged. This
file records actual implementation truth, verification evidence, open release
gates, and the exact continuation point for the COPY THAT? 2.0 rebuild.

## Product Thesis

- Conversation is the control system: the human Engineer knows NEXT/GLOBAL,
  the Driver knows NOW/FEEL, and neither can succeed alone.
- Timing is gameplay. The deterministic simulation is authoritative; language
  and voice may issue constrained calls but never drive the car per frame.
- The Driver is capable and can sometimes save the car, but cannot erase a bad
  Engineer decision.
- UI provides evidence, not the answer.

## Repository State

- Branch: `master`.
- GitHub: private `origin` at `https://github.com/bhp328/copy-that`; `master`
  tracks `origin/master`.
- Safe pre-rebuild baseline: `2b981b0 Checkpoint submitted vertical slice baseline`.
- Phase 0 evidence checkpoint: `acb5019 Document Phase 0 rebuild audit`.
- That checkpoint contains the complete previously submitted Meridian Sprint
  and the authoritative North Star documentation.
- The submitted public URL is
  `https://lambent-gecko-2ec95c.netlify.app/` and must be preserved when a later
  release candidate is intentionally deployed.
- Deployment is deliberately paused until the rebuilt core passes the North
  Star release gates locally.

## Existing Baseline — What Is Worth Preserving

- Three.js + TypeScript + Vite, browser-first and English/Korean capable.
- A deterministic spline-driving race shell with a complete start, three laps,
  result, and Retry loop.
- The approved pure overtake model and its measured 3.75–4.70 s NOW interval.
  Preserve its characterization while the surrounding race is rebuilt.
- Deterministic EN/KR command parsing and one shared command path for text,
  buttons, and future voice intents.
- Debug-only seeded stage jumps and timestamp evidence.

## Rebuild Milestone 1 — Implemented And Locally Verified

- Added `docs/rebuild-2.0-design.md`, the falsifiable 3–5 minute encounter and
  information-split contract. It is subordinate to the North Star and its
  untested values are hypotheses, not approved balance.
- Added a shared serializable track specification and separated CatmullRom/frame
  math, validation, and Three.js rendering responsibilities.
- Re-authored the circuit to 1721.17 m with a measured 17.00 m elevation range
  and a genuine crest profile. The crest rises 11.30 m, falls 9.58 m, and
  occludes the approach-to-reveal sight line by 9.24 m.
- Track validation now uses the actual 3.15 m-wide Formula-car envelope, dense
  0.25 m samples, an 18 m minimum curvature requirement, legal center bounds,
  non-local road clearance, global barrier-to-asphalt clearance, and transformed
  barrier chord/endpoint continuity checks.
- The current track passes with 18.39 m minimum radius, 4.18 m minimum legal
  center half-width, 13.88 m minimum non-local road gap, 3.79 m minimum barrier
  clearance, 2880 continuous instanced panels, zero measured endpoint gap, and
  1.85 m maximum panel chord.
- Added a 60 Hz fixed-step clock between browser frame time and simulation. It
  produces the same 720 authority ticks over 12 seconds under 30/60/120 FPS
  schedules and clamps a 1 s spike to six 60 Hz ticks.
- Extracted the protected overtake authority into `CoreOvertakeSimulation`, a
  module with no Three.js, DOM, browser clock, or random-source dependency.
  `OvertakePresentation` now only maps snapshots to the rival mesh.
- Direct runtime characterization passes success, too early, too late, blocked,
  no-call, and deterministic Retry. The original lower-model matrix and timing
  interval are unchanged.
- Browser QA on the production build confirmed the re-authored track renders,
  the pure-simulation OUTSIDE + NOW path reaches P2, and inspected paths have no
  console warnings or errors. This is regression evidence, not a Fun Gate.

## Rebuild Milestone 2 — Pure first-three encounter slice

- Added `RaceSimulation`, a Three.js/DOM-independent 60 Hz authority with a
  FIFO action queue, monotonic action/event receipts, retry cancellation, and
  immutable Engineer, Driver, Presentation, and diagnostics projections.
- The Engineer projection exposes upcoming geometry, gap/closing evidence and
  road remaining while omitting exact grip, brake feel, visibility, and local
  overlap. The Driver projection exposes those NOW/FEEL facts while omitting
  unseen geometry and global rival trend. Runtime probes assert the forbidden
  keys are absent and the projections are frozen.
- Added `raceCorridor.ts`; both player and rival are checked every simulation
  tick against legal asphalt and outer runoff envelopes. The first-slice traces
  complete with zero containment clamps.
- Implemented the first three connected exchanges: proactive Driver feel →
  PUSH/HOLD/SAVE persistence, a route-positioned blind-crest brake margin with
  emergency save/compromised/spin consequences, and a rival attack/defence
  exchange where cover follows the Driver's visible line. Wrong depleted
  defence can become contact/DNF; conservative yield is safe but loses P2.
- The browser now defaults to this authority through a transitional adapter and
  exposes pace, crest-brake, and defence calls plus EN/KR text fallback.
  `?legacy=1` remains a developer regression path for the old protected-
  overtake presentation; it is not the rebuild's normal player path.

### Milestone 2 verification

- `npm run sim:race` passes AFK emergency save + automatic yield, conservative
  safe miss, good clean crest + held P2, wrong late/spin + depleted-side
  contact/DNF, timing-shift consequence, 30/60/120 render partitions,
  immutable role-view omissions, and FIFO duplicate rejection.
- `npm run test:commands` remains green with the original 23 cases; the parser
  also accepts SAVE/EARLY/NORMAL/LATE/YIELD fallback vocabulary.
- `npm run build` passes after the browser adapter and expanded command deck.
- Local Browser automation was attempted against the production preview, but
  the in-app Browser auto-review denied localhost access in this session. No
  screenshot or console-clean claim is made for this milestone; browser
  full-run evidence remains an explicit next gate.

## Phase 0 Actual Audit — 2026-08-28

This is based on full browser runs and focused runtime probes, not on build or
smoke-test success alone.

### Full-run evidence

- **NO INPUT / AFK:** the race reached the finish normally in P3 at **2:25.9**.
  It missed the P2 objective, but silence never created an incident, terminal
  failure, or need for collaboration. This fails the North Star's silence and
  Engineer-necessity hypotheses.
- The baseline contains only three player calls across two decision sequences:
  opening `PUSH/HOLD`, then final `INSIDE/OUTSIDE` plus `NOW`. A lap-two Driver
  balance report is flavor only; the Engineer cannot act on it. Long stretches
  are empty racing.
- Code-derived complete-run timing is approximately 2:19.1 for the earliest
  PUSH + good pass, 2:21.9 after a missed pace call + good pass, 2:23.3 for HOLD
  + good pass, and 2:25.9 for AFK. The older ~2:06 duration claim was stale.
- The opening decision arrives around 8.9 s and expires around 20.0 s. The next
  meaningful player decision does not begin until roughly 119 s, leaving an
  unacceptable communication desert.

### Focused deterministic overtake evidence

- Seed 1 exposes an inside defense. Correct `OUTSIDE`, then a viable `NOW`,
  produced a P2 pass and Driver acknowledgement: “Got him. Nice call.”
- The measured causal chain was defense readable at 0.898 s, intent at 1.069 s,
  80% preparation at 2.065 s, `NOW` at 3.901 s, and success at 6.633 s.
- Wrong `INSIDE`, then `NOW` at about 4.003 s, produced a blocked attempt at
  7.351 s with a safe abort and roughly 7.0 m final gap. Wrong, early, late,
  and no-call outcomes are readable, but all are currently too safe to express
  the North Star's reckless-contact/spin/DNF possibility.
- The approved overtake timing model itself still passes its characterization;
  the rebuild should add systems around it rather than silently retune it.

### Information architecture findings

- The current UI reads the deterministic defense side and prints an explicit
  “RIVAL MOVING INSIDE/OUTSIDE” answer. That violates “evidence, not answers.”
- The rival chooses a seeded/forced defense rather than reacting to visible
  Driver positioning. Bluff, feint, switch, and commit therefore do not exist.
- PUSH/HOLD affects elapsed time and result labeling but does not create a
  persistent race-state tradeoff. Driver balance reports do not require
  Engineer judgment.
- The final overtake simulation starts as a fresh authority block and abruptly
  replaces the opening race pace. The full race does not yet have one unified,
  fixed-step deterministic state machine.

### Track, camera, vehicle, UI, and audio findings at the audited baseline

- The 1744.456 m circuit is visually coherent enough for a prototype but has
  only about 0.52 m of elevation, so it cannot deliver a genuine blind crest.
- Legal lateral bounds are not consulted by the race simulation. Sparse box
  barriers use chord placement with visible gaps and have no whole-track
  clearance/intrusion assertions. Containment is therefore unproven.
- The cockpit car and rivals are dominated by box, sphere, and torus primitives;
  the flat track, repeated barriers, simple hills/buildings, and rectangular
  engineering console still read as a WebGL placeholder.
- The full-circuit map omits tactical lateral offsets. On a small viewport the
  map is hidden and the critical command area may scroll.
- Audio provides procedural engine/wind, radio clicks, and outcome accents, but
  lacks layered tire, curb, impact, stress, transmission, and authored radio
  performances. Some audio variation uses nondeterministic `Math.random`.
- Fresh visual scorecard: art direction 1/3, hero vehicle 0/3, opponents 1/3,
  rewards 0/3, world 1/3, materials 1/3, lighting 1/3, VFX 1/3, UI 1/3,
  measured performance evidence 1/3 (average 0.8/3).

### Public/local verification

- The submitted public URL and the local production build both booted in the
  browser with no console errors during the audited paths.
- Representative screenshots were captured for public start, local calm/AFK,
  AFK result, defense reveal, correct preparation/NOW/pass, wrong blocked call,
  and finish/result states.
- The public build contains a small radio-hint copy difference from the local
  checkpoint. No deployment action was taken.

## Verification Baseline

- `npm run test:commands`: 23 English/Korean recognition and rejection cases pass.
- `npm run sim:fixed-step`: 30/60/120 partitions, frame spike, and irregular
  partition checks pass.
- `npm run sim:track`: corridor, curvature, elevation/crest occlusion,
  self-clearance, barrier intrusion, panel continuity, and vehicle-envelope
  assertions pass.
- `npm run sim:overtake`: required ten-case matrix plus 30/60/120 FPS
  classifications pass with the approved timing unchanged.
- `npm run sim:overtake-runtime`: success, early, late, blocked, no-call, and
  deterministic Retry cases pass against the extracted runtime simulation.
- `npm run build`: production build passes. Vite reports the existing
  non-blocking Three.js chunk-size advisory (about 605 kB JS before gzip).
- These checks protect deterministic behavior; they do not claim that the game
  is fun or that any North Star release gate has passed.

## Voice / Realtime Feasibility

- A secure browser WebRTC path is technically viable: a same-origin server
  broker creates the Realtime session/call with a server-only OpenAI key, while
  the browser receives no long-lived secret.
- Natural language should resolve only to constrained deterministic race-call
  tools and route through the same simulation command boundary as fallback text.
- Required latency timestamps are: PTT down/up, audio commit, transcript,
  intent/tool arguments, simulation apply, acknowledgement start, and audio end.
- The current 0.95 s NOW window is **not voice-proven**. It must be measured with
  real speech before being accepted or retuned.
- No OpenAI, Tripo, Gemini, or ElevenLabs API key is available in the current
  process. Secure scaffolding and deterministic mock testing can continue; live
  Realtime and external generated-asset proof will stop only at that minimal
  credential boundary.

## Active Milestone

**COPY THAT? 2.0 — deterministic core and information architecture rebuild.**

The track, fixed-step clock, protected pure overtake boundary, and first three-
beat pure RaceSimulation slice are complete. The next milestone is to browser-
prove this slice end to end, then extend the same authority with the unseen
incident, visible-position feint/switch, protected NOW commitment, and final
defence. The full run remains incomplete until those beats are connected.

## Current Release-gate Status

- **Fail:** AFK/silence does not prevent a normal finish.
- **Partial:** the first three-beat slice has several causal exchanges, but the
  full run still has the old sparse long-race shape after the slice.
- **Partial:** default rebuild UI presents evidence-only crest/defence cues; the
  `?legacy=1` developer path retains the old explicit overtake wording.
- **Partial pass:** the first-slice rival reacts to visible Driver line, but the
  later feint/switch and protected NOW opponent loop are not connected yet.
- **Partial pass:** first-slice contact/spin/DNF and persistent condition are
  causal; unseen-incident and final-defence failure families remain.
- **Partial pass:** static corridor and first-slice per-tick traces pass with
  zero clamps. Full deterministic race traces still do not exist.
- **Fail:** cockpit/car/track/UI/audio remain placeholder-quality.
- **Blocked on later credential only:** live Realtime voice measurement.
- **Pass as baseline only:** build, command parsing, protected overtake model,
  complete start-to-result/Retry shell, and clean audited console paths.

## RESUME HERE

1. Confirm `git status --short --branch` and this file before changing code.
2. Preserve the focused M2 checkpoint: `RaceSimulation`, the role-specific
   information split, persistent condition state, runtime containment, and the
   first three connected exchanges are implemented and simulator-verified.
   Do not treat that checkpoint as browser, Fun Gate, voice, or release proof.
3. Read `docs/rebuild-2.0-design.md`; do not redesign the completed track or
   protected overtake boundary without new failing evidence.
4. Re-run the local browser full slice and capture start, calm/feel, blind crest,
   defence, consequence, and retry screenshots plus console state. Browser
   permission was denied in the interrupted session, so do not mark this gate
   complete from the simulator alone.
5. Connect the unseen incident with race-control hazard evidence, causal
   lift/route choices, and a normal-seed AFK DNF path; then add visible-position
   feint/switch and feed its cover into the protected NOW model.
6. Add final defence, full 3–5 minute start→pressure→climax→finish/DNF→retry
   traces, and run the A–I EN/KR desktop/small-viewport playtest matrix.
7. Add secure PTT/realtime scaffolding and latency timestamps; stop only at the
   exact missing project-scoped credential for live audio.
8. Update this section/log, run relevant simulations/build/browser evidence, and
   create the next checkpoint. Do not deploy.

Baseline commands:

```text
npm run test:commands
npm run sim:fixed-step
npm run sim:track
npm run sim:race
npm run sim:overtake
npm run sim:overtake-runtime
npm run build
npm run preview -- --host 127.0.0.1
```

Do not deploy. Do not weaken `docs/north-star.md`. Do not start visual polish or
live voice integration until the authoritative simulation and information split
can support them without hiding gameplay flaws.
