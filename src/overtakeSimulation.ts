import {
  cloneOvertakeState,
  commitIntent,
  createOvertakeState,
  evaluateNowFromState,
  getOvertakeStage,
  getPreparationProgress,
  metresPerSecondToKmh,
  stepOvertakeModel,
  TUNED_OVERTAKE_PARAMETERS,
  type AttackLane,
  type NowAssessment,
  type OvertakeModelState,
  type OvertakeOutcome,
  type OvertakeParameters,
  type OvertakeStage,
} from './overtakeModel.js';

export type DriverMessageKey =
  | 'copyInside'
  | 'copyOutside'
  | 'now'
  | 'tooSoon'
  | 'tooLate'
  | 'noRoom'
  | 'noCall'
  | 'gotHim';

export type GapRelation = 'behind' | 'sideBySide' | 'ahead';
export type DefenseSelectionMode = 'seeded' | 'inside' | 'outside';

export interface CoreOvertakeOptions {
  parameters?: OvertakeParameters;
  defenseMode?: DefenseSelectionMode;
  seed?: number;
  /** Physical race position for the start of the protected overtake model. */
  startTotalProgress?: number;
  /** Preserve the prototype's lap-advancing event Retry behaviour by default. */
  repeatAddsLap?: boolean;
}

export interface CoreOvertakeSnapshot {
  scenarioIndex: number;
  defenseSide: AttackLane;
  defenseMode: DefenseSelectionMode;
  seed: number;
  eventTimeSeconds: number;
  stage: OvertakeStage;
  defenseReadable: boolean;
  preparationProgress: number;
  playerTotalProgress: number;
  opponentTotalProgress: number;
  playerSpeedKmh: number;
  opponentSpeedKmh: number;
  playerDistanceMetres: number;
  opponentDistanceMetres: number;
  distanceToCornerMetres: number;
  longitudinalGapMetres: number;
  relativeGapSeconds: number;
  gapRelation: GapRelation;
  playerLateralOffsetMetres: number;
  opponentLateralOffsetMetres: number;
  intent: AttackLane | null;
  phase: OvertakeModelState['phase'];
  towActive: boolean;
  nowCalled: boolean;
  nowAssessment: NowAssessment | null;
  outcome: OvertakeOutcome;
  driverMessage: DriverMessageKey | null;
  canCallIntent: boolean;
  canCallNow: boolean;
  canRetry: boolean;
}

export const CORE_EVENT_START_PROGRESS = 0.135;
export const CORE_EVENT_END_PROGRESS = 0.88;

const NOW_ACKNOWLEDGEMENT_SECONDS = 0.65;
const ACKNOWLEDGEMENT_SECONDS = 1.8;
const REACTION_SECONDS = 2.2;
const RETRY_DELAY_SECONDS = 0.8;
const MIN_GAP_SPEED_METRES_PER_SECOND = 8;

/**
 * Presentation-independent authority for the protected overtake. This module
 * has no Three.js, DOM, browser clock, or random-source dependency.
 */
export class CoreOvertakeSimulation {
  private readonly trackLength: number;
  private readonly parameters: OvertakeParameters;
  private readonly defenseMode: DefenseSelectionMode;
  private readonly seed: number;
  private readonly startTotalProgress: number;
  private readonly repeatAddsLap: boolean;
  private model: OvertakeModelState;
  private scenarioIndex = 0;
  private currentDefenseSide: AttackLane;
  private nowCalled = false;
  private nowAssessment: NowAssessment | null = null;
  private outcome: OvertakeOutcome = 'pending';
  private driverMessage: DriverMessageKey | null = null;
  private queuedReaction: DriverMessageKey | null = null;
  private messageSecondsRemaining = 0;
  private postEventSeconds = 0;
  private driverAcknowledgedAtSeconds: number | null = null;
  private nowCalledAtSeconds: number | null = null;
  private outcomeAtSeconds: number | null = null;

  constructor(trackLength: number, options: CoreOvertakeOptions = {}) {
    this.trackLength = Math.max(0.001, trackLength);
    this.parameters = options.parameters ?? TUNED_OVERTAKE_PARAMETERS;
    this.defenseMode = options.defenseMode ?? 'seeded';
    this.seed = normalizeSeed(options.seed ?? 1);
    this.startTotalProgress = Number.isFinite(options.startTotalProgress)
      ? Math.max(0, options.startTotalProgress ?? CORE_EVENT_START_PROGRESS)
      : CORE_EVENT_START_PROGRESS;
    this.repeatAddsLap = options.repeatAddsLap ?? true;
    this.currentDefenseSide = selectDefenseSide(
      this.defenseMode,
      this.seed,
      this.scenarioIndex,
    );
    this.model = createOvertakeState(this.parameters);
  }

