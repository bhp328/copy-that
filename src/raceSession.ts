import type { DriverCommand } from './commandParser';
import type { CoreOvertakeSnapshot, DriverMessageKey } from './overtakeGameplay';
import {
  kmhToMetresPerSecond,
  metresPerSecondToKmh,
  stepSpeedToward,
  type OvertakeOutcome,
} from './overtakeModel';

export const SPRINT_TOTAL_LAPS = 3;
export const SPRINT_START_TOTAL_PROGRESS = 0.015;
export const SPRINT_OVERTAKE_START_TOTAL_PROGRESS = 2.535;
export const SPRINT_FINISH_TOTAL_PROGRESS = 3;

export type RacePhase =
  | 'ready'
  | 'countdown'
  | 'opening'
  | 'overtake'
  | 'runout'
  | 'finished';

export type PaceDecision = 'push' | 'hold' | 'missed' | null;

export type RaceRadioKey =
  | DriverMessageKey
  | 'radioCheck'
  | 'raceStart'
  | 'pushAck'
  | 'holdAck'
  | 'noPaceCall'
  | 'lapTwo'
  | 'finalLap'
  | 'targetAhead'
  | 'targetAchieved'
  | 'targetMissed';

interface OvertakePort {
  readonly snapshot: CoreOvertakeSnapshot;
  update(deltaSeconds: number): CoreOvertakeSnapshot;
  issueIntent(intent: 'inside' | 'outside'): boolean;
  issueNow(): boolean;
  restart(): void;
}

export interface SprintRaceSnapshot {
  phase: RacePhase;
  elapsedSeconds: number;
  countdownValue: number | null;
  playerTotalProgress: number;
  playerSpeedKmh: number;
  playerLateralOffsetMetres: number;
  rivalTotalProgress: number;
  rivalLateralOffsetMetres: number;
  leaderTotalProgress: number;
  position: 2 | 3;
  lap: number;
  totalLaps: number;
  sector: 1 | 2 | 3;
  raceProgress: number;
  gapSeconds: number;
  paceDecision: PaceDecision;
  canCallPace: boolean;
  canCallIntent: boolean;
  canCallNow: boolean;
  intent: 'inside' | 'outside' | null;
  nowCalled: boolean;
  outcome: OvertakeOutcome;
  resultAchieved: boolean | null;
  radioKey: RaceRadioKey | null;
  radioSequence: number;
  core: CoreOvertakeSnapshot;
}

const COUNTDOWN_SECONDS = 3.6;
const PACE_WINDOW_START = 0.12;
const PACE_WINDOW_END = 0.36;
const PACE_EFFECT_END = 0.58;
const MAX_STEP_SECONDS = 0.1;
const SPEED_RESPONSE = 1.35;

/**
 * Owns the beginning/middle/end race flow around the protected overtake port.
 * It never moves Three.js objects; render state consumes its snapshot.
 */
export class SprintRaceSession {
  private readonly trackLength: number;
  private readonly overtake: OvertakePort;
  private phase: RacePhase = 'ready';
  private elapsedSeconds = 0;
  private phaseSeconds = 0;
  private playerTotalProgress = SPRINT_START_TOTAL_PROGRESS;
  private rivalTotalProgress: number;
  private leaderTotalProgress: number;
  private playerSpeedMetresPerSecond = 0;
  private rivalSpeedMetresPerSecond = kmhToMetresPerSecond(132);
  private leaderSpeedMetresPerSecond = kmhToMetresPerSecond(139);
  private paceDecision: PaceDecision = null;
  private resultAchieved: boolean | null = null;
  private finalOutcome: OvertakeOutcome = 'pending';
  private radioKey: RaceRadioKey | null = null;
  private radioSequence = 0;
  private radioSecondsRemaining = 0;
  private lastCoreMessage: DriverMessageKey | null = null;
  private announcedLapTwo = false;
  private announcedFinalLap = false;
  private announcedTarget = false;

  constructor(trackLength: number, overtake: OvertakePort) {
    this.trackLength = Math.max(1, trackLength);
    this.overtake = overtake;
    this.rivalTotalProgress =
      this.playerTotalProgress + 72 / this.trackLength;
    this.leaderTotalProgress =
      this.rivalTotalProgress + 94 / this.trackLength;
  }

  start(): boolean {
    if (this.phase !== 'ready') return false;
    this.phase = 'countdown';
    this.phaseSeconds = 0;
    this.setRadio('radioCheck', 1.5);
    return true;
  }

