# COPY THAT? — M2 Human-Test Protocol

Date frozen: 2026-09-03

Authority baseline: `5a98f95`, Checkpoint deterministic M2 encounter slice

Status: frozen before participant data is collected. Do not change thresholds
after seeing results.

## Purpose and decision boundary

Use the existing Web M2 slice as a **core-thesis falsification oracle**. This is
not release QA and is not statistical product validation. It asks whether the
behavior worth preserving already creates:

1. **conversation as agency** — the Engineer contributes NEXT/GLOBAL
   information the Driver does not have;
2. **causal legibility** — players and observers can connect a call, its timing,
   and the resulting consequence; and
3. **retry/mastery desire** — a second attempt produces observable learning and
   players want another attempt without being sold one.

This test does **not** evaluate final graphics quality, Steam production
readiness, live voice quality, or Web release quality. It does not authorize an
engine choice, production port, deployment, balance pass, or presentation
redesign.

## Cohorts

### Players

- Recruit exactly six people who have never played or been briefed on this M2
  slice.
- Assign anonymous IDs `P01` through `P06`; do not record names in the score
  sheet.
- Each participant plays two runs of the same existing slice: start → Driver
  feel → blind crest → rival defence → consequence → Retry.
- Both runs use the same frozen build and facilitation rules. Record the build,
  locale, seed or seed schedule, and input method so Run 1 and Run 2 can be
  compared.
- English/Korean mix may be recorded as sampling context, but localization
  coverage is not a pass criterion in this test.

### Clip observers

- Recruit three different people who did not play, watch a session, or receive
  an explanation of the slice.
- Assign anonymous IDs `C01` through `C03`.
- Each watches the same frozen 10-second clip and then explains what was
  dangerous and which judgment or call produced the result.

## Fixed facilitation rules

Before Run 1, explain only:

- the player is the Race Engineer;
- the immediate objective; and
- how to issue the available controls or calls.

Do not explain the solution, correct call, timing window, cue meaning, outcome
table, information split, or what the observer hopes to see. Do not coach,
confirm, correct, gesture toward an answer, or reinterpret a call during either
run.

If spoken calls are mapped to the existing deterministic controls by a hidden
facilitator, label the session as Wizard-of-Oz and use the same mapping rules for
both runs. This does not count as STT, latency, or live-voice evidence.

After Run 1 and before giving any feedback, ask only neutral prompts such as:

- What was your job?
- What did you know that the Driver did not?
- What did the Driver know or feel that you did not?
- Why did that result happen?
- What, if anything, would you change next time?

Record the answer before responding. A facilitator may clarify what a question
means but may not supply game information.

The second run is required even when the participant does not request it. To
measure spontaneous Retry, first leave an unprompted observation window after a
result. Count only an unsolicited request, stated desire, or actual Retry action
that occurs before the facilitator offers the required next run. A yes-answer to
“Do you want to try again?” does not count.

For the clip cohort, provide no solution or role explanation beyond asking them
to watch the clip and describe what happened. Record the first causal summary;
do not teach between observers.

## Minimum observation record

Use one row per player run and one row per clip observer. Use `N/A` rather than
leaving a field blank when it does not apply.

| Field | Required record |
| --- | --- |
| Participant ID | Anonymous `P01`–`P06` or `C01`–`C03` |
| Run number | `1`, `2`, or `clip` |
| No-hint | Yes/no; explain any deviation |
| Key calls/timing | Calls, order, approximate or logged timing, and relevant silence |
| Outcome | Position/result and visible consequence |
| Failure attribution | Participant's own explanation; `N/A` only if no failure or miss occurred |
| Spontaneous Retry | Actual action, unsolicited statement, or no |
| Observed confusion | Cue, control, role, causality, presentation, or other confusion |
| Notable quote | Short verbatim evidence, including uncertainty or blame |
| 10-second causal summary | Clip observer's first account; `N/A` for player-run rows |
| Optional video timestamp | Source timestamp for later review, if recorded |

Also retain the build identifier, locale, seed or seed schedule, input/mapping
method, facilitator, and session date once per session sheet. Survey enjoyment
may be collected after the scored observations, but it cannot replace behavior
or causal understanding.

## Frozen scoring rules

Score each player once per criterion. Keep the evidence beside the score; do not
award credit from a general positive impression.

### A — Engineer necessity and information split

**Pass threshold: at least 4/6 players.**

After Run 1 and before feedback, the participant explains in their own words
that the Engineer contributes upcoming or global information the Driver lacks
and uses it to affect the race. “The Engineer tells the Driver what to do” alone
is insufficient unless the missing-information structure is understood.

### B — Mastery and learnability

**Pass threshold: at least 4/6 players.**

