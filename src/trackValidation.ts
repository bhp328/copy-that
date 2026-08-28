import * as THREE from 'three';
import {
  createBarrierPlacements,
  createTrackCurve,
  getTrackFrame,
} from './trackGeometry.js';
import {
  getLegalTrackHalfWidthAt,
  getTrackRoadWidthAt,
  isBarrierAllowedAt,
  MERIDIAN_2_TRACK_SPEC,
  type TrackSpec,
} from './trackSpec.js';

export interface TrackValidationIssue {
  readonly code: string;
  readonly message: string;
  readonly progress?: number;
}

export interface TrackValidationMetrics {
  readonly lengthMetres: number;
  readonly elevationRangeMetres: number;
  readonly crestRiseMetres: number;
  readonly crestFallMetres: number;
  readonly elevationPeakProgress: number;
  readonly crestOcclusionMetres: number;
  readonly maximumGradePercent: number;
  readonly minimumCurvatureRadiusMetres: number;
  readonly minimumCurvatureProgress: number;
  readonly minimumLegalHalfWidthMetres: number;
  readonly minimumBarrierClearanceMetres: number;
  readonly minimumNonLocalCenterlineClearanceMetres: number;
  readonly maximumBarrierEndpointGapMetres: number;
  readonly maximumBarrierEndpointGapProgress: number;
  readonly maximumBarrierPanelLengthMetres: number;
  readonly barrierCoverageRatio: number;
  readonly barrierCount: number;
}

export interface TrackValidationReport {
  readonly valid: boolean;
  readonly issues: readonly TrackValidationIssue[];
  readonly metrics: TrackValidationMetrics;
}

interface CenterlineSample {
  readonly progress: number;
  readonly point: THREE.Vector3;
  readonly roadWidthMetres: number;
}

const CENTERLINE_SAMPLE_SPACING_METRES = 0.25;
const SELF_OVERLAP_SAMPLE_SPACING_METRES = 0.75;
const MINIMUM_NON_LOCAL_ROAD_GAP_METRES = 2;
const BARRIER_DEPTH_PROBES = 5;
const MINIMUM_CURVATURE_RADIUS_METRES = 18;
const MAXIMUM_BARRIER_ENDPOINT_GAP_METRES = 0.12;
const MAXIMUM_BARRIER_PANEL_LENGTH_METRES = 2.5;
const MINIMUM_CREST_OCCLUSION_METRES = 1;

