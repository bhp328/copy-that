import { FixedStepClock } from '../src/fixedStep.js';
import {
  RaceSimulation,
  type AttackSide,
  type RaceAction,
  type RaceDiagnosticsView,
  type RaceEvent,
} from '../src/raceSimulation.js';

const TRACK_LENGTH_METRES = 1_721.17;
const MAX_FRAMES = 20_000;

interface Trace {
  readonly diagnostics: RaceDiagnosticsView;
  readonly events: readonly RaceEvent[];
}

const afk = runScenario(17, () => []);
assert(afk.diagnostics.phase === 'sliceComplete', `AFK should finish the first slice, got ${afk.diagnostics.phase}.`);
assert(afk.diagnostics.position === 3, 'AFK should lose P2 after the automatic defence yield.');
assert(afk.diagnostics.crestOutcome === 'emergency_save', 'AFK should reach the engineer-critical crest without a call.');
assert(afk.diagnostics.damage > 0.1, 'AFK crest consequence should persist damage.');
console.log(`PASS AFK: ${afk.diagnostics.crestOutcome}, position P${afk.diagnostics.position}, damage=${afk.diagnostics.damage.toFixed(2)}`);

const conservative = runScenario(17, (simulation) => {
  const diagnostics = simulation.getDiagnosticsView();
  if (diagnostics.encounter === 'pace' && diagnostics.paceMode === null && diagnostics.routeDistanceMetres >= 220) {
    return [{ kind: 'setPace', mode: 'save' }];
  }
  if (diagnostics.encounter === 'crest' && diagnostics.cornerApproach === null && diagnostics.routeDistanceMetres < 1_600) {
    return [{ kind: 'setCornerApproach', mode: 'early' }];
  }
  if (diagnostics.encounter === 'defence' && diagnostics.defenceMode === null) {
    return [{ kind: 'setDefence', mode: 'yield' }];
  }
  return [];
});
assert(conservative.diagnostics.phase === 'sliceComplete', 'Conservative path should safely complete the slice.');
assert(conservative.diagnostics.position === 3, 'Conservative yield should miss P2 without a DNF.');
assert(conservative.diagnostics.damage < 0.1, 'Conservative path should not take damage.');
console.log(`PASS conservative: position P${conservative.diagnostics.position}, damage=${conservative.diagnostics.damage.toFixed(2)}`);

const good = runScenario(17, (simulation) => {
  const diagnostics = simulation.getDiagnosticsView();
  if (diagnostics.encounter === 'pace' && diagnostics.paceMode === null && diagnostics.routeDistanceMetres >= 220) {
    return [{ kind: 'setPace', mode: 'hold' }];
  }
  if (diagnostics.encounter === 'crest' && diagnostics.cornerApproach === null && diagnostics.routeDistanceMetres < 1_600) {
    return [{ kind: 'setCornerApproach', mode: 'normal' }];
  }
  if (diagnostics.encounter === 'defence' && diagnostics.defenceMode === null) {
    return [{ kind: 'setDefence', mode: diagnostics.attackSide }];
  }
  return [];
});
assert(good.diagnostics.phase === 'sliceComplete', 'Good path should complete the first slice.');
assert(good.diagnostics.position === 2, 'Good path should defend P2.');
assert(good.diagnostics.crestOutcome === 'clean', `Good path crest should be clean, got ${good.diagnostics.crestOutcome}.`);
assert(good.diagnostics.defenceOutcome === 'held', `Good path defence should hold, got ${good.diagnostics.defenceOutcome}.`);
console.log(`PASS good: crest=${good.diagnostics.crestOutcome}, defence=${good.diagnostics.defenceOutcome}, position P${good.diagnostics.position}`);