Run 2 shows a clearly better judgment, call timing, or result than Run 1 without
a hint. Count improvement only when the observation record identifies the
change. A better result by itself is insufficient if the seed, conditions, or
facilitation changed enough to explain it.

### C — Spontaneous Retry

**Pass threshold: at least 4/6 players.**

The participant initiates Retry or expresses a clear desire to try again before
being invited. The protocol-required second run does not count by itself, and a
positive answer to a direct Retry question does not count.

### D — Causal failure attribution

**Pass threshold: at least 4/6 players.**

When a failure or missed objective occurs, the participant identifies the
approximate decision, call, timing, or silence that caused it without an
answer-giving UI or facilitator explanation. Reading the outcome as arbitrary
randomness or blaming the system without identifying a causal mistake is a fail
signal.

If fewer than four participants encounter a scorable failure or missed
objective, Criterion D is not proven; the overall verdict is `INCONCLUSIVE`, not
an assumed pass or fail.

### E — 10-second causal legibility

**Pass threshold: at least 2/3 clip observers.**

The observer identifies both what was dangerous and which judgment or call
produced the result. Merely naming “a race” or describing the final image is not
enough.

### Scorecard

| Criterion | Threshold | Result | Evidence reference |
| --- | ---: | ---: | --- |
| A. Engineer necessity / NEXT-GLOBAL | 4/6 | Pending | |
| B. Run-2 mastery / learnability | 4/6 | Pending | |
| C. Spontaneous Retry | 4/6 | Pending | |
| D. Failure attribution | 4/6 | Pending | |
| E. 10-second causal legibility | 2/3 | Pending | |

## False-negative and failure interpretation

The current presentation, audio, and vehicle feel are below the intended
production ceiling. They can create a false negative by hiding an otherwise
causal interaction. Do not relax the frozen scores. After scoring, classify the
evidence separately as one of:

- **Core thesis failure:** participants can perceive the relevant evidence and
  consequence, but communication does not create meaningful agency, learning,
  or Retry desire.
- **Presentation ceiling failure:** deterministic traces contain the intended
  causal chain, but repeated visual, audio, timing-feedback, or vehicle-feel
  confusion prevents participants from perceiving it.
- **Mixed/unclear:** both interaction design and presentation plausibly explain
  the miss and the evidence does not isolate them.

Observed confusion, key-call timing, outcome traces, quotes, and post-score
diagnostic questions support this classification. A presentation diagnosis is
not permission to port to a native engine; repair the smallest identified layer
in the existing harness and test again first.

## Cohort integrity and bug rule

A critical bug may be fixed during testing, but record the exact build boundary
and invalidate affected runs. If the fix does not change any beat, balance,
available information, UI meaning, call meaning, or causal outcome, replace the
affected participant slot with a new first-time participant and rerun both runs
on the fixed build.

If any beat, balance, available information, UI meaning, call meaning, or causal
outcome changes, stop. The old and new sessions are not one cohort. Freeze the
new version and recruit a new six-player cohort; replace the 10-second clip and
three-observer cohort too if the changed meaning appears in the clip.

## Verdict

### PASS

Award `PASS` only when the cohort is valid and all five thresholds pass: A–D
each reach at least 4/6 and E reaches at least 2/3. Only then may the project
freeze engine-neutral actions, views, events, reason codes, fixtures, and golden
traces before running the equal Godot C# versus Unity C# Windows spike.

### FAIL

Award `FAIL` when the cohort is valid, every criterion is scoreable, and one or
more frozen thresholds miss. Record the secondary diagnosis above. Revise the
core interaction in the existing harness—including only the presentation layer
when evidence identifies it as the ceiling—and repeat the human gate before any
engine transition.

### INCONCLUSIVE

Award `INCONCLUSIVE` when a threshold cannot be scored reliably because of
insufficient failure exposure, hints, participant contamination, a critical
bug, material data loss, changed conditions, or another protocol deviation.
Before retesting, name the exact missing evidence and the smallest valid retest:

- with no implementation or semantic change, replace only invalid participant
  slots with new first-time participants and preserve the frozen procedure;
- after any beat, balance, information, UI-meaning, call-meaning, or causal
  change, start a complete new cohort as required above; and
- rerun the clip cohort only when its evidence was invalid or its source moment
  changed.

`INCONCLUSIVE` does not authorize contract freeze, engine spike, production
port, or deployment.

## Required result note

The final test note must report:

- cohort/build/seed/input conditions and any protocol deviations;
- the five numeric scores with evidence references;
- `PASS`, `FAIL`, or `INCONCLUSIVE`;
- the separate core-thesis/presentation-ceiling interpretation; and
- exactly one next action allowed by the verdict.

Do not call this test Steam readiness, Web release QA, live-voice proof, or a
general Fun Gate. It is one deliberately narrow falsification gate.
