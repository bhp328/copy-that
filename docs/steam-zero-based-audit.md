# COPY THAT? — Steam-first Zero-Based Product/Tech Audit

> [!WARNING]
> **SUPERSEDED / HISTORICAL — 2026-09-03**
>
> This audit governed the previous AI-solo/Web M2 decision gate. It remains
> evidence of what the old harness proved and failed to prove, but it no longer
> controls product direction, development stage, engine timing, or production
> survival. Current authority is
> [North Star](./north-star.md),
> [Steam Product Plan](./steam-product-plan.md),
> [Pre-production Plan](./preproduction-plan.md),
> [Technical Decision Gates](./technical-decision-gates.md), and
> [Current Project Truth](./current.md).
>
> In particular, the old requirement that Web M2 pass before native risk work,
> the Engineer-only/AI Driver product weighting, and the old engine weights are
> superseded. Do not execute this document's Next decision as the active plan.

Date: 2026-09-03

Authority baseline: commit 5a98f95, Checkpoint deterministic M2 encounter slice

Scope: audit and decision preparation only; no gameplay, engine, UI, audio, asset,
networking, or voice implementation was changed in this pass.

## Executive decision

**Decision: DO NOT FREEZE YET.**

Steam PC is now the primary product target. Web remains useful only as the
cheapest existing validation, discovery, and eventual demo surface. This is
already consistent with the Platform Strategy in north-star.md, so the product
constitution does not need to be rewritten.

The audit does not support either extreme:

- Do not protect Three.js because it already exists.
- Do not discard Three.js merely because Steam is native.
- Do not select Godot or Unity from feature lists.
- Do not begin a big-bang port before COPY THAT?'s communication loop has
  produced blind human evidence.

The current decision posture is:

| Item | Verdict | Meaning now |
| --- | --- | --- |
| Steam PC primary product | **KEEP / SUPPORTED** | Native Windows packaging and Steam UX are the commercial target. |
| Web as product constraint | **DELETE** | Browser limits no longer define the shipping game. |
| Web as validation oracle | **KEEP TEMPORARILY** | Use the existing M2 slice for one narrow human/fun test, not release QA. |
| Three.js/Vite production commitment | **UNFREEZE** | It competes as the low-migration control, not the incumbent winner. |
| Godot C# | **EXPERIMENT** | Leading solo-dev/cost/reversibility challenger. |
| Unity C# | **EXPERIMENT** | Leading 3D tooling/asset/production-ceiling challenger. |
| Unreal | **SKIP FOR THIS DECISION** | Strong ceiling, but its present migration and scope cost do not earn a spike. |
| RaceSimulation contract | **KEEP, THEN PORT BY PARITY** | Preserve behavior and evidence, not TypeScript syntax. |
| OpenAI as a fixed dependency | **REJECTED** | No provider may own gameplay authority or be required for offline core play. |
| Hybrid Driver and AI-optional core | **KEEP AS ARCHITECTURE; EXPERIENCE UNPROVEN** | Common/critical radio stays deterministic; generation is selective and replaceable. |

The production engine may be frozen only after three gates:

1. the narrow existing-web human test produces causal understanding and
   voluntary retry evidence;
2. M2 behavior is captured as engine-neutral actions, views, events, fixtures,
   and golden traces;
3. Godot C# and Unity C# run the same boxed native spike and produce measured
   Windows builds.

Voice/provider selection remains a separate later freeze. Its candidates must
still be compared on the same English/Korean command corpus, including offline
fallback and false-action safety, but that work does not block choosing the
production engine after the native spike.

## Audit authority and evidence boundary

Judgment order for this audit:

1. North Star and product thesis;
2. actual blind/full-run human evidence;
3. deterministic repo evidence and strong first-party research;
4. subjective preference;
5. tool, engine, provider, or model taste.

Repo state was clean before this documentation pass. HEAD and origin/master
both resolved to 5a98f952a4a5392697a792a1408d6ca38e7e308e. The required command
suite had already been re-run on 2026-09-03 and was green, but no new browser
full run, screenshot, console, voice, or Fun Gate evidence was created.

That distinction controls every recommendation below.

## What M2 actually proves

| Claim | Status | Evidence or gap |
| --- | --- | --- |
| A deterministic authority can own the first three exchanges at 60 Hz | **SUPPORTED** | RaceSimulation is independent of Three.js/DOM and passes equal 30/60/120 render partitions. |
| Actions can enter through one ordered boundary | **SUPPORTED** | FIFO receipts, duplicate rejection, monotonic events, and retry cancellation are simulator-tested. |
| Engineer NEXT/GLOBAL and Driver NOW/FEEL can be structurally separated | **SUPPORTED IN CODE** | Frozen role projections omit forbidden information. Human comprehension remains untested. |
| Pace choices persist into later consequences | **SUPPORTED IN SLICE** | Grip, heat, stability, damage, gap, and position carry through crest and defence. |
| Calls produce deterministic, explainable consequences | **SUPPORTED IN SLICE** | AFK, conservative, good, and wrong paths separate and emit reason codes/Moment markers. |
| Overtake timing is measured rather than guessed | **SUPPORTED** | The protected model preserves the measured 3.75–4.70 second NOW interval. |
| Silence proves the Engineer is necessary | **REJECTED FOR OLD FULL RUN; UNPROVEN FOR REBUILD** | The old full race lets AFK finish P3. The M2 slice auto-saves the crest and auto-yields safely; the planned unseen-incident AFK DNF is not connected. |
| No Empty Racing works across a 3–5 minute run | **UNPROVEN** | Only the first three exchanges are rebuilt; the remainder is still the sparse legacy shell. |
| The visible-position rival loop creates mastery | **PARTIAL** | First-slice defence is causal, but feint/switch and protected NOW commitment are not connected. |
| Conversation is more fun than buttons/text | **UNPROVEN** | M2 has no live voice evidence. Earlier human approval applies to a prior communication-feel slice, not the rebuilt full loop. |
| The 0.95 second NOW window works with real speech | **UNPROVEN** | No PTT-to-apply latency trace exists; the earlier 1.8 second advisory budget leaves almost no preparation headroom. |
| Driver relationship, 2AM Test, and 10-second Clip Test pass | **UNPROVEN** | These require humans and spectators, not simulation output. |
| The current visual/audio layer is shippable | **REJECTED** | Cockpit, car, track presentation, UI, and browser WebAudio remain placeholders. |

