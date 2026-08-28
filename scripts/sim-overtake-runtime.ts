import {
  CoreOvertakeSimulation,
  type CoreOvertakeSnapshot,
} from '../src/overtakeSimulation.js';
import type { AttackLane, OvertakeOutcome } from '../src/overtakeModel.js';

const FIXED_STEP_SECONDS = 1 / 60;
const TRACK_LENGTH_METRES = 1_721.17;

const cases = [
  { name: 'correct viable', intent: 'outside', nowAt: 3.9, expected: 'success' },
  { name: 'correct early', intent: 'outside', nowAt: 3.25, expected: 'tooEarly' },
  { name: 'correct late', intent: 'outside', nowAt: 5.1, expected: 'tooLate' },
  { name: 'wrong line', intent: 'inside', nowAt: 3.9, expected: 'blocked' },
  { name: 'no call', intent: null, nowAt: null, expected: 'noCall' },
] as const satisfies readonly {
  readonly name: string;
  readonly intent: AttackLane | null;
  readonly nowAt: number | null;
  readonly expected: OvertakeOutcome;
}[];

for (const testCase of cases) {
  const final = runCase(testCase.intent, testCase.nowAt);
  assert(
    final.outcome === testCase.expected,
    `${testCase.name}: expected ${testCase.expected}, got ${final.outcome}.`,
  );
  console.log(
    `PASS ${testCase.name}: ${final.outcome} ` +
      `time=${final.eventTimeSeconds.toFixed(3)}s gap=${final.longitudinalGapMetres.toFixed(3)}m`,
  );
}

const restartProbe = new CoreOvertakeSimulation(TRACK_LENGTH_METRES, {
  defenseMode: 'seeded',
  seed: 17,
  repeatAddsLap: false,
});
const firstDefense = restartProbe.snapshot.defenseSide;
restartProbe.restart();
assert(restartProbe.snapshot.scenarioIndex === 1, 'Restart did not advance scenario index exactly once.');
const secondDefense = restartProbe.snapshot.defenseSide;
const mirrorProbe = new CoreOvertakeSimulation(TRACK_LENGTH_METRES, {
  defenseMode: 'seeded',
  seed: 17,
  repeatAddsLap: false,
});
mirrorProbe.restart();
assert(
  mirrorProbe.snapshot.defenseSide === secondDefense,
  'Seeded restart defense is not repeatable.',
);
assert(restartProbe.snapshot.eventTimeSeconds === 0, 'Restart retained event time.');
assert(restartProbe.snapshot.intent === null, 'Restart retained intent.');
console.log(`PASS restart: ${firstDefense} -> ${secondDefense}, clean deterministic state.`);

function runCase(
  intent: AttackLane | null,
  nowAtSeconds: number | null,
): CoreOvertakeSnapshot {
  const simulation = new CoreOvertakeSimulation(TRACK_LENGTH_METRES, {
    defenseMode: 'inside',
    seed: 1,
    repeatAddsLap: false,
  });
  let intentIssued = false;
  let nowIssued = false;
  while (simulation.snapshot.outcome === 'pending') {
    const before = simulation.snapshot;
    if (
      intent !== null &&
      !intentIssued &&
      before.defenseReadable &&
      before.eventTimeSeconds >= 1.05
    ) {
      assert(simulation.issueIntent(intent), 'Expected intent to be accepted.');
      intentIssued = true;
    }
    if (
      nowAtSeconds !== null &&
      !nowIssued &&
      simulation.snapshot.eventTimeSeconds >= nowAtSeconds
    ) {
      assert(simulation.issueNow(), 'Expected NOW to be accepted.');
      nowIssued = true;
    }
    simulation.update(FIXED_STEP_SECONDS);
    assert(
      simulation.snapshot.eventTimeSeconds < 12,
      'Protected overtake did not resolve within 12 seconds.',
    );
  }
  return simulation.snapshot;
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
