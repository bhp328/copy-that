import type { OvertakeOutcome } from './overtakeModel.js';
import type { CoreOvertakeSnapshot } from './overtakeSimulation.js';
import type { DriverCommand } from './commandParser.js';
import {
  RaceSimulation,
  type RaceAction,
  type RaceDiagnosticsView,
} from './raceSimulation.js';
import type { RaceRadioKey, SprintRaceSnapshot } from './raceSession.js';

const TRACK_LENGTH_METRES = 1_721.17;

/**
 * Transitional presentation adapter. The browser's existing cockpit can keep
 * rendering while the new RaceSimulation replaces the old race authority.
 * It deliberately carries the separate role views alongside the legacy shape;
 * the UI reads the role views for rebuild mode and never uses the synthetic
 * overtake fields as tactical evidence.
 */
export function createRebuildBrowserSnapshot(
  simulation: RaceSimulation,
  trackLengthMetres = TRACK_LENGTH_METRES,
): SprintRaceSnapshot {
  const engineer = simulation.getEngineerView();
  const driver = simulation.getDriverView();
  const presentation = simulation.getPresentationView();
  const diagnostics = simulation.getDiagnosticsView();
  const legacyPhase = diagnostics.phase === 'ready'
    ? 'ready'
    : diagnostics.phase === 'running'
      ? 'opening'
      : 'finished';
  const rivalTotalProgress = diagnostics.totalProgress - diagnostics.gapMetres / trackLengthMetres;
  const leaderTotalProgress = diagnostics.totalProgress + 94 / trackLengthMetres;
  const lap = Math.min(3, Math.max(1, Math.floor(diagnostics.totalProgress) + 1));
  const lapProgress = wrapProgress(diagnostics.totalProgress);
  const sector = (Math.min(2, Math.floor(lapProgress * 3)) + 1) as 1 | 2 | 3;
  const outcome: OvertakeOutcome = diagnostics.phase === 'sliceComplete'
    ? diagnostics.position === 2 ? 'success' : 'noCall'
    : diagnostics.phase === 'dnf'
      ? 'blocked'
      : 'pending';
  const core = createSyntheticCore(diagnostics, rivalTotalProgress, outcome);
  const radioKey = mapRadioKey(presentation.radioSignal);
  return {
    phase: legacyPhase,
    elapsedSeconds: diagnostics.elapsedSeconds,
    countdownValue: null,
    playerTotalProgress: diagnostics.totalProgress,
    playerSpeedKmh: diagnostics.speedKmh,
    playerLateralOffsetMetres: diagnostics.playerLateralOffsetMetres,
    rivalTotalProgress,
    rivalLateralOffsetMetres: diagnostics.rivalLateralOffsetMetres,
    leaderTotalProgress,
    position: diagnostics.position,
    lap,
    totalLaps: 3,
    sector,
    raceProgress: clamp01(diagnostics.routeDistanceMetres / (trackLengthMetres * 1.45)),
    gapSeconds: Math.abs(diagnostics.gapMetres) / Math.max(1, diagnostics.speedKmh / 3.6),
    paceDecision: diagnostics.paceMode === 'save'
      ? 'hold'
      : diagnostics.paceMode ?? (diagnostics.crestOutcome === null && diagnostics.routeDistanceMetres >= 660 ? 'missed' : null),
    canCallPace: engineer.allowedCalls.includes('setPace'),
    canCallIntent: engineer.allowedCalls.includes('setCornerApproach') || engineer.allowedCalls.includes('setDefence'),
    canCallNow: false,
    intent: diagnostics.defenceMode === 'inside' || diagnostics.defenceMode === 'outside' ? diagnostics.defenceMode : null,
    nowCalled: false,
    outcome,
    resultAchieved: diagnostics.phase === 'sliceComplete' || diagnostics.phase === 'dnf' ? diagnostics.position === 2 : null,
    radioKey,
    radioSequence: diagnostics.eventSequence,
    core,
    rebuild: {
      engineer,
      driver,
      presentation,
      diagnostics,
    },
  };
}

