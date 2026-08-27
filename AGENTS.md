# COPY THAT? Project Rules

## Read first

- Before any substantial gameplay, UI, AI, race, camera, audio, platform, or
  product decision, read `docs/north-star.md` and `docs/current.md` first.
- `docs/north-star.md` is the stable product and design constitution.
  `docs/current.md` is the short source of actual implementation truth, active
  milestone, deployment state, and current gaps.
- Consult `docs/codex-log.md` only when historical decisions or rejected
  experiments matter. Use `docs/overtake-sim.md` for detailed overtake evidence.

## Product and design authority

- Core thesis: "Communication is the control system."
- The human is the game director/designer; Codex is the engineering partner.
- `docs/north-star.md` outranks implementation convenience and all tool, plugin,
  skill, model, or agent suggestions.
- Never silently edit `docs/north-star.md`. Change it only after explicit user
  direction or strong playtest evidence reviewed with the user.
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
  - `docs/north-star.md`: stable product thesis, fun laws, and experience laws;
    what COPY THAT? fundamentally is.
  - `docs/current.md`: actual current implementation truth, deployment, active
    milestone, and gaps; changes often.
  - `docs/codex-log.md`: chronological history, experiments, rejected
    directions, and evidence.
  - `docs/overtake-sim.md`: detailed overtake simulation evidence.

## Continuity and milestone review

- At a material milestone, update `docs/current.md` if current truth changed;
  add only durable decisions and evidence to `docs/codex-log.md`. Do not
  duplicate reports or treat either file as a full chat transcript.
- Treat human feedback as evidence, not a universal claim. Repeated observed
  playtest behavior and measured project evidence can outweigh generic design
  theory; theory should guide hypotheses and flag risks, not redesign approved play.
- Before a milestone commit, review the actual diff for scope, regressions,
  stale docs, generated files, and missing verification. This review has no
  authority to retune or redesign gameplay.
