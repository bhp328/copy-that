# COPY THAT? — Current Project Truth

## Thesis

- Racing game where communication is the control system.
- You do not drive the car. You drive the Driver.
- The human Race Engineer has information; the AI Driver has controls; communication connects them.
- Timing is gameplay.
- The AI Driver is capable. It does not intentionally act stupid.
- The Driver can save the car, but cannot save the Engineer's decision.

## Approved Core Loop

`opponent reveals defense -> Engineer reads -> INSIDE / OUTSIDE intent -> Driver acknowledges and prepares -> anticipation -> NOW -> success / Too Soon / Too Late / blocked / no-call -> Retry`

- Reactive human play passed the first Fun Gate.
- The current overtake balance is approved and locked unless later human or measured evidence shows a problem.

## Technical Architecture

- Three.js + TypeScript + Vite; vanilla TypeScript; browser-first.
- Deterministic spline/curve arcade driving; no physics engine.
- No backend or database.
- An LLM must never drive the vehicle per frame. Future command interpretation maps into deterministic Driver behavior.

## Approved UI Concept

- About 75% Driver Feed / 25% Engineer Panel.
- Driver Feed is the primary immediate situation and payoff view.
- Engineer Panel gives earlier tactical information and should provide facts, not answers.
- English is the default; Korean localization is supported.

## Current Status and Tools

- First complete overtake Core Loop is human-playtest approved.
- The deterministic overtake simulator exists: `npm run sim:overtake`.
- Developer diagnostics: `?debug=1`; `COPY TEST REPORT` is available there.
- Communication Feel passed its human Fun Gate on 2026-08-26. The Engineer
  Panel now has a Driver Radio text affordance with a deliberately narrow
  English/Korean command parser for INSIDE, OUTSIDE, and NOW. The original
  buttons remain the reliable fallback. State-driven Driver acknowledgements,
  an immediate Engineer Brief, and the mobile radio layout make the
  communication loop readable without changing the overtake model.
- Browser-native speech recognition was unavailable in the current local QA
  browser, so voice is intentionally omitted from the submission build. Text
  and buttons remain the stable, deterministic control paths.
- `npm run build` and a production-preview browser smoke have passed for the
  current worktree; the generated `dist` is ready for root-path static hosting.

## Continuity and Evidence Governance

- This file is the compact handoff for a new task; update it only when current
  project truth, approval state, or the active boundary changes.
- `docs/codex-log.md` preserves material historical decisions and evidence;
  it is not a duplicate status report or chat transcript.
- Human feedback is important evidence, but a single reaction does not prove
  universal appeal. Strong repeated observed playtest behavior and measured
  project evidence outrank generic theory; theory informs hypotheses and risks.

## Next Milestone

**Submission handoff** — Communication Feel has passed its human Fun Gate and
the local production build is verified. The remaining work is external static
hosting/submission, if a destination and account are supplied.

## Backlog — Not Authorized

- INSIDE/OUTSIDE re-call; feint/bait; opponent response to visible Driver positioning.
- Voice/STT, TTS, Driver personality/trust.
- Clutch save, spin, collision, DNF.
- Audio, graphics polish, high-G effects.
- Performance optimization unless measured evidence justifies it.

## Scope Rule

Before proposing a feature, ask:

1. Does it raise hackathon score?
2. Is it higher priority than validating or improving the core?
3. Is it worth the solo-development time?

Do not silently promote backlog ideas into active scope.
