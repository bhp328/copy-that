# COPY THAT? — Current Project Truth

The stable product and design constitution is `docs/north-star.md`. This file
tracks actual implementation truth, deployment, the active milestone, and gaps.

## Thesis

- Racing game where communication is the control system.
- You do not drive the car. You drive the Driver.
- The human Race Engineer has information; the AI Driver has controls; communication connects them.
- Timing is gameplay.
- The AI Driver is capable. It does not intentionally act stupid.
- The Driver can save the car, but cannot save the Engineer's decision.

## Approved Core Loop

`opponent reveals defense -> Engineer reads -> INSIDE / OUTSIDE intent -> Driver acknowledges and prepares -> anticipation -> NOW -> success / Too Soon / Too Late / blocked / no-call`

- Reactive human play passed the first Fun Gate.
- Communication Feel passed its human Fun Gate on 2026-08-26.
- The overtake balance is approved and locked unless later human or measured evidence shows a problem.
- The submission vertical slice reuses the exact approved overtake model and timing values.

## Shipped Vertical Slice

- One complete fictional three-lap Formula-style scenario: **Meridian Sprint**.
- The player starts P3 as the Race Engineer for fictional team **Apex Vector**, with the mission to finish P2 or better.
- The race has a title/onboarding state, radio check and countdown, an opening PUSH/HOLD communication beat, lap and sector progression, the protected overtake climax, finish line, P2/P3 debrief, and full-sprint Retry.
- Meridian Circuit is a coherent closed venue with straights, technical sections, curbs, barriers, runoff, braking boards, sector markers, start/finish treatment, and a dynamic full-circuit tactical map.
- The primary view is a live Car 27 onboard feed. The secondary surface is a compact motorsport-specific engineering console with mission, position, lap, sector, gap, next corner, rival movement, radio, and fallback command buttons.
- Fictional open-wheel cars, speed-responsive onboard camera behavior, responsive engine/wind audio, radio clicks/static, and success/failure accents provide the presentation layer without external assets or a physics rewrite.
- English is the default and Korean is maintained across title, race, radio, commands, feedback, and result states.
- Browser-native SpeechRecognition remains unavailable in the current QA browser. Voice is omitted; text and buttons are the stable deterministic input paths.

## Technical Architecture

- Three.js + TypeScript + Vite; vanilla TypeScript; browser-first.
- Deterministic spline/curve arcade driving; no physics engine, backend, database, or API secrets.
- Simulation/race state remains separate from the Three.js presentation layer. Language input maps into the same deterministic commands as buttons.
- The pure overtake model still owns preparation, gap, clearance, timing assessment, and pass outcome.
- Developer diagnostics remain gated behind `?debug=1`; release QA state jumps additionally use `stage=pace|overtake` and can hide the panel with `panel=0`.

## Verification State

- `npm run test:commands`: 23 English/Korean recognition and rejection cases pass.
- `npm run sim:overtake`: the required ten-case matrix plus 30/60/120 FPS classifications pass with the approved 3.75–4.70 s NOW interval unchanged.
- `npm run build`: production build passes; the existing non-blocking Three.js chunk-size advisory remains.
- Screenshot-led browser QA covers title, normal racing, opening call, defense reveal, preparation, NOW, successful pass, Too Soon, Too Late, blocked, no-call, P2/P3 results, Retry, English, Korean, desktop, and 390×844 mobile.
- The production preview boots cleanly with no browser console warnings or errors.
- A build, smoke test, or automated test PASS does **not** establish North Star
  satisfaction. That requires actual full-run playtests plus screenshot and voice
  evidence where relevant.

## Deployment

- Submitted public URL: https://lambent-gecko-2ec95c.netlify.app/

## Strategic Platform Direction

- The core is platform-agnostic: Web-first for discovery and prototyping;
  Steam-first for the full product after core-fun validation.
- Do not begin a native-engine rewrite before the web vertical slice proves the
  communication and core-fun hypotheses defined in `docs/north-star.md`.

## Active Milestone

**Submitted web vertical slice / core-fun validation.** The public build exists;
the next product milestone is evidence-led full-run validation against the North
Star, not an automatic native-engine rewrite.

## Backlog — Not Authorized

- Additional tracks, races, opponents, or championship progression.
- Pit stops, fuel, tire management, setup menus, or detailed ERS simulation.
- Online multiplayer, networking, freeform LLM chat, or LLM per-frame driving.
- Collision/DNF systems, full physics, large asset pipelines, or an expensive modeled engineering room.

## Scope Rule

Before proposing a feature, ask:

1. Does it raise hackathon score?
2. Is it higher priority than validating or improving the core?
3. Is it worth the solo-development time?

Do not silently promote backlog ideas into active scope.
