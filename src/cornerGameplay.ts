import * as THREE from 'three';
import type { DrivingModifiers } from './carController';

export type CornerDirection = 'left' | 'right';
export type TimingState = 'prepared' | 'rushed' | 'emergency';
export type CornerResult =
  | 'aggressiveEntry'
  | 'hardRecovery'
  | 'overshootRecovery';
export type DriverReaction = 'copy' | 'copyUrgent' | 'now';

/** One deliberately selected corner, expressed as normalized track progress. */
export interface GameplayCorner {
  approachStartProgress: number;
  entryProgress: number;
  apexProgress: number;
  exitProgress: number;
  direction: CornerDirection;
}

export interface LateBrakeFeedback {
  command: 'lateBrake';
  ttcSeconds: number;
  timing: TimingState;
  result: CornerResult;
  reaction: DriverReaction;
}

/** Prototype tuning values, intentionally centralized for quick playtest changes. */
export const LATE_BRAKE_TTC_THRESHOLDS = Object.freeze({
  preparedMinimumSeconds: 2.5,
  rushedMinimumSeconds: 1,
});

const KMH_PER_METRE_PER_SECOND = 3.6;
const PROGRESS_EPSILON = 1e-9;

interface ActiveLateBrakeCommand {
  feedback: LateBrakeFeedback;
  issuedAtTotalProgress: number;
  approachStartTotalProgress: number;
  entryTotalProgress: number;
  apexTotalProgress: number;
  exitTotalProgress: number;
}

/** Wrap any lap progress into the normalized [0, 1) track range. */
export function wrapTrackProgress(progress: number): number {
  if (!Number.isFinite(progress)) {
    return 0;
  }

  return ((progress % 1) + 1) % 1;
}

/** Forward-only normalized distance, including correctly wrapping over the line. */
export function getForwardProgressDistance(
  fromProgress: number,
  toProgress: number,
): number {
  return wrapTrackProgress(toProgress - fromProgress);
}

/** Forward-only distance in track units (treated as metres by the prototype). */
export function getForwardDistanceMetres(
  fromProgress: number,
  toProgress: number,
  trackLength: number,
): number {
  const safeTrackLength = Number.isFinite(trackLength)
    ? Math.max(0, trackLength)
    : 0;
  return getForwardProgressDistance(fromProgress, toProgress) * safeTrackLength;
}

/** Convert a distance and current speed into a deterministic time-to-corner. */
export function getTimeToCornerSeconds(
  distanceMetres: number,
  speedKmh: number,
): number {
  const safeDistance = Number.isFinite(distanceMetres)
    ? Math.max(0, distanceMetres)
    : 0;
  const speedMetresPerSecond =
    Number.isFinite(speedKmh) && speedKmh > 0
      ? speedKmh / KMH_PER_METRE_PER_SECOND
      : 0;

  return speedMetresPerSecond > 0
    ? safeDistance / speedMetresPerSecond
    : Number.POSITIVE_INFINITY;
}

export function classifyLateBrakeTiming(ttcSeconds: number): TimingState {
  if (ttcSeconds >= LATE_BRAKE_TTC_THRESHOLDS.preparedMinimumSeconds) {
    return 'prepared';
  }
  if (ttcSeconds >= LATE_BRAKE_TTC_THRESHOLDS.rushedMinimumSeconds) {
    return 'rushed';
  }
  return 'emergency';
}

/**
 * Owns the one-corner timing state. It has no randomness and no frame-clock
 * dependency: the same command at the same progress and speed has the same result.
 */
export class CornerGameplayController {
  private readonly corner: GameplayCorner;
  private readonly trackLength: number;
  private readonly approachToEntryProgress: number;
  private readonly entryToApexProgress: number;
  private readonly entryToExitProgress: number;
  private activeCommand: ActiveLateBrakeCommand | null = null;
  private previousFeedback: LateBrakeFeedback | null = null;
  private currentReaction: DriverReaction | null = null;

  constructor(corner: GameplayCorner, trackLength: number) {
    this.corner = normalizeCorner(corner);
    this.trackLength = Number.isFinite(trackLength)
      ? Math.max(PROGRESS_EPSILON, trackLength)
      : PROGRESS_EPSILON;
    this.approachToEntryProgress = getForwardProgressDistance(
      this.corner.approachStartProgress,
      this.corner.entryProgress,
    );
    this.entryToApexProgress = getForwardProgressDistance(
      this.corner.entryProgress,
      this.corner.apexProgress,
    );
    this.entryToExitProgress = getForwardProgressDistance(
      this.corner.entryProgress,
      this.corner.exitProgress,
    );

    if (
      this.approachToEntryProgress <= PROGRESS_EPSILON ||
      this.entryToApexProgress <= PROGRESS_EPSILON ||
      this.entryToExitProgress <= this.entryToApexProgress
    ) {
      throw new Error(
        'Gameplay corner points must run forward: approach, entry, apex, exit.',
      );
    }
  }