  issueCommand(command: DriverCommand): boolean {
    if (command === 'push' || command === 'hold') {
      return this.issuePace(command);
    }
    if (command === 'now') return this.issueNow();
    return this.issueIntent(command);
  }

  issuePace(decision: 'push' | 'hold'): boolean {
    if (!this.snapshot.canCallPace) return false;
    this.paceDecision = decision;
    this.setRadio(decision === 'push' ? 'pushAck' : 'holdAck', 2.2);
    return true;
  }

  issueIntent(intent: 'inside' | 'outside'): boolean {
    return this.phase === 'overtake' && this.overtake.issueIntent(intent);
  }

  issueNow(): boolean {
    return this.phase === 'overtake' && this.overtake.issueNow();
  }

  restart(): void {
    this.overtake.restart();
    this.phase = 'ready';
    this.elapsedSeconds = 0;
    this.phaseSeconds = 0;
    this.playerTotalProgress = SPRINT_START_TOTAL_PROGRESS;
    this.rivalTotalProgress = this.playerTotalProgress + 72 / this.trackLength;
    this.leaderTotalProgress = this.rivalTotalProgress + 94 / this.trackLength;
    this.playerSpeedMetresPerSecond = 0;
    this.rivalSpeedMetresPerSecond = kmhToMetresPerSecond(132);
    this.leaderSpeedMetresPerSecond = kmhToMetresPerSecond(139);
    this.paceDecision = null;
    this.resultAchieved = null;
    this.finalOutcome = 'pending';
    this.radioKey = null;
    this.radioSecondsRemaining = 0;
    this.lastCoreMessage = null;
    this.announcedLapTwo = false;
    this.announcedFinalLap = false;
    this.announcedTarget = false;
  }

  /** Developer-only state jump; main.ts exposes it only behind ?debug=1. */
  debugJumpTo(stage: 'pace' | 'overtake'): void {
    this.radioKey = null;
    this.radioSecondsRemaining = 0;
    this.resultAchieved = null;
    this.finalOutcome = 'pending';
    if (stage === 'pace') {
      this.phase = 'opening';
      this.elapsedSeconds = 8;
      this.phaseSeconds = 4;
      this.playerTotalProgress = PACE_WINDOW_START + 0.015;
      this.rivalTotalProgress = this.playerTotalProgress + 58 / this.trackLength;
      this.leaderTotalProgress = this.rivalTotalProgress + 94 / this.trackLength;
      this.playerSpeedMetresPerSecond = kmhToMetresPerSecond(143);
      this.rivalSpeedMetresPerSecond = kmhToMetresPerSecond(140);
      this.leaderSpeedMetresPerSecond = kmhToMetresPerSecond(146);
      return;
    }
    this.phase = 'overtake';
    this.elapsedSeconds = 104;
    this.phaseSeconds = 0;
    this.playerTotalProgress = SPRINT_OVERTAKE_START_TOTAL_PROGRESS;
    this.rivalTotalProgress = this.overtake.snapshot.opponentTotalProgress;
    this.leaderTotalProgress = this.rivalTotalProgress + 94 / this.trackLength;
  }

  update(deltaSeconds: number): SprintRaceSnapshot {
    const timeStep = clamp(deltaSeconds, 0, MAX_STEP_SECONDS);
    if (this.phase !== 'ready' && this.phase !== 'finished') {
      this.elapsedSeconds += timeStep;
      this.phaseSeconds += timeStep;
    }
    this.updateRadio(timeStep);

    if (this.phase === 'countdown') {
      if (this.phaseSeconds >= COUNTDOWN_SECONDS) {
        this.phase = 'opening';
        this.phaseSeconds = 0;
        this.setRadio('raceStart', 2.1);
      }
    } else if (this.phase === 'opening') {
      this.updateOpeningRace(timeStep);
    } else if (this.phase === 'overtake' || this.phase === 'runout') {
      this.updateOvertakeRace(timeStep);
    }
    return this.snapshot;
  }

