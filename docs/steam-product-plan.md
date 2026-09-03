# COPY THAT? — Steam Product Plan

Status: high-level product/GDD source of truth for Product Reset / early
Pre-production.

Authority: subordinate to docs/north-star.md. Items are explicitly FROZEN or
UNPROVEN; absence from this plan is not approval to build it.

## Product promise

COPY THAT? is an online two-player asymmetric Formula racing co-op game where
conversation is the control system. The Driver physically drives the car. The
Engineer reads the larger race and changes what the team can safely attempt.
Neither role can master the race alone.

The desired story is not "one player gives orders and the other obeys." It is
two specialists building a shared model under pressure, committing together,
and living with one continuous physical consequence.

## Frozen product pillars

1. Human Driver × Human Engineer is the flagship.
2. Steam PC is the primary commercial target.
3. Voice/PTT is the primary communication path.
4. Driver execution and Engineer judgment are both real skills.
5. Information is complementary and incomplete by role.
6. Consequences are hard, fair, continuous, and causally legible.
7. The game is designed to play well at 2AM and read well in a 10-second clip.
8. AI fills a missing teammate role; it does not replace the flagship premise.

## Flagship modes

| Mode | Status | Product intent |
| --- | --- | --- |
| Play with Friend | FROZEN | Invite one friend, select roles, ready, race, and stay together for another race or Contract. |
| Matchmaking | FROZEN | Pair two players through role and region/latency preferences with a fast rematch path. Exact skill model is unproven. |
| Driver / Engineer / Flex preference | FROZEN | A player states role preference before matching; the match resolves exactly one of each role. |
| Role Swap | FROZEN direction | Make the information split learnable from both sides and create natural replay/mastery. Exact cadence and rewards are unproven. |
| Solo: Human Driver + AI Engineer | FROZEN fallback | Train Driver skills, practice tracks, and support players without a partner. |
| Solo: Human Engineer + AI Driver | FROZEN fallback | Train information and communication skills and preserve the original research lineage. |
| Stay Together / One More Race / Continue Contract | FROZEN direction | Preserve chemistry after a good random match. Exact social flow is unproven. |

## Driver fantasy and verbs

Fantasy: "I am holding a Formula car at the limit while a teammate sees the race
I cannot."

Primary verbs:

- steer, throttle, brake, shift, position, defend, attack, and recover;
- feel grip, slip, balance, wheelspin, braking margin, contact, and damage;
- report what the car is doing;
- ask for missing information and clarify uncertain calls;
- execute, adapt, or push back when the car cannot safely do what was asked;
- manage risk while trusting incomplete information.

The Driver never becomes an animation playing out Engineer commands. Assists may
shape approachability, but direct control and a mastery ceiling remain.

## Engineer fantasy and verbs

Fantasy: "I cannot touch the wheel, but I can see the race forming and make the
team ready before the Driver can."

Primary verbs:

- select, pin, and compare evidence sources;
- scan upcoming geometry, gaps, trends, hazards, race control, and persistent
  condition;
- listen to Driver feel and update the shared model;
- predict, warn, question, confirm, time, and prioritize;
- choose when to interrupt and when silence is safer;
- create an attack, defence, save, or strategic commitment through communication;
- reconstruct why a result happened and improve the next attempt.

Engineer interaction selects information, not commands. No normal-play deck tells
the Driver INSIDE, OUTSIDE, PUSH, NOW, or another suggested answer.

## Communication loop

1. One role perceives evidence the other lacks.
2. The team communicates, asks, or confirms.
3. The receiving role acknowledges understanding or uncertainty.
4. The Driver makes a physical commitment or the Engineer makes a strategic
   commitment.
5. Rival, track, and race state respond continuously.
6. The result becomes visible/audible and is classified only after resolution.
7. The pair reacts, updates trust, and carries the consequence forward.

The loop supports disagreement, correction, interruption, and silence. Radio
brevity increases with pressure, but calm periods allow diagnosis and character.

## Race structure

- One race is one continuous world and state.
- Dense short race stories remain the working direction; exact duration and lap
  count are UNPROVEN.
- A representative race should contain anticipation, multiple interdependent
  decisions, physical execution, at least one recovery/release interval, a
  climax, a result, and a fast rematch/role-swap hook.
- Encounter families include Driver feel/pace, blind geometry, rear attack and
  defence, overtake setup and feint, race-control hazard, persistent damage or
  grip, and final attack/defence.
- Encounters are composed from live state; they are not a fixed minigame
  playlist.

## Difficulty ladder

