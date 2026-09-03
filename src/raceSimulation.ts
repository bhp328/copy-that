import { AUTHORITATIVE_STEP_SECONDS } from './fixedStep.js';
import {
  getTrackSectionAt,
  MERIDIAN_2_TRACK_SPEC,
  type TrackSectionKey,
  type TrackSpec,
  wrapUnitProgress,
} from './trackSpec.js';
import {
  clampRaceLateralOffset,
  getRaceCorridorLimits,
  isRaceVehicleContained,
} from './raceCorridor.js';

export type PaceMode = 'push' | 'hold' | 'save';
export type CornerApproachMode = 'early' | 'normal' | 'late';
export type DefenceMode = 'inside' | 'outside' | 'yield';
export type DriverQuestion = 'grip' | 'brakes' | 'space' | 'visibility';
export type AttackSide = 'inside' | 'outside';
export type RacePhase = 'ready' | 'running' | 'sliceComplete' | 'dnf';
export type RaceEncounter = 'pace' | 'crest' | 'defence' | 'release' | 'complete';
export type VehicleSurface = 'asphalt' | 'runoff';

export type RaceAction =
  | { readonly kind: 'start' }
  | { readonly kind: 'retry' }
  | { readonly kind: 'askDriver'; readonly topic: DriverQuestion }
  | { readonly kind: 'setPace'; readonly mode: PaceMode }
  | { readonly kind: 'setCornerApproach'; readonly mode: CornerApproachMode }
  | { readonly kind: 'setDefence'; readonly mode: DefenceMode };

export type RaceIntent = Exclude<
  RaceAction,
  { readonly kind: 'start' } | { readonly kind: 'retry' }
>;

export type RaceActionSource = 'voice' | 'text' | 'accessibility' | 'debug';

export interface EnqueuedAction {
  readonly actionId: number;
  readonly enqueuedTick: number;
  readonly source: RaceActionSource;
}

export type RaceEvent =
  | ActionReceiptEvent
  | { readonly type: 'raceStarted'; readonly sequence: number; readonly tick: number; readonly attempt: number }
  | { readonly type: 'driverReport'; readonly sequence: number; readonly tick: number; readonly attempt: number; readonly topic: 'feel' | 'visibility' | 'space'; readonly signal: string }
  | { readonly type: 'driverAck'; readonly sequence: number; readonly tick: number; readonly attempt: number; readonly phrase: string }
  | { readonly type: 'encounterStarted'; readonly sequence: number; readonly tick: number; readonly attempt: number; readonly encounter: RaceEncounter; readonly reason: string }
  | { readonly type: 'decisionResolved'; readonly sequence: number; readonly tick: number; readonly attempt: number; readonly encounter: RaceEncounter; readonly outcome: string; readonly reason: string; readonly before: RaceStateEvidence; readonly after: RaceStateEvidence }
  | { readonly type: 'positionChanged'; readonly sequence: number; readonly tick: number; readonly attempt: number; readonly from: 2 | 3; readonly to: 2 | 3; readonly reason: string }
  | { readonly type: 'momentMarker'; readonly sequence: number; readonly tick: number; readonly attempt: number; readonly label: 'cleanCrest' | 'emergencySave' | 'defenceHeld' | 'safeYield' | 'contact' };

export interface ActionReceiptEvent {
  readonly type: 'actionReceipt';
  readonly sequence: number;
  readonly tick: number;
  readonly attempt: number;
  readonly actionId: number;
  readonly status: 'accepted' | 'rejected' | 'cancelled';
  readonly reason: string;
  readonly action: RaceAction;
}

export interface RaceStateEvidence {
  readonly routeDistanceMetres: number;
  readonly speedKmh: number;
  readonly grip: number;
  readonly tireHeat: number;
  readonly stability: number;
  readonly damage: number;
  readonly gapMetres: number;
  readonly position: 2 | 3;
}

export interface EngineerRaceView {
  readonly role: 'engineer';
  readonly phase: RacePhase;
  readonly encounter: RaceEncounter;
  readonly tick: number;
  readonly elapsedSeconds: number;
  readonly attempt: number;
  readonly totalProgress: number;
  readonly speedKmh: number;
  readonly position: 2 | 3;
  readonly gapMetres: number;
  readonly closingTrendMetresPerSecond: number;
  readonly roadRemainingToDecisionMetres: number;
  readonly upcoming: {
    readonly section: TrackSectionKey;
    readonly pressure: 'calm' | 'building' | 'critical' | 'release';
    readonly engineerCritical: boolean;
    readonly distanceMetres: number;
    readonly label: 'pace_window' | 'blind_crest' | 'rival_attack' | 'release' | 'complete';
  };
  readonly evidenceBands: {
    readonly gap: 'comfortable' | 'closing' | 'under_attack';
    readonly road: 'open' | 'committing' | 'short';
    readonly pace: 'uncommitted' | 'push' | 'hold' | 'save' | 'missed';
  };
  readonly lastDriverReport: {
    readonly topic: 'feel' | 'visibility' | 'space' | null;
    readonly signal: string | null;
  };
  readonly allowedCalls: readonly RaceAction['kind'][];
}

