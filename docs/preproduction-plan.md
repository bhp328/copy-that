# COPY THAT? — Pre-production Plan

Status: active stage and gate plan.

The project is in Product Reset / Risk Prototype. A stage changes only when its
hard gate is satisfied and recorded in docs/current.md and docs/codex-log.md.
Passing a build, simulator, or isolated prototype never silently promotes the
project.

## Stage rules

- Test the most expensive assumption with the cheapest credible artifact.
- State the risk, comparison, measure, threshold, kill condition, and disposable
  parts before implementation.
- Keep prototypes isolated enough to explain failures.
- Preserve evidence and contracts, not prototype technology.
- Use representative humans before claiming fun, coordination, accessibility,
  spectator clarity, or online quality.
- Every stage ends with a clean checkpoint and exact continuation state.

## Stage 0 — Product Reset

Purpose: define the strongest product before protecting implementation.

Deliverables:

- two-player Steam North Star;
- product/GDD plan;
- pre-production stages and hard gates;
- technical decision gates;
- short current-state document;
- legacy diff survival review;
- historical notices on the superseded Web/AI-solo audit and protocol.

Hard gate:

- Human Driver × Human Engineer, Steam target, role information split, PTT,
  difficulty, creator pillar, AI fallback, and anti-inertia rule are mutually
  consistent across repo instructions and docs.
- Legacy repair lessons are captured before its code is restored.
- Final checkpoint is docs-only, clean, and pushed normally.

Exit status: completed by the Zero-Based Product Reset checkpoint.

## Stage 1 — Risk Prototypes

Stage 1 proves five risks independently enough to diagnose failure. Prototypes
may be ugly, local, scripted, or disposable. They are not the vertical slice.

### R1 — Human×Human Conversation Contract — first

Risk: the flagship may sound compelling yet fail to make two humans genuinely
interdependent while one is physically driving.

Cheapest credible artifact:

- two separate stations and screens;
- one directly controlled greybox car;
- one continuous 60–90 second approach → complication → commitment →
  consequence → recovery encounter;
- Engineer-only upcoming/global evidence;
- Driver-only immediate/feel evidence;
- controlled PTT/radio discipline;
- no AI, answer labels, normal-play typed control, or command buttons.

Comparison conditions:

1. asymmetric duo;
2. silence/no useful Engineer communication;
3. both roles receive the same information.

Record: both screens, room/radio audio, physical inputs, source selections,
calls, acknowledgement, state transitions, outcome, confusion, causal
explanation, and unprompted retry/role-swap desire.

Provisional pass gate to freeze before participant recruitment:

- a majority of first-time pairs performs or recovers materially better in the
  asymmetric duo condition than silence;
- both players independently explain information that only the other role had;
- shared-information control reduces the need for coordination rather than
  improving the intended experience;
- failures are attributed to a call, missed evidence, timing, or execution—not
  hidden rules or apparatus friction;
- the second attempt shows a named improvement and produces credible desire to
  retry or swap roles.

Kill/revise rule: if the duo condition does not create measurable interdependence
or players prefer shared information for reasons other than onboarding, revise
the information/communication design before engine selection.

Why first: it tests the whole-product thesis and both-role necessity earlier and
more cheaply than a network stack, content build, or polished vehicle.

### R2 — Human Driver Vehicle Feel

Risk: direct driving may be approachable but shallow, or demanding but unreadable.

Artifact: one car, one short repeatable handling course, gamepad first, with
steering/throttle/brake/gear, braking zones, grip loss/recovery, kerb/surface
change, contact, and telemetry. Camera/audio/assists are test variables, not
polish.

Hard gate:

- responsive input and stable frame/physics timing;
- novices can complete after brief instruction;
- experienced players produce repeatably faster/cleaner lines;
- braking, grip, slip, weight-transfer cues, kerbs, and contact are learnable;
- assists widen access without erasing line/brake/throttle mastery;
- players can explain why the car lost time or control;
- the model can expose authorized NOW/FEEL evidence without leaking the
  Engineer's NEXT/GLOBAL view.

Do not build a full tire/aero simulator, opponent field, art car, damage model,
or wheel/FFB stack here.

### R3 — Engineer Information and Attention

Risk: multi-source evidence may become either an all-knowing dashboard or
frustrating camera whack-a-mole.

