import { validateTrackGeometry } from '../src/trackValidation.js';

const report = validateTrackGeometry();
const metrics = report.metrics;

console.log('MERIDIAN 2 TRACK GEOMETRY');
console.log(
  [
    `length=${metrics.lengthMetres.toFixed(2)}m`,
    `elevation=${metrics.elevationRangeMetres.toFixed(2)}m`,
    `crestRise=${metrics.crestRiseMetres.toFixed(2)}m`,
    `crestFall=${metrics.crestFallMetres.toFixed(2)}m`,
    `peak@${metrics.elevationPeakProgress.toFixed(4)}`,
    `occlusion=${metrics.crestOcclusionMetres.toFixed(2)}m`,
    `maxGrade=${metrics.maximumGradePercent.toFixed(2)}%`,
    `minRadius=${metrics.minimumCurvatureRadiusMetres.toFixed(2)}m@${metrics.minimumCurvatureProgress.toFixed(4)}`,
  ].join(' '),
);
console.log(
  [
    `legalHalfWidth>=${metrics.minimumLegalHalfWidthMetres.toFixed(2)}m`,
    `barrierClearance>=${metrics.minimumBarrierClearanceMetres.toFixed(2)}m`,
    `nonLocalRoadGap>=${metrics.minimumNonLocalCenterlineClearanceMetres.toFixed(2)}m`,
    `barriers=${metrics.barrierCount}`,
    `coverage=${metrics.barrierCoverageRatio.toFixed(2)}`,
    `maxPanelGap=${metrics.maximumBarrierEndpointGapMetres.toFixed(2)}m@${metrics.maximumBarrierEndpointGapProgress.toFixed(4)}`,
    `maxChord=${metrics.maximumBarrierPanelLengthMetres.toFixed(2)}m`,
  ].join(' '),
);

if (!report.valid) {
  for (const issue of report.issues) {
    const progress =
      issue.progress === undefined ? '' : ` @${issue.progress.toFixed(4)}`;
    console.error(`${issue.code}${progress}: ${issue.message}`);
  }
  throw new Error(`Track geometry failed ${report.issues.length} assertion(s).`);
}

console.log('PASS: legal corridor, barrier clearance/coverage, self-overlap, and blind crest assertions.');