export interface DriverRaceView {
  readonly role: 'driver';
  readonly phase: RacePhase;
  readonly encounter: RaceEncounter;
  readonly tick: number;
  readonly elapsedSeconds: number;
  readonly attempt: number;
  readonly totalProgress: number;
  readonly speedKmh: number;
  readonly lateralOffsetMetres: number;
  readonly surface: VehicleSurface;
  readonly carFeel: {
    readonly exactGrip: number;
    readonly tireHeat: number;
    readonly brakeFeel: 'firm' | 'long' | 'fading';
    readonly stability: number;
    readonly damage: number;
    readonly reportedFeel: 'neutral' | 'front_limited' | 'rear_limited';
  };
  readonly visibility: {
    readonly distanceMetres: number;
    readonly level: 'clear' | 'screened' | 'blind';
  };
  readonly localSpace: {
    readonly rivalVisible: boolean;
    readonly overlapMetres: number;
    readonly attackSide: AttackSide | null;
    readonly insideClearanceMetres: number;
    readonly outsideClearanceMetres: number;
  };
  readonly allowedCalls: readonly RaceAction['kind'][];
}

export interface RacePresentationView {
  readonly phase: RacePhase;
  readonly encounter: RaceEncounter;
  readonly tick: number;
  readonly elapsedSeconds: number;
  readonly totalProgress: number;
  readonly speedKmh: number;
  readonly lateralOffsetMetres: number;
  readonly position: 2 | 3;
  readonly gapMetres: number;
  readonly rivalLateralOffsetMetres: number;
  readonly pressure: 'calm' | 'building' | 'critical' | 'release';
  readonly stress: 'calm' | 'building' | 'critical' | 'recovering';
  readonly radioSignal: string | null;
  readonly objective: 'hold_p2' | 'survive' | 'slice_complete' | 'dnf';
}

export interface RaceDiagnosticsView extends RaceStateEvidence {
  readonly phase: RacePhase;
  readonly encounter: RaceEncounter;
  readonly tick: number;
  readonly elapsedSeconds: number;
  readonly attempt: number;
  readonly totalProgress: number;
  readonly playerLateralOffsetMetres: number;
  readonly rivalLateralOffsetMetres: number;
  readonly playerSurface: VehicleSurface;
  readonly rivalSurface: VehicleSurface;
  readonly paceMode: PaceMode | null;
  readonly cornerApproach: CornerApproachMode | null;
  readonly defenceMode: DefenceMode | null;
  readonly attackSide: AttackSide;
  readonly crestOutcome: string | null;
  readonly defenceOutcome: string | null;
  readonly containmentChecks: number;
  readonly containmentClamps: number;
  readonly eventSequence: number;
}

interface MutableRaceState {
  phase: RacePhase;
  encounter: RaceEncounter;
  tick: number;
  attempt: number;
  elapsedSeconds: number;
  routeDistanceMetres: number;
  speedMetresPerSecond: number;
  rivalGapMetres: number;
  rivalLateralOffsetMetres: number;
  playerLateralOffsetMetres: number;
  playerSurface: VehicleSurface;
  rivalSurface: VehicleSurface;
  grip: number;
  tireHeat: number;
  stability: number;
  damage: number;
  position: 2 | 3;
  paceMode: PaceMode | null;
  paceWindowMissed: boolean;
  cornerApproach: CornerApproachMode | null;
  cornerCallRouteDistanceMetres: number | null;
  crestOutcome: string | null;
  crestResolved: boolean;
  defenceMode: DefenceMode | null;
  defenceOutcome: string | null;
  defenceResolved: boolean;
  lastDriverReport: { topic: 'feel' | 'visibility' | 'space' | null; signal: string | null };
  radioSignal: string | null;
  releaseUntilRouteDistanceMetres: number | null;
  containmentChecks: number;
  containmentClamps: number;
}

const START_PROGRESS = 0.4;
const PACE_REPORT_ROUTE_METRES = 180;
const PACE_WINDOW_END_ROUTE_METRES = 660;
const DEFENCE_START_ROUTE_METRES = 1_880;
const CREST_RESPONSE_SECONDS = 0.32;
const CREST_ENTRY_SPEED_METRES_PER_SECOND = 35;
const CREST_ENTRY_TARGETS: Readonly<Record<CornerApproachMode, number>> = {
  early: 30,
  normal: 35,
  late: 40,
};
const CREST_DECELERATION: Readonly<Record<CornerApproachMode, number>> = {
  early: 7.2,
  normal: 6.5,
  late: 5.4,
};
const CREST_WARNING_PROGRESS = 0.18;
const CREST_ENTRY_PROGRESS = 0.4;
const RELEASE_DISTANCE_METRES = 220;
const EPSILON = 1e-6;

export class RaceSimulation {
  private readonly trackSpec: Readonly<TrackSpec>;
  private readonly trackLengthMetres: number;
  private readonly seed: number;
  private readonly attackSide: AttackSide;
  private readonly reportedFeel: DriverRaceView['carFeel']['reportedFeel'];
  private readonly crestWarningRouteDistanceMetres: number;
  private readonly crestEntryRouteDistanceMetres: number;
  private readonly pendingActions: Array<{ readonly actionId: number; readonly action: RaceAction; readonly source: RaceActionSource }> = [];
  private readonly events: RaceEvent[] = [];
  private state: MutableRaceState;
  private nextActionId = 1;
  private nextEventSequence = 1;

  constructor(options: {
    readonly seed: number;
    readonly trackSpec?: Readonly<TrackSpec>;
    readonly trackLengthMetres?: number;
  }) {
    this.trackSpec = options.trackSpec ?? MERIDIAN_2_TRACK_SPEC;
    this.trackLengthMetres = Math.max(
      1,
      options.trackLengthMetres ?? 1_721.17,
    );
    this.seed = normalizeSeed(options.seed);
    this.attackSide = this.seed % 2 === 0 ? 'inside' : 'outside';
    this.reportedFeel = this.seed % 3 === 0
      ? 'rear_limited'
      : this.seed % 3 === 1
        ? 'front_limited'
        : 'neutral';
    this.crestWarningRouteDistanceMetres = routeDistanceToNextProgress(
      START_PROGRESS,
      CREST_WARNING_PROGRESS,
      this.trackLengthMetres,
    );
    this.crestEntryRouteDistanceMetres = routeDistanceToNextProgress(
      START_PROGRESS,
      CREST_ENTRY_PROGRESS,
      this.trackLengthMetres,
    );
    this.state = this.createInitialState(1);
  }