  get snapshot(): SprintRaceSnapshot {
    const core = this.overtake.snapshot;
    const usesCore = this.phase === 'overtake' || this.phase === 'runout' || this.phase === 'finished';
    const playerTotalProgress = usesCore
      ? core.playerTotalProgress
      : this.playerTotalProgress;
    const playerSpeedKmh = usesCore
      ? core.playerSpeedKmh
      : metresPerSecondToKmh(this.playerSpeedMetresPerSecond);
    const rivalTotalProgress = usesCore
      ? core.opponentTotalProgress
      : this.rivalTotalProgress;
    const relationPosition = usesCore && core.gapRelation === 'ahead' ? 2 : 3;
    const position = this.resultAchieved === true ? 2 : relationPosition;
    const lap = Math.min(
      SPRINT_TOTAL_LAPS,
      Math.max(1, Math.floor(playerTotalProgress) + 1),
    );
    const lapProgress = wrapProgress(playerTotalProgress);
    const sector = (Math.min(2, Math.floor(lapProgress * 3)) + 1) as 1 | 2 | 3;
    const playerSpeed = Math.max(30, playerSpeedKmh / 3.6);
    const gapMetres =
      (rivalTotalProgress - playerTotalProgress) * this.trackLength;
    const gapSeconds = usesCore
      ? Math.abs(core.relativeGapSeconds)
      : Math.max(0, gapMetres / playerSpeed);
    const countdownValue =
      this.phase === 'countdown'
        ? Math.max(1, 3 - Math.floor(this.phaseSeconds))
        : null;

    return {
      phase: this.phase,
      elapsedSeconds: this.elapsedSeconds,
      countdownValue,
      playerTotalProgress,
      playerSpeedKmh,
      playerLateralOffsetMetres: usesCore
        ? core.playerLateralOffsetMetres
        : 0,
      rivalTotalProgress,
      rivalLateralOffsetMetres: usesCore
        ? core.opponentLateralOffsetMetres
        : 0,
      leaderTotalProgress: this.leaderTotalProgress,
      position,
      lap,
      totalLaps: SPRINT_TOTAL_LAPS,
      sector,
      raceProgress: clamp(
        (playerTotalProgress - SPRINT_START_TOTAL_PROGRESS) /
          (SPRINT_FINISH_TOTAL_PROGRESS - SPRINT_START_TOTAL_PROGRESS),
        0,
        1,
      ),
      gapSeconds,
      paceDecision: this.paceDecision,
      canCallPace:
        this.phase === 'opening' &&
        this.paceDecision === null &&
        this.playerTotalProgress >= PACE_WINDOW_START &&
        this.playerTotalProgress < PACE_WINDOW_END,
      canCallIntent: this.phase === 'overtake' && core.canCallIntent,
      canCallNow: this.phase === 'overtake' && core.canCallNow,
      intent: core.intent,
      nowCalled: core.nowCalled,
      outcome:
        this.finalOutcome !== 'pending' ? this.finalOutcome : core.outcome,
      resultAchieved: this.resultAchieved,
      radioKey: this.radioKey,
      radioSequence: this.radioSequence,
      core,
    };
  }

  private updateOpeningRace(deltaSeconds: number): void {
    const lapProgress = wrapProgress(this.playerTotalProgress);
    let playerTarget = getTargetSpeedKmh(lapProgress);
    if (this.playerTotalProgress < PACE_EFFECT_END) {
      if (this.paceDecision === 'push') playerTarget += 22;
      if (this.paceDecision === 'hold') playerTarget -= 9;
    }

    const playerStep = stepSpeedToward(
      this.playerSpeedMetresPerSecond,
      kmhToMetresPerSecond(playerTarget),
      SPEED_RESPONSE,
      deltaSeconds,
    );
    this.playerSpeedMetresPerSecond = playerStep.nextSpeedMetresPerSecond;
    this.playerTotalProgress += playerStep.distanceMetres / this.trackLength;

    const rivalTarget = getTargetSpeedKmh(wrapProgress(this.rivalTotalProgress)) - 3;
    const rivalStep = stepSpeedToward(
      this.rivalSpeedMetresPerSecond,
      kmhToMetresPerSecond(rivalTarget),
      1.25,
      deltaSeconds,
    );
    this.rivalSpeedMetresPerSecond = rivalStep.nextSpeedMetresPerSecond;
    this.rivalTotalProgress += rivalStep.distanceMetres / this.trackLength;

    const minimumRivalProgress = this.playerTotalProgress + 25 / this.trackLength;
    this.rivalTotalProgress = Math.max(this.rivalTotalProgress, minimumRivalProgress);

    const leaderTarget = getTargetSpeedKmh(wrapProgress(this.leaderTotalProgress)) + 4;
    const leaderStep = stepSpeedToward(
      this.leaderSpeedMetresPerSecond,
      kmhToMetresPerSecond(leaderTarget),
      1.2,
      deltaSeconds,
    );
    this.leaderSpeedMetresPerSecond = leaderStep.nextSpeedMetresPerSecond;
    this.leaderTotalProgress += leaderStep.distanceMetres / this.trackLength;

    if (this.paceDecision === null && this.playerTotalProgress >= PACE_WINDOW_END) {
      this.paceDecision = 'missed';
      this.setRadio('noPaceCall', 2.2);
    }
    if (!this.announcedLapTwo && this.playerTotalProgress >= 1.01) {
      this.announcedLapTwo = true;
      this.setRadio('lapTwo', 2.3);
    }
    if (!this.announcedFinalLap && this.playerTotalProgress >= 2.01) {
      this.announcedFinalLap = true;
      this.setRadio('finalLap', 2.3);
    }
    if (!this.announcedTarget && this.playerTotalProgress >= 2.34) {
      this.announcedTarget = true;
      this.setRadio('targetAhead', 2.4);
    }

    if (this.playerTotalProgress >= SPRINT_OVERTAKE_START_TOTAL_PROGRESS) {
      this.playerTotalProgress = SPRINT_OVERTAKE_START_TOTAL_PROGRESS;
      this.phase = 'overtake';
      this.phaseSeconds = 0;
      this.radioKey = null;
      this.radioSecondsRemaining = 0;
    }
  }

