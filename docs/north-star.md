# COPY THAT? — NORTH STAR

This is the stable product and design constitution for COPY THAT?. It changes
only through explicit product direction or strong, reviewed human evidence.
Implementation, sunk cost, tools, engines, plugins, and model taste are
subordinate.

## Whole-product thesis

**Conversation is the control system.**

**Driver drives the car. Engineer drives the race. Neither has enough
information alone.**

COPY THAT? is a Steam-first online two-player asymmetric Formula racing co-op
game. Human Driver × Human Engineer is the flagship fantasy. The Engineer-role
phrase "You do not drive the car; you drive the Driver" may still describe that
role, but it is not the whole-product thesis.

## Flagship, solo, and roles

- Flagship: online Human Driver × Human Engineer.
- Driver: directly controls the car and owns immediate feel, visibility, and
  local space.
- Engineer: selects evidence, builds the larger picture, communicates what is
  next or global, and shapes the race.
- Solo: AI fills the missing teammate role as training, fallback, or an alternate
  way to play:
  - Human Driver + AI Engineer.
  - Human Engineer + AI Driver.
- AI is not the reason the flagship exists and may never turn either human role
  into a spectator.

## Core laws

1. Conversation is the control system; voice/PTT is its primary interface.
2. The Driver drives. Steering, throttle, brake, gear, car placement, and
   recovery are physical player execution in the flagship.
3. The Engineer drives the race through judgment, timing, synthesis, and
   communication, not command buttons.
4. Engineer knows NEXT/GLOBAL; Driver knows NOW/FEEL. Neither screen contains
   enough information to solve the race alone.
5. Engineer UI provides evidence, never the answer.
6. Information selection costs attention. No role receives every feed and every
   warning at once without a tradeoff.
7. Silence is gameplay. Missing a useful call can lose time or position; missing
   an Engineer-critical call can cause spin, contact, damage, or DNF when the
   advance evidence was fair.
8. What is said and when it is said both matter.
9. Acknowledgement confirms mutual understanding or intent. Success, failure,
   position, contact, and safety are reported only after the world resolves them.
10. Every meaningful beat follows a legible causal chain: communication,
    acknowledgement, physical or strategic commitment, rival/world response,
    fair consequence, emotional release.
11. Opponents react to observable car behavior and race state, not private UI
    selections or raw voice tokens.
12. Rules and outcomes are reproducible and explainable even when personality,
    tactics, and race stories vary.
13. No Empty Racing. Calm supports anticipation, diagnosis, relationship, or
    recovery; it is not dead time.
14. UI, audio, camera, track, physics, voice, networking, and replay serve the
    same readable race story.

## Information law

The Engineer owns earlier or wider evidence:

- upcoming geometry, surface, weather, and hazards;
- tactical map, gaps, trends, closing rates, and opponent patterns;
- rear, battle, onboard, trackside, tactical, and race-control sources;
- strategy, persistent condition, race state, and consequences beyond the
  Driver's immediate attention.

The Driver owns embodied evidence:

- grip, slip, wheelspin, brake feel, traction, and balance;
- immediate visibility and local racing line;
- precise overlap, closing perception, contact risk, and recoverability;
- the real effort required to execute the Engineer's plan.

The Driver proactively reports feel, asks, clarifies, disagrees when appropriate,
and acknowledges. The Engineer listens as well as talks. A good decision often
requires both halves.

## Engineer interface and camera law

- The Engineer manages evidence sources rather than watching one compulsory
  cockpit feed or an automatic cinematic edit.
- Feed families may include onboard, rear/battle, trackside, tactical, and race
  control. Their exact arrangement is unproven.
- Changing or pinning a source must be fast, comprehensible, and consequential
  enough to create attention skill without producing arbitrary blindness.
- The interface surfaces raw or lightly processed evidence, uncertainty, source
  age, and loss of signal when relevant. It does not label the correct call,
  suggest a command, or reduce play to a dashboard checklist.
