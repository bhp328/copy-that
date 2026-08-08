import {
  FIRST_CORE_LOOP_PARAMETERS,
  getDefenseReadableTimeSeconds,
  getEventDurationSeconds,
  simulateAttempt,
  TUNED_OVERTAKE_PARAMETERS,
  type AttackLane,
  type OvertakeOutcome,
  type OvertakeParameters,
} from '../src/overtakeModel.js';

const SWEEP_STEP_SECONDS = 0.02;
const NOW_SAMPLE_SECONDS = 0.05;
const HUMAN_REACTION_DELAYS = [0.6, 1.0, 1.4] as const;
const HISTORICAL_INFORMATION_HOLD_SECONDS = 1.5;

runBeforeHumanTimingCorrection();
const afterWindows = runAfterHumanTimingCorrection();
runRequiredMatrix(afterWindows);
runFrameConsistencyCheck(afterWindows);

interface SuccessWindow {
  first: number;
  last: number;
  width: number;
}

function runBeforeHumanTimingCorrection(): void {
  const parameters = FIRST_CORE_LOOP_PARAMETERS;
  const readable = requireReadableTime(parameters, 'inside');
  const historicalWindow = findSuccessWindow(parameters, 'inside', 'outside', 0.1);
  console.log('\nBEFORE — HUMAN-REJECTED FIRST CORE LOOP');
  console.log(
    `moving-model defense readable=${readable.toFixed(2)}s; ` +
      `fake hold=${HISTORICAL_INFORMATION_HOLD_SECONDS.toFixed(2)}s`,
  );
  console.log(
    `historical machine-known intent@0.10s success=${formatWindow(historicalWindow)}`,
  );
  if (historicalWindow) {
    console.log(
      `wall-clock success=${(historicalWindow.first + HISTORICAL_INFORMATION_HOLD_SECONDS).toFixed(2)}-` +
        `${(historicalWindow.last + HISTORICAL_INFORMATION_HOLD_SECONDS).toFixed(2)}s; ` +
        `defense readable=${(readable + HISTORICAL_INFORMATION_HOLD_SECONDS).toFixed(2)}s`,
    );
  }
  for (const reactionDelay of HUMAN_REACTION_DELAYS) {
    const intentTime = readable + reactionDelay;
    const preparation80 = measurePreparationMilestone(
      parameters,
      'inside',
      'outside',
      intentTime,
    );
    const window = findSuccessWindow(
      parameters,
      'inside',
      'outside',
      intentTime,
    );
    console.log(
      `reaction=${reactionDelay.toFixed(1)}s intent=${intentTime.toFixed(2)}s ` +
        `prep80=${formatTime(preparation80)} success=${formatWindow(window)}`,
    );
    assert(window === null, 'Rejected loop unexpectedly supports reactive play.');
  }
}

