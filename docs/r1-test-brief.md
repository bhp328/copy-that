# COPY THAT? — R1 Human×Human Conversation Contract Test Brief

Status: PROPOSED FOR HUMAN APPROVAL. Merge/explicit approval freezes this brief for
R1 apparatus implementation only. It does not select a production engine or
promote the project beyond Product Reset / Risk Prototype.

Authority: subordinate to docs/north-star.md, docs/current.md,
docs/steam-product-plan.md, docs/preproduction-plan.md, and
docs/technical-decision-gates.md.

## Risk and falsifiable question

Risk: the flagship may sound compelling yet fail to make two humans genuinely
interdependent while one physically drives.

Question:

**Does asymmetric information plus voice coordination let a Human Driver × Human
Engineer pair perform, understand, learn, and want to retry in ways that neither
silence nor shared information produces?**

R1 tests complementary information + communication + physical execution. It does
not test final vehicle feel, final Engineer UI, networking, Steam, AI, release
quality, or production architecture.

## Cheapest credible apparatus

- Two separate stations/screens.
- One directly controlled greybox car in one continuous 60–90 second encounter.
- Driver directly controls steering, throttle, brake, and simple gear changes.
- Driver sees immediate/local racing space and physical response only.
- Engineer receives raw/lightly processed upcoming/global evidence only.
- Engineer evidence may be static or Wizard-of-Oz; no production UI is required.
- Controlled PTT/radio discipline; transport quality is not under test.
- No AI, answer labels, suggested calls, normal-play typed control, command
  buttons, network stack, Steam integration, or production engine choice.

## Encounter requirement

Use the representative encounter in docs/r1-encounter-spec.md. It must contain:

1. an Engineer -> Driver dependency: meaningful upcoming/global information the
   Driver cannot know early enough alone;
2. a Driver -> Engineer dependency: immediate physical/brake/handling evidence
   the Engineer cannot observe directly;
3. approach -> complication -> commitment -> consequence -> recovery in one
   continuous physical world;
4. a credible conservative path, a stronger coordinated path, and fair physical
   consequences for wrong/late decisions.

The Engineer must interpret evidence rather than read an answer. The Driver must
still physically execute and may disagree with an unsafe plan.

## Conditions

Each first-time pair runs:

- **A — Asymmetric Duo:** role-limited information, communication allowed.
- **B — Silence:** same asymmetric information, no useful Engineer communication.
- **C — Shared Information:** both roles receive the union of relevant evidence,
  communication allowed.
- **A2 — Asymmetric Retry:** a novel equivalent variant after the three controls,
  used only for learning/retry evidence.

A/B/C order is counterbalanced across six pairs. Encounter direction, brake state,
and rival attack side are balanced independently using docs/r1-run-sheet.md.
A2 is not used to inflate the primary A-versus-B result.

## Participants

Initial R1 cohort: **6 first-time pairs / 12 participants**.

Participants may vary in racing, co-op, and gamepad experience. Record those
traits; do not optimize the gate after seeing results. No participant should know
the encounter solution or have prior R1 exposure.

## Outcome band

Freeze apparatus-specific examples before recruitment:

- **0 — Failure:** reset, unrecoverable spin/contact, or cannot finish.
- **1 — Major loss:** recoverable spin/contact/off-track or critical decision
  failure.
- **2 — Safe:** finishes cleanly but yields material time/position/opportunity.
- **3 — Strong:** finishes cleanly while preserving the intended race opportunity.

Record completion, outcome band, contact/off-track/reset, critical decision,
Driver inputs, world events, Engineer evidence, calls, acknowledgement,
commitment, consequence, recovery, confusion, causal explanation, and retry
behavior.

## Frozen provisional PASS gate

R1 passes only if all are true:

1. **Asymmetric value:** at least **4 of 6 pairs** score at least one outcome band
   better in A than B, or avoid a named critical failure in A that occurs in B,
   excluding apparatus-confounded runs.
2. **Role necessity:** in at least **5 of 6 pairs**, both players independently
   identify at least one meaningful piece of information that only the other role
   possessed.
3. **Shared-information control:** shared information reduces the need for the
   intended coordination. Across the cohort, median coordination-bearing calls in
   C are **30% lower than A**, or at least **4 of 6 pairs** independently describe
   the teammate as less necessary because they can see the missing evidence
   themselves. C may equal or beat A on raw performance; that is not a failure.
4. **Fair attribution:** at least **5 of 6 pairs** can correctly explain the main
   causal chain after the run, and no more than one pair's critical comparison is
   dominated by hidden rules, unreadable evidence, broken controls, or apparatus
   friction.
5. **Learning:** at least **4 of 6 pairs** name a concrete coordination change
   before A2, and at least **3 of 6 pairs** show an observable improvement in
   outcome, timing, clarity, or recovery while attempting that change.
6. **Retry signal:** at least **4 of 6 pairs** show credible unprompted desire to
   retry, role-swap, or immediately discuss how to improve the next attempt.

These are small-sample product gates, not population-level statistical claims.
Do not relax them after observing participants.

## FAIL / REVISE

Revise the information/communication contract before engine selection if any of
these product failures are supported by valid evidence:

- 2 or fewer pairs gain material value from A versus B;
- either role can consistently solve the representative encounter alone;
- 4 or more pairs prefer shared information because asymmetry feels arbitrary,
  unfair, or unreadable rather than merely easier for onboarding;
- Engineer play becomes answer reading, passive watching, or command delivery;
- Driver play becomes instruction execution rather than driving;
- Driver-only feel does not materially change Engineer judgment;
- voice adds friction without meaningful collaboration.

## INCONCLUSIVE

Do not interpret the product thesis if more than one pair's critical comparison is
invalidated by controls, evidence presentation, bugs, recording failure, or other
apparatus confounds. Fix only the named confound and rerun the minimum valid R1.

## Evidence artifact

For every pair preserve:

- Driver screen capture;
- Engineer evidence capture/photo;
- room/radio audio;
- input/world-event telemetry;
- condition and run parameters;
- observer timeline of calls and acknowledgement;
- outcome band and causal chain;
- independent debrief answers;
- spontaneous retry/role-swap behavior.

Final R1 evidence is one per-pair timeline plus one cohort summary table and
representative PASS/FAIL clips. No production replay system is required.

## Disposable by design

Disposable: greybox course, R1 vehicle controller, rival script, Wizard-of-Oz
Engineer evidence, temporary PTT discipline/tooling, encounter scripting, and
capture glue.

Preserve only validated product evidence: role-information contracts, measures,
causal traces, observed failure modes, and participant behavior. No R1 technology
earns production preservation rights.