  enqueue(action: RaceAction, source: RaceActionSource = 'debug'): EnqueuedAction {
    const actionId = this.nextActionId;
    this.nextActionId += 1;
    this.pendingActions.push({ actionId, action, source });
    return Object.freeze({
      actionId,
      enqueuedTick: this.state.tick,
      source,
    });
  }

  queueIntent(intent: RaceIntent, source: RaceActionSource = 'debug'): EnqueuedAction {
    return this.enqueue(intent, source);
  }

  step(): void {
    this.state.tick += 1;
    this.state.elapsedSeconds = this.state.tick * AUTHORITATIVE_STEP_SECONDS;
    this.processActionsAtTick();
    if (this.state.phase === 'running') {
      this.updatePhysics();
      this.enforceContainment();
    }
  }

  drainEvents(): readonly RaceEvent[] {
    const drained = this.events.splice(0, this.events.length);
    return Object.freeze(drained.map((event) => freezeDeep(event)));
  }

  getEngineerView(): EngineerRaceView {
    const next = this.getUpcomingEvidence();
    const allowedCalls: RaceAction['kind'][] = [];
    if (this.state.phase === 'running') {
      if (this.state.encounter === 'pace' && this.state.paceMode === null && !this.state.paceWindowMissed) {
        allowedCalls.push('setPace');
      }
      if (this.state.encounter === 'crest' && !this.state.crestResolved && this.state.cornerApproach === null) {
        allowedCalls.push('setCornerApproach');
      }
      if (this.state.encounter === 'defence' && !this.state.defenceResolved && this.state.defenceMode === null) {
        allowedCalls.push('setDefence');
      }
      allowedCalls.push('askDriver');
    }
    const view: EngineerRaceView = {
      role: 'engineer',
      phase: this.state.phase,
      encounter: this.state.encounter,
      tick: this.state.tick,
      elapsedSeconds: this.state.elapsedSeconds,
      attempt: this.state.attempt,
      totalProgress: this.getTotalProgress(),
      speedKmh: metresPerSecondToKmh(this.state.speedMetresPerSecond),
      position: this.state.position,
      gapMetres: this.state.rivalGapMetres,
      closingTrendMetresPerSecond: this.getClosingTrend(),
      roadRemainingToDecisionMetres: next.distanceMetres,
      upcoming: next,
      evidenceBands: {
        gap: this.state.rivalGapMetres < 7 ? 'under_attack' : this.state.rivalGapMetres < 19 ? 'closing' : 'comfortable',
        road: next.distanceMetres < 90 ? 'short' : next.distanceMetres < 260 ? 'committing' : 'open',
        pace: this.state.paceMode ?? (this.state.paceWindowMissed ? 'missed' : 'uncommitted'),
      },
      lastDriverReport: { ...this.state.lastDriverReport },
      allowedCalls: Object.freeze(allowedCalls),
    };
    return freezeDeep(view);
  }

  getDriverView(): DriverRaceView {
    const crestDistance = Math.max(0, this.crestEntryRouteDistanceMetres - this.state.routeDistanceMetres);
    const visibilityDistanceMetres = this.state.encounter === 'crest'
      ? Math.min(crestDistance, 86)
      : 999;
    const overlapMetres = this.state.encounter === 'defence'
      ? Math.max(0, 7 - this.state.rivalGapMetres)
      : 0;
    const allowedCalls: RaceAction['kind'][] = this.state.phase === 'running'
      ? ['askDriver']
      : [];
    const view: DriverRaceView = {
      role: 'driver',
      phase: this.state.phase,
      encounter: this.state.encounter,
      tick: this.state.tick,
      elapsedSeconds: this.state.elapsedSeconds,
      attempt: this.state.attempt,
      totalProgress: this.getTotalProgress(),
      speedKmh: metresPerSecondToKmh(this.state.speedMetresPerSecond),
      lateralOffsetMetres: this.state.playerLateralOffsetMetres,
      surface: this.state.playerSurface,
      carFeel: {
        exactGrip: this.state.grip,
        tireHeat: this.state.tireHeat,
        brakeFeel: this.state.damage > 0.42 ? 'fading' : this.state.tireHeat > 0.74 ? 'long' : 'firm',
        stability: this.state.stability,
        damage: this.state.damage,
        reportedFeel: this.reportedFeel,
      },
      visibility: {
        distanceMetres: visibilityDistanceMetres,
        level: visibilityDistanceMetres < 36 ? 'blind' : visibilityDistanceMetres < 90 ? 'screened' : 'clear',
      },
      localSpace: {
        rivalVisible: this.state.encounter === 'defence' && this.state.rivalGapMetres < 24,
        overlapMetres,
        attackSide: this.state.encounter === 'defence' ? this.attackSide : null,
        insideClearanceMetres: Math.max(0.2, 4.4 - Math.abs(this.state.playerLateralOffsetMetres + 2.1)),
        outsideClearanceMetres: Math.max(0.2, 4.4 - Math.abs(this.state.playerLateralOffsetMetres - 2.1)),
      },
      allowedCalls: Object.freeze(allowedCalls),
    };
    return freezeDeep(view);
  }