  private updateOvertakeRace(deltaSeconds: number): void {
    const core = this.overtake.update(deltaSeconds);
    this.syncCoreRadio(core.driverMessage);

    if (
      this.phase === 'overtake' &&
      core.outcome !== 'pending' &&
      core.distanceToCornerMetres <= 0.05
    ) {
      this.phase = 'runout';
      this.phaseSeconds = 0;
      this.finalOutcome = core.outcome;
      this.resultAchieved = core.outcome === 'success';
    }

    const leaderTarget = getTargetSpeedKmh(wrapProgress(this.leaderTotalProgress)) + 4;
    const leaderStep = stepSpeedToward(
      this.leaderSpeedMetresPerSecond,
      kmhToMetresPerSecond(leaderTarget),
      1.2,
      deltaSeconds,
    );
    this.leaderSpeedMetresPerSecond = leaderStep.nextSpeedMetresPerSecond;
    this.leaderTotalProgress += leaderStep.distanceMetres / this.trackLength;

    if (this.phase === 'runout' && core.playerTotalProgress >= SPRINT_FINISH_TOTAL_PROGRESS) {
      this.phase = 'finished';
      this.phaseSeconds = 0;
      this.setRadio(
        this.resultAchieved ? 'targetAchieved' : 'targetMissed',
        Number.POSITIVE_INFINITY,
      );
    }
  }

  private syncCoreRadio(message: DriverMessageKey | null): void {
    if (message === this.lastCoreMessage) return;
    this.lastCoreMessage = message;
    if (message) this.setRadio(message, Number.POSITIVE_INFINITY);
    else if (this.radioKey && isCoreRadioKey(this.radioKey)) this.radioKey = null;
  }

  private setRadio(key: RaceRadioKey, durationSeconds: number): void {
    this.radioKey = key;
    this.radioSequence += 1;
    this.radioSecondsRemaining = durationSeconds;
  }

  private updateRadio(deltaSeconds: number): void {
    if (!Number.isFinite(this.radioSecondsRemaining)) return;
    this.radioSecondsRemaining = Math.max(0, this.radioSecondsRemaining - deltaSeconds);
    if (this.radioSecondsRemaining === 0) this.radioKey = null;
  }
}

function getTargetSpeedKmh(progress: number): number {
  if (progress >= 0.19 && progress < 0.3) return 116;
  if (progress >= 0.39 && progress < 0.47) return 139;
  if (progress >= 0.68 && progress < 0.81) return 112;
  if (progress >= 0.83 && progress < 0.91) return 122;
  if (progress >= 0.94 || progress < 0.035) return 132;
  return 154;
}

function isCoreRadioKey(key: RaceRadioKey): key is DriverMessageKey {
  return [
    'copyInside',
    'copyOutside',
    'now',
    'tooSoon',
    'tooLate',
    'noRoom',
    'noCall',
    'gotHim',
  ].includes(key);
}

function wrapProgress(progress: number): number {
  return ((progress % 1) + 1) % 1;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, Number.isFinite(value) ? value : 0));
}