  get lastFeedback(): LateBrakeFeedback | null {
    return this.previousFeedback;
  }

  get reaction(): DriverReaction | null {
    return this.currentReaction;
  }

  get hasActiveCommand(): boolean {
    return this.activeCommand !== null;
  }

  /** Distance to this corner's next entry, wrapping cleanly onto the next lap. */
  distanceToNextCorner(totalProgress: number): number {
    return getForwardDistanceMetres(
      totalProgress,
      this.corner.entryProgress,
      this.trackLength,
    );
  }

  /**
   * Apply one command to the next entry occurrence. Repeated presses are ignored
   * until that occurrence exits, preventing accidental multi-lap commands.
   */
  issueLateBrake(
    totalProgress: number,
    currentSpeedKmh: number,
  ): LateBrakeFeedback | null {
    const safeTotalProgress = finiteNonNegative(totalProgress);
    this.resetCommandAfterExit(safeTotalProgress);
    if (this.activeCommand) {
      return null;
    }

    const entryTotalProgress = getNextOccurrenceTotalProgress(
      safeTotalProgress,
      this.corner.entryProgress,
    );
    const distanceMetres =
      (entryTotalProgress - safeTotalProgress) * this.trackLength;
    const ttcSeconds = getTimeToCornerSeconds(
      distanceMetres,
      currentSpeedKmh,
    );
    const timing = classifyLateBrakeTiming(ttcSeconds);
    const feedback = createFeedback(ttcSeconds, timing);

    this.activeCommand = {
      feedback,
      issuedAtTotalProgress: safeTotalProgress,
      approachStartTotalProgress:
        entryTotalProgress - this.approachToEntryProgress,
      entryTotalProgress,
      apexTotalProgress: entryTotalProgress + this.entryToApexProgress,
      exitTotalProgress: entryTotalProgress + this.entryToExitProgress,
    };
    this.previousFeedback = feedback;
    this.currentReaction = feedback.reaction;

    return feedback;
  }

  /**
   * Produce this frame's arcade-driving values. The caller passes the current
   * pace target, so SAFE / NORMAL / PUSH remain authoritative outside the corner.
   */
  update(
    totalProgress: number,
    baselineTargetSpeedKmh: number,
  ): DrivingModifiers {
    const safeTotalProgress = finiteNonNegative(totalProgress);
    const safeBaselineSpeedKmh = Number.isFinite(baselineTargetSpeedKmh)
      ? Math.max(0, baselineTargetSpeedKmh)
      : 0;
    this.resetCommandAfterExit(safeTotalProgress);

    const command = this.activeCommand;
    if (
      command &&
      safeTotalProgress + PROGRESS_EPSILON >=
        command.approachStartTotalProgress &&
      safeTotalProgress <= command.exitTotalProgress + PROGRESS_EPSILON
    ) {
      return this.getCommandModifiers(
        command,
        safeTotalProgress,
        safeBaselineSpeedKmh,
      );
    }

    return this.getAutomaticCornerModifiers(
      safeTotalProgress,
      safeBaselineSpeedKmh,
    );
  }

  private resetCommandAfterExit(totalProgress: number): void {
    if (
      this.activeCommand &&
      totalProgress > this.activeCommand.exitTotalProgress + PROGRESS_EPSILON
    ) {
      this.activeCommand = null;
      this.currentReaction = null;
    }
  }

