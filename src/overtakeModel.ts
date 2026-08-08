export type AttackLane = 'inside' | 'outside';
export type OvertakePhase = 'following' | 'attacking' | 'aborting' | 'passed';
export type OvertakeStage =
  | 'reveal'
  | 'preparation'
  | 'execution'
  | 'resolution';
export type NowAssessment = 'viable' | 'tooEarly' | 'tooLate' | 'blocked';
export type OvertakeOutcome =
  | 'pending'
  | 'success'
  | 'tooEarly'
  | 'tooLate'
  | 'blocked'
  | 'noCall';

export interface OvertakeParameters {
  eventDistanceMetres: number;
  defenseStartDistanceMetres: number;
  defenseFullDistanceMetres: number;
  defenseReadableOffsetMetres: number;
  towStartDistanceMetres: number;
  playerStartSpeedKmh: number;
  playerTowTargetSpeedKmh: number;
  playerAttackTargetSpeedKmh: number;
  playerAbortTargetSpeedKmh: number;
  playerSpeedResponse: number;
  opponentSpeedKmh: number;
  startGapMetres: number;
  minimumFollowingGapMetres: number;
  completedPassGapMetres: number;
  requiredLateralClearanceMetres: number;
  minimumPreparationAtNowRatio: number;
  playerPreparationOffsetMetres: number;
  opponentDefenseOffsetMetres: number;
  preparationDelaySeconds: number;
  preparationResponse: number;
}

export interface OvertakeModelState {
  timeSeconds: number;
  playerDistanceMetres: number;
  playerSpeedMetresPerSecond: number;
  opponentSpeedMetresPerSecond: number;
  longitudinalGapMetres: number;
  playerLateralOffsetMetres: number;
  opponentLateralOffsetMetres: number;
  intent: AttackLane | null;
  intentIssuedAtSeconds: number | null;
  phase: OvertakePhase;
  towActive: boolean;
  passed: boolean;
  defenseReadableAtSeconds: number | null;
  preparationMilestoneAtSeconds: number | null;
}

export interface SpeedStep {
  nextSpeedMetresPerSecond: number;
  distanceMetres: number;
}

export interface AttemptResult {
  assessment: NowAssessment | null;
  outcome: OvertakeOutcome;
  stateAtNow: OvertakeModelState | null;
  finalState: OvertakeModelState;
}

const KMH_PER_METRE_PER_SECOND = 3.6;
const EPSILON = 1e-9;
export const PREPARATION_MILESTONE_RATIO = 0.8;

/**
 * Untuned seed values taken from the approved Step 2.5 runtime. The opponent had
 * no explicit speed; 105 km/h is its measured/implied average while the scripted
 * gap contracted from 28 m to 8.5 m over the 101 m approach.
 */
export const INITIAL_OVERTAKE_PARAMETERS: Readonly<OvertakeParameters> =
  Object.freeze({
    eventDistanceMetres: 101.018,
    defenseStartDistanceMetres: 18.941,
    defenseFullDistanceMetres: 82.835,
    defenseReadableOffsetMetres: 1.6,
    towStartDistanceMetres: 0,
    playerStartSpeedKmh: 130,
    playerTowTargetSpeedKmh: 130,
    playerAttackTargetSpeedKmh: 130,
    playerAbortTargetSpeedKmh: 105,
    playerSpeedResponse: 1.45,
    opponentSpeedKmh: 105,
    startGapMetres: 28,
    minimumFollowingGapMetres: 8.5,
    completedPassGapMetres: -4.5,
    requiredLateralClearanceMetres: 2.5,
    minimumPreparationAtNowRatio: 0,
    playerPreparationOffsetMetres: 2.25,
    opponentDefenseOffsetMetres: 2.35,
    preparationDelaySeconds: 0.32,
    preparationResponse: 2.4,
  });

/** Human-rejected first Core Loop, retained for before/after evidence. */
export const FIRST_CORE_LOOP_PARAMETERS: Readonly<OvertakeParameters> =
  Object.freeze({
    eventDistanceMetres: 145.214,
    defenseStartDistanceMetres: 18.941,
    defenseFullDistanceMetres: 119.075,
    defenseReadableOffsetMetres: 1.6,
    towStartDistanceMetres: 0,
    playerStartSpeedKmh: 108,
    playerTowTargetSpeedKmh: 155,
    playerAttackTargetSpeedKmh: 132,
    playerAbortTargetSpeedKmh: 100,
    playerSpeedResponse: 1.2,
    opponentSpeedKmh: 108,
    startGapMetres: 22,
    minimumFollowingGapMetres: 7,
    completedPassGapMetres: -4.5,
    requiredLateralClearanceMetres: 1.7,
    minimumPreparationAtNowRatio: 0,
    playerPreparationOffsetMetres: 2.25,
    opponentDefenseOffsetMetres: 2.35,
    preparationDelaySeconds: 0.32,
    preparationResponse: 2.4,
  });

