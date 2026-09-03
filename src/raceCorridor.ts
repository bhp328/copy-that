import {
  getLegalTrackHalfWidthAt,
  getTrackRoadWidthAt,
  MERIDIAN_2_TRACK_SPEC,
  type TrackSpec,
} from './trackSpec.js';

export interface RaceCorridorLimits {
  readonly progress: number;
  readonly roadWidthMetres: number;
  readonly legalCenterHalfWidthMetres: number;
  readonly outerCenterHalfWidthMetres: number;
}

/**
 * Returns the two lateral envelopes used by the authoritative race. The
 * legal envelope keeps a car's full Formula envelope on asphalt; the outer
 * envelope is the fail-closed runoff limit before a car can escape the track.
 */
export function getRaceCorridorLimits(
  progress: number,
  spec: Readonly<TrackSpec> = MERIDIAN_2_TRACK_SPEC,
): RaceCorridorLimits {
  const roadWidthMetres = getTrackRoadWidthAt(progress, spec);
  const legalCenterHalfWidthMetres = getLegalTrackHalfWidthAt(progress, spec);
  const outerCenterHalfWidthMetres = Math.max(
    legalCenterHalfWidthMetres,
    roadWidthMetres * 0.5 +
      spec.barrier.edgeClearanceMetres -
      spec.vehicle.halfWidthMetres -
      0.08,
  );
  return Object.freeze({
    progress,
    roadWidthMetres,
    legalCenterHalfWidthMetres,
    outerCenterHalfWidthMetres,
  });
}

export function clampRaceLateralOffset(
  offsetMetres: number,
  limits: RaceCorridorLimits,
  surface: 'asphalt' | 'runoff' = 'asphalt',
): { readonly offsetMetres: number; readonly clamped: boolean } {
  const limit = surface === 'asphalt'
    ? limits.legalCenterHalfWidthMetres
    : limits.outerCenterHalfWidthMetres;
  const safeOffset = Number.isFinite(offsetMetres) ? offsetMetres : 0;
  const offsetMetresClamped = Math.max(-limit, Math.min(limit, safeOffset));
  return Object.freeze({
    offsetMetres: offsetMetresClamped,
    clamped: Math.abs(offsetMetresClamped - safeOffset) > 1e-9,
  });
}

export function isRaceVehicleContained(
  offsetMetres: number,
  limits: RaceCorridorLimits,
  surface: 'asphalt' | 'runoff',
): boolean {
  const limit = surface === 'asphalt'
    ? limits.legalCenterHalfWidthMetres
    : limits.outerCenterHalfWidthMetres;
  return Number.isFinite(offsetMetres) && Math.abs(offsetMetres) <= limit + 1e-6;
}