  getPresentationView(): RacePresentationView {
    const section = getTrackSectionAt(wrapUnitProgress(this.getTotalProgress()), this.trackSpec);
    const stress = this.state.phase === 'dnf' || this.state.damage > 0.5
      ? 'critical'
      : this.state.encounter === 'release' || this.state.encounter === 'complete'
        ? 'recovering'
        : this.state.encounter === 'pace'
          ? 'calm'
          : 'building';
    const objective = this.state.phase === 'dnf'
      ? 'dnf'
      : this.state.phase === 'sliceComplete'
        ? 'slice_complete'
        : this.state.position === 2
          ? 'hold_p2'
          : 'survive';
    return freezeDeep({
      phase: this.state.phase,
      encounter: this.state.encounter,
      tick: this.state.tick,
      elapsedSeconds: this.state.elapsedSeconds,
      totalProgress: this.getTotalProgress(),
      speedKmh: metresPerSecondToKmh(this.state.speedMetresPerSecond),
      lateralOffsetMetres: this.state.playerLateralOffsetMetres,
      position: this.state.position,
      gapMetres: this.state.rivalGapMetres,
      rivalLateralOffsetMetres: this.state.rivalLateralOffsetMetres,
      pressure: section.pressure,
      stress,
      radioSignal: this.state.radioSignal,
      objective,
    });
  }

  getDiagnosticsView(): RaceDiagnosticsView {
    return freezeDeep({
      phase: this.state.phase,
      encounter: this.state.encounter,
      tick: this.state.tick,
      elapsedSeconds: this.state.elapsedSeconds,
      attempt: this.state.attempt,
      totalProgress: this.getTotalProgress(),
      routeDistanceMetres: this.state.routeDistanceMetres,
      speedKmh: metresPerSecondToKmh(this.state.speedMetresPerSecond),
      playerLateralOffsetMetres: this.state.playerLateralOffsetMetres,
      rivalLateralOffsetMetres: this.state.rivalLateralOffsetMetres,
      playerSurface: this.state.playerSurface,
      rivalSurface: this.state.rivalSurface,
      grip: this.state.grip,
      tireHeat: this.state.tireHeat,
      stability: this.state.stability,
      damage: this.state.damage,
      gapMetres: this.state.rivalGapMetres,
      position: this.state.position,
      paceMode: this.state.paceMode,
      cornerApproach: this.state.cornerApproach,
      defenceMode: this.state.defenceMode,
      attackSide: this.attackSide,
      crestOutcome: this.state.crestOutcome,
      defenceOutcome: this.state.defenceOutcome,
      containmentChecks: this.state.containmentChecks,
      containmentClamps: this.state.containmentClamps,
      eventSequence: this.nextEventSequence - 1,
    });
  }

  private createInitialState(attempt: number): MutableRaceState {
    return {
      phase: 'ready',
      encounter: 'pace',
      tick: 0,
      attempt,
      elapsedSeconds: 0,
      routeDistanceMetres: 0,
      speedMetresPerSecond: 42,
      rivalGapMetres: 36,
      rivalLateralOffsetMetres: 0,
      playerLateralOffsetMetres: 0,
      playerSurface: 'asphalt',
      rivalSurface: 'asphalt',
      grip: 0.88,
      tireHeat: 0.28,
      stability: 0.9,
      damage: 0,
      position: 2,
      paceMode: null,
      paceWindowMissed: false,
      cornerApproach: null,
      cornerCallRouteDistanceMetres: null,
      crestOutcome: null,
      crestResolved: false,
      defenceMode: null,
      defenceOutcome: null,
      defenceResolved: false,
      lastDriverReport: { topic: null, signal: null },
      radioSignal: null,
      releaseUntilRouteDistanceMetres: null,
      containmentChecks: 0,
      containmentClamps: 0,
    };
  }

  private processActionsAtTick(): void {
    if (this.pendingActions.length === 0) return;
    const actions = this.pendingActions.splice(0, this.pendingActions.length);
    for (let index = 0; index < actions.length; index += 1) {
      const queued = actions[index];
      if (queued.action.kind === 'retry') {
        for (const cancelled of actions.slice(index + 1)) {
          this.emitActionReceipt(cancelled, 'cancelled', 'cancelled_by_retry');
        }
        this.applyRetry(queued);
        break;
      }
      const result = this.applyAction(queued.action);
      this.emitActionReceipt(queued, result.status, result.reason);
    }
  }

