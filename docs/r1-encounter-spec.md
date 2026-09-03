# COPY THAT? — R1 Encounter Specification

Status: PROPOSED. This is a disposable falsification fixture for R1, not product
content and not a vertical slice.

## Design target

Create one 60–90 second continuous greybox encounter where good performance
requires both halves of the information law:

- Engineer owns NEXT/GLOBAL;
- Driver owns NOW/FEEL.

The encounter must make conversation useful without turning the Engineer into an
answer reader or the Driver into an instruction executor.

## Core beat

Working name: **Blind Brake / Rear Pressure**.

The Driver approaches a blind medium-speed corner while a rival closes from
behind. Before the Driver can see the entry, the Engineer can inspect raw upcoming
track/race evidence. During the approach the Driver discovers the current braking
response through direct physical input. The safest/fastest commitment depends on
combining those two facts.

### Timeline target

- **0–15 s — Establish:** Driver learns current control response on a simple
  straight/gentle bend. Engineer sees upcoming source context but no answer.
- **15–35 s — Approach:** rival closes; upcoming corner/hazard remains outside the
  Driver's useful sight line.
- **35–50 s — Complication:** Driver's first meaningful brake input reveals one of
  two NOW/FEEL states. Engineer cannot see this state directly.
- **45–65 s — Commitment:** pair chooses pace, line, and braking commitment under
  rear pressure.
- **55–75 s — Consequence:** the corner/hazard and rival resolve continuously.
- **70–90 s — Recovery:** finish/recover on a short exit so players can attribute
  the result and want another attempt.

Exact seconds may move during apparatus smoke testing, but the causal order may
not.

## Hidden variables

Each run selects one value from each independent family.

### Engineer-visible upcoming state

1. **Corner direction:** left or right, visible on a simple map/trackside evidence
   source before the Driver has useful sight.
2. **Available corridor:** one side has debris/yellow runoff intrusion or a
   narrowing that makes that corridor materially worse. Show the physical fact,
   not `USE LEFT/RIGHT`.
3. **Rear pressure:** rival closes toward one side/overlap tendency. Show gap trend
   and/or a rear/battle view, not `DEFEND INSIDE/OUTSIDE`.

### Driver-visible feel state

**Brake state:** normal or long.

- Normal: repeatable stopping response expected for the fixture.
- Long: modestly longer stopping distance / weaker deceleration, obvious after a
  meaningful brake application but not pre-labelled on screen.

The Engineer receives no brake-state label or hidden telemetry. The Driver must
report what the car is doing if it matters.

## Why the two directions matter

The Engineer's upcoming evidence alone can identify what is coming but cannot
know how much physical margin the Driver currently has.

The Driver's feel alone can identify braking margin but cannot know the hidden
corner/corridor/rear-pressure picture early enough to choose the strongest
commitment.

A robust pair should therefore exchange information similar to:

- Driver: braking is long / car is fine / I cannot hold that margin.
- Engineer: upcoming geometry/corridor/rear trend.
- Either role: clarification or disagreement.
- Driver: physical commitment.

No phrase is required and no utterance is scored by vocabulary.

## Valid solution space

There must not be exactly one magic line.

For every run provide:

- **Conservative path:** early brake / concede position or time, high finish
  probability.
- **Coordinated strong path:** preserve more pace/position by combining upcoming
  evidence with actual brake feel.
- **Wrong/late path:** physically plausible contact, off-track, spin, or major
  time/position loss.

The strong path must be harder to execute than the conservative path. The
Engineer cannot guarantee success through a correct call.

## Raw Engineer evidence

R1 needs at most three simple sources; they may be static or Wizard-of-Oz.

1. **Upcoming map/diagram** — corner geometry and visible physical obstruction or
   corridor width.
2. **Rear/battle evidence** — rival gap/closing direction from an image, simple
   animated diagram, or manually advanced state.
3. **Race-control card** — only if needed to represent debris/yellow state; it
   states the observed condition, not the action to take.

Forbidden Engineer labels include:

- `BRAKE NOW`, `USE INSIDE`, `USE OUTSIDE`, `DEFEND LEFT/RIGHT`, `SAFE LINE`,
  `CORRECT`, recommended speed, recommended command, or a single interpreted
  composite answer.

Source switching itself is not under test in R1. Do not add attention cost merely
because R3 will test it later.

## Driver apparatus

The R1 controller must provide actual continuous player authority:

- analog/digital steering;
- throttle;
- brake;
- simple automatic gear acceptable for the smoke check, but the final R1 brief
  calls for gear input, so provide at least up/down semantic actions before human
  evidence is collected;
- no spline/rail steering authority;
- no automatic lane change from an Engineer choice;
- no command-triggered physical movement.

Keep the model deliberately shallow. R1 needs readable braking, steering,
off-track/contact, and recovery only. Deep tire/aero/FFB work belongs to R2.

## Rival behavior

Use one simple deterministic rival under the same world rules needed for visible
space/contact. It reacts only to observable player position/race state, never to
private Engineer evidence or voice.

For R1, the rival may follow a simple authored closing trajectory with a small
observable response to lane occupancy. It must not choose outcomes for the test.

## Variants

Prepare at least four visually/mechanically equivalent variants by mirroring or
recombining:

- left/right corner;
- normal/long brake state;
- rival attack tendency left/right;
- obstruction/corridor side left/right.

Variants must preserve difficulty closely enough that condition order does not
become the main explanation. Smoke testing may reject a variant, but do not tune a
variant after seeing participant condition results.

## Smoke-check criteria

Before participant recruitment, an operator who is not counted in R1 confirms:

- a novice can steer, throttle, brake, and finish after short neutral instruction;
- 60–90 second duration is credible without forced waiting;
- normal versus long brake response is distinguishable through driving but not
  visually labelled;
- upcoming evidence is readable and does not state an answer;
- the Driver cannot see the decisive upcoming fact early enough to make the
  Engineer ornamental;
- the Engineer cannot infer brake feel without Driver reporting it;
- conservative, strong, and wrong/late paths all resolve physically;
- recording and timestamps reconstruct the causal chain.

Smoke-check observations are apparatus evidence only and cannot PASS the product
thesis.