  private getAutomaticCornerModifiers(
    totalProgress: number,
    baselineSpeedKmh: number,
  ): DrivingModifiers {
    const progress = wrapTrackProgress(totalProgress);
    const fromApproach = getForwardProgressDistance(
      this.corner.approachStartProgress,
      progress,
    );
    const approachToExit =
      this.approachToEntryProgress + this.entryToExitProgress;

    if (fromApproach > approachToExit) {
      return {};
    }

    const normalCornerSpeed = getNormalCornerSpeed(baselineSpeedKmh);
    if (fromApproach < this.approachToEntryProgress) {
      const approachPhase = safeRatio(
        fromApproach,
        this.approachToEntryProgress,
      );
      const brakingBlend = smoothstep(0.18, 1, approachPhase);
      return {
        targetSpeedKmh: THREE.MathUtils.lerp(
          baselineSpeedKmh,
          normalCornerSpeed,
          brakingBlend,
        ),
        speedResponse: THREE.MathUtils.lerp(1.7, 3.8, brakingBlend),
      };
    }

    const afterEntry = fromApproach - this.approachToEntryProgress;
    if (afterEntry <= this.entryToApexProgress) {
      return {
        targetSpeedKmh: normalCornerSpeed,
        speedResponse: 3.8,
      };
    }

    const exitPhase = safeRatio(
      afterEntry - this.entryToApexProgress,
      this.entryToExitProgress - this.entryToApexProgress,
    );
    return {
      targetSpeedKmh: THREE.MathUtils.lerp(
        normalCornerSpeed,
        baselineSpeedKmh,
        smoothstep(0, 1, exitPhase),
      ),
      speedResponse: 1.8,
    };
  }

  private getCommandModifiers(
    command: ActiveLateBrakeCommand,
    totalProgress: number,
    baselineSpeedKmh: number,
  ): DrivingModifiers {
    switch (command.feedback.timing) {
      case 'prepared':
        return this.getPreparedModifiers(
          command,
          totalProgress,
          baselineSpeedKmh,
        );
      case 'rushed':
        return this.getRushedModifiers(
          command,
          totalProgress,
          baselineSpeedKmh,
        );
      case 'emergency':
        return this.getEmergencyModifiers(
          command,
          totalProgress,
          baselineSpeedKmh,
        );
    }
  }

  private getPreparedModifiers(
    command: ActiveLateBrakeCommand,
    totalProgress: number,
    baselineSpeedKmh: number,
  ): DrivingModifiers {
    const normalCornerSpeed = getNormalCornerSpeed(baselineSpeedKmh);
    const aggressiveCornerSpeed = Math.min(
      baselineSpeedKmh,
      normalCornerSpeed + Math.max(24, baselineSpeedKmh * 0.24),
    );
    // CarController's lateral basis points to visual track-left. Therefore a
    // right corner's inside line is negative and its outside is positive.
    const insideDirection = this.corner.direction === 'right' ? -1 : 1;

    if (totalProgress < command.entryTotalProgress) {
      const approachPhase = safeRatio(
        totalProgress - command.approachStartTotalProgress,
        command.entryTotalProgress - command.approachStartTotalProgress,
      );
      const brakingBlend = smoothstep(0.78, 1, approachPhase);
      return {
        targetSpeedKmh: THREE.MathUtils.lerp(
          baselineSpeedKmh,
          aggressiveCornerSpeed,
          brakingBlend,
        ),
        speedResponse: THREE.MathUtils.lerp(1.45, 2.6, brakingBlend),
      };
    }

    const cornerPhase = safeRatio(
      totalProgress - command.entryTotalProgress,
      command.exitTotalProgress - command.entryTotalProgress,
    );
    const exitRecovery = smoothstep(
      safeRatio(
        command.apexTotalProgress - command.entryTotalProgress,
        command.exitTotalProgress - command.entryTotalProgress,
      ),
      1,
      cornerPhase,
    );
    return {
      targetSpeedKmh: THREE.MathUtils.lerp(
        aggressiveCornerSpeed,
        baselineSpeedKmh,
        exitRecovery,
      ),
      speedResponse: 2.5,
      lateralOffset:
        insideDirection * 0.55 * Math.sin(Math.PI * cornerPhase),
      yawOffset: 0,
    };
  }

