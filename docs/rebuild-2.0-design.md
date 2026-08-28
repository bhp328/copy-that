# COPY THAT? 2.0 — Deterministic Vertical-slice Contract

Status: implementation contract for falsification. It does not replace
`docs/north-star.md`, approve untested tuning, or pass a human Fun Gate.

## Design Brief

- **Player promise:** coordinate a capable Driver through one coherent Formula
  sprint where incomplete information, timing, and prior choices determine the
  result.
- **Target feeling:** tense, collaborative, precise, fast, and causally fair.
- **Primary verb:** communicate a plan or commitment.
- **Secondary verbs:** ask, clarify, manage risk, position, feint, switch, and
  commit.
- **Core loop:** interpret NEXT/GLOBAL evidence plus Driver NOW/FEEL reports,
  make a constrained call, hear acknowledgement, and read a deterministic
  consequence that changes the next problem.
- **Progression:** persistent grip, stability, damage, gaps, and position carry
  through a target 3:20 ±20 s authored sprint.
- **Failure/retry:** missed opportunities cost time or position; reckless
  combinations can cause contact, spin, puncture, or DNF; every result names its
  physical cause and Retry is immediate.
- **Skill expression:** better Engineers combine both information channels,
  choose risk for the current car state, sell visible positioning to the rival,
  and time commitment from readiness and road remaining.
- **Non-goals:** per-frame LLM driving, licensed circuits/teams, full tire or
  setup simulation, multiplayer, career progression, and a native-engine port.

Core-loop contract:

```text
The Engineer communicates a plan to achieve P2 while incomplete information,
track pressure, persistent car state, rivals, and incidents create risk;
success changes position and relationship, while failure costs time, condition,
position, or the run and teaches the causal mistake.
```

## Authority And Information Views

One 60 Hz presentation-independent `RaceSimulation` owns the race. Browser,
voice, text, UI, audio, and Three.js are adapters.

```text
input intents -> fixed simulation -> sequenced events -> presentation/audio/UI
```

Authoritative state must include route distance, speed, lateral position, gaps,
position, grip, tire heat, stability, damage, Driver feel/local space/visibility,
current encounter, visible rival response, and running/target/DNF result.

- **Engineer view:** upcoming geometry/elevation, race control, gap and closing
  trend, tactical positions, and road remaining. It omits exact grip, brake feel,
  visibility, and local overlap.
- **Driver view:** exact car feel, visibility, and immediate lateral space. It
  omits unseen hazards/corners and global rival trend.
- **Spectator view:** may combine legible tension and consequence, but cannot
  leak a recommended answer into the Engineer UI.

Seed chooses the presented situation before the run. It never rolls success or
failure after a call.

## Authored Encounter Spine

Times are experience targets only. Activation and outcomes use route distance,
TTC, grip, clearance, overlap, and road remaining.

| Beat | Target | Required exchange | Persistent consequence |
| --- | ---: | --- | --- |
| 1. Driver feel / pace | 0:12–0:31 | Driver reports balance; Engineer calls PUSH, HOLD, or SAVE using gap/sector evidence. | Speed, tire heat, grip, and later margin change. |
| 2. Blind crest | 0:31–0:55 | Engineer sees the hidden tightening corner; Driver reports visibility and current feel; Engineer calls EARLY, NORMAL, or LATE braking. | Clean entry, recoverable time loss, or large-deficit off/spin/damage from braking margin. |
| Release | 0:55–1:05 | Driver reacts and telemetry recedes. | Stability recovers; heat/damage/gap persist. |
| 3. Rival attack / defence | 1:05–1:28 | Engineer sees closing trend; Driver knows exact overlap; Engineer calls cover side or YIELD. | Position retained at a tire cost, place lost safely, or contact from a depleted wrong squeeze. |
| Release | 1:28–1:39 | Short acknowledgement/disagreement. | Held/lost position changes the later target. |
| 4. Unseen incident | 1:39–2:06 | Engineer receives race-control hazard location; Driver has only grip and screened sight; Engineer calls route plus LIFT/HOLD. | Feasible clear route, clutch risk, puncture/contact, or DNF. AFK must fail here in every normal seed. |
| Release | 2:06–2:19 | Relief, anger, or near-miss breathing beat. | Car condition and gap persist. |
| 5. Sell the feint | 2:19–2:38 | Engineer calls SHOW INSIDE/OUTSIDE or HOLD STATION. | Driver physically moves; rival can react only to visible lateral position. |
| 6. Read and switch | 2:38–2:54 | Rival covers the shown side; Driver reports immediate space; Engineer switches after the cover is readable. | Early switch teaches the rival; late switch consumes road; repeated feints cost distance. |
| 7. NOW | 2:54–3:02 | Engineer commits from closure/road evidence after Driver preparation. | The protected 3.75–4.70 s state-derived model resolves success, early, late, or blocked. |
| Payoff / release | 3:02–3:15 | Driver celebrates, objects, or breathes. | Position and car condition become the last problem. |
| 8. Final defence | 3:15–3:35 | Engineer knows finish distance/closing rate; Driver reports grip/overlap; Engineer covers or yields. | P2 target, safe target miss, contact, or DNF. |

