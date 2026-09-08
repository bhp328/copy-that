# COPY THAT? — R1 Run Sheet

Status: PROPOSED. Freeze with docs/r1-test-brief.md before participant recruitment.

## Conditions

- A: Asymmetric Duo, communication allowed.
- B: Silence, asymmetric views preserved, no useful Engineer communication.
- C: Shared Information, communication allowed.
- A2: Asymmetric Retry on a fresh equivalent variant.

## Counterbalance

Use each A/B/C order exactly once across six first-time pairs:

| Pair | Run 1 | Run 2 | Run 3 | Run 4 |
| --- | --- | --- | --- | --- |
| P1 | A | B | C | A2 |
| P2 | A | C | B | A2 |
| P3 | B | A | C | A2 |
| P4 | B | C | A | A2 |
| P5 | C | A | B | A2 |
| P6 | C | B | A | A2 |

Rotate encounter variants independently so condition is not tied to corner direction,
brake state, rival tendency, or obstruction side. Freeze the assignment before recruitment.

## Neutral onboarding

- Driver practices steering, throttle, brake, gear up/down, and PTT on a non-scored section.
- Engineer practices reading raw evidence and PTT without seeing a scored configuration.
- Explain role boundaries only. Do not teach preferred vocabulary, timing, line, or solution.
- Stop practice once the apparatus is usable.

## Participant script

You are a Driver and an Engineer working as one race team. The Driver physically controls the car. The Engineer cannot drive. Each of you may have information the other cannot see. When communication is allowed, communicate however you think is useful. There is no hidden command vocabulary and no required phrase. The game, not your skill, is being tested.

For B: do not exchange useful race information until the run ends.

For C: both stations may show information that was separated in other runs. Play normally with the information you have.

## Record each run

- pair ID, condition, variant/seed;
- start/end time;
- outcome band 0–3;
- contact, off-track, spin, reset;
- critical commitment and consequence timestamps;
- Engineer evidence available at commitment;
- meaningful calls, acknowledgement, clarification, disagreement;
- Driver feel report;
- apparatus confusion or bug;
- spontaneous retry, strategy discussion, or role-swap statement.

## Outcome bands

- 0 Failure: unrecoverable incident, reset, or cannot finish.
- 1 Major loss: recoverable major incident or loss of the critical opportunity.
- 2 Safe: clean conservative completion with material time/position/opportunity loss.
- 3 Strong: clean completion preserving the intended opportunity through physical execution.

Freeze apparatus-specific examples during smoke testing.

## Independent debrief

Before pair discussion ask each player independently:

1. What information did you have that your teammate did not?
2. What information did your teammate have that you did not?
3. What call, missing call, or physical observation mattered most?
4. Why did the most important consequence happen?

After A2 also ask what they deliberately changed from earlier attempts. Keep spontaneous retry/role-swap behavior separate from prompted answers.

## Coordination-bearing calls

Count an utterance only if it contributes missing evidence, updates shared understanding,
clarifies uncertainty, acknowledges a meaningful commitment, disagrees for physical/safety
reasons, or changes the plan. Do not count banter, PTT checks, or duplicate filler.

## Confounds

Tag only when supported: CONTROL_LEARNING, INPUT_FAILURE, EVIDENCE_UNREADABLE,
ANSWER_LEAK, RULE_HIDDEN, RECORDING_FAILURE, OPERATOR_ERROR, VARIANT_BROKEN,
OTHER_APPARATUS.

Record whether each confound materially invalidates the critical comparison before analysis.

## Analysis order

1. apparatus validity/confounds;
2. A versus B outcome bands by pair;
3. role-necessity answers;
4. A versus C coordination-bearing calls and preference explanations;
5. causal understanding;
6. A2 named adaptation and observed improvement;
7. spontaneous retry/role-swap/strategy behavior.

Do not change thresholds after analysis begins.

## Decision

End with exactly one result: PASS, FAIL, or INCONCLUSIVE according to docs/r1-test-brief.md.
Record the result and exactly one next step in docs/current.md and docs/codex-log.md. R1 cannot select the production engine.
