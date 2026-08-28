import {
  AUTHORITATIVE_STEP_SECONDS,
  FixedStepClock,
  MAX_FRAME_DELTA_SECONDS,
} from '../src/fixedStep.js';

interface ScheduleResult {
  readonly steps: number;
  readonly simulationSeconds: number;
}

const durationSeconds = 12;
const schedules = [30, 60, 120].map((framesPerSecond) => ({
  framesPerSecond,
  result: runSchedule(framesPerSecond, durationSeconds),
}));

for (const schedule of schedules) {
  const expectedSteps = Math.round(
    durationSeconds / AUTHORITATIVE_STEP_SECONDS,
  );
  assert(
    schedule.result.steps === expectedSteps,
    `${schedule.framesPerSecond} FPS produced ${schedule.result.steps} ticks; ${expectedSteps} expected.`,
  );
  assertClose(
    schedule.result.simulationSeconds,
    durationSeconds,
    AUTHORITATIVE_STEP_SECONDS * 0.5,
    `${schedule.framesPerSecond} FPS simulation time`,
  );
  console.log(
    `PASS ${schedule.framesPerSecond} FPS: ` +
      `${schedule.result.steps} ticks / ${schedule.result.simulationSeconds.toFixed(6)}s`,
  );
}

const spikeClock = new FixedStepClock();
let spikeSteps = 0;
const spike = spikeClock.advance(1, () => {
  spikeSteps += 1;
});
assertClose(
  spike.clampedFrameSeconds,
  MAX_FRAME_DELTA_SECONDS,
  1e-12,
  'frame-spike clamp',
);
assert(spikeSteps === 6, `Clamped 0.1 s spike produced ${spikeSteps} ticks; 6 expected.`);
console.log('PASS 1.0s frame spike: clamped to 0.1s and advanced exactly 6 ticks.');

const irregularClock = new FixedStepClock();
let irregularSteps = 0;
for (const delta of [0.004, 0.021, 0.013, 0.033, 0.008, 0.018, 0.003]) {
  irregularClock.advance(delta, () => {
    irregularSteps += 1;
  });
}
assert(irregularSteps === 6, `Irregular 0.1 s partition produced ${irregularSteps} ticks; 6 expected.`);
console.log('PASS irregular frame partition: 0.100s advanced exactly 6 ticks.');

function runSchedule(
  framesPerSecond: number,
  seconds: number,
): ScheduleResult {
  const clock = new FixedStepClock();
  let steps = 0;
  let result = clock.advance(0, () => undefined);
  const totalFrames = framesPerSecond * seconds;
  for (let frame = 0; frame < totalFrames; frame += 1) {
    result = clock.advance(1 / framesPerSecond, () => {
      steps += 1;
    });
  }
  return { steps, simulationSeconds: result.simulationSeconds };
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertClose(
  actual: number,
  expected: number,
  tolerance: number,
  label: string,
): void {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(
      `${label}: ${actual.toFixed(12)} differs from ${expected.toFixed(12)}.`,
    );
  }
}
