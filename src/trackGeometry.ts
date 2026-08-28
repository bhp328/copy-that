import * as THREE from 'three';
import {
  getTrackRoadWidthAt,
  isBarrierAllowedAt,
  MERIDIAN_2_TRACK_SPEC,
  wrapUnitProgress,
  type TrackSpec,
} from './trackSpec.js';

const WORLD_UP = new THREE.Vector3(0, 1, 0);

export interface TrackFrame {
  readonly tangent: THREE.Vector3;
  readonly right: THREE.Vector3;
  readonly up: THREE.Vector3;
  readonly quaternion: THREE.Quaternion;
}

export interface BarrierPlacement {
  readonly progress: number;
  readonly side: -1 | 1;
  readonly position: THREE.Vector3;
  readonly tangent: THREE.Vector3;
  readonly right: THREE.Vector3;
  readonly quaternion: THREE.Quaternion;
  readonly depthMetres: number;
}

export function createTrackCurve(
  spec: Readonly<TrackSpec> = MERIDIAN_2_TRACK_SPEC,
): THREE.CatmullRomCurve3 {
  const curve = new THREE.CatmullRomCurve3(
    spec.controlPoints.map(
      (point) => new THREE.Vector3(point.x, point.y, point.z),
    ),
    true,
    'centripetal',
    0.5,
  );
  curve.arcLengthDivisions = spec.arcLengthDivisions;
  curve.updateArcLengths();
  return curve;
}

export function getTrackFrame(
  curve: THREE.CatmullRomCurve3,
  progress: number,
): TrackFrame {
  const wrapped = wrapUnitProgress(progress);
  const tangent = curve.getTangentAt(wrapped).normalize();
  const right = new THREE.Vector3().crossVectors(WORLD_UP, tangent).normalize();
  const up = new THREE.Vector3().crossVectors(tangent, right).normalize();
  const basis = new THREE.Matrix4().makeBasis(right, up, tangent);
  return {
    tangent,
    right,
    up,
    quaternion: new THREE.Quaternion().setFromRotationMatrix(basis),
  };
}

export function createBarrierPlacements(
  curve: THREE.CatmullRomCurve3,
  spec: Readonly<TrackSpec> = MERIDIAN_2_TRACK_SPEC,
): readonly BarrierPlacement[] {
  const placements: BarrierPlacement[] = [];
  for (let index = 0; index < spec.barrier.segments; index += 1) {
    const progress = (index + 0.5) / spec.barrier.segments;
    for (const side of [-1, 1] as const) {
      if (!isBarrierAllowedAt(progress, side, spec)) continue;
      const startProgress = index / spec.barrier.segments;
      const endProgress = (index + 1) / spec.barrier.segments;
      const start = getBarrierBoundaryPoint(curve, startProgress, side, spec);
      const end = getBarrierBoundaryPoint(curve, endProgress, side, spec);
      const tangent = end.clone().sub(start);
      const baseDepth = tangent.length();
      tangent.normalize();
      const right = new THREE.Vector3().crossVectors(WORLD_UP, tangent).normalize();
      const up = new THREE.Vector3().crossVectors(tangent, right).normalize();
      const basis = new THREE.Matrix4().makeBasis(right, up, tangent);
      placements.push({
        progress,
        side,
        position: start.clone().lerp(end, 0.5),
        tangent,
        right,
        quaternion: new THREE.Quaternion().setFromRotationMatrix(basis),
        depthMetres: baseDepth * spec.barrier.coverageRatio,
      });
    }
  }
  return placements;
}

function getBarrierBoundaryPoint(
  curve: THREE.CatmullRomCurve3,
  progress: number,
  side: -1 | 1,
  spec: Readonly<TrackSpec>,
): THREE.Vector3 {
  const wrapped = wrapUnitProgress(progress);
  const point = curve.getPointAt(wrapped);
  const frame = getTrackFrame(curve, wrapped);
  const centerDistance =
    getTrackRoadWidthAt(wrapped, spec) * 0.5 +
    spec.barrier.edgeClearanceMetres +
    spec.barrier.thicknessMetres * 0.5;
  return point
    .clone()
    .addScaledVector(frame.right, centerDistance * side)
    .addScaledVector(frame.up, spec.barrier.heightMetres * 0.5 - 0.12);
}