- Driver and spectator presentation protects spatial reading. Engineer and
  broadcast views protect causal reading. Neither role is forced to sacrifice
  playability to visual chrome.
- A FNAF-like multi-source rhythm is one experiment, not a frozen layout or an
  automatic-camera mandate.

## Driver and vehicle law

- The production target is simcade Formula handling with coherent constraints,
  immediate control, and a high mastery ceiling.
- The car must support learnable steering, braking distance, traction, slip/yaw,
  weight-transfer cues, kerb and surface interaction, collision, recovery, and
  persistent damage or condition where they serve the race.
- Opponents share the same meaningful spatial rules.
- Handling assists may improve approachability but cannot erase execution,
  communication timing, or risk. Their behavior must be legible and testable.
- Formula authenticity serves fantasy and skill; it does not require a licensed
  series, a full aero/tire engineering simulator, or realism that weakens play.
- Spline/rail authority may remain in historical tools but cannot be the
  flagship production driving model.

## Voice, text, and AI law

- Human-to-human PTT radio is the flagship communication path.
- Voice needs clear transmit state, local sidetone/radio feedback, independent
  volume, mute, block, report, privacy controls, and failure recovery.
- Captions/speech-to-text, text-to-speech, subtitles, transcripts, and concise
  quick communication are accessibility paths that preserve participation.
  They are not a normal-play answer deck.
- Race-critical human communication must not require generative AI.
- In solo, AI may perceive authorized role evidence, converse, clarify, and
  propose constrained actions. It never receives forbidden role information,
  invents telemetry, or drives the car per frame.
- Common and time-critical AI teammate responses require a local deterministic
  fallback. Cloud failure cannot silently change the race.

## Difficulty

**Easy to understand. Hard to execute. Harder to coordinate. Very hard to
master. Brutal at the highest stakes.**

Good difficulty comes from physical execution, limited attention, incomplete but
fair information, communication timing, prior-state consequences, adaptive
opponents, and hard risk/reward choices.

Bad difficulty comes from contradictory objectives, tiny or hidden critical
evidence, random-looking punishment, broken networking or speech recognition,
bad translation, unreadable camera work, or consequences that cannot be traced
to a decision and physical event.

Failure can be severe. It must also be attributable, learnable, and capable of
creating a credible "one more attempt" response.

## Race and session composition

- Each race is one continuous world and state, never a stitched minigame
  carousel or teleport sequence.
- Dense short race stories are the working direction. Exact length, lap count,
  beat count, field size, and content volume remain hypotheses.
- Useful pressure families include Driver feel/pace, blind crest or unseen
  corner, rear attack/defence, overtake setup, bluff/feint/switch/commit,
  yellow/debris/hazard, damage or grip carryover, and final attack/defence.
- Pressure emerges from track geometry × physical vehicle state × opponent
  behavior × incomplete information × communication × persistent consequence.
- Recovery and quiet periods create anticipation, diagnosis, relationship, or
  release before the next commitment.

## DDD and emotional loop

Dopamine Driven Development is a product heuristic, not settled neuroscience
and not reward spam:

**Anticipation → Agency → Commitment → Immediate Feedback → Fair Consequence →
Emotional Payoff → Release → Next Hook**

- Micro loop: perceive, communicate, execute, and react.
- Encounter loop: pressure builds, both roles commit, the world answers.
- Race loop: one coherent shared story and a meaningful result.
- Contract loop: repeated races accumulate fair stakes, history, and mastery.
- No payoff without anticipation and no sustained tension without recovery.

## Creator, spectator, and hardcore law

- COPY THAT? must pass the 2AM Test: it is worth another attempt without an
  audience, recording, or social reward.
- It must pass the 10-Second Clip Test: a newcomer can quickly understand the
  danger, the communication or execution, and the payoff.