M2 is therefore a valuable behavioral asset and an insufficient product proof.
It earns preservation and further testing; it does not earn a platform freeze.

## Assumption Register

States are UNPROVEN, SUPPORTED, REJECTED, or REVISE.

| ID | Assumption | State | Evidence and required action |
| --- | --- | --- | --- |
| A01 | Steam PC should be the primary commercial target. | **SUPPORTED** | Explicit product decision and North Star platform strategy; evaluate native Windows/Steam paths. |
| A02 | A pure TypeScript core is directly reusable in any engine. | **REVISE** | Behavior and data are highly reusable; source code is not directly reusable in C# engines. Preserve contracts and golden traces, then port. |
| A03 | Moving to a native engine automatically creates premium feel. | **REJECTED** | Engines raise the ceiling; authored camera, audio, feedback, assets, and tuning create the experience. Make the spike demonstrate the delta. |
| A04 | The present NOW window is compatible with voice. | **UNPROVEN** | Measure speech start/end, transcript, intent, action apply, acknowledgement, and outcome before accepting or retuning it. |
| A05 | The role split makes both characters necessary. | **SUPPORTED STRUCTURALLY / UNPROVEN HUMANLY** | Projections are correct; blind players have not yet demonstrated mutual dependence. |
| A06 | Hybrid Driver is safer and more fun than fully generative dialogue. | **SUPPORTED AS RISK CONTROL / UNPROVEN AS EXPERIENCE** | It protects timing and offline play. Compare authored-only, hybrid, and optional-generative sessions with humans. |
| A07 | More generative dialogue creates a better relationship. | **UNPROVEN** | Banter can become chatbot theater or cover dead racing. A/B test with generation disabled. |
| A08 | Wheel/FFB must drive the engine decision now. | **REJECTED FOR SOLO CORE** | The solo player is the Engineer, not the Driver. Keep gamepad support important; defer wheel/FFB weight until Human Driver duo. |
| A09 | A realistic vehicle-physics stack is required for authenticity. | **REJECTED** | COPY THAT? needs Formula fantasy authenticity and deterministic causality, not a tire/aero simulator. |
| A10 | A backend is required for the first Steam build. | **REJECTED** | Solo/offline play, local saves, and packaged builds need none. Add a thin service only for cloud keys/quotas or later multiplayer evidence. |
| A11 | More browser QA is required before considering native. | **REVISE** | One browser human/fun gate is valuable; responsive, hosting, cross-browser, and WebRTC production QA are not. |
| A12 | Current Moment markers can become a clip/replay system. | **SUPPORTED TECHNICALLY / UNPROVEN VIRALLY** | Preserve semantic events and seeds; test whether spectators understand marked moments before building an editor. |
| A13 | Native duo should use authoritative dedicated servers. | **UNPROVEN** | Two-player co-op may work with Steam lobbies and relay P2P. Choose topology only after cheating, persistence, and latency requirements exist. |
| A14 | Unreal is necessary to achieve acceptable Formula visuals. | **REJECTED AT CURRENT SCOPE** | Its ceiling is real, but no evidence says Godot/Unity cannot deliver the stylized cockpit target; Unreal magnifies solo-dev and AAA-scope risk. |
| A15 | The current hard-coded M2 sequence will scale into a full product. | **UNPROVEN** | Move event content/tuning into composable data and prove conditional incidents/opponents before authoring many tracks. |

The register should be updated by evidence, not by consensus. A failed test may
change a status; a new tool announcement may not.

## 1. Engine and platform audit

### Product-specific weights

Wheel/FFB receives only 2% today because the commercial solo loop is Engineer
play. Native mic/audio, deterministic parity, solo iteration, cockpit
readability, and Windows packaging matter much more.

| Criterion | Weight |
| --- | ---: |
| Deterministic-core parity and testability | 24% |
| Solo-dev iteration, debugging, and failure recovery | 20% |
| Cockpit/camera/audio/speed-feel ceiling | 18% |
| Steam/Windows packaging and native integration | 13% |
| Asset/content pipeline | 10% |
| Long-term maintainability and licensing predictability | 8% |
| Human duo/networking path | 5% |
| Wheel/FFB ceiling for later Human Driver | 2% |

These weights are an audit prior, not test results.

### Candidate comparison

