import * as THREE from 'three';
import { wrapTrackProgress } from './cornerGameplay';
import type { CoreOvertakeSnapshot } from './overtakeSimulation';
import { createOpponentCar } from './overtakeScenario';

export {
  CORE_EVENT_END_PROGRESS,
  CORE_EVENT_START_PROGRESS,
  selectDefenseSide,
} from './overtakeSimulation';
export type {
  CoreOvertakeOptions,
  CoreOvertakeSnapshot,
  DefenseSelectionMode,
  DriverMessageKey,
  GapRelation,
} from './overtakeSimulation';

const WORLD_UP = new THREE.Vector3(0, 1, 0);

/** Three.js-only adapter for the protected overtake opponent. */
export class OvertakePresentation {
  readonly opponent: THREE.Group;

  private readonly curve: THREE.CatmullRomCurve3;
  private readonly tangent = new THREE.Vector3();
  private readonly lateral = new THREE.Vector3();
  private readonly up = new THREE.Vector3();
  private readonly orientation = new THREE.Matrix4();

  constructor(curve: THREE.CatmullRomCurve3) {
    this.curve = curve;
    this.opponent = createOpponentCar();
  }

  sync(snapshot: CoreOvertakeSnapshot): void {
    const progress = wrapTrackProgress(snapshot.opponentTotalProgress);
    const point = this.curve.getPointAt(progress);
    this.tangent.copy(this.curve.getTangentAt(progress)).normalize();
    this.lateral.crossVectors(WORLD_UP, this.tangent).normalize();
    this.up.crossVectors(this.tangent, this.lateral).normalize();
    this.orientation.makeBasis(this.lateral, this.up, this.tangent);
    this.opponent.position
      .copy(point)
      .addScaledVector(this.lateral, snapshot.opponentLateralOffsetMetres)
      .addScaledVector(this.up, 0.08);
    this.opponent.quaternion.setFromRotationMatrix(this.orientation);
  }
}