/**
 * Tuned core-loop values. The useful NOW interval is an emergent consequence
 * of stored tow speed, closing distance, prepared lateral clearance, and the
 * finite road remaining before corner entry. There is no success timer here.
 */
export const TUNED_OVERTAKE_PARAMETERS: Readonly<OvertakeParameters> =
  Object.freeze({
    eventDistanceMetres: 235.214,
    defenseStartDistanceMetres: 8,
    defenseFullDistanceMetres: 38,
    defenseReadableOffsetMetres: 1.6,
    towStartDistanceMetres: 90,
    playerStartSpeedKmh: 108,
    playerTowTargetSpeedKmh: 185,
    playerAttackTargetSpeedKmh: 131,
    playerAbortTargetSpeedKmh: 100,
    playerSpeedResponse: 0.7,
    opponentSpeedKmh: 108,
    startGapMetres: 22,
    minimumFollowingGapMetres: 7,
    completedPassGapMetres: -4.5,
    requiredLateralClearanceMetres: 1.7,
    minimumPreparationAtNowRatio: PREPARATION_MILESTONE_RATIO,
    playerPreparationOffsetMetres: 2.25,
    opponentDefenseOffsetMetres: 2.35,
    preparationDelaySeconds: 0.32,
    preparationResponse: 2.4,
  });

export function kmhToMetresPerSecond(speedKmh: number): number {
  return Math.max(0, speedKmh) / KMH_PER_METRE_PER_SECOND;
}

export function metresPerSecondToKmh(speedMetresPerSecond: number): number {
  return Math.max(0, speedMetresPerSecond) * KMH_PER_METRE_PER_SECOND;
}

/** Exact first-order speed response shared by runtime and the CLI simulation. */
export function stepSpeedToward(
  currentSpeedMetresPerSecond: number,
  targetSpeedMetresPerSecond: number,
  response: number,
  deltaSeconds: number,
): SpeedStep {
  const safeResponse = Math.max(EPSILON, response);
  const safeDelta = Math.max(0, deltaSeconds);
  const decay = Math.exp(-safeResponse * safeDelta);
  const nextSpeedMetresPerSecond =
    targetSpeedMetresPerSecond +
    (currentSpeedMetresPerSecond - targetSpeedMetresPerSecond) * decay;
  const distanceMetres =
    targetSpeedMetresPerSecond * safeDelta +
    ((currentSpeedMetresPerSecond - targetSpeedMetresPerSecond) *
      (1 - decay)) /
      safeResponse;

  return { nextSpeedMetresPerSecond, distanceMetres };
}

export function createOvertakeState(
  parameters: OvertakeParameters,
): OvertakeModelState {
  return {
    timeSeconds: 0,
    playerDistanceMetres: 0,
    playerSpeedMetresPerSecond: kmhToMetresPerSecond(
      parameters.playerStartSpeedKmh,
    ),
    opponentSpeedMetresPerSecond: kmhToMetresPerSecond(
      parameters.opponentSpeedKmh,
    ),
    longitudinalGapMetres: parameters.startGapMetres,
    playerLateralOffsetMetres: 0,
    opponentLateralOffsetMetres: 0,
    intent: null,
    intentIssuedAtSeconds: null,
    phase: 'following',
    towActive: parameters.towStartDistanceMetres <= 0,
    passed: false,
    defenseReadableAtSeconds: null,
    preparationMilestoneAtSeconds: null,
  };
}

export function cloneOvertakeState(
  state: OvertakeModelState,
): OvertakeModelState {
  return { ...state };
}

export function commitIntent(
  state: OvertakeModelState,
  intent: AttackLane,
): void {
  if (state.intent !== null) {
    return;
  }
  state.intent = intent;
  state.intentIssuedAtSeconds = state.timeSeconds;
}

