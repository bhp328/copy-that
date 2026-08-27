import * as THREE from 'three';
import type { GameplayCorner } from './cornerGameplay';
import { getForwardDistanceMetres, wrapTrackProgress } from './cornerGameplay';
import { createFormulaCar } from './formulaCar';

export type DefenseSide = 'inside' | 'outside';

export interface OvertakeScenarioMetadata {
  approachStartProgress: number;
  defenseStartProgress: number;
  cornerEntryProgress: number;
  apexProgress: number;
  recoveryEndProgress: number;
  stagingGapMetres: number;
  entryGapMetres: number;
  defenseOffsetMetres: number;
}

export interface OvertakeScenarioSnapshot {
  occurrenceIndex: number;
  defenseSide: DefenseSide;
  distanceToCornerMetres: number;
  gapMetres: number;
  gapSeconds: number;
  isClosing: boolean;
  opponentLateralOffsetMetres: number;
}

/**
 * Explicit staging for the overtake-decision experiment. These markers describe
 * the scenario beat, not a hidden player timing window or a command outcome.
 */
export const OVERTAKE_SCENARIO = Object.freeze({
  approachStartProgress: 0.42,
  defenseStartProgress: 0.48,
  cornerEntryProgress: 0.88,
  apexProgress: 0.93,
  recoveryEndProgress: 0.99,
  stagingGapMetres: 28,
  entryGapMetres: 8.5,
  defenseOffsetMetres: 2.35,
} satisfies OvertakeScenarioMetadata);

const WORLD_UP = new THREE.Vector3(0, 1, 0);
const MIN_GAP_SPEED_METRES_PER_SECOND = 8;

/**
 * Owns one deterministic opponent and the alternating A/B defense setup.
 *
 * Architecture rule: Driver can save the car. He cannot save the Engineer's
 * decision. This foundation stages information only; it intentionally contains
 * no player command, overtake resolution, collision, save, retirement, or DNF.
 */
export class OvertakeScenarioController {
  readonly opponent: THREE.Group;

  private readonly curve: THREE.CatmullRomCurve3;
  private readonly trackLength: number;
  private readonly corner: GameplayCorner;
  private readonly metadata: OvertakeScenarioMetadata;
  private readonly tangent = new THREE.Vector3();
  private readonly lateral = new THREE.Vector3();
  private readonly up = new THREE.Vector3();
  private readonly orientation = new THREE.Matrix4();
  private state: OvertakeScenarioSnapshot;

  constructor(
    curve: THREE.CatmullRomCurve3,
    trackLength: number,
    corner: GameplayCorner,
    metadata: OvertakeScenarioMetadata = OVERTAKE_SCENARIO,
  ) {
    this.curve = curve;
    this.trackLength = Math.max(0.001, trackLength);
    this.corner = corner;
    this.metadata = metadata;
    this.opponent = createOpponentCar();
    this.state = {
      occurrenceIndex: 0,
      defenseSide: 'inside',
      distanceToCornerMetres: 0,
      gapMetres: metadata.stagingGapMetres,
      gapSeconds: 0,
      isClosing: false,
      opponentLateralOffsetMetres: 0,
    };
  }