export function raceActionForDriverCommand(command: DriverCommand): RaceAction | null {
  switch (command) {
    case 'push':
    case 'hold':
    case 'save':
      return { kind: 'setPace', mode: command };
    case 'early':
    case 'normal':
    case 'late':
      return { kind: 'setCornerApproach', mode: command };
    case 'inside':
    case 'outside':
    case 'yield':
      return { kind: 'setDefence', mode: command };
    default:
      return null;
  }
}

function createSyntheticCore(
  diagnostics: RaceDiagnosticsView,
  rivalTotalProgress: number,
  outcome: OvertakeOutcome,
): CoreOvertakeSnapshot {
  return {
    scenarioIndex: Math.max(0, diagnostics.attempt - 1),
    defenseSide: diagnostics.attackSide,
    defenseMode: 'seeded',
    seed: diagnostics.attempt,
    eventTimeSeconds: diagnostics.elapsedSeconds,
    stage: diagnostics.encounter === 'defence' ? 'execution' : diagnostics.encounter === 'complete' ? 'resolution' : 'reveal',
    defenseReadable: diagnostics.encounter === 'defence',
    preparationProgress: diagnostics.encounter === 'defence' ? clamp01((24 - Math.max(0, diagnostics.gapMetres)) / 24) : 0,
    playerTotalProgress: diagnostics.totalProgress,
    opponentTotalProgress: rivalTotalProgress,
    playerSpeedKmh: diagnostics.speedKmh,
    opponentSpeedKmh: diagnostics.speedKmh,
    playerDistanceMetres: diagnostics.routeDistanceMetres,
    opponentDistanceMetres: diagnostics.routeDistanceMetres - diagnostics.gapMetres,
    distanceToCornerMetres: Math.max(0, 101 - diagnostics.routeDistanceMetres),
    longitudinalGapMetres: diagnostics.gapMetres,
    relativeGapSeconds: -diagnostics.gapMetres / Math.max(10, diagnostics.speedKmh / 3.6),
    gapRelation: diagnostics.position === 2 ? 'ahead' : 'behind',
    playerLateralOffsetMetres: diagnostics.playerLateralOffsetMetres,
    opponentLateralOffsetMetres: diagnostics.rivalLateralOffsetMetres,
    intent: diagnostics.defenceMode === 'inside' || diagnostics.defenceMode === 'outside' ? diagnostics.defenceMode : null,
    phase: diagnostics.phase === 'dnf' ? 'aborting' : diagnostics.position === 2 ? 'passed' : 'following',
    towActive: false,
    nowCalled: false,
    nowAssessment: null,
    outcome,
    driverMessage: null,
    canCallIntent: false,
    canCallNow: false,
    canRetry: diagnostics.phase === 'sliceComplete' || diagnostics.phase === 'dnf',
  };
}

function mapRadioKey(signal: string | null): RaceRadioKey | null {
  if (signal === null) return null;
  const mapping: Readonly<Record<string, RaceRadioKey>> = {
    radio_check: 'radioCheck',
    push_ack: 'pushAck',
    hold_ack: 'holdAck',
    save_ack: 'holdAck',
    feel_report: 'feelReport',
    blind_crest: 'blindCrest',
    blind_crest_warning: 'blindCrest',
    early_brake_ack: 'raceStart',
    normal_brake_ack: 'raceStart',
    late_brake_ack: 'raceStart',
    crest_clean: 'crestClean',
    crest_emergency_save: 'crestEmergency',
    crest_compromised: 'crestEmergency',
    crest_spin: 'crestEmergency',
    rival_closing: 'rivalClosing',
    cover_inside_ack: 'defenceHeld',
    cover_outside_ack: 'defenceHeld',
    defence_held: 'defenceHeld',
    yield_clear: 'safeYield',
    safe_finish_below_target: 'safeYield',
    contact: 'contact',
    dnf_contact: 'contact',
    hold_p2: 'targetAchieved',
  };
  return mapping[signal] ?? 'raceStart';
}

function wrapProgress(progress: number): number {
  return ((progress % 1) + 1) % 1;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}
