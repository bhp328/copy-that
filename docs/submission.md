# COPY THAT? — Submission Notes

## One-line

**A racing game where communication is the control system.**

## Pitch

You are the Race Engineer, not the Driver. Your Driver has the wheel and the
reflexes; you have the tactical read. Watch a fictional Formula sprint through
the live onboard feed, read information the Driver cannot process at speed, and
compress it into short calls. PUSH to build the race, read a rival's defense,
set INSIDE or OUTSIDE, then judge the moment to call NOW. The Driver can execute
a good plan, but cannot erase a bad Engineer decision.

## How to play

1. Press **START SESSION**. Mission: finish P2 or better in the three-lap Meridian Sprint.
2. Use **PUSH** or **HOLD** when the opening pace decision appears.
3. On the final-lap attack, read the rival's movement and call **INSIDE** or **OUTSIDE**.
4. Let the Driver prepare, then call **NOW**. Too Soon, Too Late, the blocked line, and no-call each have deterministic consequences.
5. Buttons are the permanent fallback. The Driver Radio text box accepts short English or Korean calls through the same deterministic command path.

## Technical architecture

- Three.js + TypeScript + Vite; vanilla browser-first implementation.
- Deterministic Catmull-Rom circuit driving with no physics engine, backend, database, or client secret.
- Race flow and simulation state are separate from Three.js rendering state.
- A narrow natural-language parser maps English/Korean phrases to PUSH, HOLD, INSIDE, OUTSIDE, and NOW. No freeform chatbot or language model controls the car.
- The approved overtake model owns gap, preparation, lane clearance, timing classification, and pass feasibility. Its CLI simulator protects the same behavior at 30, 60, and 120 FPS.
- Procedural WebAudio supplies responsive engine, wind, radio, and outcome sound after the START gesture.

## Codex collaboration story

- `AGENTS.md` preserves design authority and the rule that communication—not direct steering—is the control system.
- `docs/current.md` carries the compact approved state; `docs/codex-log.md` keeps durable experiments and evidence instead of replaying chat history.
- A rejected braking-call prototype remains documented rather than being quietly revived.
- The approved overtake is protected by a deterministic ten-case simulator and command-parser regressions.
- Human Fun Gates approved the core reactive overtake and later its communication feel before this vertical-slice production pass.
- Game Studio's specialist Three.js, game-UI, and screenshot-led playtest guidance was used without allowing generic tooling to retune the approved core.
- Release QA used representative WebGL screenshots across success, deterministic failures, English/Korean, desktop/mobile, finish, and Retry.

## <=3 minute demo plan

**0:00–0:20 — Establish the fantasy**

Show the Apex Vector Engineer Workstation and say: “You don't drive the car. You drive the Driver.” Point out the mission, live onboard feed, tactical track, and radio.

**0:20–0:55 — First communication beat**

Start the sprint, hear the radio check, and make the opening PUSH/HOLD call. Show that the Driver acknowledges and executes while the player never steers.

**0:55–1:45 — Main attack**

Use the final-lap debug/demo jump if time is limited. Let the rival reveal its defense, call the open line, show the Driver preparing, then call NOW for the P3→P2 pass.

**1:45–2:15 — Prove timing is gameplay**

Restart the encounter and call NOW immediately for Too Soon, or wait for Too Late. Emphasize that the outcome comes from the deterministic race state, not random mishearing.

**2:15–2:40 — Close the race**

Show the P2 target-achieved result and Retry. Briefly switch to Korean or send a Korean radio call if useful.

**2:40–3:00 — Technology and collaboration**

Mention Three.js/TypeScript/Vite, deterministic Driver behavior, language-to-command mapping, the overtake simulator, project rules/current truth, human Fun Gates, and screenshot-led release QA.

## Local build and static deployment

```text
npm ci
npm run build
npm run preview -- --host 127.0.0.1
```

Upload the contents of `dist/` to a static host's root. The production build uses
root-relative assets; rebuild with the appropriate Vite `--base` if a host serves
the game from a subpath.