Artifact: one replayable race state with three to five manually selectable
sources such as onboard, rear/battle, tactical, trackside, and race control.
Sources have explicit strengths, age, blind spots, and switching cost.

Hard gate:

- players find relevant evidence before the decision without an answer label;
- no single source solves every case;
- source selection creates recoverable attention errors, not arbitrary failure;
- calm and critical states preserve hierarchy and playfield readability;
- blind observers can follow the danger and consequence;
- alternate input, scaling, color, captions, and reduced-motion paths remain
  usable.

The exact feed count, layout, automatic alerts, and FNAF-like rhythm remain
unfrozen.

### R4 — Online Voice and Network

Risk: latency, authority, voice, packet loss, or disconnects may break Driver
control and causal fairness.

Artifact: two remote Windows PCs running the same minimal encounter with a
friend-lobby/invite stub, candidate host/authority models, PTT voice, instrumentation,
and forced latency/loss/disconnect cases.

Hard gate:

- Driver local input remains immediately responsive;
- authoritative state, Engineer calls, rival/world events, and outcomes stay
  ordered and explainable;
- p50/p95 input, state, call, and mouth-to-ear voice latency are measured under
  target and degraded conditions;
- no duplicate, reordered, or silently lost critical call;
- reconnect/host-loss behavior is defined and tested;
- PTT never sticks open and mute/block/report/privacy paths work;
- captions/STT/TTS alternatives participate without receiving suggested answers.

This prototype compares topology and transport; it does not build production
matchmaking, a dedicated fleet, or a social backend.

### R5 — Representative Continuous Racing Encounter

Risk: isolated successes may not combine into one tense, coherent race.

Artifact: one short continuous encounter connecting direct driving,
Engineer attention, human PTT, opponent/world response, persistent condition,
meaningful failure/recovery, and a result.

Hard gate:

- no teleport, stitched scenario, or second authority;
- at least two exchanges require information from opposite roles;
- prior state changes later options or physical margins;
- silence, conservative coordination, strong coordination, and a wrong/late
  path produce distinct, fair results;
- both roles show second-attempt learning;
- the moment passes a frozen 2AM/10-second-clip protocol;
- deterministic/recorded high-level events can reconstruct why the result
  happened without forcing identical low-level physics across machines.

### Stage 1 exit gate

Advance only when R1–R5 have valid evidence or an explicit recorded decision that
a risk was combined without losing diagnostic power. The project must have:

- a demonstrated Human×Human core;
- a vehicle-feel target worth carrying into a spike;
- a tested Engineer information contract;
- measured online/voice constraints;
- one coherent representative encounter;
- frozen candidate-neutral fixtures, measures, and failure cases for Stage 2.

## Stage 2 — Engine and Architecture Spike

Purpose: select the production engine and boundaries from measured COPY THAT?
evidence.

Candidates: Godot C# and Unity C# receive equivalent spikes. Three.js is a
historical low-migration/reference control only where comparison is useful, not
an incumbent. Add another engine only when evidence justifies equal evaluation.

Each candidate must deliver the same:

- R2 vehicle course and R5 representative encounter;
- separate Driver and Engineer role views;
- one two-PC network/voice path;
- gamepad and keyboard action maps plus one representative wheel feasibility
  check;
- Windows development build;
- documented Steam SDK/binding, lobby/invite, transport/SDR, and packaging path;
- deterministic high-level event/reason trace and replay reconstruction;
- one multi-source Engineer UI;
- representative camera, audio, radio, profiling, and debugging;
- measured edit-to-play, edit-to-package, crash recovery, frame pacing, latency,
  source-control noise, and maintenance surface.

Hard gate:

- both spikes use the same test brief, content, hardware class, network
  conditions, evidence capture, and time box;
- no engine frame callback, physics component, UI, AI, or network object becomes
  an undocumented second authority;
- each produces a clean packaged build and reproducible evidence;
- stock feature presence is not scored as working integration;
- a winner materially repays migration and maintenance cost;
- a narrow tie triggers one targeted tie-breaker, not preference voting.

Output: one selected engine and architecture decision, or a documented
INCONCLUSIVE result with exactly one tie-breaker. No winner exists today.

## Stage 3 — True Steam Vertical Slice