  private applyAction(queuedAction: RaceAction): { readonly status: 'accepted' | 'rejected'; readonly reason: string } {
    if (queuedAction.kind === 'start') {
      if (this.state.phase !== 'ready') return { status: 'rejected', reason: 'already_started' };
      this.state.phase = 'running';
      this.state.radioSignal = 'radio_check';
      this.emit({ type: 'raceStarted', sequence: 0, tick: 0, attempt: 0 });
      this.emit({ type: 'encounterStarted', sequence: 0, tick: 0, attempt: 0, encounter: 'pace', reason: 'opening_window' });
      return { status: 'accepted', reason: 'race_started' };
    }
    if (this.state.phase !== 'running') return { status: 'rejected', reason: 'race_not_running' };
    if (queuedAction.kind === 'askDriver') {
      this.answerDriver(queuedAction.topic);
      return { status: 'accepted', reason: 'driver_answered' };
    }
    if (queuedAction.kind === 'setPace') {
      if (this.state.encounter !== 'pace' || this.state.paceMode !== null || this.state.paceWindowMissed) {
        return { status: 'rejected', reason: this.state.paceMode !== null ? 'already_committed' : 'pace_window_closed' };
      }
      this.state.paceMode = queuedAction.mode;
      this.state.radioSignal = `${queuedAction.mode}_ack`;
      this.emit({ type: 'driverAck', sequence: 0, tick: 0, attempt: 0, phrase: queuedAction.mode === 'push' ? 'Copy. Give me everything.' : queuedAction.mode === 'hold' ? 'Copy. Hold this rhythm.' : 'Copy. Saving the tyres.' });
      return { status: 'accepted', reason: `pace_${queuedAction.mode}` };
    }
    if (queuedAction.kind === 'setCornerApproach') {
      if (this.state.encounter !== 'crest' || this.state.cornerApproach !== null || this.state.crestResolved) {
        return { status: 'rejected', reason: this.state.cornerApproach !== null ? 'already_committed' : 'crest_window_closed' };
      }
      this.state.cornerApproach = queuedAction.mode;
      this.state.cornerCallRouteDistanceMetres = this.state.routeDistanceMetres;
      this.state.radioSignal = `${queuedAction.mode}_brake_ack`;
      this.emit({ type: 'driverAck', sequence: 0, tick: 0, attempt: 0, phrase: queuedAction.mode === 'early' ? 'Copy. Braking before the crest.' : queuedAction.mode === 'normal' ? 'Copy. Normal brake point.' : 'Copy. Holding it late.' });
      return { status: 'accepted', reason: `crest_${queuedAction.mode}` };
    }
    if (queuedAction.kind === 'setDefence') {
      if (this.state.encounter !== 'defence' || this.state.defenceMode !== null || this.state.defenceResolved) {
        return { status: 'rejected', reason: this.state.defenceMode !== null ? 'already_committed' : 'defence_window_closed' };
      }
      this.state.defenceMode = queuedAction.mode;
      if (queuedAction.mode === 'yield') {
        this.resolveDefence('safe_yield', 'yielded_before_overlap');
      } else {
        this.state.playerLateralOffsetMetres = queuedAction.mode === 'inside' ? -2.1 : 2.1;
        this.state.radioSignal = `cover_${queuedAction.mode}_ack`;
        this.emit({ type: 'driverAck', sequence: 0, tick: 0, attempt: 0, phrase: `Copy. Covering ${queuedAction.mode}.` });
      }
      return { status: 'accepted', reason: `defence_${queuedAction.mode}` };
    }
    return { status: 'rejected', reason: 'unsupported_action' };
  }

  private applyRetry(queued: { readonly actionId: number; readonly action: RaceAction; readonly source: RaceActionSource }): void {
    this.state = this.createInitialState(this.state.attempt + 1);
    this.emitActionReceipt(queued, 'accepted', 'retry_started');
    this.emit({ type: 'raceStarted', sequence: 0, tick: 0, attempt: this.state.attempt });
    this.state.phase = 'running';
    this.emit({ type: 'encounterStarted', sequence: 0, tick: 0, attempt: this.state.attempt, encounter: 'pace', reason: 'retry_opening_window' });
  }

  private answerDriver(topic: DriverQuestion): void {
    const report = topic === 'grip'
      ? { topic: 'feel' as const, signal: this.reportedFeel }
      : topic === 'visibility'
        ? { topic: 'visibility' as const, signal: this.state.encounter === 'crest' ? 'screened' : 'clear' }
        : topic === 'space'
          ? { topic: 'space' as const, signal: this.state.encounter === 'defence' ? this.attackSide : 'clear' }
          : { topic: 'feel' as const, signal: this.state.damage > 0.35 ? 'brakes_fading' : 'brakes_firm' };
    this.state.lastDriverReport = report;
    this.state.radioSignal = report.topic === 'feel'
      ? 'feel_report'
      : report.topic === 'visibility'
        ? 'blind_crest'
        : 'rival_closing';
    this.emit({ type: 'driverReport', sequence: 0, tick: 0, attempt: 0, topic: report.topic, signal: report.signal });
  }

  private updatePhysics(): void {
    const deltaSeconds = AUTHORITATIVE_STEP_SECONDS;
    const previousRoute = this.state.routeDistanceMetres;
    const targetSpeed = this.getTargetSpeedMetresPerSecond();
    const crestBraking = this.state.encounter === 'crest' && this.state.cornerApproach !== null && !this.state.crestResolved && this.state.cornerCallRouteDistanceMetres !== null && this.state.routeDistanceMetres >= this.state.cornerCallRouteDistanceMetres + CREST_RESPONSE_SECONDS * this.state.speedMetresPerSecond;
    if (crestBraking) {
      const mode = this.state.cornerApproach as CornerApproachMode;
      this.state.speedMetresPerSecond = Math.max(
        CREST_ENTRY_TARGETS[mode],
        this.state.speedMetresPerSecond - CREST_DECELERATION[mode] * deltaSeconds,
      );
    } else {
      this.state.speedMetresPerSecond = approach(
        this.state.speedMetresPerSecond,
        targetSpeed,
        (targetSpeed > this.state.speedMetresPerSecond ? 12 : 18) * deltaSeconds,
      );
    }
    this.state.routeDistanceMetres += this.state.speedMetresPerSecond * deltaSeconds;
    this.updateCarCondition(deltaSeconds);
    this.updateGap(deltaSeconds);
    this.checkMilestones(previousRoute);
    this.state.rivalLateralOffsetMetres = this.state.encounter === 'defence' && this.state.rivalGapMetres < 24
      ? this.attackSide === 'inside' ? -2.1 : 2.1
      : 0;
  }

