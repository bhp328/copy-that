# COPY THAT? — NORTH STAR

This is the stable product and design constitution for COPY THAT?. It should
change rarely, and only after explicit user direction or strong playtest evidence
reviewed with the user.

## Product Thesis

- **A racing game where communication is the control system.**
- **You don't drive the car. You drive the Driver.**
- Red-team refinement: **Conversation is the control system. Voice is its primary interface.**

## Core Fantasy

- The player is a Formula-style Race Engineer working with a Driver under extreme racing pressure.
- This is not a full race-engineer simulator. Fun comes from incomplete information, judgment, timing, trust, panic, banter, mistakes, saves, and shared race consequences.
- Current solo expression: Human Engineer × AI Driver.
- Long-term ultimate expression: Human Engineer × Human Driver asymmetric multiplayer.

## Core Laws

1. Conversation is the control system; voice/PTT is primary. Text and buttons are fallback, accessibility, and debug paths only.
2. Engineer knows the race; Driver feels the car.
3. Neither side has enough information alone.
4. The Driver handles what he can see and feel; the Engineer protects him from what he cannot see or process in time.
5. Silence is gameplay. In Engineer-critical situations, silence may cause spin, contact, or DNF when the Engineer had clear advance information.
6. What you say matters; when you say it matters just as much.
7. Every meaningful call gets immediate acknowledgement and a visible or audible race consequence.
8. Difficulty comes from pressure, judgment, incomplete information, timing, opponent response, prior-state consequences, and risk/reward—not unreadable rules, arbitrary randomness, broken STT, or intentionally dumb AI.
9. The faster and more critical the race gets, the shorter the radio gets.
10. Engineer UI gives evidence, never the answer.
11. The Driver can save small instability; he cannot erase the Engineer's bad strategic or risk decision.
12. Personality may surprise; rules and outcomes stay understandable and causally legible.
13. Memory is data; personality is AI. History and trust facts are deterministic state; AI expresses them naturally.
14. No Empty Racing.
15. UI, audio, dialogue, track design, events, camera, and simulation serve the same emotional and gameplay beat.

## Fun-First Tests

- **2AM Test:** The game is fun enough to make someone want another run even alone, with no audience, recording, or social reward.
- **10-Second Clip Test:** A newcomer can understand why a moment is tense, funny, or skillful within about 10 seconds.
- A feature is valuable only if it materially increases agency, tension, mastery, relationship, spectacle, replayability, or clip-generative stories.
- Use the latest technology aggressively when it strengthens the core; reject technology that mainly demonstrates itself.

## DDD — Dopamine Driven Development

Treat DDD as a practical design and product heuristic, not settled neuroscience and not stimulation spam.

**Anticipation → Agency → Commitment → Immediate Feedback → Fair Consequence → Emotional Payoff → Release → Next Hook**

- No payoff without anticipation; no tension without recovery.
- Avoid cheap XP or confetti reward spam.
- Micro loop (~3–10 seconds): communication, reaction, payoff.
- Meso loop (~30–90 seconds): chase, incident, overtake, problem.
- Run loop (~3–5 minutes): one coherent race story.
- Marathon/Contract loop: repeated attempts with long-form stakes and an attempt counter.

## Clip-Generative / Creator Design

- The goal is genuine emergent reaction, not scripted clip farming.
- Every run should naturally enable at least one retellable Comedy/Fuck-up, Clutch/Save, Mastery/Perfect-call/Feint, or Personality/Banter moment.
- Spectators should see danger early enough to anticipate success or failure.
- Creator goals include a facecam-safe HUD, spectator-legible semantics, Moment Engine event timestamps, replay markers, short clip export, Contracts/Hardcore modes, attempt counters, and seeded/shareable challenges.
- The long-term creator fantasy is difficult Contracts that sustain multi-hour streamer attempts and create an emergent narrative.

## Engineer / Driver Information Split

The Engineer knows **NEXT/GLOBAL**:

- upcoming track and corner information
- tactical map
- race control
- rival trend and closing rate
- gaps
- attack and defence context
- hazards the Driver cannot yet see

The Driver knows **NOW/FEEL**:

- grip
- wheelspin
- brake feel
- local visibility
- immediate car balance
- precise local space near another car