  issueIntent(intent: AttackLane): boolean {
    if (!this.snapshot.canCallIntent) return false;
    commitIntent(this.model, intent);
    this.driverAcknowledgedAtSeconds = this.model.timeSeconds;
    this.setMessage(
      intent === 'inside' ? 'copyInside' : 'copyOutside',
      ACKNOWLEDGEMENT_SECONDS,
    );
    return true;
  }

  issueNow(): boolean {
    if (!this.snapshot.canCallNow) return false;
    this.nowCalled = true;
    this.nowCalledAtSeconds = this.model.timeSeconds;
    this.nowAssessment = evaluateNowFromState(
      this.model,
      this.parameters,
      this.currentDefenseSide,
    );
    this.model.towActive = false;
    this.model.phase =
      this.nowAssessment === 'viable' ? 'attacking' : 'aborting';
    this.queuedReaction = getReactionForAssessment(this.nowAssessment);
    this.setMessage('now', NOW_ACKNOWLEDGEMENT_SECONDS);
    return true;
  }

  update(deltaSeconds: number): CoreOvertakeSnapshot {
    const timeStep = Number.isFinite(deltaSeconds)
      ? Math.max(0, deltaSeconds)
      : 0;
    this.updateMessage(timeStep);
    stepOvertakeModel(
      this.model,
      this.parameters,
      this.currentDefenseSide,
      timeStep,
    );

    if (this.model.passed && this.outcome === 'pending') {
      this.outcome = 'success';
      this.outcomeAtSeconds = this.model.timeSeconds;
      this.queuedReaction = null;
      this.setMessage('gotHim', REACTION_SECONDS);
    }

    if (this.model.playerDistanceMetres >= this.parameters.eventDistanceMetres) {
      if (this.outcome === 'pending') {
        this.outcome = this.nowCalled
          ? assessmentToOutcome(this.nowAssessment)
          : 'noCall';
        this.outcomeAtSeconds = this.model.timeSeconds;
        if (this.outcome === 'noCall') {
          this.setMessage('noCall', REACTION_SECONDS);
        }
      }
      this.postEventSeconds += timeStep;
    }
    return this.snapshot;
  }

  retry(): boolean {
    if (!this.snapshot.canRetry) return false;
    this.resetAttempt();
    return true;
  }

  restart(): void {
    this.resetAttempt();
  }

