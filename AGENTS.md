# COPY THAT? Project Rules

## Read first

- Read `docs/current.md` before gameplay work. It is the short source of current
  approved project truth, active milestone, and backlog boundaries.
- Consult `docs/codex-log.md` only when historical decisions or rejected
  experiments matter. Use `docs/overtake-sim.md` for detailed overtake evidence.

## Product and design authority

- Core thesis: "Communication is the control system."
- The human is the game director/designer; Codex is the engineering partner.
- The original project direction and human-approved decisions outrank generic
  best practices or recommendations from external tools and skills.
- Do not introduce features or silently promote backlog ideas unless specifically
  requested. Do not retune an approved design without new human or measured
  evidence.
- Browser stability and playability are higher priority than realism.

## Stack and architecture

- Three.js + TypeScript + Vite is the fixed stack unless explicitly changed.
- Use vanilla TypeScript. Keep the game browser-first; do not add a backend,
  database, or physics engine without explicit approval.
- Prefer deterministic gameplay outcomes over random failure.
- The vehicle simulation remains deterministic spline/curve arcade driving.
- An LLM must never control the vehicle per frame. Future command interpretation
  must map into deterministic Driver behavior.
- English is the default UI language. Maintain Korean localization alongside
  player-facing text; avoid awkward literal automotive terminology.

## Verification

- For gameplay/model changes, run `npm run sim:overtake` when relevant and
  `npm run build` before handoff. Use a browser smoke test when interaction or
  visual behavior changes.
- Commands: `npm run dev`, `npm run build`, `npm run preview`, and
  `npm run sim:overtake`.
- Treat debug tooling as developer-only and keep it gated from normal play.

## Git and documentation discipline

- Inspect `git status` and the relevant diff before committing. Do not commit
  generated artifacts or unrelated files.
- Experimental gameplay requires human playtest approval before a checkpoint.
  Keep approved gameplay and documentation/workflow changes in separate commits
  when that separation is practical.
- Documentation roles:
  - `AGENTS.md`: stable rules for working in this repository.
  - `docs/current.md`: current approved state, active milestone, and backlog.
  - `docs/codex-log.md`: historical decisions, experiments, and evidence.
  - `docs/overtake-sim.md`: detailed overtake simulation evidence.
