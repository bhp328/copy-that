import * as THREE from 'three';
import type { DrivingModifiers } from './carController';
import type { GameplayCorner } from './cornerGameplay';
import { wrapTrackProgress } from './cornerGameplay';
import {
  OVERTAKE_SCENARIO,
  type OvertakeScenarioMetadata,
} from './overtakeScenario';

export type IntentPlan = 'inside' | 'outside';

export interface IntentCallSnapshot {
  occurrenceIndex: number;
  isAvailable: boolean;
  committedPlan: IntentPlan | null;
  acknowledgement: string | null;
  preparationOffsetMetres: number;
}

interface IntentPreparationTuning {
  responseDelaySeconds: number;
  acknowledgementDurationSeconds: number;
  preparationOffsetMetres: number;
  preparationResponse: number;
  returnResponse: number;
}

const INTENT_PREPARATION = Object.freeze({
  responseDelaySeconds: 0.32,
  acknowledgementDurationSeconds: 2.2,
  preparationOffsetMetres: 2.25,
  preparationResponse: 2.4,
  returnResponse: 3.4,
} satisfies IntentPreparationTuning);

/**
 * Owns one tactical Engineer call for each staged opponent occurrence.
 *
 * An intent is a committed plan, not direct steering: the Driver waits briefly,
 * acknowledges, then smoothly prepares the requested corridor while retaining
 * control of speed and cornering. The opponent never reads or reacts to this
 * state. Driver can save the car. He cannot save the Engineer's decision.
 */
export class IntentCallController {
  private readonly corner: GameplayCorner;
  private readonly scenario: OvertakeScenarioMetadata;
  private occurrenceIndex = 0;
  private committedPlan: IntentPlan | null = null;
  private acknowledgement: string | null = null;
  private acknowledgementSecondsRemaining = 0;
  private responseSeconds = 0;
  private preparationOffsetMetres = 0;
  private isAvailable = false;

  constructor(
    corner: GameplayCorner,
    scenario: OvertakeScenarioMetadata = OVERTAKE_SCENARIO,
  ) {
    this.corner = corner;
    this.scenario = scenario;
  }

  issueIntent(plan: IntentPlan, totalProgress: number): boolean {
    this.synchronizeOccurrence(totalProgress);
    this.updateAvailability(totalProgress);

    if (!this.isAvailable || this.committedPlan !== null) {
      return false;
    }

    this.committedPlan = plan;
    this.acknowledgement =
      plan === 'inside' ? 'Copy. Inside.' : 'Copy. Outside.';
    this.acknowledgementSecondsRemaining =
      INTENT_PREPARATION.acknowledgementDurationSeconds;
    this.responseSeconds = 0;
    this.isAvailable = false;
    return true;
  }

  update(deltaSeconds: number, totalProgress: number): DrivingModifiers {
    const timeStep = THREE.MathUtils.clamp(
      Number.isFinite(deltaSeconds) ? deltaSeconds : 0,
      0,
      0.1,
    );
    this.synchronizeOccurrence(totalProgress);
    this.updateAvailability(totalProgress);

    if (this.acknowledgementSecondsRemaining > 0) {
      this.acknowledgementSecondsRemaining = Math.max(
        0,
        this.acknowledgementSecondsRemaining - timeStep,
      );
      if (this.acknowledgementSecondsRemaining === 0) {
        this.acknowledgement = null;
      }
    }

    if (this.committedPlan) {
      this.responseSeconds += timeStep;
    }

    const progress = wrapTrackProgress(totalProgress);
    const activePlan = this.committedPlan;
    const shouldPrepare =
      activePlan !== null &&
      this.responseSeconds >= INTENT_PREPARATION.responseDelaySeconds &&
      progress < this.scenario.recoveryEndProgress;
    const targetOffset = shouldPrepare
      ? this.getPlanDirection(activePlan) *
        INTENT_PREPARATION.preparationOffsetMetres
      : 0;
    const response = shouldPrepare
      ? INTENT_PREPARATION.preparationResponse
      : INTENT_PREPARATION.returnResponse;
    const blend = 1 - Math.exp(-response * timeStep);
    this.preparationOffsetMetres = THREE.MathUtils.lerp(
      this.preparationOffsetMetres,
      targetOffset,
      blend,
    );

    if (Math.abs(this.preparationOffsetMetres) < 0.001) {
      this.preparationOffsetMetres = 0;
    }

    return this.preparationOffsetMetres === 0
      ? {}
      : { lateralOffset: this.preparationOffsetMetres };
  }

  get snapshot(): IntentCallSnapshot {
    return {
      occurrenceIndex: this.occurrenceIndex,
      isAvailable: this.isAvailable,
      committedPlan: this.committedPlan,
      acknowledgement: this.acknowledgement,
      preparationOffsetMetres: this.preparationOffsetMetres,
    };
  }

  private synchronizeOccurrence(totalProgress: number): void {
    const safeTotalProgress = Number.isFinite(totalProgress)
      ? Math.max(0, totalProgress)
      : 0;
    const nextOccurrenceIndex = Math.floor(
      safeTotalProgress + (1 - this.scenario.recoveryEndProgress),
    );

    if (nextOccurrenceIndex === this.occurrenceIndex) {
      return;
    }

    this.occurrenceIndex = nextOccurrenceIndex;
    this.committedPlan = null;
    this.acknowledgement = null;
    this.acknowledgementSecondsRemaining = 0;
    this.responseSeconds = 0;
    this.isAvailable = false;
  }

  private updateAvailability(totalProgress: number): void {
    const progress = wrapTrackProgress(totalProgress);
    this.isAvailable =
      this.committedPlan === null &&
      progress >= this.scenario.approachStartProgress &&
      progress < this.scenario.cornerEntryProgress;
  }

  private getPlanDirection(plan: IntentPlan): number {
    // CarController's lateral basis points toward visual track-left. For this
    // right-hander the physical inside/right is negative; outside/left positive.
    const insideDirection = this.corner.direction === 'right' ? -1 : 1;
    return plan === 'inside' ? insideDirection : -insideDirection;
  }
}