  get snapshot(): CoreOvertakeSnapshot {
    const eventLapOffset = this.repeatAddsLap ? this.scenarioIndex : 0;
    const playerTotalProgress =
      eventLapOffset +
      this.startTotalProgress +
      this.model.playerDistanceMetres / this.trackLength;
    const opponentDistanceMetres =
      this.model.playerDistanceMetres + this.model.longitudinalGapMetres;
    const opponentTotalProgress =
      eventLapOffset +
      this.startTotalProgress +
      opponentDistanceMetres / this.trackLength;
    const referenceGapSpeed = Math.max(
      MIN_GAP_SPEED_METRES_PER_SECOND,
      (this.model.playerSpeedMetresPerSecond +
        this.model.opponentSpeedMetresPerSecond) *
        0.5,
    );
    const eventComplete =
      this.model.playerDistanceMetres >= this.parameters.eventDistanceMetres;
    const overlapHalfLength = Math.abs(
      this.parameters.completedPassGapMetres,
    );
    const gapRelation: GapRelation =
      this.model.longitudinalGapMetres > overlapHalfLength
        ? 'behind'
        : this.model.longitudinalGapMetres <= -overlapHalfLength
          ? 'ahead'
          : 'sideBySide';

    return {
      scenarioIndex: this.scenarioIndex,
      defenseSide: this.currentDefenseSide,
      defenseMode: this.defenseMode,
      seed: this.seed,
      eventTimeSeconds: this.model.timeSeconds,
      stage: getOvertakeStage(this.model, this.parameters),
      defenseReadable: this.model.defenseReadableAtSeconds !== null,
      preparationProgress: getPreparationProgress(this.model, this.parameters),
      playerTotalProgress,
      opponentTotalProgress,
      playerSpeedKmh: metresPerSecondToKmh(
        this.model.playerSpeedMetresPerSecond,
      ),
      opponentSpeedKmh: metresPerSecondToKmh(
        this.model.opponentSpeedMetresPerSecond,
      ),
      playerDistanceMetres: this.model.playerDistanceMetres,
      opponentDistanceMetres,
      distanceToCornerMetres: Math.max(
        0,
        this.parameters.eventDistanceMetres -
          this.model.playerDistanceMetres,
      ),
      longitudinalGapMetres: this.model.longitudinalGapMetres,
      relativeGapSeconds:
        -this.model.longitudinalGapMetres / referenceGapSpeed,
      gapRelation,
      playerLateralOffsetMetres: this.model.playerLateralOffsetMetres,
      opponentLateralOffsetMetres: this.model.opponentLateralOffsetMetres,
      intent: this.model.intent,
      phase: this.model.phase,
      towActive: this.model.towActive,
      nowCalled: this.nowCalled,
      nowAssessment: this.nowAssessment,
      outcome: this.outcome,
      driverMessage: this.driverMessage,
      canCallIntent:
        !eventComplete &&
        this.model.defenseReadableAtSeconds !== null &&
        this.model.intent === null,
      canCallNow:
        !eventComplete &&
        this.model.intent !== null &&
        !this.nowCalled &&
        this.outcome === 'pending',
      canRetry:
        eventComplete &&
        this.outcome !== 'pending' &&
        this.postEventSeconds >= RETRY_DELAY_SECONDS,
    };
  }

  get debugState(): OvertakeModelState {
    return cloneOvertakeState(this.model);
  }

  get tuning(): Readonly<OvertakeParameters> {
    return this.parameters;
  }

  get liveNowAssessment(): NowAssessment | null {
    if (this.model.intent === null || this.nowCalled) return null;
    return evaluateNowFromState(
      this.model,
      this.parameters,
      this.currentDefenseSide,
    );
  }

  createDebugReport(): string {
    const state = this.snapshot;
    const liveAssessment = this.liveNowAssessment;
    const remainingSeconds =
      state.distanceToCornerMetres /
      Math.max(0.001, this.model.playerSpeedMetresPerSecond);
    const readableAt = this.model.defenseReadableAtSeconds;
    const intentAt = this.model.intentIssuedAtSeconds;
    const preparationAt = this.model.preparationMilestoneAtSeconds;
    return [
      'COPY THAT? — OVERTAKE DEBUG REPORT',
      `event=${state.scenarioIndex} mode=${state.defenseMode} seed=${state.seed} defense=${state.defenseSide}`,
      `time=${state.eventTimeSeconds.toFixed(3)}s stage=${state.stage} phase=${state.phase} tow=${state.towActive}`,
      `playerDistance=${state.playerDistanceMetres.toFixed(3)}m opponentDistance=${state.opponentDistanceMetres.toFixed(3)}m`,
      `remaining=${state.distanceToCornerMetres.toFixed(3)}m (~${remainingSeconds.toFixed(3)}s) playerSpeed=${state.playerSpeedKmh.toFixed(3)}km/h opponentSpeed=${state.opponentSpeedKmh.toFixed(3)}km/h`,
      `gap=${state.longitudinalGapMetres.toFixed(3)}m relation=${state.gapRelation} relative=${formatSignedSeconds(state.relativeGapSeconds)}`,
      `preparation=${(state.preparationProgress * 100).toFixed(1)}% playerLateral=${state.playerLateralOffsetMetres.toFixed(3)}m opponentLateral=${state.opponentLateralOffsetMetres.toFixed(3)}m`,
      `intent=${state.intent ?? 'none'} nowCalled=${state.nowCalled} liveAssessment=${liveAssessment ?? 'n/a'}`,
      `assessment=${state.nowAssessment ?? 'none'} outcome=${state.outcome}`,
      `timestamps: defenseChoice=0.000s defenseReadable=${formatTimestamp(readableAt)} intent=${formatTimestamp(intentAt)} acknowledgement=${formatTimestamp(this.driverAcknowledgedAtSeconds)} preparation80=${formatTimestamp(preparationAt)} now=${formatTimestamp(this.nowCalledAtSeconds)} result=${formatTimestamp(this.outcomeAtSeconds)}`,
      `intervals: read→intent=${formatInterval(readableAt, intentAt)} intent→ack=${formatInterval(intentAt, this.driverAcknowledgedAtSeconds)} intent→prep80=${formatInterval(intentAt, preparationAt)} prep80→now=${formatInterval(preparationAt, this.nowCalledAtSeconds)} now→result=${formatInterval(this.nowCalledAtSeconds, this.outcomeAtSeconds)}`,
      `rules: defenseReadableOffset=${this.parameters.defenseReadableOffsetMetres.toFixed(2)}m towStart=${this.parameters.towStartDistanceMetres.toFixed(2)}m prepAtNow>=${(this.parameters.minimumPreparationAtNowRatio * 100).toFixed(0)}% passGap<=${this.parameters.completedPassGapMetres.toFixed(2)}m lateralClearance>=${this.parameters.requiredLateralClearanceMetres.toFixed(2)}m deadline=${this.parameters.eventDistanceMetres.toFixed(2)}m`,
      'success timing is predicted from tow speed, gap, preparation, lane clearance, and road remaining; no fixed NOW timer is used.',
    ].join('\n');
  }

