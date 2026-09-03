# COPY THAT? Project Rules

## Read first

- Before any product, gameplay, physics, networking, voice, UI, camera, audio,
  platform, or engine decision, read docs/north-star.md and docs/current.md.
- Then read docs/steam-product-plan.md, docs/preproduction-plan.md, and
  docs/technical-decision-gates.md for the active product, stage, and evidence
  gates.
- docs/north-star.md is the product constitution. docs/current.md is the short
  operational source of truth. Neither implementation convenience nor a tool,
  skill, engine, or model outranks them.
- docs/codex-log.md and docs/legacy-diff-survival-review.md are decision history.
  docs/steam-zero-based-audit.md and docs/human-test-protocol.md are historical
  evidence from the superseded AI-solo/Web direction.

## Frozen product direction

- Steam PC is the primary commercial target.
- The flagship is online two-player asymmetric Human Driver × Human Engineer.
- Product thesis: Conversation is the control system. Driver drives the car.
  Engineer drives the race. Neither has enough information alone.
- Solo uses an AI teammate to fill the missing role. AI is a fallback,
  training, and accessibility path, not the flagship reason to exist.
- Voice/PTT is the primary communication interface. Typed chat and quick-command
  controls are accessibility, recovery, test, or debug paths, not normal-play
  flagship controls.
- The Driver has direct physical steering, throttle, brake, and gear input. The
  production vehicle target is simcade with a high mastery ceiling; spline or
  rail authority cannot be the production driving model.
- The Engineer selects and reads evidence sources. Engineer UI must impose a
  fair attention cost without suggesting answers or becoming a SaaS dashboard.
- Difficulty is easy to understand, hard to execute, harder to coordinate, very
  hard to master, and brutal at the highest stakes.
- Creator and hardcore design are core: facecam-safe presentation, spectator
  legibility, semantic Moment events, replay markers, Contracts, Hardcore,
  Attempt number, the 2AM Test, and the 10-Second Clip Test.

## Architecture and anti-inertia

- No production engine has been selected. Godot C# and Unity C# must earn a
  decision through equivalent measured spikes; add another candidate only when
  evidence justifies its cost.
- The existing Three.js/TypeScript/Vite build is a disposable research harness,
  historical evidence source, and possible future demo. It has no automatic
  production-preservation rights.
- Keep simulation, rendering, input, networking, voice, UI, replay, and platform
  adapters separated. Each role receives only its authorized information view.
- Preserve deterministic high-level consequences, ordered actions/events,
  explicit reason codes, and reproducible traces where they remain useful. Do
  not assume that existing TypeScript is the portable contract.
- An AI system never drives the car per frame and never owns authoritative race
  state. It may communicate or propose constrained actions through the same
  validated boundary as a human or accessibility input.
- Existing work has no preservation rights. Preserve only evidence and product
  value that survive the current North Star.

## Current stage and scope control

- The project is in Product Reset / Risk Prototype, not Production.
- Do not extend legacy Web M2 as the production game, port TypeScript by inertia,
  build full content, select an engine from feature lists, deploy, or begin a
  production architecture without the gate in docs/preproduction-plan.md.
- A prototype must name the risk, cheapest falsifiable test, success threshold,
  failure interpretation, disposable parts, and evidence artifact before code.
- Do not silently promote a prototype result into a product decision.

## Verification

- For documentation-only work, inspect the complete diff and run git diff
  --check. Do not rerun game tests when gameplay code returns exactly to the
  prior checkpoint; record that executable evidence remains historical.
- For later behavior changes, run only relevant deterministic checks plus an
  actual role-appropriate playtest. Builds and simulators are not proof of fun,
  voice, online play, spectator clarity, or release readiness.
- Browser or rendered work needs representative screenshots. Online/voice work
  needs two-machine latency, packet-loss, reconnect, privacy, mute/block/report,
  and accessibility evidence. Vehicle work needs measured input-to-response and
  repeatable handling evidence.
- Keep debug surfaces gated from normal play. Never expose secrets or long-lived
  service credentials in a client.

## Git and documentation discipline

- Inspect git status and the complete relevant diff before editing and before
  committing. Preserve unrelated user work.
- Leave a clean, reversible checkpoint after a material approved milestone.
  Keep docs/current.md short and end it with an exact RESUME HERE sequence.
- Do not commit generated builds, recordings, secrets, dependency caches, or
  unrelated artifacts.
- Do not force-push, rebase shared history, deploy, or delete historical evidence
  unless the user explicitly requests it.

## Document roles

- docs/north-star.md: stable product constitution and falsification laws.
- docs/steam-product-plan.md: high-level product/GDD plan and scope boundaries.
- docs/preproduction-plan.md: development stages, prototypes, and hard gates.
- docs/technical-decision-gates.md: physics, networking, voice, engine, input,
  replay, and Steam evidence needed before a choice is frozen.
- docs/current.md: current stage, frozen/unfrozen decisions, next action, and
  exact continuation point.
- docs/codex-log.md: chronological decisions and evidence.
- Historical documents remain useful evidence but cannot override current docs.
