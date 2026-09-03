# COPY THAT? — Technical Decision Gates

Status: active evidence requirements. No production engine or final technical
winner exists.

This document defines what must be learned before a decision is frozen. Feature
lists and existing code are priors only. Every choice must serve the North Star,
the Human Driver × Human Engineer flagship, and the current pre-production stage.

## Decision policy

For every technical choice record:

- player-facing risk;
- candidates and simplest control;
- identical test artifact and hardware/network conditions;
- hard gate and measured evidence;
- failure/rollback path;
- dependencies, licensing, privacy, and maintenance surface;
- what stays unfrozen after the decision.

Do not combine engine, physics, networking, voice, UI, and Steam selection into
one emotional winner. A chosen engine does not automatically choose a network
topology, voice transport, AI provider, wheel stack, or replay design.

## Current freeze map

| Area | Current state |
| --- | --- |
| Steam PC primary product | FROZEN |
| Online two-player Human Driver × Human Engineer | FROZEN |
| Direct Driver control and simcade mastery target | FROZEN |
| PTT-first human communication | FROZEN |
| Role-limited information and evidence-not-answers | FROZEN |
| Deterministic high-level events/reason traces | FROZEN as an architecture goal |
| Production engine | UNFROZEN |
| Physics implementation and assists | UNFROZEN |
| Host, authority, prediction, transport, and dedicated-server need | UNFROZEN |
| Voice capture/codec/transport and AI speech providers | UNFROZEN |
| Steam SDK binding | UNFROZEN |
| Exact Engineer feeds/layout | UNFROZEN |
| Replay storage and Steam Timeline integration depth | UNFROZEN |
| Controller/wheel/FFB scope | UNFROZEN |

## Physics and simcade gate

### Target

Create Formula handling that is physically coherent, immediately readable, and
deep enough to reward braking, line, throttle, slip control, recovery, and team
timing. "Simcade" means game-designed physical rules with a high mastery ceiling,
not weakened rail driving and not an unbounded motorsport simulator.

### Prototype requirements

- direct steering, throttle, brake, and gear input;
- stable fixed physics timing separated from rendering;
- acceleration/braking envelope and repeatable stopping distances;
- longitudinal/lateral grip interaction, slip angle/yaw response, weight-transfer
  cues, traction loss, and recoverability;
- kerb, grass/runoff, wall, car-to-car contact, and persistent consequence;
- tunable assists with explicit behavior;
- camera, audio, wheel animation, and haptics driven by physical state;
- telemetry for input, velocity, yaw rate, slip, tire/contact state, assists,
  collision, and reset;
- deterministic high-level event/reason output even if floating-point low-level
  traces are not bit-identical across peers.

### Evidence to freeze

- novice completion and expert repeatability on the same short course;
- lap/sector and error distributions across multiple attempts;
- players can name why they lost grip, time, or control;
- assists improve access without collapsing expert separation;
- no visible rail snapping, teleport correction, or camera-created false cue;
- 60/120 render schedules and supported frame drops do not change authoritative
  outcome classification unexpectedly;
- network prototype can keep Driver input responsive while resolving contact and
  race state fairly;
- candidate implementation is debuggable and tunable by one developer.

### Do not overbuild

- licensed F1 data, full tire thermodynamics, aero maps, setup engineering,
  dynamic weather, pit systems, large vehicle roster, or perfect wheel FFB;
- a stock vehicle component treated as proof;
- deterministic low-level physics at the expense of responsive driving unless
  the network/replay test proves it necessary.

## Multiplayer, authority, and Steam gate

### Separate concerns

- Lobby/matchmaking finds a teammate, carries role/readiness metadata, and starts
  a session.
- Gameplay networking carries inputs, state, events, reconnect, and results.
- Voice capture/compression does not itself deliver packets.
- Steam Datagram Relay is a transport/security option, not an authority model.

### Questions the spike must answer

- Does one player host, does a relay-backed listen server host, or is a dedicated
  server necessary?
- Which state is server/host authoritative: car physics, contacts, opponents,
  race control, Engineer calls, result, and replay record?
- Which Driver state is predicted locally and how is reconciliation made visible
  without false steering/braking cues?
- Are Engineer communications reliable/ordered while high-rate state uses an
  appropriate unreliable path?
- How are clock sync, input sequence, action receipt, event order, pause, retry,
  and role views represented?
- What happens when the host, Driver, Engineer, Steam connection, mic, or game
  process disconnects?
- Can a player reconnect to the same role/state, can host migration be credible,
  or must the run end with a fair recorded result?
- What cheating, ranking, persistence, or tournament requirement would actually
  justify a dedicated server?

### Required tests

- two remote Windows PCs across representative regions;
- injected latency, jitter, packet loss, reordering, bandwidth pressure, and
  brief/full disconnects;
- rapid Driver steering/braking plus a simultaneous Engineer call and contact;
- lobby create/search/join, friend invite, role conflict, ready/start, rematch,
  stay together, and launch-from-invite;