export function stepOvertakeModel(
  state: OvertakeModelState,
  parameters: OvertakeParameters,
  defenseLane: AttackLane,
  deltaSeconds: number,
): void {
  const safeDelta = Math.max(0, deltaSeconds);
  const targetSpeedKmh = getPlayerTargetSpeedKmh(state, parameters);
  const speedStep = stepSpeedToward(
    state.playerSpeedMetresPerSecond,
    kmhToMetresPerSecond(targetSpeedKmh),
    parameters.playerSpeedResponse,
    safeDelta,
  );
  const opponentDistance = state.opponentSpeedMetresPerSecond * safeDelta;

  state.timeSeconds += safeDelta;
  state.playerDistanceMetres += speedStep.distanceMetres;
  state.playerSpeedMetresPerSecond = speedStep.nextSpeedMetresPerSecond;
  state.longitudinalGapMetres +=
    opponentDistance - speedStep.distanceMetres;

  if (
    state.phase === 'following' &&
    state.longitudinalGapMetres < parameters.minimumFollowingGapMetres
  ) {
    state.longitudinalGapMetres = parameters.minimumFollowingGapMetres;
    state.playerSpeedMetresPerSecond = Math.min(
      state.playerSpeedMetresPerSecond,
      state.opponentSpeedMetresPerSecond,
    );
  }

  state.towActive =
    state.phase === 'following' &&
    state.playerDistanceMetres >= parameters.towStartDistanceMetres;

  updateLateralState(state, parameters, defenseLane, safeDelta);

  if (
    state.defenseReadableAtSeconds === null &&
    isDefenseReadable(state, parameters)
  ) {
    state.defenseReadableAtSeconds = state.timeSeconds;
  }
  if (
    state.preparationMilestoneAtSeconds === null &&
    getPreparationProgress(state, parameters) >= PREPARATION_MILESTONE_RATIO
  ) {
    state.preparationMilestoneAtSeconds = state.timeSeconds;
  }

  const hasLateralClearance =
    Math.abs(
      state.playerLateralOffsetMetres - state.opponentLateralOffsetMetres,
    ) >= parameters.requiredLateralClearanceMetres;
  if (
    state.phase === 'attacking' &&
    hasLateralClearance &&
    state.longitudinalGapMetres <= parameters.completedPassGapMetres
  ) {
    state.phase = 'passed';
    state.passed = true;
  }
}

export function predictPassFromState(
  sourceState: OvertakeModelState,
  parameters: OvertakeParameters,
  defenseLane: AttackLane,
  stepSeconds = 0.05,
): boolean {
  if (sourceState.intent === null || sourceState.intent === defenseLane) {
    return false;
  }
  if (
    getPreparationProgress(sourceState, parameters) <
    parameters.minimumPreparationAtNowRatio
  ) {
    return false;
  }

  const forecast = cloneOvertakeState(sourceState);
  forecast.phase = 'attacking';
  forecast.towActive = false;
  while (forecast.playerDistanceMetres < parameters.eventDistanceMetres) {
    stepOvertakeModel(forecast, parameters, defenseLane, stepSeconds);
    if (forecast.passed) {
      return true;
    }
  }
  return false;
}

export function evaluateNowFromState(
  sourceState: OvertakeModelState,
  parameters: OvertakeParameters,
  defenseLane: AttackLane,
  stepSeconds = 0.05,
): NowAssessment {
  if (sourceState.intent === null || sourceState.intent === defenseLane) {
    return 'blocked';
  }
  if (predictPassFromState(sourceState, parameters, defenseLane, stepSeconds)) {
    return 'viable';
  }

  const future = cloneOvertakeState(sourceState);
  while (future.playerDistanceMetres < parameters.eventDistanceMetres) {
    stepOvertakeModel(future, parameters, defenseLane, stepSeconds);
    if (predictPassFromState(future, parameters, defenseLane, stepSeconds)) {
      return 'tooEarly';
    }
  }
  return 'tooLate';
}

export function simulateAttempt(
  parameters: OvertakeParameters,
  defenseLane: AttackLane,
  intent: AttackLane | null,
  intentTimeSeconds: number | null,
  nowTimeSeconds: number | null,
  stepSeconds = 0.05,
): AttemptResult {
  const state = createOvertakeState(parameters);
  let assessment: NowAssessment | null = null;
  let stateAtNow: OvertakeModelState | null = null;

  while (state.playerDistanceMetres < parameters.eventDistanceMetres) {
    if (
      intent !== null &&
      intentTimeSeconds !== null &&
      state.intent === null &&
      state.timeSeconds + EPSILON >= intentTimeSeconds
    ) {
      commitIntent(state, intent);
    }
    if (
      nowTimeSeconds !== null &&
      assessment === null &&
      state.timeSeconds + EPSILON >= nowTimeSeconds
    ) {
      assessment = evaluateNowFromState(
        state,
        parameters,
        defenseLane,
        stepSeconds,
      );
      stateAtNow = cloneOvertakeState(state);
      state.towActive = false;
      state.phase = assessment === 'viable' ? 'attacking' : 'aborting';
    }
    stepOvertakeModel(state, parameters, defenseLane, stepSeconds);
  }

  const outcome: OvertakeOutcome =
    nowTimeSeconds === null
      ? 'noCall'
      : state.passed
        ? 'success'
        : assessment === 'viable'
          ? 'tooLate'
          : (assessment ?? 'tooLate');
  return { assessment, outcome, stateAtNow, finalState: state };
}