- Player legibility, spectator legibility, streamer usability, conversation
  clarity, and clip potential are considered from the first representative
  prototype.
- Protect facecam-safe and OBS-friendly layouts without weakening either role.
- Preserve semantic Moment events and replay markers so later systems can find
  starts, commitments, reversals, saves, contacts, DNFs, and finishes.
- Contracts, Hardcore, role swaps, seeded/shareable challenges, visible
  ATTEMPT #N, and "stay together / one more race" are core long-form directions.
- Highest stakes may reset a whole Contract after one DNF only when the failure
  remains fair and understood.
- Creator features amplify genuine play; they never replace the 2AM Test with
  scripted clip farming.

## Platform and architecture law

- Steam PC is the primary commercial product and architecture target.
- The existing Web/Three.js build is research evidence, a disposable harness,
  and a possible later demo. Browser, Netlify, or hackathon constraints do not
  define production.
- No production engine is selected. Godot C#, Unity C#, or another candidate
  must earn the choice through equivalent product-specific spikes.
- Simulation/physics, rendering, UI, networking, voice, AI, replay, and Steam
  integrations keep explicit boundaries. Presentation cannot secretly become a
  second race authority.
- Deterministic high-level actions, events, reason codes, and reproducible traces
  are valuable when they support fairness, debugging, replay, and migration.
  Existing TypeScript syntax is not itself a product asset.
- Existing work has no preservation rights. Only evidence and product value do.

## Falsification and evidence

Reject or revise a hypothesis when:

- Human×Human play does not create more meaningful agency than silent or
  shared-information controls.
- Either role can consistently solve the representative race alone.
- Driver control feels like a rail, a QTE, or execution without a skill ceiling.
- Engineer play becomes command clicking, answer reading, or passive camera
  watching.
- Voice adds friction but not collaboration, and accessible alternatives cannot
  preserve participation.
- Players attribute failure mainly to latency, UI confusion, randomness, bad
  translation, or hidden rules.
- Online play cannot keep Driver control responsive and consequences fair.
- A second attempt shows no learning, adaptation, or desire to coordinate again.
- A blind observer cannot explain a representative 10-second moment.
- Visual/audio polish produces screenshots but not clearer play.
- The game fails the 2AM Test.

Evidence order:

1. This North Star and explicit product direction.
2. Actual representative Human×Human play and observed behavior.
3. Measured prototype traces, latency, input, replay, and role-information
   evidence.
4. Strong relevant first-party or practitioner research.
5. Individual opinion.
6. Tool, skill, engine, plugin, or model preference.

## Drift alarms

Stop and re-check direction if the project becomes:

- AI-first or Engineer-only by default;
- a button-first command deck or normal-play typed chat;
- direct driving with an ornamental Engineer;
- an all-knowing Engineer dashboard or answer-giving assistant;
- a Driver who succeeds without useful Engineer information;
- a deliberately incompetent AI or human role created only to force calls;
- spline/rail driving presented as the production vehicle;
- random event chaos, scripted scenario stitching, or empty laps;
- constant chatter with no listening, silence, or recovery;
- a generic SaaS UI around a racing view;
- a provider demo, networking demo, or engine demo without product evidence;
- creator-only spectacle that fails the 2AM Test;
- full content, backend, realism, or polish before the next risk is proven;
- preservation of legacy code because it already exists.

## Feature decision test

Before a feature or technical commitment:

1. Which role fantasy and verb does it strengthen?
2. Which expensive product risk does it reduce?
3. Does it deepen complementary information and real communication?
4. Does it preserve direct Driver execution and Engineer judgment?
5. Does it improve both PLAY and WATCH?
6. Does it support hard-but-legible mastery and fair consequence?
7. Can a cheaper test answer the same question?
8. If it fails, what reusable evidence remains?
9. Is it being protected only because it already exists?

If the answer is weak, reject, defer, or redesign the experiment.