function runAfterHumanTimingCorrection(): Map<AttackLane, SuccessWindow> {
  const parameters = TUNED_OVERTAKE_PARAMETERS;
  const windows = new Map<AttackLane, SuccessWindow>();
  console.log('\nAFTER — MOVING REVEAL / PREPARATION / EXECUTION PACING');
  console.log(
    `event=${parameters.eventDistanceMetres.toFixed(1)}m ` +
      `formation=${parameters.opponentSpeedKmh.toFixed(0)}km/h ` +
      `towStart=${parameters.towStartDistanceMetres.toFixed(0)}m ` +
      `towTarget=${parameters.playerTowTargetSpeedKmh.toFixed(0)}km/h ` +
      `attackTarget=${parameters.playerAttackTargetSpeedKmh.toFixed(0)}km/h ` +
      `duration=${getEventDurationSeconds(parameters, 'inside', SWEEP_STEP_SECONDS).toFixed(2)}s`,
  );

  for (const defense of ['inside', 'outside'] as const) {
    const correctIntent: AttackLane =
      defense === 'inside' ? 'outside' : 'inside';
    const readable = requireReadableTime(parameters, defense);
    let normalReactionWindow: SuccessWindow | null = null;
    console.log(
      `\nForced Scenario ${defense === 'inside' ? 'A' : 'B'} ` +
        `(defense ${defense}) readable=${readable.toFixed(2)}s`,
    );
    for (const reactionDelay of HUMAN_REACTION_DELAYS) {
      const intentTime = readable + reactionDelay;
      const preparation80 = measurePreparationMilestone(
        parameters,
        defense,
        correctIntent,
        intentTime,
      );
      const window = findSuccessWindow(
        parameters,
        defense,
        correctIntent,
        intentTime,
      );
      assert(window !== null, `${defense} has no reactive success window.`);
      assert(
        window.width >= 0.85 && window.width <= 1.5,
        `${defense} reactive window is outside the intended useful width.`,
      );
      if (reactionDelay === 1) {
        normalReactionWindow = window;
      }
      console.log(
        `reaction=${reactionDelay.toFixed(1)}s intent/ack=${intentTime.toFixed(2)}s ` +
          `prepStart=${(intentTime + parameters.preparationDelaySeconds).toFixed(2)}s ` +
          `prep80=${formatTime(preparation80)} ` +
          `NOW=${formatWindow(window)}`,
      );
    }

    const voiceProbeDelay = 1.8;
    const voiceIntentTime = readable + voiceProbeDelay;
    const voicePreparation80 = measurePreparationMilestone(
      parameters,
      defense,
      correctIntent,
      voiceIntentTime,
    );
    const voiceWindow = findSuccessWindow(
      parameters,
      defense,
      correctIntent,
      voiceIntentTime,
    );
    assert(voiceWindow !== null, `${defense} has no 1.8s voice-headroom window.`);
    console.log(
      `voice-headroom probe reaction=${voiceProbeDelay.toFixed(1)}s ` +
        `intent=${voiceIntentTime.toFixed(2)}s prep80=${formatTime(voicePreparation80)} ` +
        `NOW=${formatWindow(voiceWindow)}`,
    );

    const normalIntentTime = readable + 1;
    const normalWindow = requireWindow(normalReactionWindow);
    windows.set(defense, normalWindow);
    const earlyTime = normalWindow.first - 0.5;
    const viableTime = (normalWindow.first + normalWindow.last) * 0.5;
    const lateTime = normalWindow.last + 0.4;
    const early = simulateAttempt(
      parameters,
      defense,
      correctIntent,
      normalIntentTime,
      earlyTime,
      SWEEP_STEP_SECONDS,
    );
    const viable = simulateAttempt(
      parameters,
      defense,
      correctIntent,
      normalIntentTime,
      viableTime,
      SWEEP_STEP_SECONDS,
    );
    const late = simulateAttempt(
      parameters,
      defense,
      correctIntent,
      normalIntentTime,
      lateTime,
      SWEEP_STEP_SECONDS,
    );
    const blocked = simulateAttempt(
      parameters,
      defense,
      defense,
      normalIntentTime,
      viableTime,
      SWEEP_STEP_SECONDS,
    );
    const noCall = simulateAttempt(
      parameters,
      defense,
      null,
      null,
      null,
      SWEEP_STEP_SECONDS,
    );
    console.log(
      `samples early@${earlyTime.toFixed(2)}=${early.outcome} ` +
        `good@${viableTime.toFixed(2)}=${viable.outcome} ` +
        `late@${lateTime.toFixed(2)}=${late.outcome}`,
    );
    console.log(
      `wrong-line=${blocked.outcome}; no-call=${noCall.outcome} ` +
        `final-gap=${noCall.finalState.longitudinalGapMetres.toFixed(1)}m`,
    );
  }
  return windows;
}

function runRequiredMatrix(windows: Map<AttackLane, SuccessWindow>): void {
  console.log('\nREQUIRED 10-CASE REACTIVE-HUMAN MATRIX');
  for (const defense of ['inside', 'outside'] as const) {
    const correctIntent: AttackLane =
      defense === 'inside' ? 'outside' : 'inside';
    const readable = requireReadableTime(TUNED_OVERTAKE_PARAMETERS, defense);
    const intentTime = readable + 1;
    const window = requireWindow(windows.get(defense) ?? null);
    const cases: Array<{
      label: string;
      intent: AttackLane | null;
      now: number | null;
      expected: OvertakeOutcome;
    }> = [
      { label: 'correct / early', intent: correctIntent, now: window.first - 0.5, expected: 'tooEarly' },
      { label: 'correct / good', intent: correctIntent, now: (window.first + window.last) * 0.5, expected: 'success' },
      { label: 'correct / late', intent: correctIntent, now: window.last + 0.4, expected: 'tooLate' },
      { label: 'wrong / NOW', intent: defense, now: (window.first + window.last) * 0.5, expected: 'blocked' },
      { label: 'no call', intent: null, now: null, expected: 'noCall' },
    ];
    for (const testCase of cases) {
      const first = simulateAttempt(
        TUNED_OVERTAKE_PARAMETERS,
        defense,
        testCase.intent,
        testCase.intent === null ? null : intentTime,
        testCase.now,
        SWEEP_STEP_SECONDS,
      );
      const repeated = simulateAttempt(
        TUNED_OVERTAKE_PARAMETERS,
        defense,
        testCase.intent,
        testCase.intent === null ? null : intentTime,
        testCase.now,
        SWEEP_STEP_SECONDS,
      );
      const passed =
        first.outcome === testCase.expected &&
        repeated.outcome === first.outcome &&
        repeated.finalState.longitudinalGapMetres ===
          first.finalState.longitudinalGapMetres;
      console.log(
        `${passed ? 'PASS' : 'FAIL'} ${defense}/${testCase.label}: ${first.outcome}`,
      );
      assert(passed, `${defense}/${testCase.label} failed.`);
    }
  }
}