| COPY THAT? concern | Three.js + Vite, optionally desktop-wrapped | Godot C# | Unity C# | Unreal |
| --- | --- | --- | --- | --- |
| Existing M2 reuse | **Best direct reuse.** TypeScript runs unchanged. | Behavioral reuse high; source port required. | Behavioral reuse high; source port required. | Behavioral reuse high; largest rewrite/tooling jump. |
| Deterministic core | Already proven, if renderer remains read-only. | Plain C# core can remain outside Nodes/physics. | Plain C# assembly can remain outside MonoBehaviours/physics. | Possible, but engine patterns and tooling add more surface area. |
| Solo iteration | Fastest today; browser/dev server already works. | Likely strongest native solo ROI; lightweight and MIT. Must measure C# build/editor friction. | Strong editor/profiler/ecosystem; heavier project and package surface. | Highest onboarding/content/tool overhead. |
| Formula presentation | Current ceiling is limited by custom pipeline work, not WebGL alone. Native add-ons complicate desktop polish. | Adequate-to-strong stylized 3D ceiling; smaller racing/audio ecosystem. | Strongest shortlist prior for camera, rendering, assets, audio, profiling, and commercial middleware. | Highest theoretical ceiling and strongest temptation to build the wrong AAA racing game. |
| Mic/audio | Browser APIs work, but native device/latency paths require desktop/native integration. | Native microphone and audio buses are built in. | Native microphone and mature audio tooling are built in. | Strong native audio stack. |
| Steam integration | Possible through Electron/native Node modules, with ABI/build maintenance. | Community binding required; Valve lists third-party GodotSteam. | Community binding required; Valve lists Steamworks.NET/Facepunch alternatives. | Native Steam support is listed by Valve, but this does not offset scope cost. |
| Gamepad | Browser gamepad can validate basics; Steam/native edge cases add work. | SDL-backed joypad support and vibration; verify mappings in packaged build. | Input System documents gamepads and generic joystick/racing-wheel HID paths; verify target devices. | Strong. |
| Wheel/FFB | Weakest and most custom. | No verified built-in steering FFB path in reviewed docs; native extension/device SDK spike required. | Racing-wheel input is documented, but FFB is not a guaranteed built-in outcome; plugin/device SDK spike required. | Strongest likely ecosystem, still irrelevant to current solo loop. |
| Duo/networking | Custom web/network stack or Steam native bridge. | Engine networking plus Steam binding; exact transport needs a spike. | Netcode plus Steam transport/binding; more ecosystem options. | Strong, but premature. |
| Asset pipeline | GLB/browser optimization is known; tools are custom. | First-class glTF/GLB and simple scene import. | Broad DCC/Asset Store/import ecosystem. | Broadest/heaviest. |
| Runtime/performance headroom | Current small deterministic slice is not performance-bound, but JS/DOM/WebGL and any native bridge add future profiling surfaces. | Native renderer and profiler should raise headroom; verify C# interop and frame pacing with the real slice. | Strong native profiler/render pipeline prior; package/bloat and project settings still require discipline. | Highest ceiling and highest content/runtime complexity. |
| Build/deploy | Web build is proven; packaged Steam desktop path is not. | Direct Windows export; C# requires .NET edition/SDK. | Direct Windows standalone builds and development profiling. | Direct desktop builds with highest tool footprint. |
| Migration cost | Lowest now; a Steam desktop wrapper and native integrations would still be new work. | Medium/high: port the core and rebuild presentation, then maintain community Steam binding. | Medium/high: same core/presentation port plus a heavier project/package surface. | Highest: largest tooling, architecture, and content jump. |
| Licensing/cost | Open-source libraries; Electron/app dependencies still need license review. | MIT engine, commercial use allowed with notice. | Personal is currently free up to USD 200k revenue/funding; Pro is currently USD 2,310/year/seat above that threshold. | Royalty/business terms add complexity after revenue thresholds. |
| Long-term maintenance | Custom-engine responsibilities accumulate around input, native APIs, tooling, editor, and packaging. | Engine source and simple licensing reduce vendor risk; smaller integrations can shift maintenance to the team. | Ecosystem lowers some integration risk; package/version and commercial-policy exposure are higher. | Highest project complexity for this team/scope. |