const wrong = runScenario(17, (simulation) => {
  const diagnostics = simulation.getDiagnosticsView();
  if (diagnostics.encounter === 'pace' && diagnostics.paceMode === null && diagnostics.routeDistanceMetres >= 220) {
    return [{ kind: 'setPace', mode: 'push' }];
  }
  if (diagnostics.encounter === 'crest' && diagnostics.cornerApproach === null && diagnostics.routeDistanceMetres > 1_650) {
    return [{ kind: 'setCornerApproach', mode: 'late' }];
  }
  if (diagnostics.encounter === 'defence' && diagnostics.defenceMode === null) {
    return [{ kind: 'setDefence', mode: oppositeSide(diagnostics.attackSide) }];
  }
  return [];
});
assert(wrong.diagnostics.phase === 'dnf' || wrong.diagnostics.position === 3, 'Wrong path must cause contact/DNF or a legible position loss.');
assert(wrong.diagnostics.defenceOutcome === 'contact' || wrong.diagnostics.defenceOutcome === 'lost_position', 'Wrong defence should resolve causally.');
console.log(`PASS wrong: crest=${wrong.diagnostics.crestOutcome}, defence=${wrong.diagnostics.defenceOutcome}, phase=${wrong.diagnostics.phase}`);

const earlyTiming = runScenario(17, (simulation) => {
  const diagnostics = simulation.getDiagnosticsView();
  if (diagnostics.encounter === 'pace' && diagnostics.paceMode === null && diagnostics.routeDistanceMetres >= 220) return [{ kind: 'setPace', mode: 'hold' }];
  if (diagnostics.encounter === 'crest' && diagnostics.cornerApproach === null && diagnostics.routeDistanceMetres < 1_400) return [{ kind: 'setCornerApproach', mode: 'normal' }];
  if (diagnostics.encounter === 'defence' && diagnostics.defenceMode === null) return [{ kind: 'setDefence', mode: diagnostics.attackSide }];
  return [];
});
const lateTiming = runScenario(17, (simulation) => {
  const diagnostics = simulation.getDiagnosticsView();
  if (diagnostics.encounter === 'pace' && diagnostics.paceMode === null && diagnostics.routeDistanceMetres >= 220) return [{ kind: 'setPace', mode: 'hold' }];
  if (diagnostics.encounter === 'crest' && diagnostics.cornerApproach === null && diagnostics.routeDistanceMetres > 1_650) return [{ kind: 'setCornerApproach', mode: 'normal' }];
  if (diagnostics.encounter === 'defence' && diagnostics.defenceMode === null) return [{ kind: 'setDefence', mode: diagnostics.attackSide }];
  return [];
});
assert(earlyTiming.diagnostics.crestOutcome !== lateTiming.diagnostics.crestOutcome || earlyTiming.diagnostics.damage !== lateTiming.diagnostics.damage, 'Moving the same semantic crest call must change its physical consequence.');
console.log(`PASS timing: early=${earlyTiming.diagnostics.crestOutcome}/${earlyTiming.diagnostics.damage.toFixed(2)} late=${lateTiming.diagnostics.crestOutcome}/${lateTiming.diagnostics.damage.toFixed(2)}`);

for (const fps of [30, 60, 120]) {
  const trace = runScenarioWithRenderSchedule(17, fps, (simulation) => {
    const diagnostics = simulation.getDiagnosticsView();
    if (diagnostics.encounter === 'pace' && diagnostics.paceMode === null && diagnostics.routeDistanceMetres >= 220) return [{ kind: 'setPace', mode: 'hold' }];
    if (diagnostics.encounter === 'crest' && diagnostics.cornerApproach === null && diagnostics.routeDistanceMetres < 1_600) return [{ kind: 'setCornerApproach', mode: 'normal' }];
    if (diagnostics.encounter === 'defence' && diagnostics.defenceMode === null) return [{ kind: 'setDefence', mode: diagnostics.attackSide }];
    return [];
  });
  assert(trace.diagnostics.position === good.diagnostics.position, `${fps} FPS schedule changed position.`);
  assert(trace.diagnostics.crestOutcome === good.diagnostics.crestOutcome, `${fps} FPS schedule changed crest outcome.`);
  assert(trace.diagnostics.defenceOutcome === good.diagnostics.defenceOutcome, `${fps} FPS schedule changed defence outcome.`);
  assert(trace.diagnostics.eventSequence === good.diagnostics.eventSequence, `${fps} FPS schedule changed event sequencing.`);
  console.log(`PASS ${fps} FPS partition: ${trace.diagnostics.tick} ticks, ${trace.diagnostics.eventSequence} events`);
}