The Driver should proactively report car feel, ask questions, disagree or clarify appropriately, acknowledge, react, and occasionally joke. The Engineer sometimes needs Driver information before deciding.

## Voice / AI Driver Architecture

- Deliver a real push-to-talk radio feel.
- Use realtime speech-to-speech plus function/tool calling when secure and useful.
- Map flexible natural language into constrained deterministic game actions.
- The LLM never drives the car per frame.
- AI handles understanding, clarification, dialogue, banter, emotional expression, and personality.
- Simulation handles vehicle state, timing windows, race outcomes, opponent behavior, damage, incidents, and fairness.
- Radio processing should feel transmitted—click, static, filtering, compression—not like clean chatbot audio.
- Voice latency and reliability are gameplay requirements and should be measured with timestamps.

## Difficulty Philosophy

- **Hard to execute, easy to understand.**
- Create high cognitive pressure, not impossible reaction time.
- Strategic decisions may get seconds; commitment moments can be tight.
- Build difficulty from limited time, combining clear signals, opponent response, prior-state consequences, risk/reward, and communication timing.
- Never build difficulty from tiny text, opaque rules, arbitrary random punishment, broken STT, or intentionally incompetent Driver AI.
- First moments teach the communication language; later moments demand mastery.

## Silence / Failure / DNF

- Radio silence must not be harmless across a full run.
- In normal visible situations, the Driver can cope alone.
- In competitive situations, silence loses opportunities or positions.
- In Engineer-critical unseen or future situations, silence can cause serious consequences up to DNF when clear advance evidence was available.
- AFK or total silence should not successfully complete a normal full run.
- Conservative but communicative play may finish safely while missing the target.
- Reckless or wrong calls may cause contact, spin, damage, or DNF.
- Crashes are meaningful, relatively rare, causally attributable, and clip-worthy—not random chaos.

## Race / Track / Pressure Composition

- Prefer a dense ~3–5 minute Formula-style sprint over empty repeated laps.
- Exact lap count is not North Star; use one or two laps only if playtests support it.
- Five to eight meaningful communication beats per short run is a target, not sacred.
- The track is level design: every major section creates communication or problem-solving pressure, or spectacle.
- Useful beat families include blind-crest or unseen-corner warning, pace/risk, Driver grip report, rival attack/defence, yellow/debris/hazard, overtake setup/bluff/feint/switch/commit, and final defence.
- Do not create a scripted mini-game carousel.
- Interesting pressure combines Track Pressure + Persistent Race State + Conditional Incident/Event.
- Results must remain fair and causally legible.

## Opponent / Signaling

- Opponents react to visible Driver positioning, not raw user commands.
- Bluff/feint means showing one line, inducing a cover, switching, then committing.
- Repositioning has a natural time and space cost, not an arbitrary cooldown.
- Mastery comes from timing and opponent interpretation, not QTE memorization.

## UI / Frontend × Simulation Contract

- UI is an attention director, not decoration or a SaaS dashboard.
- The main Formula cockpit/onboard feed dominates.
- Calm means low information density; tension reveals relevant evidence; critical states show only actionable evidence prominently; payoff lets clutter recede.
- Use motorsport, broadcast, and instrumentation language: direct typography, telemetry rails, hairlines, ticks, brackets, dynamic track graphics, and a slim radio lower-third.
- Avoid rounded-card grids, generic dashboards, and answer-giving UI.
- Spectator legibility is first-class.
- Simulation creates pressure and story state; frontend and audio make it legible and emotional; voice changes simulation; payoff feeds presentation.

## Visual / Audio Direction

- Aim for polished stylized Formula motorsport, never Minecraft, Roblox, or test-map placeholder quality.
- Use a Formula cockpit/onboard view with halo, nose, and front-wheel cues plus real high-speed visual pressure.
- Halo and occlusion support Formula identity and information asymmetry, not artificial blindness for its own sake.
- Use an original fictional circuit informed by real circuit-design grammar—no random spline blobs and no ripped official track or brand assets.
- The Formula car must read as a sleek single-seater, not stacked primitive boxes.
- Audio is gameplay information: layered engine, wind, tire, curb, radio, impacts, and stress/release cues.
- Camera and visual stress represent actual car state. Avoid arbitrary G-force red screens; reserve danger treatment for genuine critical states and impacts.