export function validateTrackGeometry(
  spec: Readonly<TrackSpec> = MERIDIAN_2_TRACK_SPEC,
): TrackValidationReport {
  const issues: TrackValidationIssue[] = [];
  const curve = createTrackCurve(spec);
  const samples = sampleCenterline(
    curve,
    spec,
    Math.ceil(curve.getLength() / CENTERLINE_SAMPLE_SPACING_METRES),
  );
  const elevations = samples.map((sample) => sample.point.y);
  const minimumElevation = Math.min(...elevations);
  const maximumElevation = Math.max(...elevations);
  const elevationPeakProgress =
    samples[elevations.indexOf(maximumElevation)].progress;
  const minimumLegalHalfWidthMetres = Math.min(
    ...samples.map((sample) => getLegalTrackHalfWidthAt(sample.progress, spec)),
  );

  if (
    spec.vehicle.maximumNormalLateralOffsetMetres >
    minimumLegalHalfWidthMetres
  ) {
    issues.push({
      code: 'NORMAL_LANE_OUTSIDE_CORRIDOR',
      message:
        `Authored normal offset ${spec.vehicle.maximumNormalLateralOffsetMetres.toFixed(2)} m ` +
        `exceeds legal half-width ${minimumLegalHalfWidthMetres.toFixed(2)} m.`,
    });
  }

  let maximumGradePercent = 0;
  let minimumCurvatureRadiusMetres = Number.POSITIVE_INFINITY;
  let minimumCurvatureProgress = 0;
  for (let index = 0; index < samples.length; index += 1) {
    const previous = samples[(index - 1 + samples.length) % samples.length];
    const next = samples[(index + 1) % samples.length];
    const current = samples[index];
    const horizontal = Math.hypot(
      next.point.x - current.point.x,
      next.point.z - current.point.z,
    );
    if (horizontal > 1e-6) {
      maximumGradePercent = Math.max(
        maximumGradePercent,
        (Math.abs(next.point.y - current.point.y) / horizontal) * 100,
      );
    }
    const curvatureRadius = horizontalCircumradius(
      previous.point,
      current.point,
      next.point,
    );
    if (curvatureRadius < minimumCurvatureRadiusMetres) {
      minimumCurvatureRadiusMetres = curvatureRadius;
      minimumCurvatureProgress = current.progress;
    }
  }
  if (minimumCurvatureRadiusMetres < MINIMUM_CURVATURE_RADIUS_METRES) {
    issues.push({
      code: 'CURVATURE_TOO_TIGHT',
      message:
        `Minimum horizontal curvature radius is ` +
        `${minimumCurvatureRadiusMetres.toFixed(2)} m; ` +
        `${MINIMUM_CURVATURE_RADIUS_METRES.toFixed(2)} m required.`,
    });
  }

  const crest = spec.blindCrest;
  const approachY = curve.getPointAt(crest.approachProgress).y;
  const crestY = curve.getPointAt(crest.crestProgress).y;
  const revealY = curve.getPointAt(crest.revealProgress).y;
  const crestRiseMetres = crestY - approachY;
  const crestFallMetres = crestY - revealY;
  const crestLineRatio =
    (crest.crestProgress - crest.approachProgress) /
    (crest.revealProgress - crest.approachProgress);
  const sightLineAtCrest =
    approachY + 1.15 +
    (revealY + 1 - (approachY + 1.15)) * crestLineRatio;
  const crestOcclusionMetres = crestY - sightLineAtCrest;
  if (crestRiseMetres < crest.minimumRiseMetres) {
    issues.push({
      code: 'CREST_RISE_TOO_SMALL',
      message: `Blind crest rises only ${crestRiseMetres.toFixed(2)} m.`,
      progress: crest.crestProgress,
    });
  }
  if (crestFallMetres < crest.minimumFallMetres) {
    issues.push({
      code: 'CREST_FALL_TOO_SMALL',
      message: `Blind crest falls only ${crestFallMetres.toFixed(2)} m.`,
      progress: crest.crestProgress,
    });
  }
  if (crestOcclusionMetres < MINIMUM_CREST_OCCLUSION_METRES) {
    issues.push({
      code: 'CREST_NOT_VISUALLY_BLIND',
      message:
        `Crest clears the approach-to-reveal sight line by only ` +
        `${crestOcclusionMetres.toFixed(2)} m.`,
      progress: crest.crestProgress,
    });
  }

  const barrierPlacements = createBarrierPlacements(curve, spec);
  let minimumBarrierClearanceMetres = Number.POSITIVE_INFINITY;
  for (const barrier of barrierPlacements) {
    const innerFaceDirection = -barrier.side;
    for (let probeIndex = 0; probeIndex < BARRIER_DEPTH_PROBES; probeIndex += 1) {
      const depthRatio =
        probeIndex / (BARRIER_DEPTH_PROBES - 1) - 0.5;
      const point = barrier.position
        .clone()
        .addScaledVector(barrier.tangent, barrier.depthMetres * depthRatio)
        .addScaledVector(
          barrier.right,
          innerFaceDirection * spec.barrier.thicknessMetres * 0.5,
        );
      const nearest = findNearestCenterlineSample(point, samples);
      const clearance =
        horizontalDistance(point, nearest.point) - nearest.roadWidthMetres * 0.5;
      minimumBarrierClearanceMetres = Math.min(
        minimumBarrierClearanceMetres,
        clearance,
      );
      if (clearance + 1e-6 < spec.barrier.minimumAsphaltClearanceMetres) {
        issues.push({
          code: 'BARRIER_INTRUSION',
          message:
            `Barrier inner face clears asphalt by ${clearance.toFixed(2)} m; ` +
            `${spec.barrier.minimumAsphaltClearanceMetres.toFixed(2)} m required ` +
            `(side ${barrier.side}, nearest road ${nearest.progress.toFixed(4)}).`,
          progress: barrier.progress,
        });
        break;
      }
    }
  }

  let minimumNonLocalCenterlineClearanceMetres = Number.POSITIVE_INFINITY;
  const overlapSamples = sampleCenterline(
    curve,
    spec,
    Math.ceil(curve.getLength() / SELF_OVERLAP_SAMPLE_SPACING_METRES),
  );
  for (let first = 0; first < overlapSamples.length; first += 1) {
    for (let second = first + 1; second < overlapSamples.length; second += 1) {
      const directSeparation = second - first;
      const wrappedSeparation = overlapSamples.length - directSeparation;
      const arcSeparationMetres =
        (Math.min(directSeparation, wrappedSeparation) /
          overlapSamples.length) *
        curve.getLength();
      const localArcExclusionMetres =
        Math.max(
          overlapSamples[first].roadWidthMetres,
          overlapSamples[second].roadWidthMetres,
        ) * 2.2;
      if (arcSeparationMetres <= localArcExclusionMetres) {
        continue;
      }
      const a = overlapSamples[first];
      const b = overlapSamples[second];
      const edgeClearance =
        horizontalDistance(a.point, b.point) -
        (a.roadWidthMetres + b.roadWidthMetres) * 0.5;
      minimumNonLocalCenterlineClearanceMetres = Math.min(
        minimumNonLocalCenterlineClearanceMetres,
        edgeClearance,
      );
    }
  }
  if (
    minimumNonLocalCenterlineClearanceMetres <
    MINIMUM_NON_LOCAL_ROAD_GAP_METRES
  ) {
    issues.push({
      code: 'ROAD_SELF_OVERLAP',
      message:
        `Non-local road edges clear by only ` +
        `${minimumNonLocalCenterlineClearanceMetres.toFixed(2)} m.`,
    });
  }

  let expectedBarrierCount = 0;
  for (let index = 0; index < spec.barrier.segments; index += 1) {
    const progress = (index + 0.5) / spec.barrier.segments;
    for (const side of [-1, 1] as const) {
      if (isBarrierAllowedAt(progress, side, spec)) expectedBarrierCount += 1;
    }
  }
  if (barrierPlacements.length !== expectedBarrierCount) {
    issues.push({
      code: 'BARRIER_COUNT_MISMATCH',
      message: `Expected ${expectedBarrierCount} barriers, got ${barrierPlacements.length}.`,
    });
  }
  if (spec.barrier.coverageRatio < 1) {
    issues.push({
      code: 'BARRIER_GAPS',
      message: `Barrier coverage ratio ${spec.barrier.coverageRatio.toFixed(2)} leaves nominal gaps.`,
    });
  }

  let maximumBarrierEndpointGapMetres = 0;
  let maximumBarrierEndpointGapProgress = 0;
  let maximumBarrierPanelLengthMetres = 0;
  for (const side of [-1, 1] as const) {
    const sidePlacements = barrierPlacements.filter(
      (placement) => placement.side === side,
    );
    for (let index = 0; index < sidePlacements.length; index += 1) {
      const current = sidePlacements[index];
      const next = sidePlacements[(index + 1) % sidePlacements.length];
      maximumBarrierPanelLengthMetres = Math.max(
        maximumBarrierPanelLengthMetres,
        current.depthMetres,
      );
      const currentEnd = current.position
        .clone()
        .addScaledVector(current.tangent, current.depthMetres * 0.5);
      const nextStart = next.position
        .clone()
        .addScaledVector(next.tangent, -next.depthMetres * 0.5);
      const endpointGap = currentEnd.distanceTo(nextStart);
      if (endpointGap > maximumBarrierEndpointGapMetres) {
        maximumBarrierEndpointGapMetres = endpointGap;
        maximumBarrierEndpointGapProgress = current.progress;
      }
    }
  }
  if (
    maximumBarrierEndpointGapMetres > MAXIMUM_BARRIER_ENDPOINT_GAP_METRES
  ) {
    issues.push({
      code: 'BARRIER_PANEL_DISCONTINUITY',
      message:
        `Maximum transformed panel endpoint gap is ` +
        `${maximumBarrierEndpointGapMetres.toFixed(2)} m; ` +
        `${MAXIMUM_BARRIER_ENDPOINT_GAP_METRES.toFixed(2)} m allowed.`,
    });
  }
  if (maximumBarrierPanelLengthMetres > MAXIMUM_BARRIER_PANEL_LENGTH_METRES) {
    issues.push({
      code: 'BARRIER_PANEL_TOO_LONG',
      message:
        `Maximum barrier chord is ${maximumBarrierPanelLengthMetres.toFixed(2)} m; ` +
        `${MAXIMUM_BARRIER_PANEL_LENGTH_METRES.toFixed(2)} m allowed.`,
    });
  }

  return {
    valid: issues.length === 0,
    issues,
    metrics: {
      lengthMetres: curve.getLength(),
      elevationRangeMetres: maximumElevation - minimumElevation,
      crestRiseMetres,
      crestFallMetres,
      elevationPeakProgress,
      crestOcclusionMetres,
      maximumGradePercent,
      minimumCurvatureRadiusMetres,
      minimumCurvatureProgress,
      minimumLegalHalfWidthMetres,
      minimumBarrierClearanceMetres,
      minimumNonLocalCenterlineClearanceMetres,
      maximumBarrierEndpointGapMetres,
      maximumBarrierEndpointGapProgress,
      maximumBarrierPanelLengthMetres,
      barrierCoverageRatio: spec.barrier.coverageRatio,
      barrierCount: barrierPlacements.length,
    },
  };
}

