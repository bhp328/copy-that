# Legacy M2 Repair Diff — Survival Review

Date: 2026-09-03

Review baseline:
5ec810fdd9ec70a2c63f51fb8ef6690a3c22b22f
(Document Steam audit and human test gate)

Reviewed state: master tracking origin/master, no staged changes, 10 modified
files, 665 insertions and 91 deletions. The full diff for every file was read
before any restoration.

Authority: docs/north-star.md and remote GitHub Issue #1, "PRODUCT RESET —
Steam-first 2-player flagship decision record."

## Decision language

- KEEP CODE: the changed implementation itself earns a place in the new product.
- PORT PRINCIPLE ONLY: the rule survives, but this code does not.
- ARCHIVE EVIDENCE: the observation, failure, or test proposition survives as
  historical evidence; this code does not.
- DELETE: the change has no production value under the reset and is restored to
  HEAD.

These labels classify the stopped diff, not every line already present at HEAD.
PORT PRINCIPLE ONLY and ARCHIVE EVIDENCE still result in code deletion here.

## Executive result

No hunk earned KEEP CODE.

The repair correctly exposed four durable lessons:

1. Objectives and relative-position language must agree.
2. Relevant evidence must become readable before a decision is accepted.
3. Acknowledgement confirms intent; only world state confirms outcome.
4. Vehicles, camera, gap, overlap, and results must change continuously enough
   for causality to be seen.

Those lessons now live in the North Star, product plan, pre-production gates, and
technical gates. Their old implementation remains coupled to a single Human
Engineer, normal-play command buttons/text, DOM dashboard UI, deterministic
spline vehicles, and a Web/Three.js presentation adapter. Preserving it would
grant production rights to the architecture the reset rejects.

## Exact file and logical-hunk disposition

### scripts/sim-commands.ts — +6 / -0 — final file outcome: DELETE

| Logical change | Disposition | Reason |
| --- | --- | --- |
| Added BLOCK/COVER INSIDE English/Korean parser cases | DELETE | Normal-play voice-as-button vocabulary is not the flagship input model. A future accessibility corpus must be derived from the new Human×Human/AI teammate contract. |
| Added BLOCK/COVER OUTSIDE English/Korean parser cases | DELETE | Same rejected command-deck coupling. |
| Added YIELD POSITION English/Korean parser cases | DELETE | Same rejected command-deck coupling and old defence encounter semantics. |

### scripts/sim-race.ts — +129 / -6 — final file outcome: DELETE

| Logical change | Disposition | Reason |
| --- | --- | --- |
| Added DefenceCausalProbe fields | ARCHIVE EVIDENCE | The measurement dimensions—evidence time, lateral state, acknowledgement tick, outcome tick, final gap—are useful for a future prototype, but this fixture targets the old rail simulation. |
| Added AFK, yield, and held final-gap assertions | ARCHIVE EVIDENCE | They expose a real continuity problem and useful causal checks; their exact thresholds and spline outcomes are not production evidence. |
| Replaced encounter-only defence issue timing with allowedCalls gating | PORT PRINCIPLE ONLY | Input must be accepted only after authorized evidence is readable. The old setDefence call and TypeScript helper do not survive. |
| Added explicit acknowledgement-before-decision assertions | PORT PRINCIPLE ONLY | Mutual understanding must precede world outcome. The old phrases and event types are not the new voice contract. |
| Added mirrored-seed held-defence check | ARCHIVE EVIDENCE | Mirrored cases are a good anti-bias test, but the tested interaction is the superseded single-role button slice. |
| Added full causal probe loop and canSetDefence helper | ARCHIVE EVIDENCE | Preserve the future test shape, not this simulator implementation. |

### src/commandParser.ts — +10 / -0 — final file outcome: DELETE

| Logical change | Disposition | Reason |
| --- | --- | --- |
| Added block/cover/yield English and Korean aliases | DELETE | These aliases strengthen normal-play typed/button commands that the flagship explicitly rejects. Later accessibility input must not become an answer deck. |

### src/main.ts — +58 / -6 — final file outcome: DELETE

| Logical change | Disposition | Reason |
| --- | --- | --- |
| Added smoothed player/rival lateral presentation and yaw | ARCHIVE EVIDENCE | The old rail/teleport feel and missing rival lateral rendering were valid observed defects. Production vehicle motion must come from direct physical Driver control, not smoothing a spline authority. |
| Added lateral camera lag to reduce clipping and communicate movement | ARCHIVE EVIDENCE | Camera must communicate physical state and avoid clipping, but these Three.js constants and cockpit adapter are not portable product code. |
| Routed smoothed offsets through render sync and animation loop | DELETE | This is a Web/Three.js presentation patch for the superseded architecture. |

### src/raceEngineerUI.ts — +157 / -19 — final file outcome: DELETE

| Logical change | Disposition | Reason |
| --- | --- | --- |
| Added switchable circuit map / defence radar and markers | PORT PRINCIPLE ONLY | Engineer play needs selectable evidence sources and attention cost. This automatic encounter swap and DOM SVG radar freeze the wrong implementation. |
| Added relative gap labels, closing trend, side-by-side, ahead/behind semantics | PORT PRINCIPLE ONLY | Spatial language must be perspective-correct and causally clear. Exact labels and the old P2 defence scenario remain historical copy. |
| Added encounter data state and responsive radar visibility | DELETE | Browser DOM/CSS state is not the new production UI contract. |
| Added BLOCK INSIDE / BLOCK OUTSIDE / YIELD POSITION button labels and logs | DELETE | Normal-play command buttons are explicitly rejected. |
| Added watch → choose cover → Driver moving cue sequence | PORT PRINCIPLE ONLY | Evidence must precede choice and acknowledgement must precede outcome; the old command workflow does not survive. |
| Added radar geometry, marker helpers, and generalized text setter | DELETE | These are implementation details of the superseded Web dashboard. |