  update(
    playerTotalProgress: number,
    playerSpeedKmh: number,
  ): OvertakeScenarioSnapshot {
    const safeTotalProgress = Number.isFinite(playerTotalProgress)
      ? Math.max(0, playerTotalProgress)
      : 0;
    const playerProgress = wrapTrackProgress(safeTotalProgress);
    const occurrenceIndex = Math.floor(
      safeTotalProgress + (1 - this.metadata.recoveryEndProgress),
    );
    const defenseSide: DefenseSide =
      occurrenceIndex % 2 === 0 ? 'inside' : 'outside';
    const gapMetres = this.getScriptedGap(playerProgress);
    const opponentTotalProgress =
      safeTotalProgress + gapMetres / this.trackLength;
    const opponentProgress = wrapTrackProgress(opponentTotalProgress);
    const lateralOffset =
      this.getDefenseOffset(playerProgress) *
      (defenseSide === 'inside' ? -1 : 1);

    this.placeOpponent(opponentProgress, lateralOffset);

    const speedMetresPerSecond = Math.max(
      MIN_GAP_SPEED_METRES_PER_SECOND,
      Math.max(0, playerSpeedKmh) / 3.6,
    );
    this.state = {
      occurrenceIndex,
      defenseSide,
      distanceToCornerMetres: getForwardDistanceMetres(
        safeTotalProgress,
        this.corner.entryProgress,
        this.trackLength,
      ),
      gapMetres,
      gapSeconds: gapMetres / speedMetresPerSecond,
      isClosing:
        playerProgress >= this.metadata.approachStartProgress &&
        playerProgress < this.metadata.cornerEntryProgress,
      opponentLateralOffsetMetres: lateralOffset,
    };

    return this.state;
  }

  get snapshot(): OvertakeScenarioSnapshot {
    return this.state;
  }

  private getScriptedGap(progress: number): number {
    const {
      approachStartProgress,
      cornerEntryProgress,
      recoveryEndProgress,
      stagingGapMetres,
      entryGapMetres,
    } = this.metadata;

    if (progress < approachStartProgress || progress >= recoveryEndProgress) {
      return stagingGapMetres;
    }

    if (progress < cornerEntryProgress) {
      const phase = inverseLerp(
        approachStartProgress,
        cornerEntryProgress,
        progress,
      );
      return THREE.MathUtils.lerp(
        stagingGapMetres,
        entryGapMetres,
        smoothPhase(phase),
      );
    }

    const recoveryPhase = inverseLerp(
      cornerEntryProgress,
      recoveryEndProgress,
      progress,
    );
    return THREE.MathUtils.lerp(
      entryGapMetres,
      stagingGapMetres,
      smoothPhase(recoveryPhase),
    );
  }

  private getDefenseOffset(progress: number): number {
    const {
      defenseStartProgress,
      cornerEntryProgress,
      apexProgress,
      recoveryEndProgress,
      defenseOffsetMetres,
    } = this.metadata;

    if (progress < defenseStartProgress || progress >= recoveryEndProgress) {
      return 0;
    }
    if (progress < cornerEntryProgress) {
      return (
        defenseOffsetMetres *
        smoothPhase(
          inverseLerp(defenseStartProgress, cornerEntryProgress, progress),
        )
      );
    }
    if (progress <= apexProgress) {
      return defenseOffsetMetres;
    }

    return (
      defenseOffsetMetres *
      (1 -
        smoothPhase(
          inverseLerp(apexProgress, recoveryEndProgress, progress),
        ))
    );
  }

  private placeOpponent(progress: number, lateralOffset: number): void {
    const point = this.curve.getPointAt(progress);
    this.tangent.copy(this.curve.getTangentAt(progress)).normalize();
    this.lateral.crossVectors(WORLD_UP, this.tangent).normalize();
    this.up.crossVectors(this.tangent, this.lateral).normalize();
    this.orientation.makeBasis(this.lateral, this.up, this.tangent);

    this.opponent.position
      .copy(point)
      .addScaledVector(this.lateral, lateralOffset)
      .addScaledVector(this.up, 0.08);
    this.opponent.quaternion.setFromRotationMatrix(this.orientation);
  }
}

export function createOpponentCar(): THREE.Group {
  return createFormulaCar({
    name: 'opponent-car',
    bodyColor: 0x16d8d0,
    accentColor: 0x1857ff,
    helmetColor: 0xfff3c4,
  }).group;
}

function inverseLerp(minimum: number, maximum: number, value: number): number {
  if (maximum <= minimum) {
    return value >= maximum ? 1 : 0;
  }
  return THREE.MathUtils.clamp(
    (value - minimum) / (maximum - minimum),
    0,
    1,
  );
}

function smoothPhase(value: number): number {
  return value * value * (3 - 2 * value);
}