function sampleCenterline(
  curve: THREE.CatmullRomCurve3,
  spec: Readonly<TrackSpec>,
  count: number,
): readonly CenterlineSample[] {
  return Array.from({ length: count }, (_, index) => {
    const progress = index / count;
    const point = curve.getPointAt(progress);
    const frame = getTrackFrame(curve, progress);
    if (
      !Number.isFinite(frame.right.x) ||
      !Number.isFinite(frame.right.y) ||
      !Number.isFinite(frame.right.z)
    ) {
      throw new Error(`Non-finite track frame at progress ${progress}.`);
    }
    return {
      progress,
      point,
      roadWidthMetres: getTrackRoadWidthAt(progress, spec),
    };
  });
}

function findNearestCenterlineSample(
  point: THREE.Vector3,
  samples: readonly CenterlineSample[],
): CenterlineSample {
  let nearest = samples[0];
  let nearestDistanceSquared = Number.POSITIVE_INFINITY;
  for (const sample of samples) {
    const x = point.x - sample.point.x;
    const z = point.z - sample.point.z;
    const distanceSquared = x * x + z * z;
    if (distanceSquared < nearestDistanceSquared) {
      nearestDistanceSquared = distanceSquared;
      nearest = sample;
    }
  }
  return nearest;
}

function horizontalDistance(a: THREE.Vector3, b: THREE.Vector3): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function horizontalCircumradius(
  a: THREE.Vector3,
  b: THREE.Vector3,
  c: THREE.Vector3,
): number {
  const ab = horizontalDistance(a, b);
  const bc = horizontalDistance(b, c);
  const ca = horizontalDistance(c, a);
  const twiceArea = Math.abs(
    (b.x - a.x) * (c.z - a.z) - (b.z - a.z) * (c.x - a.x),
  );
  if (twiceArea <= 1e-8) return Number.POSITIVE_INFINITY;
  return (ab * bc * ca) / (2 * twiceArea);
}