| Layer | Intended challenge |
| --- | --- |
| Onboarding | Learn role boundaries, PTT, core evidence, and physical controls without hidden rules. |
| Standard | Execute clear calls and driving under moderate time/attention pressure. |
| Advanced | Combine incomplete sources, opponent adaptation, carried condition, and tighter physical margins. |
| Expert | Coordinate feints, recovery, competing priorities, and imperfect information at race pace. |
| Contracts | Sustain performance across linked races with persistent stakes and role strategy. |
| Hardcore | Brutal but legible consequences, including a whole-Contract reset after DNF when clearly understood. |

Difficulty settings may alter assistance, information pacing, opponent pressure,
or consequence recovery. They do not make failures random or turn the Engineer
UI into an answer key.

## Creator and spectator loop

- Every representative prototype is judged for player, teammate, spectator, and
  streamer comprehension.
- HUD and feed layouts protect facecam/OBS-safe regions without hiding critical
  race evidence.
- Danger is readable before payoff; the communication and physical response are
  readable during it; the consequence is attributable afterward.
- Semantic Moment events mark warnings, calls, commitments, reversals, saves,
  contacts, DNFs, finishes, and attempt boundaries.
- Replay markers and deterministic traces are architecture requirements.
  Automatic editing and clip export are later features.
- Contracts, Hardcore, seeded/shareable challenges, ATTEMPT #N, role swaps, and
  stay-together flows turn repeated coordination into a long-form story.

Success requires both:

- 2AM Test: players want another attempt without an audience or social reward.
- 10-Second Clip Test: a newcomer can explain the danger, team action, and
  consequence quickly.

## Accessibility and communication safety

- Full remapping, separate role action sets, scalable text, contrast, color-safe
  redundant cues, reduced motion, subtitles, and independent game/radio volumes
  are baseline directions.
- Human voice can be captioned with opt-in speech-to-text.
- A non-speaking player can use text-to-speech or concise quick communication
  that reaches the teammate through the same social channel.
- Accessibility communication may be slower or text-based; timing design must
  provide an equitable configuration instead of offering an answer.
- Players need visible PTT state, mic test, device selection, per-player volume,
  mute, block, report, privacy controls, and a path that works without a
  microphone.
- Captions distinguish speaker, meaning, critical sound cues, and uncertainty
  without inventing telemetry.

## AI teammate role

- AI receives only the evidence allowed to its assigned role.
- AI Engineer may synthesize upcoming/global evidence and communicate; the Human
  Driver still drives every frame.
- AI Driver may converse and choose high-level intent; deterministic/physical
  driving systems execute within the same rules as the product.
- Common and time-critical responses have local authored fallbacks.
- Generative personality is optional, interruptible, and prohibited from
  inventing facts or directly mutating race authority.
- AI quality is measured against a human teammate experience, not novelty.

## Content and scope guardrails

Before the true vertical slice, do not build:

- a licensed championship, large car roster, open world, pit crew simulator, or
  full motorsport career;
- many tracks, incidents, Drivers, or Contracts;
- mass multiplayer, esports backend, spectator service, Workshop, audience
  sabotage, cloud replay library, or full clip editor;
- photoreal assets, dynamic weather, or sim-grade tire/aero systems whose risk
  question is still unproven;
- production AI infrastructure or provider lock-in;
- a Web product because the harness already exists.

One excellent representative car, track section, continuous race, role pair, and
causal failure chain outrank breadth.

## Frozen / unproven / rejected map

| State | Items |
| --- | --- |
| FROZEN | Steam PC; online Human Driver × Human Engineer flagship; both solo AI teammate configurations; voice/PTT primary; direct Driver control; Engineer evidence selection; complementary information; creator/hardcore pillar; hard-but-legible difficulty; continuous causal world. |
| UNPROVEN | Production engine; exact physics/assists; network topology/authority/prediction; Steam binding; voice transport; Engineer feed set/layout; race duration/laps/field; matchmaking rating; role-swap cadence; content count; AI provider/model; replay/editor scope; wheel/FFB level. |
| REJECTED | AI-first pitch; Engineer-only flagship; command-button normal play; typed chat as normal control; answer suggestions; production spline/rail driving; cockpit-only Engineer law; stitched scenarios; SaaS dashboard; Web constraints driving production; provider-owned race authority; code preservation by inertia. |

## Product proof

The plan advances only when representative humans show:

- both roles are necessary and understood;
- Driver input is responsive, learnable, and worth mastering;
- communication changes what the pair can attempt;
- failures are attributed to understandable decisions/execution rather than
  system friction;
- role swap produces new understanding or mastery;
- players voluntarily retry or stay together;
- blind observers understand a representative moment;
- online, voice, accessibility, and reconnect behavior do not break the causal
  contract.

The stage-specific thresholds live in docs/preproduction-plan.md and
docs/technical-decision-gates.md.