  private getTargetSpeedMetresPerSecond(): number {
    if (this.state.encounter === 'crest' && !this.state.crestResolved) {
      if (this.state.cornerApproach === null) return 47;
      return Math.max(CREST_ENTRY_TARGETS[this.state.cornerApproach], 41);
    }
    const base = this.state.paceMode === 'push'
      ? 55
      : this.state.paceMode === 'save'
        ? 45
        : 50;
    return this.state.damage > 0.45 ? base - 6 : base;
  }

  private updateCarCondition(deltaSeconds: number): void {
    const push = this.state.paceMode === 'push';
    const save = this.state.paceMode === 'save';
    this.state.tireHeat = clamp01(
      this.state.tireHeat + (push ? 0.0024 : save ? -0.0018 : 0.0008) * deltaSeconds,
    );
    this.state.grip = clamp01(
      this.state.grip - (push ? 0.0014 : save ? -0.001 : 0.0004) * deltaSeconds,
    );
    if (this.state.encounter === 'release') {
      this.state.stability = clamp01(this.state.stability + 0.012 * deltaSeconds);
      this.state.tireHeat = clamp01(this.state.tireHeat - 0.006 * deltaSeconds);
    }
    if (this.state.encounter !== 'crest' && this.state.playerSurface === 'runoff') {
      this.state.stability = clamp01(this.state.stability + 0.004 * deltaSeconds);
    }
  }

  private updateGap(deltaSeconds: number): void {
    const closingRate = this.state.encounter === 'defence'
      ? 1.8
      : this.state.paceMode === 'push'
        ? 0.38
        : this.state.paceMode === 'save'
          ? 1.08
          : 0.72;
    this.state.rivalGapMetres = Math.max(-4, this.state.rivalGapMetres - closingRate * deltaSeconds);
  }

  private checkMilestones(previousRoute: number): void {
    if (previousRoute < PACE_REPORT_ROUTE_METRES && this.state.routeDistanceMetres >= PACE_REPORT_ROUTE_METRES) {
      this.state.lastDriverReport = { topic: 'feel', signal: this.reportedFeel };
      this.state.radioSignal = 'feel_report';
      this.emit({ type: 'driverReport', sequence: 0, tick: 0, attempt: 0, topic: 'feel', signal: this.reportedFeel });
    }
    if (this.state.paceMode === null && !this.state.paceWindowMissed && previousRoute < PACE_WINDOW_END_ROUTE_METRES && this.state.routeDistanceMetres >= PACE_WINDOW_END_ROUTE_METRES) {
      this.state.paceWindowMissed = true;
      this.state.radioSignal = 'pace_window_missed';
      this.emitDecision('pace', 'missed', 'pace_call_absent');
    }
    if (this.state.encounter === 'pace' && previousRoute < this.crestWarningRouteDistanceMetres && this.state.routeDistanceMetres >= this.crestWarningRouteDistanceMetres) {
      this.state.encounter = 'crest';
      this.state.radioSignal = 'blind_crest_warning';
      this.emitEncounter('crest', 'engineer_sees_hidden_tightening');
      this.state.lastDriverReport = { topic: 'visibility', signal: 'screened' };
      this.state.radioSignal = 'blind_crest';
      this.emit({ type: 'driverReport', sequence: 0, tick: 0, attempt: 0, topic: 'visibility', signal: 'screened' });
    }
    if (this.state.encounter === 'crest' && !this.state.crestResolved && previousRoute < this.crestEntryRouteDistanceMetres && this.state.routeDistanceMetres >= this.crestEntryRouteDistanceMetres) {
      this.resolveCrest();
    }
    if ((this.state.encounter === 'crest' || this.state.encounter === 'release') && this.state.routeDistanceMetres >= DEFENCE_START_ROUTE_METRES && !this.state.defenceResolved) {
      this.state.encounter = 'defence';
      this.state.radioSignal = 'rival_closing';
      this.emitEncounter('defence', 'closing_rival_reaches_attack_run');
      this.state.lastDriverReport = { topic: 'space', signal: this.attackSide };
      this.state.radioSignal = 'rival_closing';
      this.emit({ type: 'driverReport', sequence: 0, tick: 0, attempt: 0, topic: 'space', signal: this.attackSide });
    }
    if (this.state.encounter === 'defence' && !this.state.defenceResolved && this.state.defenceMode === null && this.state.rivalGapMetres <= 2) {
      this.resolveDefence('safe_yield', 'silence_auto_yield');
    }
    if (this.state.encounter === 'defence' && !this.state.defenceResolved && this.state.defenceMode !== null && this.state.defenceMode !== 'yield' && this.state.rivalGapMetres <= 0.6) {
      this.resolveDefenceFromCall();
    }
    if (this.state.encounter === 'release' && this.state.releaseUntilRouteDistanceMetres !== null && this.state.routeDistanceMetres >= this.state.releaseUntilRouteDistanceMetres) {
      this.state.encounter = 'complete';
      this.state.phase = 'sliceComplete';
      this.state.radioSignal = this.state.position === 2 ? 'hold_p2' : 'safe_finish_below_target';
      this.emitEncounter('complete', 'first_three_beats_complete');
    }
  }

