import * as THREE from 'three';
import type { PaceMode } from './localization';

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

    const model = createLowPolyCar();
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

function createLowPolyCar(): { group: THREE.Group; wheels: THREE.Mesh[] } {
  const group = new THREE.Group();
  group.name = 'player-car';

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xffcf33,
    roughness: 0.5,
    metalness: 0.12,
    flatShading: true,
  });
  const darkMaterial = new THREE.MeshStandardMaterial({
    color: 0x161a20,
    roughness: 0.68,
    flatShading: true,
  });
  const windowMaterial = new THREE.MeshStandardMaterial({
    color: 0x4ba3c7,
    roughness: 0.25,
    metalness: 0.25,
    flatShading: true,
  });
  const lightMaterial = new THREE.MeshStandardMaterial({
    color: 0xf7f4d0,
    emissive: 0xb5aa65,
    emissiveIntensity: 0.35,
  });
  const tailMaterial = new THREE.MeshStandardMaterial({
    color: 0xff334f,
    emissive: 0xa00018,
    emissiveIntensity: 0.45,
  });

  const chassis = new THREE.Mesh(
    new THREE.BoxGeometry(2.45, 0.58, 4.4),
    bodyMaterial,
  );
  chassis.position.y = 0.73;
  chassis.castShadow = true;
  chassis.receiveShadow = true;
  group.add(chassis);

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.78, 0.72, 1.95),
    windowMaterial,
  );
  cabin.position.set(0, 1.34, -0.22);
  cabin.scale.set(0.92, 1, 0.9);
  cabin.castShadow = true;
  group.add(cabin);

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(1.65, 0.18, 1.65),
    darkMaterial,
  );
  roof.position.set(0, 1.74, -0.25);
  roof.castShadow = true;
  group.add(roof);

  const nose = new THREE.Mesh(
    new THREE.BoxGeometry(2.05, 0.22, 0.65),
    bodyMaterial,
  );
  nose.position.set(0, 0.78, 2.18);
  nose.castShadow = true;
  group.add(nose);

  const frontLightGeometry = new THREE.BoxGeometry(0.46, 0.18, 0.08);
  for (const x of [-0.72, 0.72]) {
    const light = new THREE.Mesh(frontLightGeometry, lightMaterial);
    light.position.set(x, 0.88, 2.53);
    group.add(light);
  }

  const tailLightGeometry = new THREE.BoxGeometry(0.5, 0.18, 0.08);
  for (const x of [-0.72, 0.72]) {
    const light = new THREE.Mesh(tailLightGeometry, tailMaterial);
    light.position.set(x, 0.84, -2.24);
    group.add(light);
  }

  const wheelGeometry = new THREE.CylinderGeometry(
    WHEEL_RADIUS,
    WHEEL_RADIUS,
    0.38,
    10,
  );
  wheelGeometry.rotateZ(Math.PI * 0.5);
  const wheels: THREE.Mesh[] = [];

  for (const x of [-1.25, 1.25]) {
    for (const z of [-1.42, 1.42]) {
      const wheel = new THREE.Mesh(wheelGeometry, darkMaterial);
      wheel.position.set(x, WHEEL_RADIUS, z);
      wheel.castShadow = true;
      wheels.push(wheel);
      group.add(wheel);
    }
  }

  const rearWing = new THREE.Mesh(
    new THREE.BoxGeometry(2.65, 0.14, 0.48),
    darkMaterial,
  );
  rearWing.position.set(0, 1.25, -2.08);
  rearWing.castShadow = true;
  group.add(rearWing);

  const wingSupports = new THREE.BoxGeometry(0.12, 0.55, 0.12);
  for (const x of [-0.76, 0.76]) {
    const support = new THREE.Mesh(wingSupports, darkMaterial);
    support.position.set(x, 0.98, -2.08);
    support.castShadow = true;
    group.add(support);
  }

  return { group, wheels };
}

function wrapProgress(progress: number): number {
  return ((progress % 1) + 1) % 1;
}

function finiteOr(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) ? value : fallback;
}
