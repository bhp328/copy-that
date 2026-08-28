import { FORMULA_CAR_ENVELOPE } from './vehicleSpec.js';

export interface TrackControlPoint {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export type TrackSectionKey =
  | 'launch'
  | 'crest'
  | 'compression'
  | 'attackRun'
  | 'hairpin'
  | 'switchbacks'
  | 'finalDefense';

export interface TrackSectionSpec {
  readonly key: TrackSectionKey;
  readonly startProgress: number;
  readonly endProgress: number;
  readonly pressure: 'calm' | 'building' | 'critical' | 'release';
  readonly engineerCritical: boolean;
}

export interface TrackWidthZone {
  readonly widenStartProgress: number;
  readonly fullWidthStartProgress: number;
  readonly fullWidthEndProgress: number;
  readonly narrowEndProgress: number;
  readonly widthMetres: number;
}

export interface TrackSpec {
  readonly id: string;
  readonly displayName: string;
  readonly controlPoints: readonly TrackControlPoint[];
  readonly baseRoadWidthMetres: number;
  readonly widthZones: readonly TrackWidthZone[];
  readonly roadSegments: number;
  readonly arcLengthDivisions: number;
  readonly barrier: {
    readonly segments: number;
    readonly edgeClearanceMetres: number;
    readonly thicknessMetres: number;
    readonly heightMetres: number;
    readonly coverageRatio: number;
    readonly minimumAsphaltClearanceMetres: number;
    readonly omissionZones: readonly {
      readonly startProgress: number;
      readonly endProgress: number;
      readonly side: -1 | 1;
    }[];
  };
  readonly vehicle: {
    readonly halfWidthMetres: number;
    readonly edgeSafetyMarginMetres: number;
    readonly maximumNormalLateralOffsetMetres: number;
  };
  readonly blindCrest: {
    readonly approachProgress: number;
    readonly crestProgress: number;
    readonly revealProgress: number;
    readonly minimumRiseMetres: number;
    readonly minimumFallMetres: number;
  };
  readonly sections: readonly TrackSectionSpec[];
}

/**
 * Meridian 2 is an original fictional circuit authored around communication
 * pressure. The eastern climb creates a real line-of-sight crest, the northern
 * run supports the protected overtake, and the western switchbacks compress the
 * final defence. Coordinates are metres.
 */
export const MERIDIAN_2_TRACK_SPEC = Object.freeze({
  id: 'meridian-2',
  displayName: 'Meridian Circuit',
  controlPoints: Object.freeze([
    { x: -205, y: 2.2, z: 185 },
    { x: -92, y: 2.8, z: 145 },
    { x: 55, y: 5.4, z: 143 },
    { x: 202, y: 12.8, z: 133 },
    { x: 298, y: 18.4, z: 78 },
    { x: 326, y: 13.6, z: -18 },
    { x: 286, y: 5.1, z: -113 },
    { x: 192, y: 2.1, z: -158 },
    { x: 60, y: 1.4, z: -171 },
    { x: -96, y: 2.2, z: -168 },
    { x: -236, y: 4.7, z: -151 },
    { x: -318, y: 9.2, z: -96 },
    { x: -345, y: 13.8, z: -20 },
    { x: -310, y: 7.1, z: 45 },
    { x: -250, y: 3.2, z: 90 },
    { x: -250, y: 2.4, z: 135 },
  ]),
  baseRoadWidthMetres: 12.4,
  widthZones: Object.freeze([
    {
      widenStartProgress: 0.485,
      fullWidthStartProgress: 0.52,
      fullWidthEndProgress: 0.72,
      narrowEndProgress: 0.775,
      widthMetres: 15.2,
    },
  ]),
  roadSegments: 960,
  arcLengthDivisions: 10_000,
  barrier: Object.freeze({
    segments: 1_440,
    edgeClearanceMetres: 3.8,
    thicknessMetres: 0.36,
    heightMetres: 1.16,
    coverageRatio: 1,
    minimumAsphaltClearanceMetres: 2.7,
    omissionZones: Object.freeze([]),
  }),
  vehicle: Object.freeze({
    halfWidthMetres: FORMULA_CAR_ENVELOPE.collisionHalfWidthMetres,
    edgeSafetyMarginMetres: 0.42,
    maximumNormalLateralOffsetMetres: 2.5,
  }),
  blindCrest: Object.freeze({
    approachProgress: 0.18,
    crestProgress: 0.307,
    revealProgress: 0.4,
    minimumRiseMetres: 9,
    minimumFallMetres: 9,
  }),
  sections: Object.freeze([
    { key: 'launch', startProgress: 0.965, endProgress: 0.18, pressure: 'calm', engineerCritical: false },
    { key: 'crest', startProgress: 0.18, endProgress: 0.4, pressure: 'critical', engineerCritical: true },
    { key: 'compression', startProgress: 0.4, endProgress: 0.485, pressure: 'release', engineerCritical: false },
    { key: 'attackRun', startProgress: 0.485, endProgress: 0.72, pressure: 'building', engineerCritical: true },
    { key: 'hairpin', startProgress: 0.72, endProgress: 0.82, pressure: 'critical', engineerCritical: true },
    { key: 'switchbacks', startProgress: 0.82, endProgress: 0.94, pressure: 'release', engineerCritical: false },
    { key: 'finalDefense', startProgress: 0.94, endProgress: 0.965, pressure: 'critical', engineerCritical: true },
  ]),
} as const satisfies TrackSpec);

export function wrapUnitProgress(progress: number): number {
  if (!Number.isFinite(progress)) return 0;
  return ((progress % 1) + 1) % 1;
}

export function getTrackRoadWidthAt(
  progress: number,
  spec: Readonly<TrackSpec> = MERIDIAN_2_TRACK_SPEC,
): number {
  const wrapped = wrapUnitProgress(progress);
  let width = spec.baseRoadWidthMetres;
  for (const zone of spec.widthZones) {
    if (
      wrapped < zone.widenStartProgress ||
      wrapped >= zone.narrowEndProgress
    ) {
      continue;
    }
    if (wrapped < zone.fullWidthStartProgress) {
      const blend = smootherstep(
        inverseLerp(
          zone.widenStartProgress,
          zone.fullWidthStartProgress,
          wrapped,
        ),
      );
      width = Math.max(width, lerp(spec.baseRoadWidthMetres, zone.widthMetres, blend));
    } else if (wrapped <= zone.fullWidthEndProgress) {
      width = Math.max(width, zone.widthMetres);
    } else {
      const blend = smootherstep(
        inverseLerp(zone.fullWidthEndProgress, zone.narrowEndProgress, wrapped),
      );
      width = Math.max(width, lerp(zone.widthMetres, spec.baseRoadWidthMetres, blend));
    }
  }
  return width;
}

export function getLegalTrackHalfWidthAt(
  progress: number,
  spec: Readonly<TrackSpec> = MERIDIAN_2_TRACK_SPEC,
): number {
  return Math.max(
    0,
    getTrackRoadWidthAt(progress, spec) * 0.5 -
      spec.vehicle.halfWidthMetres -
      spec.vehicle.edgeSafetyMarginMetres,
  );
}

export function getTrackSectionAt(
  progress: number,
  spec: Readonly<TrackSpec> = MERIDIAN_2_TRACK_SPEC,
): TrackSectionSpec {
  const wrapped = wrapUnitProgress(progress);
  const section = spec.sections.find((candidate) =>
    candidate.startProgress <= candidate.endProgress
      ? wrapped >= candidate.startProgress && wrapped < candidate.endProgress
      : wrapped >= candidate.startProgress || wrapped < candidate.endProgress,
  );
  return section ?? spec.sections[0];
}

export function isBarrierAllowedAt(
  progress: number,
  side: -1 | 1,
  spec: Readonly<TrackSpec> = MERIDIAN_2_TRACK_SPEC,
): boolean {
  const wrapped = wrapUnitProgress(progress);
  return !spec.barrier.omissionZones.some(
    (zone) =>
      zone.side === side &&
      (zone.startProgress <= zone.endProgress
        ? wrapped >= zone.startProgress && wrapped < zone.endProgress
        : wrapped >= zone.startProgress || wrapped < zone.endProgress),
  );
}

function inverseLerp(minimum: number, maximum: number, value: number): number {
  if (maximum <= minimum) return value >= maximum ? 1 : 0;
  return clamp01((value - minimum) / (maximum - minimum));
}

function smootherstep(value: number): number {
  const clamped = clamp01(value);
  return clamped * clamped * clamped * (clamped * (clamped * 6 - 15) + 10);
}

function lerp(start: number, end: number, amount: number): number {
  return start + (end - start) * amount;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}