  private resolveCrest(): void {
    this.state.crestResolved = true;
    const before = this.captureEvidence();
    const noCall = this.state.cornerApproach === null;
    if (noCall) {
      this.state.crestOutcome = 'emergency_save';
      this.state.speedMetresPerSecond = Math.min(this.state.speedMetresPerSecond, 43);
      this.state.stability = clamp01(this.state.stability - 0.34);
      this.state.damage = clamp01(this.state.damage + 0.2);
      this.state.playerSurface = 'runoff';
      this.state.playerLateralOffsetMetres = Math.min(5.35, getRaceCorridorLimits(this.getTotalProgress(), this.trackSpec).outerCenterHalfWidthMetres - 0.4);
      this.state.rivalGapMetres = Math.max(0, this.state.rivalGapMetres - 10);
      this.state.radioSignal = 'crest_emergency_save';
      this.emit({ type: 'momentMarker', sequence: 0, tick: 0, attempt: 0, label: 'emergencySave' });
      this.emitDecision('crest', 'emergency_save', 'crest_margin_no_engineer_call', before);
    } else {
      const callDistance = this.state.cornerCallRouteDistanceMetres === null
        ? 0
        : this.crestEntryRouteDistanceMetres - this.state.cornerCallRouteDistanceMetres;
      if (callDistance < 120) {
        this.state.speedMetresPerSecond = Math.max(this.state.speedMetresPerSecond, callDistance < 78 ? 44.5 : 42.5);
      }
      const entryMargin = CREST_ENTRY_SPEED_METRES_PER_SECOND - this.state.speedMetresPerSecond;
      if (entryMargin >= -2) {
        this.state.crestOutcome = this.state.cornerApproach === 'early' && entryMargin > 3 ? 'clean_slow' : 'clean';
        this.state.stability = clamp01(this.state.stability - 0.02);
        this.state.radioSignal = 'crest_clean';
        this.emit({ type: 'momentMarker', sequence: 0, tick: 0, attempt: 0, label: 'cleanCrest' });
        this.emitDecision('crest', this.state.crestOutcome, 'crest_margin_clean', before);
      } else if (entryMargin >= -9) {
        this.state.crestOutcome = 'compromised';
        this.state.stability = clamp01(this.state.stability - 0.18);
        this.state.damage = clamp01(this.state.damage + 0.05);
        this.state.rivalGapMetres = Math.max(0, this.state.rivalGapMetres - 5);
        this.state.playerSurface = 'runoff';
        this.state.playerLateralOffsetMetres = 4.8;
        this.state.radioSignal = 'crest_compromised';
        this.emitDecision('crest', 'compromised', 'crest_margin_thin', before);
      } else {
        this.state.crestOutcome = 'spin';
        this.state.stability = clamp01(this.state.stability - 0.5);
        this.state.damage = clamp01(this.state.damage + 0.28);
        this.state.rivalGapMetres = Math.max(0, this.state.rivalGapMetres - 16);
        this.state.playerSurface = 'runoff';
        this.state.playerLateralOffsetMetres = 5.8;
        this.state.radioSignal = 'crest_spin';
        this.emitDecision('crest', 'spin', 'crest_margin_exceeded', before);
      }
    }
    this.state.encounter = 'release';
    this.state.releaseUntilRouteDistanceMetres = this.state.routeDistanceMetres + RELEASE_DISTANCE_METRES;
  }

  private resolveDefenceFromCall(): void {
    const mode = this.state.defenceMode;
    if (mode === null || mode === 'yield') return;
    if (mode === this.attackSide) {
      if (this.state.stability < 0.42 || this.state.damage > 0.54) {
        this.resolveDefence('contact', 'correct_side_but_depleted_stability', true);
      } else {
        this.resolveDefence('held', 'cover_matches_visible_attack', false);
      }
    } else if (this.state.stability < 0.58 || this.state.damage > 0.3) {
      this.resolveDefence('contact', 'wrong_side_squeeze_with_depleted_car', true);
    } else {
      this.resolveDefence('lost_position', 'wrong_defence_side', false);
    }
  }

  private resolveDefence(outcome: string, reason: string, terminal = false): void {
    if (this.state.defenceResolved) return;
    const before = this.captureEvidence();
    this.state.defenceResolved = true;
    this.state.defenceOutcome = outcome;
    if (outcome === 'safe_yield' || outcome === 'lost_position') {
      const previousPosition = this.state.position;
      this.state.position = 3;
      if (previousPosition !== this.state.position) {
        this.emit({ type: 'positionChanged', sequence: 0, tick: 0, attempt: 0, from: previousPosition, to: this.state.position, reason });
      }
      this.state.playerLateralOffsetMetres = 0;
      this.state.radioSignal = outcome === 'safe_yield' ? 'yield_clear' : 'position_lost';
      this.emit({ type: 'momentMarker', sequence: 0, tick: 0, attempt: 0, label: 'safeYield' });
    } else if (outcome === 'held') {
      this.state.stability = clamp01(this.state.stability - 0.08);
      this.state.tireHeat = clamp01(this.state.tireHeat + 0.08);
      this.state.radioSignal = 'defence_held';
      this.emit({ type: 'momentMarker', sequence: 0, tick: 0, attempt: 0, label: 'defenceHeld' });
    } else if (outcome === 'contact') {
      this.state.damage = clamp01(this.state.damage + 0.28);
      this.state.stability = clamp01(this.state.stability - 0.42);
      this.state.radioSignal = 'contact';
      this.emit({ type: 'momentMarker', sequence: 0, tick: 0, attempt: 0, label: 'contact' });
    }
    this.emitDecision('defence', outcome, reason, before);
    if (terminal) {
      this.state.phase = 'dnf';
      this.state.encounter = 'complete';
      this.state.radioSignal = 'dnf_contact';
      return;
    }
    this.state.encounter = 'release';
    this.state.releaseUntilRouteDistanceMetres = this.state.routeDistanceMetres + RELEASE_DISTANCE_METRES;
  }