  private resetAttempt(): void {
    this.scenarioIndex += 1;
    this.currentDefenseSide = selectDefenseSide(
      this.defenseMode,
      this.seed,
      this.scenarioIndex,
    );
    this.model = createOvertakeState(this.parameters);
    this.nowCalled = false;
    this.nowAssessment = null;
    this.outcome = 'pending';
    this.driverMessage = null;
    this.queuedReaction = null;
    this.messageSecondsRemaining = 0;
    this.postEventSeconds = 0;
    this.driverAcknowledgedAtSeconds = null;
    this.nowCalledAtSeconds = null;
    this.outcomeAtSeconds = null;
  }

  private updateMessage(deltaSeconds: number): void {
    if (this.messageSecondsRemaining <= 0) return;
    this.messageSecondsRemaining = Math.max(
      0,
      this.messageSecondsRemaining - deltaSeconds,
    );
    if (this.messageSecondsRemaining > 0) return;
    if (this.queuedReaction) {
      const reaction = this.queuedReaction;
      this.queuedReaction = null;
      this.setMessage(reaction, REACTION_SECONDS);
    } else {
      this.driverMessage = null;
    }
  }

  private setMessage(message: DriverMessageKey, durationSeconds: number): void {
    this.driverMessage = message;
    this.messageSecondsRemaining = durationSeconds;
  }
}

export function selectDefenseSide(
  mode: DefenseSelectionMode,
  seed: number,
  eventIndex: number,
): AttackLane {
  if (mode === 'inside' || mode === 'outside') return mode;
  let value =
    (normalizeSeed(seed) + Math.imul(Math.max(0, eventIndex) + 1, 0x9e3779b9)) >>>
    0;
  value ^= value >>> 16;
  value = Math.imul(value, 0x21f0aaad);
  value ^= value >>> 15;
  value = Math.imul(value, 0x735a2d97);
  value ^= value >>> 15;
  return (value >>> 0) % 2 === 0 ? 'inside' : 'outside';
}

function normalizeSeed(seed: number): number {
  return Number.isFinite(seed) ? Math.trunc(seed) >>> 0 : 1;
}

function getReactionForAssessment(
  assessment: NowAssessment,
): DriverMessageKey | null {
  if (assessment === 'tooEarly') return 'tooSoon';
  if (assessment === 'tooLate') return 'tooLate';
  if (assessment === 'blocked') return 'noRoom';
  return null;
}

function assessmentToOutcome(
  assessment: NowAssessment | null,
): OvertakeOutcome {
  if (assessment === null || assessment === 'viable') return 'tooLate';
  return assessment;
}

function formatTimestamp(timestamp: number | null): string {
  return timestamp === null ? 'none' : `${timestamp.toFixed(3)}s`;
}

function formatInterval(start: number | null, end: number | null): string {
  return start === null || end === null
    ? 'n/a'
    : `${(end - start).toFixed(3)}s`;
}

function formatSignedSeconds(seconds: number): string {
  const prefix = seconds > 0 ? '+' : '';
  return `${prefix}${seconds.toFixed(3)}s`;
}
