# Overtake core-loop simulation evidence

Date: 2026-08-08

This document records the deterministic model shared by the browser runtime and
`npm run sim:overtake`. The current correction remains an **uncommitted gameplay
experiment**. It is not an approved checkpoint.

## Human-playtest diagnosis

The first complete Core Loop proved that the pass itself was fun, but its human
timing was invalid. A 1.5-second information hold froze the race before the
opponent had visibly committed to a side. Meanwhile, the simulation measured
intent from event start, as though the player already knew the answer. The
machine-known success window therefore closed before a reactive player could
read, interpret, and communicate the defense.

### Before: rejected first Core Loop

The retained `FIRST_CORE_LOOP_PARAMETERS` reproduce that rejected experiment.
Times below are event-model times unless identified as wall-clock times.

| Event | Time |
| --- | ---: |
| Machine-known intent used by the old sweep | 0.10 s |
| First viable NOW | 0.90 s |
| Last viable NOW | 1.85 s |
| Usable width | 0.95 s |
| Defense actually readable at 1.60 m offset | 2.22 s |
| Old frozen information hold | 1.50 s |
| Wall-clock viable NOW interval with hold | 2.40-3.35 s |
| Wall-clock defense-readable moment with hold | 3.72 s |

The defense became readable about 0.37 seconds after the old opportunity had
already closed. Starting human latency at the readable moment confirms the
failure:

| Read-to-intent assumption | Intent | Preparation 80% | Reactive success |
| ---: | ---: | ---: | --- |
| 0.6 s | 2.82 s | 3.80 s | none |
| 1.0 s | 3.22 s | 4.20 s | none |
| 1.4 s | 3.62 s | not reached before event end | none |

The old A/B alternation then made advance memorization the practical strategy,
masking the human-readability failure during machine-oriented tests.

## Corrected causal sequence

The fake hold is removed. The entire event now advances continuously through
three state-derived stages:

1. **Reveal/read:** player and opponent run at matched 108 km/h formation speed,
   preserving the 22 m gap while the opponent commits laterally. Intent controls
   unlock only after actual offset reaches the 1.60 m readability threshold.
2. **Intent/preparation:** the Driver acknowledges immediately, retains the
   0.32-second response delay, and moves smoothly at the existing 2.4 s^-1
   response. The shared model records the real 80% preparation crossing.
3. **Execution:** tow pressure begins at 90 m. A NOW forecast may succeed only if
   at least 80% preparation already exists at the instant of the call; it cannot
   count lateral movement that would occur afterward. Speed, live gap, clearance,
   and road remaining then determine the result.

There is no fixed success timer and no random outcome roll.

## Scenario changes and causal reasons

| Parameter | Rejected loop | Corrected loop | Reason |
| --- | ---: | ---: | --- |
| Event distance | 145.214 m | 235.214 m | Adds real moving race space for reveal, communication, preparation, and execution. |
| Defense motion | 18.941-119.075 m | 8-38 m | Makes the side commitment readable early rather than near the end of the opportunity. |
| Defense-readable offset | 1.60 m | 1.60 m | Keeps the visual threshold honest; pacing changes around it instead of weakening it. |
| Tow start | 0 m | 90 m | Prevents closing pressure from consuming the opportunity while the player is still reading. |
| Formation/opponent speed | 108 / 108 km/h | 108 / 108 km/h | Keeps the initial gap stable during reveal. |
| Tow target | 155 km/h | 185 km/h | Builds rapid stored closing speed later, preserving the fun visible pass payoff. Actual browser speed around a good NOW is about 146 km/h, not an instant 185 km/h jump. |
| Post-NOW attack target | 132 km/h | 131 km/h | Keeps leaving the tow consequential while retaining the successful lane attack. |
| Speed response | 1.2 s^-1 | 0.7 s^-1 | Spreads acceleration smoothly over the longer execution run. |
| Preparation required at NOW | none | 80% | Makes immediate NOW causally too early and preserves communication as preparation, not steering. |

The 22 m start gap, 7 m safe-following gap, 100 km/h abort target, -4.5 m
completed-pass gap, 1.7 m lateral clearance, 2.25/2.35 m lateral targets,
0.32-second Driver delay, and 2.4 s^-1 preparation response are retained.