export function getEventDurationSeconds(
  parameters: OvertakeParameters,
  defenseLane: AttackLane = 'inside',
  stepSeconds = 0.05,
): number {
  const state = createOvertakeState(parameters);
  while (state.playerDistanceMetres < parameters.eventDistanceMetres) {
    stepOvertakeModel(state, parameters, defenseLane, stepSeconds);
  }
  return state.timeSeconds;
}

export function getDefenseReadableTimeSeconds(
  parameters: OvertakeParameters,
  defenseLane: AttackLane = 'inside',
  stepSeconds = 0.02,
): number | null {
  const state = createOvertakeState(parameters);
  while (state.playerDistanceMetres < parameters.eventDistanceMetres) {
    stepOvertakeModel(state, parameters, defenseLane, stepSeconds);
    if (state.defenseReadableAtSeconds !== null) {
      return state.defenseReadableAtSeconds;
    }
  }
  return null;
}

export function getPreparationProgress(
  state: OvertakeModelState,
  parameters: OvertakeParameters,
): number {
  if (state.intent === null) {
    return 0;
  }
  return Math.max(
    0,
    Math.min(
      1,
      Math.abs(state.playerLateralOffsetMetres) /
        Math.max(EPSILON, parameters.playerPreparationOffsetMetres),
    ),
  );
}

export function isDefenseReadable(
  state: OvertakeModelState,
  parameters: OvertakeParameters,
): boolean {
  return (
    Math.abs(state.opponentLateralOffsetMetres) + EPSILON >=
    parameters.defenseReadableOffsetMetres
  );
}

export function getOvertakeStage(
  state: OvertakeModelState,
  parameters: OvertakeParameters,
): OvertakeStage {
  if (
    state.passed ||
    state.phase === 'aborting' ||
    state.playerDistanceMetres >= parameters.eventDistanceMetres
  ) {
    return 'resolution';
  }
  if (!isDefenseReadable(state, parameters)) {
    return 'reveal';
  }
  if (state.playerDistanceMetres < parameters.towStartDistanceMetres) {
    return 'preparation';
  }
  return 'execution';
}

function getPlayerTargetSpeedKmh(
  state: OvertakeModelState,
  parameters: OvertakeParameters,
): number {
  if (state.phase === 'aborting') {
    return parameters.playerAbortTargetSpeedKmh;
  }
  if (state.phase === 'attacking' || state.phase === 'passed') {
    return parameters.playerAttackTargetSpeedKmh;
  }
  if (state.playerDistanceMetres < parameters.towStartDistanceMetres) {
    return parameters.opponentSpeedKmh;
  }
  if (state.longitudinalGapMetres <= parameters.minimumFollowingGapMetres) {
    return parameters.opponentSpeedKmh;
  }
  return parameters.playerTowTargetSpeedKmh;
}

function updateLateralState(
  state: OvertakeModelState,
  parameters: OvertakeParameters,
  defenseLane: AttackLane,
  deltaSeconds: number,
): void {
  const defensePhase = smoothstep(
    parameters.defenseStartDistanceMetres,
    parameters.defenseFullDistanceMetres,
    state.playerDistanceMetres,
  );
  const defenseDirection = defenseLane === 'inside' ? -1 : 1;
  state.opponentLateralOffsetMetres =
    defenseDirection *
    parameters.opponentDefenseOffsetMetres *
    defensePhase;

  const intentElapsed =
    state.intentIssuedAtSeconds === null
      ? 0
      : state.timeSeconds - state.intentIssuedAtSeconds;
  const isResponding =
    state.intent !== null &&
    intentElapsed >= parameters.preparationDelaySeconds;
  const intentDirection = state.intent === 'inside' ? -1 : 1;
  const targetOffset = isResponding
    ? intentDirection * parameters.playerPreparationOffsetMetres
    : 0;
  const blend = 1 - Math.exp(-parameters.preparationResponse * deltaSeconds);
  state.playerLateralOffsetMetres +=
    (targetOffset - state.playerLateralOffsetMetres) * blend;
}

function smoothstep(minimum: number, maximum: number, value: number): number {
  if (maximum <= minimum) {
    return value >= maximum ? 1 : 0;
  }
  const ratio = Math.max(0, Math.min(1, (value - minimum) / (maximum - minimum)));
  return ratio * ratio * (3 - 2 * ratio);
}