Relevant first-party facts: Three.js describes itself as a 3D library rather
than a complete game engine; Electron can package desktop apps and load native
modules, but native modules introduce their own build/ABI lifecycle.
[Three.js game manual](https://threejs.org/manual/en/game.html),
[Electron distribution](https://www.electronjs.org/docs/latest/tutorial/application-distribution),
[Electron native code](https://www.electronjs.org/docs/latest/tutorial/native-code-and-electron).

Godot is MIT-licensed, supports desktop .NET exports, and currently cannot
export Godot 4 C# projects to Web. That is acceptable because the existing web
harness can remain separate.
[Godot license](https://godotengine.org/license/),
[Godot C# basics](https://docs.godotengine.org/en/stable/tutorials/scripting/c_sharp/c_sharp_basics.html),
[Godot Windows export](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_windows.html),
[Godot microphone recording](https://docs.godotengine.org/en/stable/tutorials/audio/recording_with_microphone.html),
[Godot Input](https://docs.godotengine.org/en/stable/classes/class_input.html).

Unity's current 2026 terms make Personal free up to USD 200k in annual revenue
and funding, while its current Windows, microphone, Input System, and Netcode
documentation support a serious production spike.
[Unity 2026 pricing](https://unity.com/products/pricing-updates),
[Unity Windows builds](https://docs.unity3d.com/6000.0/Documentation/Manual/WindowsStandaloneBinaries.html),
[Unity microphone](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Microphone.Start.html),
[Unity Input supported devices](https://docs.unity3d.com/Packages/com.unity.inputsystem@1.14/manual/SupportedDevices.html),
[Unity Netcode](https://docs-multiplayer.unity3d.com/netcode/current/about/).

Valve's own integration table identifies the official Steamworks API as C++ and
lists third-party bindings for both Godot and Unity. This is a shared dependency
risk, not a reason to pretend either engine has zero-cost Steam integration.
[Steamworks API overview](https://partner.steamgames.com/doc/sdk/api?language=english).

### Engine verdict

- **Two-week, USD 20 validation:** keep Three.js/Vite. It is already paid for,
  directly runs M2, and gives the fastest human evidence. Spend nothing on a
  desktop wrapper or Steam store setup.
- **Twelve-month, USD 100k product prior:** a native engine is more likely to
  win because the product needs durable Windows packaging, mic/audio, cockpit
  feel, asset iteration, profiling, and later Steam/duo support.
- **Shortlist:** Godot C# and Unity C#. Godot leads cost, openness, simplicity,
  and solo-dev reversibility. Unity leads the current prior for 3D production
  ecosystem and commercial ceiling.
- **Control:** retain Three.js in the spike scorecard. A native candidate must
  beat it enough to repay port and long-term complexity.
- **No winner yet:** neither Godot nor Unity is installed in the checked common
  local locations or available on PATH, and no same-slice packaged comparison
  exists.

## 2. Core architecture audit

### Keep as product authority

- one authoritative 60 Hz fixed-step simulation;
- seeded, deterministic outcomes and stable event ordering;
- a single constrained action queue for buttons, text, voice, AI, replay, and
  later network inputs;
- immutable Engineer, Driver, Presentation, and Diagnostics views;
- explicit reason codes and semantic Moment events;
- persistent grip, heat, stability, damage, gap, and position;
- track pressure, conditional incidents, opponent behavior, and personality as
  composed inputs rather than renderer behavior;
- the protected overtake timing model and its measured characterization;
- retry as deterministic state reset, including cancellation semantics.

This should remain engine-agnostic. Native physics, animation, audio, camera,
UI, networking, and AI may observe and request actions; none may become a
second race authority.

### Modify before a native port

The present core is conceptually engine-agnostic but not yet a portable product
contract. Before porting:

1. define versioned serializable action, state, view, event, and reason-code
   schemas;
2. record golden traces at named ticks for AFK, conservative, good, wrong,
   timing-shift, retry, and 30/60/120 render partitions;
3. include seed, content/tuning version, track checksum, ordered action receipt,
   event receipt, and selected state hashes;
4. move hard-coded encounter distances and tunables into validated content
   data where doing so does not weaken determinism;
5. serialize role-view omission tests, not merely state equality;
6. sample Three.js curve results into engine-neutral fixtures before replacing
   CatmullRom/frame math.

The goal is behavioral compatibility, not line-for-line translation.

### Port or delete by layer

| Current area | Verdict | Native migration treatment |
| --- | --- | --- |
| raceSimulation.ts | **KEEP CONTRACT / PORT** | Re-express as plain C# after golden fixtures exist. Do not embed Node/TypeScript in the shipping native game. |
| fixedStep.ts | **KEEP SEMANTICS / PORT** | Keep tick rate, clamp policy, ordering, and render interpolation separate. |
| raceCorridor.ts and vehicleSpec.ts | **KEEP MATH / PORT** | Port pure envelope logic and compare against golden samples. |
| trackSpec.ts | **KEEP DATA / MODIFY** | Convert to versioned neutral data with checksums. |
| overtakeModel.ts and overtakeSimulation.ts | **KEEP / PORT BY CHARACTERIZATION** | Preserve timing and outcome matrices exactly until new failing evidence exists. |
| scripts/sim-race.ts and other simulators | **KEEP AS ORACLE / MODIFY** | Convert expected outcomes to cross-runtime fixtures; keep both runtimes during cutover. |
| trackGeometry.ts and trackValidation.ts | **PORT PARTIALLY** | Specification/metrics survive; Three.js vectors, curve frames, rendering geometry do not. |
| raceSimulationAdapter.ts | **DELETE AFTER PARITY** | It is a transitional legacy/browser compatibility layer. |
| main.ts, DOM HUD/panels, browser audio | **KEEP ONLY FOR TEST, THEN DELETE OR ARCHIVE** | Do not port structure blindly; rebuild presentation around selected native engine. |
| raceSession.ts and legacy gameplay paths | **DELETE AFTER NATIVE/FULL-RUN PARITY** | They are regression references, not a second production authority. |

### Target boundary

~~~text
mic / text / buttons / replay / later network
                    |
          constrained Intent Router
                    |
        ordered, versioned Action queue
                    |
        60 Hz deterministic Race Core
             /        |         \
      Engineer     Driver     Presentation
        view        view      events + Moments
          |           |             |
          UI      radio planner   renderer / audio /
                                  telemetry / Steam Timeline

Cloud or local AI may propose dialogue or a constrained action.
Only the Race Core applies state changes.
~~~

## 3. Voice and AI audit

### Architecture verdict

**KEEP and formalize: AI-provider agnostic + AI-optional core + Hybrid Driver.**

Use four replaceable lanes:

1. **Critical/common radio:** authored/prerecorded lines, local command grammar,
   immediate deterministic acknowledgement, and text/icon fallback. No network
   round trip may gate a brake, cover, lift, push, or retry action.
2. **Speech recognition:** one interface returning transcript hypotheses,
   locale, confidence, and timestamps. It may be cloud or local. Low confidence
   must clarify or reject; it must never silently mutate the race.
3. **Selective generation:** clarification, personality, banter, and memory
   expression only. It receives a redacted event summary, is cancellable, and
   cannot invent telemetry or directly control the car.
4. **Voice rendering:** prerecorded common lines first; optional local/cloud TTS
   for noncritical variation. Missing service falls back without blocking play.

The default Steam UX must not ask players for an API key. A production cloud
option needs a developer-owned thin broker, short-lived client credentials
where supported, quotas, spend caps, and an offline fallback. Push-to-talk,
visible mic state, no voice retention by default, and a clear privacy control
are baseline UX requirements.

### Provider screen

| Option | Role it can earn | Verdict | Main risk / required proof |
| --- | --- | --- | --- |
| Prerecorded lines + local grammar | Critical/common radio and zero-cost fallback | **USE NOW** | Less novelty; test whether authored variation is enough for relationship. |
| whisper.cpp local STT | Offline EN/KR command transcription candidate | **EXPERIMENT** | Hardware variance, model size, Korean/noise accuracy, packaging. Benchmark on min-spec CPU/GPU. |
| llama.cpp + a small open model | Optional offline clarification/personality | **DEFER / EXPERIMENT LATER** | Install size, warm-up, RAM/VRAM, quality variance, and model licenses. Never require it for core play. |
| Local TTS such as Piper | Offline optional line rendering | **EXPERIMENT, LICENSE REVIEW FIRST** | Voice quality/languages and GPL integration/distribution strategy. Prerecorded remains safer. |
| OpenAI Realtime/STT/TTS | Integrated cloud reference and possible optional personality path | **EXPERIMENT, DO NOT LOCK** | Network, recurring audio cost, service dependency, secure credentials. |
| Gemini Live/Transcribe | Competing real-time cloud reference | **EXPERIMENT** | Preview/model churn, session limits, compounding context billing, secure client authentication. |
| Groq Whisper STT | Focused fast hosted transcription candidate | **EXPERIMENT** | Still online; minimum billing and end-to-end performance must be measured with game noise. |
| Qwen Audio Realtime / Model Studio | Regional/cloud alternative and open-model family | **EXPERIMENT ONLY IF CORPUS JUSTIFIES** | It must first prove EN/KR quality; region/API/model variation, operational complexity, and local model size remain risks. |
| MiniMax speech/LLM | Voice audition or noncritical TTS alternative | **USE LATER / BAKE-OFF ONLY** | Adds another vendor without proving the core; current value is voice/cost competition, not authority. |
| Fully generative Driver for every line | None | **REJECTED** | Latency, hallucinated evidence, cost, offline failure, and loss of authored character/timing. |

Official capability references:

- [OpenAI Realtime model](https://developers.openai.com/api/docs/models/gpt-realtime)
  supports realtime text/audio over WebRTC, WebSocket, or SIP; it is a cloud
  candidate, not the architecture.
- [Gemini Live capabilities](https://ai.google.dev/gemini-api/docs/live-api/capabilities)
  document native audio, VAD, multilingual output, client-auth constraints, and
  session limits. [Gemini Live billing guidance](https://ai.google.dev/gemini-api/docs/live-api/best-practices)
  warns that retained context is reprocessed, so long conversational sessions
  can compound cost.
- [Groq speech-to-text](https://console.groq.com/docs/speech-to-text) exposes
  multilingual Whisper models and current per-audio-hour pricing.
- [Qwen Audio Realtime](https://www.alibabacloud.com/help/en/model-studio/realtime)
  exposes realtime multimodal/audio service paths; it still must pass the same
  corpus and region/operations gate.
- [MiniMax pay-as-you-go](https://platform.minimax.io/docs/guides/pricing-paygo)
  provides current text and speech pricing, useful only after measured usage is
  known.
- [whisper.cpp](https://github.com/ggerganov/whisper.cpp),
  [llama.cpp](https://github.com/ggml-org/llama.cpp), and
  [Piper](https://github.com/OHF-Voice/piper1-gpl) show feasible local runtimes;
  feasibility is not proof on COPY THAT?'s target hardware or languages.

### Fast provider experiment

Build one fixed corpus, not five integrations:

- 20 English and 20 Korean intended race calls;
- the same 40 under representative engine/radio noise;
- 20 ambiguous, conversational, or out-of-vocabulary negatives;
- at least two speakers per language where available;
- log PTT down/up, first partial, final transcript, intent decision, simulation
  apply, acknowledgement start/end, cost, and failure/fallback reason.

Hard safety gate: zero wrong race mutations on negative/ambiguous samples.
Latency target is a hypothesis: p95 PTT-up-to-apply at or below 500 ms for
single critical commands. If candidates miss it, redesign the interaction
window or use an earlier/local grammar decision; do not hide the miss by
changing providers repeatedly.

## 4. Game and product design audit

### Preserve

- conversation-first control;
- Engineer NEXT/GLOBAL versus Driver NOW/FEEL;
- evidence, never answers;
- No Empty Racing;
- silence has deterministic consequences;
- DDD failure, explanation, retry, and mastery;
- 2AM Test plus 10-second Clip Test;
- track pressure × persistent state × conditional incidents × opponent
  behavior × Driver personality;
- Hybrid Driver and AI-optional core;
- deterministic seed/action/event traces for replay and fairness.

### Modify or constrain

- Do not let authored beats become a linear prompt carousel. Incidents must be
  conditional on carried state, timing, route, and opponent behavior.
- Do not expose a correct-answer UI because voice recognition is imperfect.
  Clarification is a character interaction, not a multiple-choice answer key.
- Do not use banter to fill empty track time. Every calm period must support
  anticipation, diagnosis, relationship, or consequence.
- Separate mechanical mastery from content quantity. One rival that feints,
  reacts, and remembers is more valuable than many inert cars.
- Define DDD reason codes before spectacle so every crash can be explained
  without a post-hoc story.

### Evidence status

The old full run establishes that a complete browser shell and retry loop exist,
but it also demonstrates the problem: AFK can finish, only a few calls matter,
and long gaps contain little play. M2 is the first credible repair, not the
finished proof. Do not scale tracks, incidents, Drivers, or Contracts until one
connected 3–5 minute run validates the thesis.

## 5. Visual, audio, and vehicle-feel audit

A native engine raises the ceiling in packaged audio/device access, profiling,
camera/editor iteration, asset ingestion, and effects. It does not prove the
game will feel faster, clearer, or more authentic.

The production target is **Formula fantasy authenticity**, not licensed F1
simulation:

- cockpit-first spatial context and a rival that is readable at a glance;
- camera motion that communicates speed, braking load, visibility, and impact
  without obscuring tactical evidence;
- layered engine, wind, tire, radio, impact, and silence that are driven by
  authoritative state;
- crash/contact readability that maps directly to reason codes;
- stylized track landmarks that help the Engineer form a mental model;
- stable 60 Hz authority with interpolation; render features may never change
  outcomes.

Native-spike visual/audio test:

1. use the same greybox car, track segment, seed, and M2 trace in both engines;
2. add one cockpit camera, one external debug camera, engine/wind/tire layers,
   radio ducking, crest visibility, rival attack, and one contact consequence;
3. package a Windows build and capture the same 10-second moment;
4. ask blind viewers what happened, what the Engineer knew, and why the result
   changed;
5. score authoring time, iteration time, frame pacing, audio latency, camera
   readability, and debugging—not screenshot beauty alone.

AAA scope alarms:

- no licensed grid, open world, dynamic weather, pit crew simulation, or
  sim-grade tire/aero model;
- no mass multiplayer or esports infrastructure;
- no photoreal asset mandate before the greybox loop passes 2AM/clip gates;
- no engine choice justified mainly by vehicle physics or wheel FFB;
- no post-processing that hides evidence or makes crashes less legible.

## 6. Creator, viral, Contracts, and duo

### Now

- Keep semantic Moment events, reason codes, seed, action receipts, and
  pre/post-event time bounds.
- Keep the HUD facecam-safe and spectator-readable, but do not build a creator
  mode yet.
- Include a replayable deterministic trace in every playtest artifact.
- Test the 10-second clip with observers who have not played.

### Later, after the connected run passes

- Map high-value domain events to Steam Timeline. Valve's feature is designed
  to help players find, save, and share moments, and games can enrich it with
  event calls. It complements rather than replaces COPY THAT?'s event model.
  [Steam Timelines](https://partner.steamgames.com/doc/features/timeline?language=english).
- Build lightweight replay from seed + ordered actions + versioned content,
  then add camera/audio reconstruction.
- Add Contracts/Hardcore, attempt counters, and shareable seeds only after the
  base run is replay-worthy.
- Use [Steam Playtest](https://partner.steamgames.com/doc/features/playtest?language=english)
  for controlled external testing after a store presence exists; use a polished
  [Steam demo](https://partner.steamgames.com/doc/store/application/demos?language=english)
  only when it can influence purchase intent.

### Defer

- Human Driver × Human Engineer, role swap, Steam lobbies/relay networking, and
  wheel/FFB.
- Audience modifiers, Workshop/mod tooling, full clip editor, cloud replay
  storage, and creator analytics.

Duo is a strong long-term expression of the thesis, but implementing it before
the AI Driver relationship and solo Engineer loop work would multiply ambiguity.

## 7. Cost and operations

### USD 20 / two-week validation lens

- Spend USD 0 on engines: Godot is MIT; Unity Personal is also free only if the
  project owner remains within its current revenue/funding eligibility threshold.
- Spend USD 0 on Steam Direct; the current USD 100 per-app fee exceeds this
  experiment budget and is only needed when creating the Steam application.
  [Steam Direct fee](https://partner.steamgames.com/doc/gettingstarted/appfee?language=english).
- Spend USD 0 on new plugins, cloud hosting, analytics, backend, generated
  assets, or production voice.
- Use the existing web M2 slice, local recordings/Wizard-of-Oz radio, free local
  runtimes, and tightly capped cloud trial credits only if the voice corpus
  needs a reference.
- The deliverable is evidence and a decision, not a store build.

### USD 100k / twelve-month product lens

Prioritize the scarce budget in this order:

1. development time and the connected deterministic run;
2. cockpit/track/rival art direction and authored audio/voice;
3. blind playtests, accessibility, EN/KR localization, and min-spec hardware;
4. native packaging, crash reporting, Steam integration, and QA;
5. capped optional AI inference and a thin broker only after measured value;
6. marketing/demo assets after the product creates genuine clips.

Cloud voice cost must be modeled from observed sessions:

monthly inference cost = active players × runs per player × generative minutes
per run × measured provider cost per minute.

Track p50/p95 latency, fallback rate, and cost per completed run. Set a
server-side spend ceiling. Do not subsidize unlimited generative listening when
critical gameplay can be local.

### Backend, telemetry, and crash reporting

- **Now:** local structured traces only. No account system or gameplay backend.
- **Optional cloud voice alpha:** thin key broker, ephemeral/session-scoped
  credentials where supported, quota, abuse protection, and no long-lived key
  in the client.
- **Duo later:** evaluate Steam lobbies plus Networking Sockets/relay before a
  dedicated server. Valve documents relay-backed modern networking APIs that
  can hide player IPs.
  [Steam Networking](https://partner.steamgames.com/doc/features/multiplayer/networking?language=english).
- **Telemetry later:** opt-in event funnels based on domain events, not raw
  microphone data. Default to no audio retention and minimize transcripts.
- **Crash reporting later:** use a maintained native service such as Sentry or
  engine diagnostics once packaged builds reach external alpha. Steam Error
  Reporting is nearing end-of-life and limited to 32-bit Windows, so it is not
  a production foundation.
  [Steam Error Reporting](https://partner.steamgames.com/doc/features/error_reporting?language=english).

GitHub Student Developer Pack may reduce incidental costs—currently including
GitHub Pro and a renewable-limited Sentry student offer—but benefits change and
must not decide architecture. Recheck only when a paid need appears.
[GitHub Student Developer Pack](https://education.github.com/pack/).

## 8. Skills, plugins, and model routing

No plugin installation is justified by this audit. The current task needed repo
inspection, first-party research, and game-architecture judgment; adding tools
would be tool theater.

| Tool or workflow | Verdict | Operating rule |
| --- | --- | --- |
| Game Studio: web-game-foundations | **USE NOW** | Used for this platform/core boundary audit. |
| Game Studio: game-playtest | **USE NEXT** | Use for the narrow browser human-evidence setup and later native packaged QA. It cannot replace human fun judgment. |
| Game Studio: three-webgl-game | **USE ONLY FOR CURRENT HARNESS** | Maintain the validator; do not let Three.js-specific practice bias native selection. |
| Game Studio: game UI / 3D asset pipelines | **USE LATER** | Load only after an engine/art test has a concrete deliverable. |
| CodeRabbit | **USE LATER** | Independent review for the contract extraction and port PRs; not a product or balance authority. |
| GitHub | **USE NOW** | Preserve clean checkpoints, branches/worktrees, issues, and reviewed diffs. Do not create remote noise for an audit-only pass. |
| Sentry | **USE LATER** | Add to packaged external-alpha builds; not the local prototype. |
| Figma | **USE LATER** | Use after the evidence/HUD information contract is stable enough to design, not before. |
| Remotion | **SKIP NOW** | It may help marketing exports later; it is not the game replay/Moment engine. |
| Cloudflare | **SKIP NOW; POSSIBLE LATER** | Consider only for a thin AI broker/edge quota path after cloud value is proven. |
| Vercel / Sites / Netlify deployment work | **SKIP NOW** | Web hosting is no longer the product gate. |
| GitHub Student Pack | **USE SELECTIVELY LATER** | Claim a benefit only when it offsets a real approved cost. |

Installed/exposed app capabilities observed in this session include GitHub,
Plugin Management, Sites, and Spreadsheets. Figma and Cloudflare are available
to install but are not needed for this decision. No engine executable was
found on PATH or in the checked common Godot/Unity install locations.

### Codex model routing

Model choice is a risk/cost control, never authority:

| Work | Default routing |
| --- | --- |
| North Star conflict, engine boundary, migration plan, difficult deterministic bug, security/privacy boundary | **Sol, high reasoning** |
| Normal feature integration, tests, documentation, PR synthesis | **Terra, medium/high as needed** |
| Bounded mechanical fixtures, localization tables, repetitive code edits, log extraction | **Luna, low/medium** |
| Final behavior-changing merge | Use the cheapest model that succeeded, then require deterministic tests, diff review, and human evidence; escalate on ambiguity. |

Current OpenAI model pages position Sol as the flagship complex coding/reasoning
model, Terra as the balanced coding model, and Luna as the cost-efficient
option. Their API token prices are not the same thing as Codex app quota, so
do not invent a precise task-cost formula from API prices.
[OpenAI model catalog](https://developers.openai.com/api/docs/models).

## 9. The web-proof question

### Worth doing before native work

One minimal existing-presentation **core-fun test** is high value because it is
the fastest way to test whether the behavior worth porting creates
understanding, pressure, and retry desire.

The binding procedure, thresholds, and verdict rules are frozen in
`docs/human-test-protocol.md`. If this audit's earlier provisional wording
differs, that protocol controls.

Exact test:

1. Recruit six first-time players; each completes two runs. Record language as
   context, not as a pass criterion.
2. Give only the role premise, not the correct actions.
3. Run start → Driver feel → blind crest → rival defence → visible consequence
   → retry, twice per player.
4. On the first run, let the tester speak naturally; a hidden facilitator may
   map speech to the existing deterministic buttons as a clearly labeled
   Wizard-of-Oz test. Do not pretend this measures STT latency.
5. Record screen, room/game audio, seed, actions, events, state hashes, pauses,
   and spontaneous comments.
6. After the first result ask: What did you know, what did the Driver know, why
   did the outcome happen, and what would you change?
7. Show one 10-second crest/defence/consequence clip to at least three
   nonplayers and ask them to describe the conflict and result.

Frozen pass signal:

- at least four of six players explain why the Engineer is needed: the Engineer
  contributes NEXT/GLOBAL information the Driver lacks;
- at least four of six show clearly better judgment, timing, or result on Run 2;
- at least four of six initiate or express Retry desire without prompting;
- when failure or a missed objective occurs, at least four of six identify its
  approximate causal decision, timing, or silence without an answer being
  supplied; and
- at least two of three observers identify both the danger and the judgment
  that produced the 10-second clip's result.

`PASS` requires every threshold. `FAIL` and `INCONCLUSIVE`, including
presentation-ceiling diagnosis and minimum retest rules, are defined in the
protocol. The sample is a directional falsification gate, not statistical
product validation. A non-pass cannot advance to an engine spike.

### Not worth doing now

- cross-browser/device compatibility matrix;
- responsive small-viewport polish;
- Netlify/Vercel/Sites deployment;
- production WebRTC/security/scale work;
- browser-specific audio or graphics optimization;
- screenshots marketed as release evidence;
- full web release QA.

A build/smoke check remains useful whenever the harness changes. It is not a
Steam product milestone.

## 10. Migration strategy if native wins

### Phase 0 — Evidence gate

Run `docs/human-test-protocol.md` without changing its thresholds. Do not
rewrite while the core reason to migrate is still hypothetical.

### Phase 1 — Freeze the behavioral contract, not the engine

Only after a human-test `PASS`, create schemas and golden traces from 5a98f95.
Tag a clean checkpoint. The existing web runtime becomes the read-only oracle
for the port.

### Phase 2 — Boxed Godot C# versus Unity C# spike

Use separate branches/worktrees and the same inputs/assets. Limit each candidate
to the same deliverable:

- plain C# M2 core loading the same neutral fixture;
- identical seed/actions and key-tick state/event hashes;
- one cockpit greybox, crest, rival, and consequence;
- one layered engine/wind/tire/radio audio pass;
- push-to-talk microphone capture plus deterministic text/button fallback;
- gamepad action map;
- packaged 64-bit Windows development build;
- measured edit-to-play and edit-to-package cycles;
- profiler/frame pacing capture;
- a documented path to Steam initialization and later relay networking.

Do not create custom art, full race physics, multiplayer, generative dialogue,
or a production backend inside the spike.

Hard gates:

- exact action/event order, outcome class, retry semantics, and role omissions;
- deterministic traces under 30/60/120 render schedules;
- no engine physics or frame callback changes authority;
- packaged build starts cleanly and records the latency timestamps;
- no critical call requires network AI;
- no blocker in the maintained Steam binding path;
- the candidate materially improves authoring or presentation versus the web
  control.

Score the measured spike with the product weights above. A difference smaller
than 5 weighted points is not decisive; prefer the simpler/cheaper/reversible
candidate or run one targeted tie-breaker. Record tool versions and exact
hardware.

### Phase 3 — Freeze and port one vertical run

Choose the winner once, checkpoint it, and port by parity:

1. core schemas/tests;
2. track/corridor and role views;
3. M2 first three beats;
4. unseen incident, feint/switch, protected NOW, final defence;
5. presentation/audio/voice adapters;
6. packaged Steam-oriented run and human gates.

Keep the web oracle until the native run has deterministic and human parity.

### Phase 4 — Cutover and deletion

Only after native parity:

- remove the transitional adapter and legacy second authority;
- archive or delete browser product-only UI/audio paths;
- retain a minimal web demo only if it still earns discovery/viral value;
- create a clean Git checkpoint with exact verification and RESUME HERE.

Rollback is always the last passing phase checkpoint. No destructive migration
is needed before a winner exists.

## Highest expected-value changes

Maximum five, ranked:

| Rank | Change | Why it is better | What it gives up | Fastest experiment | Kill/discard criterion |
| ---: | --- | --- | --- | --- | --- |
| 1 | **EXPERIMENT: narrow blind M2 core-fun test** | Prevents months of porting an unproven interaction; tests causal understanding and retry desire. | Delays native work by one evidence pass and accepts ugly presentation. | Six players, two runs, Wizard-of-Oz speech, three clip observers. | Any frozen protocol threshold misses; revise the identified core or presentation ceiling before platform work. |
| 2 | **MODIFY: engine-neutral schemas and golden traces** | Converts valuable M2 behavior into a portable contract and makes migration reversible. | Gives up the illusion of a quick line-by-line port; adds fixture discipline. | Serialize the four canonical paths and reproduce one in a tiny C# console harness. | If the schema cannot express current role omissions/events without engine types, redesign the boundary before any engine spike. |
| 3 | **EXPERIMENT: equal Godot C# vs Unity C# native spike** | Makes every dependency earn its place against the web control using COPY THAT?'s actual slice. | Gives up an immediate emotional engine choice and some duplicated spike work. | Same greybox/seed/audio/mic/package scorecard, isolated worktrees. | Candidate fails parity/hard gates or does not repay its iteration/migration cost. |
| 4 | **MODIFY: Hybrid radio with provider interfaces and local critical path** | Protects timing, privacy, offline resilience, and unit economics while preserving optional personality. | Gives up the fantasy of an unconstrained always-generative Driver. | One EN/KR corpus across authored/local plus two cloud references. | Any provider causes wrong critical mutation, cannot meet the interaction budget, or lacks a clean fallback. |
| 5 | **MODIFY: Formula-authentic state-driven camera/audio consequence slice** | Forces native engines and assets to improve comprehension, speed, tension, and clips—not just screenshots. | Gives up AAA vehicle/scope features that do not serve the Engineer loop. | Same 10-second crest/defence/consequence capture in both engines and blind viewer questions. | Viewers cannot explain the moment, or the native path adds cost without better authoring/readability than web. |

## Final freeze map

### Frozen now

- North Star and decision priority;
- Steam PC primary product, Web as validator/discovery/demo only;
- deterministic 60 Hz race authority;
- NEXT/GLOBAL versus NOW/FEEL information split;
- evidence-not-answers;
- one constrained action boundary;
- persistent state, deterministic consequences, reason codes, and Moment events;
- AI-provider agnostic, AI-optional core, Hybrid Driver;
- no BYO API key as default Steam UX;
- no deployment and no big-bang migration.

### Deliberately not frozen

- Three.js, Godot, or Unity as production engine;
- C# port details and content serialization format;
- production STT/LLM/TTS provider;
- local model bundle and minimum hardware;
- backend, telemetry vendor, Steam binding, or network topology;
- wheel/FFB;
- final art pipeline, renderer tier, replay editor, Contracts, and duo.

### Next decision

Run only the frozen existing-web protocol. `PASS` permits engine-neutral
fixtures and then the equal Godot/Unity spike. `FAIL` requires revision in the
existing harness first; `INCONCLUSIVE` permits only its documented minimum
retest.

Do not deploy. Do not start a production port. Do not call this audit a Fun
Gate, voice proof, or release proof.

## Source index

Repo truth:

- [North Star](./north-star.md)
- [Current project truth](./current.md)
- [M2 human-test protocol](./human-test-protocol.md)
- [Rebuild 2.0 design](./rebuild-2.0-design.md)
- [Overtake model evidence](./overtake-sim.md)
- [Codex log](./codex-log.md)

Steam:

- [Steamworks home](https://partner.steamgames.com/doc/home)
- [Steamworks API overview](https://partner.steamgames.com/doc/sdk/api?language=english)
- [Steam Input](https://partner.steamgames.com/doc/api/isteaminput?language=english)
- [Steam Voice](https://partner.steamgames.com/doc/features/voice?language=english)
- [Steam Networking](https://partner.steamgames.com/doc/features/multiplayer/networking?language=english)
- [Steam builds](https://partner.steamgames.com/doc/store/application/builds?language=english)
- [Steam Timelines](https://partner.steamgames.com/doc/features/timeline?language=english)
- [Steam Playtest](https://partner.steamgames.com/doc/features/playtest?language=english)
- [Steam demos](https://partner.steamgames.com/doc/store/application/demos?language=english)
- [Steam Direct fee](https://partner.steamgames.com/doc/gettingstarted/appfee?language=english)

Engines and runtime:

- [Three.js game manual](https://threejs.org/manual/en/game.html)
- [Electron distribution](https://www.electronjs.org/docs/latest/tutorial/application-distribution)
- [Electron native code](https://www.electronjs.org/docs/latest/tutorial/native-code-and-electron)
- [Godot license](https://godotengine.org/license/)
- [Godot C# basics](https://docs.godotengine.org/en/stable/tutorials/scripting/c_sharp/c_sharp_basics.html)
- [Godot Windows export](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_windows.html)
- [Godot microphone recording](https://docs.godotengine.org/en/stable/tutorials/audio/recording_with_microphone.html)
- [Godot networking](https://docs.godotengine.org/en/stable/tutorials/networking/index.html)
- [Godot runtime glTF/GLB loading](https://docs.godotengine.org/en/stable/tutorials/io/runtime_file_loading_and_saving.html)
- [Unity 2026 pricing](https://unity.com/products/pricing-updates)
- [Unity Windows builds](https://docs.unity3d.com/6000.0/Documentation/Manual/WindowsStandaloneBinaries.html)
- [Unity microphone](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Microphone.Start.html)
- [Unity Input supported devices](https://docs.unity3d.com/Packages/com.unity.inputsystem@1.14/manual/SupportedDevices.html)
- [Unity Netcode](https://docs-multiplayer.unity3d.com/netcode/current/about/)
- [Unreal Chaos Vehicles](https://dev.epicgames.com/documentation/en-us/unreal-engine/chaos-vehicles)
- [Unreal licensing](https://www.unrealengine.com/license)

Voice/AI and operations:

- [OpenAI model catalog](https://developers.openai.com/api/docs/models)
- [OpenAI Realtime](https://developers.openai.com/api/docs/models/gpt-realtime)
- [Gemini Live capabilities](https://ai.google.dev/gemini-api/docs/live-api/capabilities)
- [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [Groq speech-to-text](https://console.groq.com/docs/speech-to-text)
- [Qwen Audio/Omni Realtime](https://www.alibabacloud.com/help/en/model-studio/realtime)
- [MiniMax pay-as-you-go](https://platform.minimax.io/docs/guides/pricing-paygo)
- [whisper.cpp](https://github.com/ggerganov/whisper.cpp)
- [llama.cpp](https://github.com/ggml-org/llama.cpp)
- [Piper](https://github.com/OHF-Voice/piper1-gpl)
- [GitHub Student Developer Pack](https://education.github.com/pack/)
- [Steam Error Reporting](https://partner.steamgames.com/doc/features/error_reporting?language=english)