- host loss, client loss, reconnect, duplicate call, late call, and version
  mismatch;
- trace comparison of inputs, receipts, authority ticks, corrections, events,
  outcomes, and replay.

### Freeze gate

- Driver local input remains responsive within a frozen input-to-visible budget;
- p50/p95 network input/state/call latency and correction magnitude are recorded;
- no critical call is duplicated, reordered, silently dropped, or applied to the
  wrong attempt;
- contacts and position results remain causally explainable under degradation;
- disconnect behavior is explicit, tested, and acceptable to pairs;
- Steam lobby/invite and candidate transport work in packaged builds;
- the selected topology is cheaper and simpler than rejected alternatives for
  two players while leaving an evidence-based path to scale.

Small-party guidance makes host/relay P2P a serious first candidate. Dedicated
servers remain possible, not assumed.

## Voice, PTT, accessibility, and safety gate

### Human teammate boundary

- PTT is primary; open mic may be an optional later setting.
- Visible transmit/listen state, mic test, device selection, sidetone/radio
  feedback, ducking, per-player volume, and no stuck transmit are required.
- Voice packets have an explicit transport, priority, loss strategy, and
  bandwidth budget.
- Human speech reaches the teammate without generative interpretation.
- Recording/transcript retention is off by default unless a clear, consented
  feature needs it.

### Safety and participation

- mute, block, report, abuse handling, and communication privacy are product
  requirements before broad matchmaking.
- speech-to-text captions distinguish speaker and uncertainty;
- text-to-speech lets a non-speaking player participate in the same team channel;
- subtitles/transcripts, critical sound labels, scalable text, contrast, timing
  accommodation, and independent volumes are tested;
- quick communication is an accessibility/recovery language, never a suggested
  answer deck.

### AI teammate boundary

- STT/intent parsing is needed only when an AI teammate must understand speech,
  not for Human×Human voice transport.
- AI sees only its role-authorized evidence and can propose only constrained
  high-level actions.
- common/critical acknowledgements have local authored fallbacks;
- generation is cancellable, non-authoritative, and prohibited from inventing
  telemetry or driving per frame;
- cloud credentials are short-lived/server-mediated where needed and never
  shipped as long-lived client secrets.

### Evidence to freeze

- p50/p95 PTT-up-to-remote-audio-start and end-to-end call-to-world-response;
- loss, jitter, clipping, echo, noise, radio ducking, and simultaneous speech;
- device hot-swap, focus loss, background/overlay behavior, and reconnect;
- zero stuck-open transmissions and clear failure feedback;
- captions and TTS accuracy/latency with English/Korean, names, motorsport terms,
  noise, and overlap;
- successful mute/block/report and accessible configuration from launch through
  lobby and race;
- AI fallback safety, wrong-action rate, latency, privacy, offline behavior, and
  cost only for solo modes.

## Engine gate — Godot C# versus Unity C#

No winner is selected. Both candidates must implement the same boxed Stage 2
artifact after Stage 1 supplies the contracts and thresholds.

### Updated flagship weights

| Criterion | Weight |
| --- | ---: |
| Vehicle physics, feel, tuning, camera/haptics, and profiling | 25% |
| Two-player networking, authority, prediction, correction, and reconnect | 20% |
| Solo-developer iteration, debugging, Windows packaging, and maintainability | 15% |
| Voice/audio/device access, PTT quality, and communication accessibility | 12% |
| Engineer multi-source UI, rendering, camera feeds, and spectator readability | 10% |
| Steam SDK binding, lobby/invite/matchmaking, SDR, and build pipeline | 8% |
| Gamepad/keyboard plus wheel and FFB feasibility | 6% |
| Replay, Moment events, capture/debug, and Steam Timeline path | 4% |

Weights are frozen before the spikes. Any change requires a recorded product
reason, not a favorable interim result.

### Equal deliverable

- one physical car and handling course;
- one continuous Human×Human encounter with separate role views;
- one packaged two-PC network/PTT path;
- the same inputs, network impairments, telemetry, content, camera/audio target,
  accessibility cases, and playtest script;
- Steam initialization and documented binding maintenance status;
- lobby/invite and candidate SDR/transport proof;
- semantic event/reason trace and replay reconstruction;
- measured editor start, code change-to-play, content change-to-play,
  build/package, profiler capture, failure recovery, and repository churn;
- dependency, licensing, update, platform, and solo-maintenance inventory.

### Hard disqualifiers

- cannot produce a stable 64-bit Windows build;
- cannot support the required vehicle feel without an unmaintainable custom fork;
- cannot keep Driver input responsive and race outcomes authoritative online;
- Steam/voice integration depends on an abandoned or legally unsuitable path;
- engine scene/physics/UI callbacks become hidden race authority;
- the project cannot be reproduced from source and documented dependencies;
- the candidate materially exceeds the time box without unique evidence.

If scores differ by less than five weighted points, run one named tie-breaker or
prefer the simpler, cheaper, more reversible maintenance path. Do not manufacture
a winner.