  private emitEncounter(encounter: RaceEncounter, reason: string): void {
    this.emit({ type: 'encounterStarted', sequence: 0, tick: 0, attempt: 0, encounter, reason });
  }

  private emitDecision(encounter: RaceEncounter, outcome: string, reason: string, before = this.captureEvidence()): void {
    this.emit({ type: 'decisionResolved', sequence: 0, tick: 0, attempt: 0, encounter, outcome, reason, before, after: this.captureEvidence() });
  }

  private emitActionReceipt(
    queued: { readonly actionId: number; readonly action: RaceAction; readonly source: RaceActionSource },
    status: 'accepted' | 'rejected' | 'cancelled',
    reason: string,
  ): void {
    this.emit({ type: 'actionReceipt', sequence: 0, tick: 0, attempt: 0, actionId: queued.actionId, status, reason, action: queued.action });
  }

  private emit(event: RaceEvent): void {
    const sequence = this.nextEventSequence;
    this.nextEventSequence += 1;
    this.events.push(freezeDeep({
      ...event,
      sequence,
      tick: this.state.tick,
      attempt: this.state.attempt,
    } as RaceEvent));
  }

  private captureEvidence(): RaceStateEvidence {
    return freezeDeep({
      routeDistanceMetres: this.state.routeDistanceMetres,
      speedKmh: metresPerSecondToKmh(this.state.speedMetresPerSecond),
      grip: this.state.grip,
      tireHeat: this.state.tireHeat,
      stability: this.state.stability,
      damage: this.state.damage,
      gapMetres: this.state.rivalGapMetres,
      position: this.state.position,
    });
  }

  private getTotalProgress(): number {
    return START_PROGRESS + this.state.routeDistanceMetres / this.trackLengthMetres;
  }

  private getClosingTrend(): number {
    return this.state.encounter === 'defence'
      ? 1.8
      : this.state.paceMode === 'push'
        ? 0.38
        : this.state.paceMode === 'save'
          ? 1.08
          : 0.72;
  }

  private getUpcomingEvidence(): EngineerRaceView['upcoming'] {
    if (this.state.phase === 'sliceComplete' || this.state.phase === 'dnf') {
      return { section: 'finalDefense', pressure: 'release', engineerCritical: false, distanceMetres: 0, label: 'complete' };
    }
    if (this.state.encounter === 'pace') {
      return { section: 'launch', pressure: 'calm', engineerCritical: false, distanceMetres: Math.max(0, PACE_WINDOW_END_ROUTE_METRES - this.state.routeDistanceMetres), label: 'pace_window' };
    }
    if (this.state.encounter === 'crest') {
      return { section: 'crest', pressure: 'critical', engineerCritical: true, distanceMetres: Math.max(0, this.crestEntryRouteDistanceMetres - this.state.routeDistanceMetres), label: 'blind_crest' };
    }
    if (this.state.encounter === 'defence') {
      return { section: 'attackRun', pressure: 'building', engineerCritical: true, distanceMetres: Math.max(0, this.state.rivalGapMetres), label: 'rival_attack' };
    }
    return { section: 'compression', pressure: 'release', engineerCritical: false, distanceMetres: Math.max(0, (this.state.releaseUntilRouteDistanceMetres ?? this.state.routeDistanceMetres) - this.state.routeDistanceMetres), label: 'release' };
  }

  private enforceContainment(): void {
    const playerLimits = getRaceCorridorLimits(this.getTotalProgress(), this.trackSpec);
    const rivalProgress = START_PROGRESS + (this.state.routeDistanceMetres - this.state.rivalGapMetres) / this.trackLengthMetres;
    const rivalLimits = getRaceCorridorLimits(rivalProgress, this.trackSpec);
    this.state.containmentChecks += 2;
    const playerContained = isRaceVehicleContained(this.state.playerLateralOffsetMetres, playerLimits, this.state.playerSurface);
    const rivalContained = isRaceVehicleContained(this.state.rivalLateralOffsetMetres, rivalLimits, this.state.rivalSurface);
    if (!playerContained) {
      this.state.containmentClamps += 1;
      const clamped = clampRaceLateralOffset(this.state.playerLateralOffsetMetres, playerLimits, this.state.playerSurface);
      this.state.playerLateralOffsetMetres = clamped.offsetMetres;
      this.state.phase = 'dnf';
      this.state.encounter = 'complete';
      this.emitDecision('release', 'dnf', 'player_outer_corridor_violation');
    }
    if (!rivalContained) {
      this.state.containmentClamps += 1;
      const clamped = clampRaceLateralOffset(this.state.rivalLateralOffsetMetres, rivalLimits, this.state.rivalSurface);
      this.state.rivalLateralOffsetMetres = clamped.offsetMetres;
      this.emitDecision('release', 'rival_contained', 'rival_outer_corridor_clamped');
    }
  }
}

function routeDistanceToNextProgress(startProgress: number, targetProgress: number, trackLengthMetres: number): number {
  const delta = (targetProgress - startProgress + 1) % 1;
  return delta < EPSILON ? trackLengthMetres : delta * trackLengthMetres;
}

function normalizeSeed(seed: number): number {
  if (!Number.isFinite(seed)) return 1;
  return Math.abs(Math.floor(seed)) >>> 0;
}

function metresPerSecondToKmh(value: number): number {
  return value * 3.6;
}

function approach(current: number, target: number, amount: number): number {
  if (current < target) return Math.min(target, current + amount);
  return Math.max(target, current - amount);
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

function freezeDeep<T>(value: T): T {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value as Record<string, unknown>)) {
      freezeDeep(child);
    }
    Object.freeze(value);
  }
  return value;
}