This is the first product-shaped build. Legacy Web M2 is explicitly not this
vertical slice and cannot become it through polish.

Required:

- online Human Driver × Human Engineer;
- real Driver control and representative simcade physics;
- asymmetric Engineer evidence selection;
- PTT voice plus required safety/accessibility paths;
- one continuous representative race with persistent state;
- friend invite/lobby and reliable join/ready/start/rematch flow;
- reconnect/failure behavior appropriate to the selected topology;
- representative fictional Formula car, track, rivals, UI, camera, lighting,
  audio, and radio quality;
- causal failure, Retry, Role Swap, and Stay Together / One More Race;
- semantic Moment events, replayable evidence, and a Steam Timeline feasibility
  integration point;
- min-spec Windows package, controller/keyboard coverage, settings, localization
  direction, and no secret/client credential risk.

Hard gate:

- first-time pairs understand both roles and improve without coaching;
- Driver feel, Engineer attention, PTT, network authority, and consequences meet
  their frozen thresholds;
- blind observers pass the 10-Second Clip Test;
- players demonstrate unprompted Retry or continue-together behavior;
- screenshots/video/audio read as the intended product, not a test scene;
- crash, disconnect, reconnect, mute/block/report, accessibility, and min-spec
  paths have evidence;
- scope and production cost are credible.

Only this gate authorizes Production.

## Production

Build reusable systems and content only after the vertical slice passes.

Gate to Alpha:

- production pipeline, CI/builds, telemetry/privacy, save/versioning, content
  tools, network operations, test matrix, and crash reporting work;
- representative content breadth exists without violating No Empty Racing;
- core features are present and major architecture is no longer in flux.

## Alpha

Feature-complete enough for structured external testing; content may be rough.

Gate to Beta:

- complete start-to-finish product loop;
- online concurrency/capacity and region evidence;
- accessibility/localization implementation;
- progression/Contracts/Hardcore and moderation/safety paths;
- performance, crash, desync, reconnect, and data-loss risks under control.

## Beta

Content-complete stabilization, balance, compatibility, onboarding, store
positioning, and operational readiness.

Gate to Steam Playtest:

- external build quality, privacy, support, moderation, server capacity, and
  rollback are ready for the planned cohort;
- store/app assets and expectations accurately describe the test;
- instrumentation answers named questions rather than collecting everything.

## Steam Playtest

Use controlled or region-limited access to validate real pairing, role
preference, retention, rematch/stay-together, voice, network conditions, and
capacity. Steam Playtest is an external evidence stage, not a marketing launch
or substitute for earlier pair testing.

Gate to Demo:

- the slice is stable and representative enough to influence purchase intent;
- matchmaking population and demo/full-game separation are understood;
- the experience ends with desire for the full product, not confusion about
  unfinished infrastructure.

## Demo

A polished, bounded sample of the real flagship. Do not ship the old Web M2 or a
technology demo under this label.

Gate to Launch:

- product, store promise, onboarding, accessibility, performance, networking,
  voice safety, moderation, operations, support, localization, controller
  coverage, and rollback meet release criteria;
- creator/clip paths amplify genuine play;
- no unresolved issue can silently corrupt a race, expose private voice data, or
  strand a two-player session.

## Evidence support, not product authority

- Valve documents Steam lobbies as group formation and role/lobby metadata, not
  gameplay transport; small parties commonly pair lobbies with P2P networking:
  [Steam Matchmaking & Lobbies](https://partner.steamgames.com/doc/features/multiplayer/matchmaking)
  and [Steam Multiplayer](https://partner.steamgames.com/doc/features/multiplayer?l=english).
- Steam Playtest uses a separate child app and controlled access; it belongs
  after a representative packaged build, while a demo should be a high-quality
  purchase-facing sample:
  [Steam Playtest](https://partner.steamgames.com/doc/features/playtest?language=english)
  and [Steam Demos](https://partner.steamgames.com/doc/store/application/demos?language=english).
- Steel Crate's GDC session frames asymmetric design around keeping players
  talking while producing tension, mistakes, hilarity, and camaraderie. It
  supports testing the conversation contract before scaling systems:
  [Designing Asymmetric Gameplay for Keep Talking and Nobody Explodes](https://www.gdcvault.com/play/1023471/Designing-Asymmetric-Gameplay-For-Keep).