## Engineer UI and camera gate

- Driver view prioritizes physical control, immediate space, speed, and car feel.
- Engineer view prioritizes selectable upcoming/global evidence.
- Spectator/broadcast framing prioritizes causal legibility.
- Sources declare what they show, latency/age where meaningful, blind spots, and
  control focus.
- Menus and accessibility surfaces have explicit input focus and never leave
  driving/camera controls active accidentally.
- Persistent chrome stays subordinate to the race; critical evidence is
  contextual and hierarchy changes with pressure.

Freeze only after first-time Engineers can find evidence without answer labels,
Drivers retain spatial control, both roles recover from attention mistakes, and
blind observers understand a representative moment.

## Input, controller, and wheel gate

- Define semantic actions separately for Driver, Engineer, shared lobby/menu,
  accessibility, replay, and debug.
- Gamepad and keyboard are baseline for the vertical slice.
- Support remapping, glyph changes, dead zones, sensitivity, inversion, hold/toggle
  PTT, and device hot-swap.
- Steam Input action sets/glyphs are evaluated in the packaged spike; they do not
  replace native device testing.
- Test at least one representative wheel during the engine spike for steering,
  pedals, device discovery, remapping, and packaging. FFB depth stays unfrozen
  until evidence shows it materially improves the flagship relative to cost.
- Engineer controller navigation must not reduce information selection to command
  buttons.

Freeze the supported-device matrix only after target devices pass both roles,
menus, overlays, focus loss, reconnect, and accessibility cases.

## Replay, Moment Engine, and Steam Timeline gate

Keep now:

- versioned semantic events and reason codes;
- attempt/race/Contract identifiers;
- input/action receipts and authoritative timestamps;
- enough state/version/seed data to reconstruct or diagnose a moment;
- pre/post bounds around warnings, commitments, reversals, saves, contact, DNF,
  and finish.

Defer:

- cinematic replay editor, automatic montage, cloud replay storage, public clip
  feed, creator analytics, and audience control.

Freeze integration depth only when the true vertical slice proves which events
people actually understand and want to revisit. Steam Timeline can receive game
phases, event markers, priorities, and possible-clip hints; it complements the
game's semantic event model and must not become the source of truth.

## Research support, not authority

- Valve separates lobbies/matchmaking from gameplay networking and notes that
  small groups commonly use lobbies plus P2P:
  [Steam Multiplayer](https://partner.steamgames.com/doc/features/multiplayer?l=english)
  and [Steam Matchmaking & Lobbies](https://partner.steamgames.com/doc/features/multiplayer/matchmaking).
- Steam Datagram Relay can carry P2P or dedicated traffic through relays and
  protect player IPs; it does not decide host authority:
  [Steam Datagram Relay](https://partner.steamgames.com/doc/features/multiplayer/steamdatagramrelay?l=english).
- Steam Voice captures/compresses/decompresses audio but requires another
  networking path to send it:
  [Steam Voice](https://partner.steamgames.com/doc/features/voice?language=english).
- Steam Input supports action-based mappings and controller glyphs; hardware
  coverage still needs packaged-device evidence:
  [Steam Input](https://partner.steamgames.com/doc/features/steam_controller).
- Steam Timeline accepts game phases and event/clip priorities, supporting the
  choice to keep semantic Moment events early:
  [ISteamTimeline](https://partner.steamgames.com/doc/api/ISteamTimeline).
- Unity WheelCollider exposes suspension and slip-based tire friction, while
  Godot explicitly warns that VehicleBody3D has known issues and may require
  custom CharacterBody3D/RigidBody3D integration for advanced physics. Therefore
  neither feature checkbox selects the engine:
  [Unity WheelCollider](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/WheelCollider.html)
  and [Godot VehicleBody3D](https://docs.godotengine.org/en/stable/classes/class_vehiclebody3d.html).
- Criterion's vehicle-feel GDC session emphasizes a solid physical simulation
  plus camera, assists, and other layers; Avalanche's simcade session emphasizes
  designer-friendly tire behavior and the tradeoff between believability and
  fun. These support a measured feel test rather than realism-by-complexity:
  [Vehicle Feel Masterclass](https://www.gdcvault.com/play/1025295/Vehicle-Feel-Masterclass-Balancing-Arcade)
  and [Vehicle Physics and Tire Dynamics in Just Cause 4](https://www.gdcvault.com/play/1026035/Vehicle-Physics-and-Tire-Dynamics).
- Microsoft's accessibility guidance treats STT/TTS and the entire path through
  invite, lobby, settings, mute, block, and report as part of accessible
  communication:
  [XAG 119](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/119)
  and [XAG 120](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/120).

## Freeze record template

When a decision is ready, append to docs/codex-log.md:

- decision and date;
- versioned candidates and dependencies;
- frozen test brief and weights;
- hardware/network/participant conditions;
- measurements and artifacts;
- rejected alternatives and why;
- known limits and next review trigger;
- exact commit and rollback point.

Until that record exists, the choice remains UNFROZEN.