  private getRushedModifiers(
    command: ActiveLateBrakeCommand,
    totalProgress: number,
    baselineSpeedKmh: number,
  ): DrivingModifiers {
    const normalCornerSpeed = getNormalCornerSpeed(baselineSpeedKmh);
    const recoveryStart = command.apexTotalProgress;
    const delayedBrakeStart = THREE.MathUtils.lerp(
      command.approachStartTotalProgress,
      command.entryTotalProgress,
      0.58,
    );
    const eventStart = Math.max(
      command.issuedAtTotalProgress,
      delayedBrakeStart,
    );

    if (totalProgress < eventStart) {
      return {
        targetSpeedKmh: baselineSpeedKmh,
        speedResponse: 1.45,
      };
    }

    const eventPhase = safeRatio(
      totalProgress - eventStart,
      command.exitTotalProgress - eventStart,
    );
    const recoveryPhase = safeRatio(
      totalProgress - recoveryStart,
      command.exitTotalProgress - recoveryStart,
    );
    const recoveryBlend = smoothstep(0, 1, recoveryPhase);
    const instabilityEnvelope = Math.sin(Math.PI * eventPhase);
    const outsideDirection = this.corner.direction === 'right' ? 1 : -1;
    const wobble = Math.sin(eventPhase * Math.PI * 5);

    return {
      targetSpeedKmh: THREE.MathUtils.lerp(
        normalCornerSpeed * 0.62,
        baselineSpeedKmh,
        recoveryBlend,
      ),
      speedResponse: THREE.MathUtils.lerp(6.8, 2, recoveryBlend),
      lateralOffset:
        outsideDirection * instabilityEnvelope * (0.65 + wobble * 0.7),
      yawOffset: instabilityEnvelope * wobble * 0.105,
    };
  }

  private getEmergencyModifiers(
    command: ActiveLateBrakeCommand,
    totalProgress: number,
    baselineSpeedKmh: number,
  ): DrivingModifiers {
    const normalCornerSpeed = getNormalCornerSpeed(baselineSpeedKmh);
    const eventStart = Math.max(
      command.issuedAtTotalProgress,
      command.approachStartTotalProgress,
    );
    const eventPhase = safeRatio(
      totalProgress - eventStart,
      command.exitTotalProgress - eventStart,
    );
    const overshootEnvelope = Math.sin(Math.PI * eventPhase);
    const outsideDirection = this.corner.direction === 'right' ? 1 : -1;
    const recoveryStartPhase = 0.58;
    const recoveryBlend = smoothstep(recoveryStartPhase, 1, eventPhase);

    return {
      targetSpeedKmh: THREE.MathUtils.lerp(
        Math.max(24, normalCornerSpeed * 0.38),
        baselineSpeedKmh,
        recoveryBlend,
      ),
      speedResponse: THREE.MathUtils.lerp(9.2, 1.8, recoveryBlend),
      lateralOffset: outsideDirection * 5.35 * overshootEnvelope,
      yawOffset:
        outsideDirection *
        0.2 *
        overshootEnvelope *
        Math.sin(Math.PI * eventPhase * 1.35),
    };
  }
}

function normalizeCorner(corner: GameplayCorner): GameplayCorner {
  return {
    approachStartProgress: wrapTrackProgress(corner.approachStartProgress),
    entryProgress: wrapTrackProgress(corner.entryProgress),
    apexProgress: wrapTrackProgress(corner.apexProgress),
    exitProgress: wrapTrackProgress(corner.exitProgress),
    direction: corner.direction,
  };
}

function getNextOccurrenceTotalProgress(
  totalProgress: number,
  targetProgress: number,
): number {
  const targetOnCurrentLap =
    Math.floor(totalProgress) + wrapTrackProgress(targetProgress);
  return targetOnCurrentLap > totalProgress + PROGRESS_EPSILON
    ? targetOnCurrentLap
    : targetOnCurrentLap + 1;
}

function createFeedback(
  ttcSeconds: number,
  timing: TimingState,
): LateBrakeFeedback {
  switch (timing) {
    case 'prepared':
      return {
        command: 'lateBrake',
        ttcSeconds,
        timing,
        result: 'aggressiveEntry',
        reaction: 'copy',
      };
    case 'rushed':
      return {
        command: 'lateBrake',
        ttcSeconds,
        timing,
        result: 'hardRecovery',
        reaction: 'copyUrgent',
      };
    case 'emergency':
      return {
        command: 'lateBrake',
        ttcSeconds,
        timing,
        result: 'overshootRecovery',
        reaction: 'now',
      };
  }
}

function getNormalCornerSpeed(baselineSpeedKmh: number): number {
  return Math.min(baselineSpeedKmh, THREE.MathUtils.clamp(
    baselineSpeedKmh * 0.62,
    46,
    92,
  ));
}

function finiteNonNegative(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function safeRatio(numerator: number, denominator: number): number {
  if (denominator <= PROGRESS_EPSILON) {
    return numerator >= 0 ? 1 : 0;
  }
  return THREE.MathUtils.clamp(numerator / denominator, 0, 1);
}

function smoothstep(minimum: number, maximum: number, value: number): number {
  if (maximum <= minimum) {
    return value >= maximum ? 1 : 0;
  }
  return THREE.MathUtils.smoothstep(value, minimum, maximum);
}