## AI Relationship / Progression

- Progression is team chemistry, not a visible Trust meter.
- Driver dialogue reflects deterministic history: late calls, perfect calls, saves, DNF causes, attempt number, and overtakes.
- Through behavior and dialogue, the Driver can become trusting, skeptical, sarcastic, relieved, or confident without affecting fairness unpredictably.

## Falsification / Evidence Rules

Reject or revise design hypotheses when playtest evidence contradicts them:

- Voice fails if it feels no more collaborative than text or buttons.
- Engineer necessity fails if no-input play can complete the intended run or objective.
- Engineer skill fails if players merely read answers from the UI.
- Timing fails if shifting calls materially in time has little consequence.
- AI relationship fails if disabling Driver dialogue barely changes the experience.
- Difficulty fails if players blame STT, UI confusion, or randomness more than their judgment.
- Replayability fails if the exact event sequence becomes predictable after only a few runs.
- Streamability fails if a newcomer cannot understand a 10-second clip.
- Core fun fails if the 2AM Test fails.
- Information asymmetry fails if one side's screen contains all needed information.
- Visual fantasy fails if screenshots still read as a WebGL test scene.

Evidence hierarchy:

1. North Star and product thesis.
2. Actual full-run playtests and observed player or spectator behavior.
3. Strong relevant game-design, research, or reference evidence.
4. Individual subjective opinion.
5. Tool, skill, or model taste.

No plugin, skill, model, or agent silently outranks the North Star or real playtest evidence.

## Platform Strategy

- **Platform-agnostic core, Steam-first full product, Web-first discovery and prototyping.**
- Web is not the final technical ceiling. It validates the communication and DDD core, offers instant access, and can later become a viral demo and acquisition surface.
- The long-term commercial target is native PC/Steam for stronger graphics, audio, input and hardware integration, and multiplayer.
- Do not rewrite immediately in another engine before core fun is proven.
- The web vertical slice must prove voice conversation fun, fair Engineer necessity, fun pressure difficulty, meaningful Driver relationship, failures that create retry desire, overtaking/feint mastery, and clips that make viewers want to try.
- If blind playtests repeatedly produce spontaneous “one more run” or “is there a harder one?” behavior, run a short native-engine technical spike—such as Godot versus Unity or another suitable stack—to choose the Steam production path.
- Long-term flywheel: viral browser demo → Steam wishlist/demo/full game → creator clips → new players.

## Long-Term Product Flywheel

**Great gameplay → genuine streamer/player reaction → clip → viewer immediately understands the hook → browser demo/Steam → own race story → new clips → repeat.**

Long-term directions include Contracts/Hardcore, attempt counters, seeded/shareable challenges, Human Driver × Human Engineer Duo, role swap, creator replay/Moment Engine, and audience-selected challenge modifiers that set challenges without arbitrarily sabotaging gameplay.

## Drift Alarms

Treat the project as drifting if it becomes:

- button-first racing command UI
- voice that is merely buttons spoken aloud
- a generic race-engineer spreadsheet simulator
- a direct-driving racing game at its core
- a freeform chatbot glued onto a racing prototype
- a Driver who succeeds without Engineer contribution
- a Driver made intentionally dumb just to force commands
- random-event chaos without causal responsibility
- a scripted event carousel with little state interaction
- empty laps with sparse communication
- UI that gives answers rather than evidence
- AI constantly talking over racing
- streamer-only spectacle that fails the 2AM Test
- visual polish that does not serve communication, tension, or readability
- conservative prototype preservation that blocks necessary redesign
- a latest-technology showcase with weak gameplay
- a premature native-engine rewrite before core fun is proven

## Feature Decision Test

Before every major feature, ask:

1. Does it strengthen communicating with the Driver under racing pressure?
2. Does it create meaningful judgment, relationship, tension/release, mastery, or retellable consequence?
3. Is player agency clear?
4. Does it strengthen Driver/Engineer complementarity?
5. Does it improve both PLAY and WATCH?
6. Does it pass both 2AM and 10-Second Clip logic?
7. Is it worth its complexity versus improving the current core?

If the answers are mostly no, reject or backlog it.