function runFrameConsistencyCheck(
  windows: Map<AttackLane, SuccessWindow>,
): void {
  const window = requireWindow(windows.get('inside') ?? null);
  const readable = requireReadableTime(TUNED_OVERTAKE_PARAMETERS, 'inside');
  const intentTime = readable + 1;
  const samples = [
    { now: window.first - 0.5, expected: 'tooEarly' },
    { now: (window.first + window.last) * 0.5, expected: 'success' },
    { now: window.last + 0.4, expected: 'tooLate' },
  ] as const;
  console.log('\nFRAME-RATE CONSISTENCY');
  for (const fps of [30, 60, 120]) {
    const outcomes = samples.map(({ now }) =>
      simulateAttempt(
        TUNED_OVERTAKE_PARAMETERS,
        'inside',
        'outside',
        intentTime,
        now,
        1 / fps,
      ).outcome,
    );
    const passed = outcomes.every(
      (outcome, index) => outcome === samples[index].expected,
    );
    console.log(
      `${passed ? 'PASS' : 'FAIL'} ${fps} FPS: ${outcomes.join(' / ')}`,
    );
    assert(passed, `${fps} FPS produced inconsistent outcomes.`);
  }
}

function findSuccessWindow(
  parameters: OvertakeParameters,
  defense: AttackLane,
  intent: AttackLane,
  intentTime: number,
): SuccessWindow | null {
  const duration = getEventDurationSeconds(
    parameters,
    defense,
    SWEEP_STEP_SECONDS,
  );
  const successes: number[] = [];
  for (
    let nowTime = intentTime;
    nowTime <= duration;
    nowTime += NOW_SAMPLE_SECONDS
  ) {
    const result = simulateAttempt(
      parameters,
      defense,
      intent,
      intentTime,
      nowTime,
      SWEEP_STEP_SECONDS,
    );
    if (result.outcome === 'success') {
      successes.push(nowTime);
    }
  }
  if (successes.length === 0) {
    return null;
  }
  for (let index = 1; index < successes.length; index += 1) {
    assert(
      successes[index] - successes[index - 1] <= NOW_SAMPLE_SECONDS + 1e-9,
      'Success samples must form one contiguous NOW interval.',
    );
  }
  const first = successes[0];
  const last = successes.at(-1) ?? first;
  return { first, last, width: last - first };
}

function measurePreparationMilestone(
  parameters: OvertakeParameters,
  defense: AttackLane,
  intent: AttackLane,
  intentTime: number,
): number | null {
  return simulateAttempt(
    parameters,
    defense,
    intent,
    intentTime,
    null,
    SWEEP_STEP_SECONDS,
  ).finalState.preparationMilestoneAtSeconds;
}

function requireReadableTime(
  parameters: OvertakeParameters,
  defense: AttackLane,
): number {
  const readable = getDefenseReadableTimeSeconds(
    parameters,
    defense,
    SWEEP_STEP_SECONDS,
  );
  assert(readable !== null, `${defense} never becomes readable.`);
  return readable;
}

function requireWindow(window: SuccessWindow | null): SuccessWindow {
  assert(window !== null, 'Expected a success window.');
  return window;
}

function formatWindow(window: SuccessWindow | null): string {
  return window
    ? `${window.first.toFixed(2)}-${window.last.toFixed(2)}s (${window.width.toFixed(2)}s)`
    : 'none';
}

function formatTime(time: number | null): string {
  return time === null ? 'none' : `${time.toFixed(2)}s`;
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