### src/raceSession.ts — +8 / -0 — final file outcome: DELETE

| Logical change | Disposition | Reason |
| --- | --- | --- |
| Split pace/brake/cover/yield acknowledgements into distinct radio keys | PORT PRINCIPLE ONLY | Intent acknowledgements should be precise, but this key set is tied to the old AI Driver and button taxonomy. |
| Added positionLost as a separate outcome key | PORT PRINCIPLE ONLY | Position loss must be reported only after resolution. A future role-neutral event schema should define it from the new physical race. |

### src/raceSimulation.ts — +98 / -17 — final file outcome: DELETE

| Logical change | Disposition | Reason |
| --- | --- | --- |
| Added positionLost Moment marker | PORT PRINCIPLE ONLY | Semantic race moments survive as an architecture requirement; this TypeScript event variant does not earn preservation. |
| Added defence evidence, lateral-rate, staging-gap, overlap, and pass constants | ARCHIVE EVIDENCE | They make the old encounter more continuous and measurable, but they are unvalidated balance inside a rail model. |
| Gated setDefence until rival lateral evidence is readable | PORT PRINCIPLE ONLY | No decision before fair evidence. Production evidence comes from the Engineer's authorized sources, not this single threshold. |
| Changed setDefence to acknowledge movement without resolving the result | PORT PRINCIPLE ONLY | This is the strongest durable lesson: acknowledgement is not outcome. The old action and phrase code is deleted. |
| Added gradual rival/player lateral approach | ARCHIVE EVIDENCE | It diagnoses teleportation and discontinuity. Real production lateral motion must be physical Driver execution. |
| Added release-phase gap evolution and staged pre-defence gap | ARCHIVE EVIDENCE | Continuous before/after spacing matters, but the exact authored gap motion is not acceptable production physics. |
| Delayed safe-yield, held, contact, and lost-position resolution until pass/overlap conditions | PORT PRINCIPLE ONLY | Outcomes require world evidence. Exact thresholds and deterministic rail outcomes do not survive. |
| Separated safeYield and positionLost markers/radio | PORT PRINCIPLE ONLY | Truthful outcome classification survives; this old state machine does not. |

### src/raceSimulationAdapter.ts — +8 / -6 — final file outcome: DELETE

| Logical change | Disposition | Reason |
| --- | --- | --- |
| Mapped distinct save/brake/cover/yield acknowledgement signals | PORT PRINCIPLE ONLY | Precise acknowledgement semantics survive, but the transitional Web adapter is specifically non-production. |
| Mapped position_lost separately from safe yield/held defence | PORT PRINCIPLE ONLY | Outcome truthfulness survives; the adapter and old signals do not. |

### src/raceText.ts — +98 / -37 — final file outcome: DELETE

| Logical change | Disposition | Reason |
| --- | --- | --- |
| Reframed the objective as holding P2 against a closing P3 | ARCHIVE EVIDENCE | The prior objective contradicted the actual scenario. That diagnosis survives; this one encounter is not the flagship product objective. |
| Added perspective-correct gap, closing, side-by-side, ahead/behind EN/KR terms | PORT PRINCIPLE ONLY | Relative spatial language must be explicit and localized, but final copy must be tested in the new two-role UI. |
| Added track-map/defence-radar and next-turn labels | PORT PRINCIPLE ONLY | Raw evidence and upcoming geometry survive as information categories; exact UI copy does not. |
| Replaced generic inside/outside/yield with defence command labels | DELETE | This strengthens the rejected button deck. |
| Added watch/move/cover cue staging | PORT PRINCIPLE ONLY | Evidence-before-choice and action continuity survive, not the prompt sequence. |
| Split acknowledgement lines from held/lost/yield/contact outcome lines | PORT PRINCIPLE ONLY | Intent and outcome truthfulness is constitutional. Exact AI Driver lines remain historical. |
| Rewrote the corresponding Korean copy | ARCHIVE EVIDENCE | The localization work demonstrates semantic repair, but must be redone against the new Human×Human and AI-teammate contexts. |

### src/release.css — +93 / -0 — final file outcome: DELETE

| Logical change | Disposition | Reason |
| --- | --- | --- |
| Added defence-radar map, road, marker, label, and trend styling | DELETE | This is CSS for the superseded DOM dashboard and automatic encounter UI. |
| Added desktop/mobile radar sizing and narrow-screen visibility rules | DELETE | Browser-responsive M2 layout is not a Steam production requirement or evidence for the new Engineer station. |

## Restored files

After this review was captured, all ten files were restored exactly to the
5ec810f baseline:

- scripts/sim-commands.ts
- scripts/sim-race.ts
- src/commandParser.ts
- src/main.ts
- src/raceEngineerUI.ts
- src/raceSession.ts
- src/raceSimulation.ts
- src/raceSimulationAdapter.ts
- src/raceText.ts
- src/release.css

No patch artifact containing the discarded code is stored in the repository.
Git history and this evidence summary are sufficient.

## Principles carried into the reset

- Objective, role, perspective, and relative-position language must agree.
- An authorized role must perceive relevant evidence before a call is accepted.
- Acknowledgement records understanding or commitment, never success.
- Position, contact, safety, and failure come only from resolved world state.
- Physical and presentation continuity must make the causal chain visible.
- Tests should capture evidence time, action receipt, acknowledgement, physical
  commitment, resolution, and final state across mirrored cases.
- These principles are engine-neutral. No TypeScript, DOM, Three.js, button,
  phrase, threshold, or spline implementation is automatically retained.
