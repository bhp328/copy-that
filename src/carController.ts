import * as THREE from 'three';
import type { PaceMode } from './localization';
import { createFormulaCar } from './formulaCar';

export type { PaceMode } from './localization';

export const PACE_MODES = ['safe', 'normal', 'push'] as const satisfies readonly PaceMode[];

/** Exaggerated prototype values so each pace is immediately readable. */
export const PACE_TARGET_SPEEDS_KMH: Readonly<Record<PaceMode, number>> = {
  safe: 60,
  normal: 130,
  push: 230,
};

/**
 * Temporary arcade-driving values supplied by gameplay systems for one frame.
 * Omitting a value preserves the normal pace-controller behaviour.
 */
export interface DrivingModifiers {
  targetSpeedKmh?: number;
  speedResponse?: number;
  lateralOffset?: number;
  yawOffset?: number;
}

const WORLD_UP = new THREE.Vector3(0, 1, 0);
const KMH_PER_METRE_PER_SECOND = 3.6;
const SPEED_RESPONSE = 1.45;
const MIN_SPEED_RESPONSE = 0.001;
const MAX_FRAME_STEP_SECONDS = 0.1;
const WHEEL_RADIUS = 0.46;

/**
 * Moves a primitive car along a closed curve without a physics engine.
 * Track units are treated as metres, making the displayed speed meaningful.
 */
export class CarController {
  readonly object: THREE.Group;

  private readonly curve: THREE.CatmullRomCurve3;
  private readonly trackLength: number;
  private readonly wheels: THREE.Mesh[];
  private currentPaceMode: PaceMode;
  private currentSpeedMetresPerSecond = 0;
  private currentProgress: number;
  private currentTotalProgress: number;

  constructor(
    curve: THREE.CatmullRomCurve3,
    initialPaceMode: PaceMode = 'normal',
    initialProgress = 0,
  ) {
    this.curve = curve;
    this.curve.updateArcLengths();
    this.trackLength = this.curve.getLength();
    this.currentPaceMode = initialPaceMode;
    this.currentTotalProgress = Number.isFinite(initialProgress)
      ? Math.max(0, initialProgress)
      : 0;
    this.currentProgress = wrapProgress(this.currentTotalProgress);

    const model = createFormulaCar({
      name: 'player-car',
      bodyColor: 0xff5b35,
      accentColor: 0xffc857,
      helmetColor: 0xf4f7fb,
    });
    this.object = model.group;
    this.wheels = model.wheels;
    this.placeCarOnTrack();
  }

  /** Advance the deterministic simulation by elapsed real time in seconds. */
  update(deltaSeconds: number, modifiers: DrivingModifiers = {}): void {
    const timeStep = THREE.MathUtils.clamp(
      Number.isFinite(deltaSeconds) ? deltaSeconds : 0,
      0,
      MAX_FRAME_STEP_SECONDS,
    );
    if (timeStep === 0) {
      this.placeCarOnTrack(modifiers);
      return;
    }

    const previousSpeed = this.currentSpeedMetresPerSecond;
    const requestedTargetSpeedKmh = finiteOr(
      modifiers.targetSpeedKmh,
      PACE_TARGET_SPEEDS_KMH[this.currentPaceMode],
    );
    const targetSpeed =
      Math.max(0, requestedTargetSpeedKmh) / KMH_PER_METRE_PER_SECOND;
    const speedResponse = Math.max(
      MIN_SPEED_RESPONSE,
      finiteOr(modifiers.speedResponse, SPEED_RESPONSE),
    );
    const decay = Math.exp(-speedResponse * timeStep);

    this.currentSpeedMetresPerSecond =
      targetSpeed + (previousSpeed - targetSpeed) * decay;

    // This is the exact distance integral of the exponential speed transition,
    // so the same command timeline has stable results at different frame rates.
    const distanceTravelled =
      targetSpeed * timeStep +
      ((previousSpeed - targetSpeed) * (1 - decay)) / speedResponse;

    this.currentTotalProgress += distanceTravelled / this.trackLength;
    this.currentProgress = wrapProgress(this.currentTotalProgress);
    this.spinWheels(distanceTravelled);
    this.placeCarOnTrack(modifiers);
  }

  /**
   * Place the rendered car from an authoritative gameplay-model state. This is
   * used by the overtake experiment so browser play and CLI simulation cannot
   * drift into separate speed/gap equations.
   */
  setSimulationState(
    totalProgress: number,
    speedKmh: number,
    modifiers: DrivingModifiers = {},
  ): void {
    const nextTotalProgress = Number.isFinite(totalProgress)
      ? Math.max(0, totalProgress)
      : this.currentTotalProgress;
    const distanceTravelled =
      (nextTotalProgress - this.currentTotalProgress) * this.trackLength;
    if (Math.abs(distanceTravelled) < this.trackLength * 0.5) {
      this.spinWheels(distanceTravelled);
    }
    this.currentTotalProgress = nextTotalProgress;
    this.currentProgress = wrapProgress(nextTotalProgress);
    this.currentSpeedMetresPerSecond =
      Math.max(0, Number.isFinite(speedKmh) ? speedKmh : 0) /
      KMH_PER_METRE_PER_SECOND;
    this.placeCarOnTrack(modifiers);
  }

  setPaceMode(paceMode: PaceMode): void {
    this.currentPaceMode = paceMode;
  }

  get paceMode(): PaceMode {
    return this.currentPaceMode;
  }

  get speedKmh(): number {
    return this.currentSpeedMetresPerSecond * KMH_PER_METRE_PER_SECOND;
  }

  get targetSpeedKmh(): number {
    return PACE_TARGET_SPEEDS_KMH[this.currentPaceMode];
  }

  /** Normalized lap position in the range [0, 1). */
  get progress(): number {
    return this.currentProgress;
  }

  /** Unwrapped lap progress. Each whole number represents one completed lap. */
  get totalProgress(): number {
    return this.currentTotalProgress;
  }

  get completedLaps(): number {
    return Math.floor(this.currentTotalProgress);
  }

  private placeCarOnTrack(modifiers: DrivingModifiers = {}): void {
    const point = this.curve.getPointAt(this.currentProgress);
    const tangent = this.curve.getTangentAt(this.currentProgress).normalize();
    const right = new THREE.Vector3()
      .crossVectors(WORLD_UP, tangent)
      .normalize();
    const up = new THREE.Vector3().crossVectors(tangent, right).normalize();
    const orientation = new THREE.Matrix4().makeBasis(right, up, tangent);
    const lateralOffset = finiteOr(modifiers.lateralOffset, 0);
    const yawOffset = finiteOr(modifiers.yawOffset, 0);

    this.object.position
      .copy(point)
      .addScaledVector(right, lateralOffset)
      .addScaledVector(up, 0.08);
    this.object.quaternion.setFromRotationMatrix(orientation);
    this.object.rotateY(yawOffset);
  }

  private spinWheels(distanceTravelled: number): void {
    const rotation = distanceTravelled / WHEEL_RADIUS;
    for (const wheel of this.wheels) {
      wheel.rotation.x += rotation;
    }
  }
}

function wrapProgress(progress: number): number {
  return ((progress % 1) + 1) % 1;
}

function finiteOr(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) ? value : fallback;
}