A good path has eight decisions. A conservative communicative path may hold
station and finish with six; both remain inside the North Star 5–8 beat target.

## Opponent Visibility Contract

The opponent never reads an Engineer intent enum.

1. Count shown distance only while the Driver's actual lateral offset is stable
   beyond a readability threshold and the gap is relevant.
2. Choose cover side only after enough visible route distance. Initial 12–16 m
   is a hypothesis to sweep, not approved balance.
3. Mirrored visible positioning with the same seed must produce mirrored cover.
4. A command whose vehicle movement is suppressed must cause no rival reaction.
5. Late or repeated feints consume real approach distance rather than a UI
   cooldown.
6. Feed the resulting physical cover into the protected overtake simulation.

## Constrained Intent Surface

```ts
type RaceIntent =
  | { kind: 'setPace'; mode: 'push' | 'hold' | 'save' }
  | { kind: 'setCornerApproach'; mode: 'early' | 'normal' | 'late' }
  | { kind: 'setDefence'; mode: 'inside' | 'outside' | 'yield' }
  | { kind: 'setHazardRoute'; route: 'left' | 'right'; pace: 'lift' | 'hold' }
  | { kind: 'setAttackLine'; mode: 'inside' | 'outside' | 'hold' }
  | { kind: 'commitOvertake' }
  | { kind: 'askDriver'; topic: 'grip' | 'brakes' | 'space' | 'visibility' };
```

- Simulation publishes the intents currently allowed; every input adapter emits
  only these enums.
- An ambiguous “inside” when multiple contexts are open causes clarification and
  no state mutation.
- Valid risky calls execute. The Driver may disagree verbally but cannot
  silently override them.
- Simulation acknowledgement is immediate; generated natural speech can follow
  without blocking physics.
- Driver sentences contract as speed and pressure rise.

## Canonical Result Paths

- **AFK:** baseline pace → emergency crest save/damage → automatic safe yield →
  unseen incident collision/puncture → DNF before finish.
- **Conservative communicative:** save/hold → early crest → yield when overlap is
  unsafe → clear incident + lift → hold station → safe finish below P2.
- **Good:** state-appropriate pace → prepared crest → correct defence → correct
  incident route/risk → visible feint → opposite switch → viable NOW → final
  hold → P2.
- **Wrong/reckless:** physical deficits combine into time loss, spin, contact,
  puncture, or DNF; the protected wrong overtake line remains a legible block.
- **Timing:** identical semantic calls moved across readiness or road-remaining
  states must produce different contiguous outcomes.

## Falsification Matrix

Before release, automated traces must prove determinism across 30/60/120 render
schedules, AFK failure across the normal seed pool, conservative safe finishes,
good-path P2, mirrored wrong-line disadvantage, contiguous timing windows,
visible-position rival reactivity, persistent-state effects, strict information
view omissions, EN/KR intent parity, and zero runtime corridor escapes.

Every failure trace records cue, Driver report, accepted call/tick, pre-state,
reason code, and post-state. Required reason families include crest margin,
wrong defence side, hazard route/call absence, feint not sold, switch unprepared,
NOW early/late/blocked, and final-overlap contact.

Voice latency is swept at 0/250/500/800/1200 ms. If strategic speech is not
viable, add physical anticipation distance before changing causal thresholds.
The protected NOW model is never widened merely to hide integration latency.

Human-only gates remain: 2AM retry desire, relationship/dialogue value, and
spectator comprehension of crest, incident, overtake, and consequence clips.
