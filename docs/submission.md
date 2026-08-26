# COPY THAT? — Submission Notes

## One-paragraph pitch

**COPY THAT?** is a racing game where communication is the control system. You
are not steering the car; you are the Race Engineer. The Driver has the hands
and reflexes, while you have the tactical read. Watch an opponent commit to a
defensive line, call INSIDE or OUTSIDE, let the Driver prepare, then make the
timing call: **NOW**. A capable Driver can execute a good instruction, but
cannot erase a bad Engineer decision.

## How to play

1. Read the Driver Feed and tactical panel as the opponent reveals its defense.
2. Call a line with the **INSIDE** / **OUTSIDE** buttons or a short Driver Radio
   command (for example `OUTSIDE`, `NOW`, `아웃사이드`, or `지금`). Buttons always
   remain available as the reliable fallback.
3. Give the Driver time to prepare, then call **NOW**. Calling too early,
   too late, or into the occupied line produces a readable outcome.
4. After a result, use **RETRY EVENT** for the next encounter.

## Technical architecture

- Three.js, TypeScript, and Vite; browser-first with no backend or database.
- Deterministic spline/curve arcade movement rather than a physics engine.
- A narrow English/Korean command parser maps only clear intent calls to the
  same deterministic `INSIDE` / `OUTSIDE` / `NOW` path as the buttons.
- The model, not a language model, owns all preparation, gap, clearance, and
  pass outcomes. No API keys or remote inference are required to play.

## Codex collaboration story

The project keeps its design authority and evidence in `AGENTS.md` and
`docs/current.md`, with historical decisions in `docs/codex-log.md`. A
deterministic overtake simulation protects the approved loop across 30, 60,
and 120 FPS, while the command-parser regression cases protect radio input.
The team retained a rejected late-brake experiment as evidence rather than
silently reviving it, then used browser QA to focus polish on communication,
readability, localization, and retry flow instead of adding risky scope.

## Suggested <=3 minute demo

**0:00-0:20 — Set the role**

Open on the Engineer Brief: “You do not drive the car. You drive the Driver.”
Point out the Driver Feed as immediate race information and the Engineer Panel
as the earlier tactical read.

**0:20-1:05 — Make one pass**

Wait for the opponent to reveal its line. Call the open line through Driver
Radio or the fallback buttons, let the Driver acknowledge and prepare, then
call NOW. Let the pass complete and point out the Driver reaction plus the
tactical map moving from BEHIND to AHEAD.

**1:05-1:35 — Show that timing matters**

On the next attempt, call NOW too early or too late. Explain that the Driver
does not become intentionally bad: the race state makes the Engineer's timing
matter. Use Retry.

**1:35-2:05 — Show accessibility of the control idea**

Switch to Korean and send a short Korean radio call, or use the visible button
fallback. Emphasize that both paths map to the same deterministic Driver
behavior.

**2:05-2:45 — Close on the build philosophy**

Mention the deterministic model, frame-rate regression simulation, and the
decision to keep the prototype focused on one polished communication-driven
overtake rather than inflate it with unreliable systems.

## Build and static deployment

```text
npm ci
npm run build
```

Upload the contents of `dist/` to a static host's root. The current Vite build
uses root-relative hosting; if the host requires a subpath, rebuild with the
appropriate Vite `--base` value before upload. For local production checking:

```text
npm run preview -- --host 127.0.0.1
```