const viewProbe = new RaceSimulation({ seed: 17, trackLengthMetres: TRACK_LENGTH_METRES });
viewProbe.enqueue({ kind: 'start' }, 'debug');
viewProbe.step();
const engineer = viewProbe.getEngineerView();
const driver = viewProbe.getDriverView();
assert(!('exactGrip' in engineer), 'Engineer view leaked exact grip.');
assert(!('attackSide' in engineer), 'Engineer view leaked local attack side.');
assert(!('upcoming' in driver), 'Driver view leaked unseen upcoming geometry.');
assert(!('closingTrendMetresPerSecond' in driver), 'Driver view leaked global rival trend.');
assert(Object.isFrozen(engineer) && Object.isFrozen(engineer.upcoming), 'Engineer view must be immutable.');
assert(Object.isFrozen(driver) && Object.isFrozen(driver.carFeel), 'Driver view must be immutable.');
console.log('PASS information split: role views are frozen and omit privileged fields.');

const fifoProbe = new RaceSimulation({ seed: 17, trackLengthMetres: TRACK_LENGTH_METRES });
fifoProbe.enqueue({ kind: 'start' }, 'debug');
fifoProbe.enqueue({ kind: 'setPace', mode: 'push' }, 'text');
fifoProbe.enqueue({ kind: 'setPace', mode: 'save' }, 'text');
fifoProbe.step();
const fifoEvents = fifoProbe.drainEvents();
const receipts = fifoEvents.filter((event): event is Extract<RaceEvent, { readonly type: 'actionReceipt' }> => event.type === 'actionReceipt');
assert(receipts[0]?.status === 'accepted' && receipts[0].action.kind === 'start', 'FIFO start was not accepted first.');
assert(receipts[1]?.status === 'accepted' && receipts[1].action.kind === 'setPace', 'FIFO first pace call was not accepted.');
assert(receipts[2]?.status === 'rejected' && receipts[2].reason === 'already_committed', 'FIFO duplicate pace call was not rejected as already committed.');
console.log('PASS FIFO receipts: first accepted call wins and duplicate is alreadyCommitted.');

function runScenario(
  seed: number,
  planner: (simulation: RaceSimulation) => readonly RaceAction[],
): Trace {
  const simulation = new RaceSimulation({ seed, trackLengthMetres: TRACK_LENGTH_METRES });
  simulation.enqueue({ kind: 'start' }, 'debug');
  const events: RaceEvent[] = [];
  let previousEncounter = simulation.getDiagnosticsView().encounter;
  for (let frame = 0; frame < MAX_FRAMES; frame += 1) {
    const diagnostics = simulation.getDiagnosticsView();
    if (diagnostics.phase === 'running') {
      for (const action of planner(simulation)) simulation.enqueue(action, 'debug');
    }
    simulation.step();
    events.push(...simulation.drainEvents());
    const next = simulation.getDiagnosticsView();
    if (next.encounter !== previousEncounter) previousEncounter = next.encounter;
    if (next.phase === 'sliceComplete' || next.phase === 'dnf') {
      return { diagnostics: next, events: Object.freeze(events) };
    }
  }
  throw new Error('Scenario did not reach a terminal first-slice state.');
}

function runScenarioWithRenderSchedule(
  seed: number,
  fps: number,
  planner: (simulation: RaceSimulation) => readonly RaceAction[],
): Trace {
  const simulation = new RaceSimulation({ seed, trackLengthMetres: TRACK_LENGTH_METRES });
  simulation.enqueue({ kind: 'start' }, 'debug');
  const clock = new FixedStepClock();
  const events: RaceEvent[] = [];
  for (let frame = 0; frame < MAX_FRAMES; frame += 1) {
    const result = clock.advance(1 / fps, () => simulation.step());
    events.push(...simulation.drainEvents());
    if (result.steps > 0 && simulation.getDiagnosticsView().phase === 'running') {
      for (const action of planner(simulation)) simulation.enqueue(action, 'debug');
    }
    if (result.simulationSeconds >= 60) {
      const diagnostics = simulation.getDiagnosticsView();
      return { diagnostics, events: Object.freeze(events) };
    }
  }
  throw new Error(`${fps} FPS schedule did not reach a terminal state.`);
}

function oppositeSide(side: AttackSide): AttackSide {
  return side === 'inside' ? 'outside' : 'inside';
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