## After: reactive-human timing budget

Both forced mirrored scenarios become readable at 0.90 s and produce the same
state-derived NOW interval. Acknowledgement occurs when intent is registered.

| Read-to-intent assumption | Intent / acknowledgement | Preparation begins | Preparation 80% | First viable NOW | Last viable NOW | Width |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0.6 s | 1.50 s | 1.82 s | 2.48 s | 3.75 s | 4.70 s | 0.95 s |
| 1.0 s | 1.90 s | 2.22 s | 2.88 s | 3.75 s | 4.70 s | 0.95 s |
| 1.4 s | 2.30 s | 2.62 s | 3.28 s | 3.75 s | 4.70 s | 0.95 s |

For the normal 1.0-second reaction assumption, the Driver reaches 80%
preparation 0.87 seconds before the first viable NOW. This creates the intended
short anticipation beat without turning NOW into a multi-second success zone.

An advisory 1.8-second voice/STT-latency probe still has a feasible
3.75-4.70-second window, but reaches 80% preparation at 3.68 seconds, only 0.07
seconds before the first viable sample. The structure has basic feasibility but
not comfortable voice headroom; a future voice input path must be measured and
budgeted explicitly rather than assumed.

Representative normal-reactive samples for both A and B are:

| NOW | Result |
| ---: | --- |
| 3.25 s | `tooEarly` |
| 4.22 s | `success` |
| 5.10 s | `tooLate` |

Wrong-line plus NOW is deterministically `blocked`. No call is safe and finishes
7.0 m behind. A viable call produces a rapid lane attack and visible pass.

## Tactical situation selection

Normal play creates one random session seed and hashes that seed with the event
index. Each event's defense side is fixed before input and is unaffected by the
player. The sequence is repeatable for a given seed but is not forced to
alternate; browser verification for seed `1` produced
`inside, inside, outside` for events 0-2.

Debug remains deterministic:

- `?debug=1&scenario=A&seed=42` forces an inside defense (correct call: OUTSIDE).
- `?debug=1&scenario=B&seed=42` forces an outside defense (correct call: INSIDE).
- `?debug=1&seed=<number>` exposes a repeatable seeded normal sequence.

The randomness selects only the tactical situation. Feasibility and outcome
remain deterministic from shared race state.

## UI and tactical-map evidence

- The actual centre-to-centre gap classifies `BEHIND` above +4.5 m,
  `SIDE BY SIDE` while -4.5 m < gap <= +4.5 m, and `AHEAD` at or beyond the real
  -4.5 m completed-pass threshold.
- The displayed seconds are player-centric and signed from live race position;
  there is no cosmetic post-pass timer. English and Korean use
  `BEHIND / SIDE BY SIDE / AHEAD` and `뒤처짐 / 나란히 / 앞섬`.
- Tactical markers follow the existing curved SVG road path. Their centre point,
  path tangent, lateral normal, and amplified local longitudinal separation all
  come from actual player/opponent distances and lateral offsets. Browser testing
  showed the player marker behind at event start and visibly beyond the opponent
  after the pass.
- The debug report records defense creation, defense readability, intent,
  acknowledgement, 80% preparation, NOW, result, and interval deltas, plus seed,
  event index, and forced/seeded mode.

## Automated and browser verification

`npm run sim:overtake` passes:

- the required ten-case A/B matrix;
- early / success / late for both correct mirrored lanes;
- wrong-line blocked and no-call safe;
- exact repeat determinism; and
- matching `tooEarly / success / tooLate` classifications at 30, 60, and 120 FPS.

Browser verification covered disabled intent controls before readability,
enabled calls after the actual cue, immediate NOW as `tooEarly`, good forced A
and B passes, late NOW as `tooLate`, wrong-line blocking, no call, Retry, seeded
non-alternation, post-pass AHEAD, Korean `앞섬`, visible tactical crossing,
timestamped debug output, and no console warnings or errors.

`npm run build` passes. Vite retains only its existing advisory that the main
JavaScript chunk is larger than 500 kB after minification.
