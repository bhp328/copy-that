import * as THREE from 'three';
import { CarController } from './carController';
import { OvertakeDebugPanel } from './debugPanel';
import { EngineerPanel } from './engineerPanel';
import type { IntentPlan } from './intentCall';
import {
  CoreOvertakeController,
  type DefenseSelectionMode,
  type CoreOvertakeSnapshot,
} from './overtakeGameplay';
import { createRaceTrack } from './track';
import './style.css';

const appElement = document.querySelector<HTMLDivElement>('#app');

if (!appElement) {
  throw new Error('The #app element is missing from index.html.');
}

const app: HTMLDivElement = appElement;
app.className = 'prototype-shell';

const driverFeed = document.createElement('main');
driverFeed.className = 'driver-feed';
driverFeed.setAttribute('aria-label', 'Driver Feed');

const feedIdentity = document.createElement('div');
feedIdentity.className = 'driver-feed__identity';
const feedLabel = document.createElement('span');
feedLabel.className = 'driver-feed__label';
const feedStatus = document.createElement('span');
feedStatus.className = 'driver-feed__status';
const liveIndicator = document.createElement('span');
liveIndicator.className = 'driver-feed__live-indicator';
liveIndicator.setAttribute('aria-hidden', 'true');
feedIdentity.append(feedLabel, liveIndicator, feedStatus);
driverFeed.append(feedIdentity);
app.append(driverFeed);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9fd3ee);
scene.fog = new THREE.Fog(0x9fd3ee, 85, 185);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.domElement.setAttribute('aria-label', 'Onboard view of the race track');
driverFeed.prepend(renderer.domElement);

const camera = new THREE.PerspectiveCamera(72, 1, 0.1, 300);

const track = createRaceTrack();
scene.add(track.group);

const queryParameters = new URLSearchParams(window.location.search);
const debugEnabled = queryParameters.get('debug') === '1';
const scenarioParameter = queryParameters.get('scenario')?.toUpperCase();
const forcedDefense: DefenseSelectionMode =
  debugEnabled && scenarioParameter === 'A'
    ? 'inside'
    : debugEnabled && scenarioParameter === 'B'
      ? 'outside'
      : 'seeded';
const seedParameter = queryParameters.get('seed');
const requestedSeed = seedParameter === null ? Number.NaN : Number(seedParameter);
const debugSeed = Number.isFinite(requestedSeed) ? requestedSeed : undefined;

const overtake = new CoreOvertakeController(
  track.curve,
  track.length,
  track.gameplayCorner,
  {
    defenseMode: forcedDefense,
    seed: debugSeed,
  },
);
scene.add(overtake.opponent);

const initialState = overtake.snapshot;
const car = new CarController(
  track.curve,
  'normal',
  initialState.playerTotalProgress,
);
car.setSimulationState(
  initialState.playerTotalProgress,
  initialState.playerSpeedKmh,
  { lateralOffset: initialState.playerLateralOffsetMetres },
);
scene.add(car.object);

const engineerPanel = new EngineerPanel({
  parent: app,
  driverFeedLabel: feedLabel,
  driverFeedStatus: feedStatus,
  onIntentCall: handleIntentCall,
  onNowCall: handleNowCall,
  onRetry: handleRetry,
});

const debugPanel = debugEnabled
  ? new OvertakeDebugPanel(app, overtake)
  : null;

function handleIntentCall(plan: IntentPlan): void {
  if (overtake.issueIntent(plan)) {
    renderGameplay(overtake.snapshot);
  }
}

function handleNowCall(): void {
  if (overtake.issueNow()) {
    renderGameplay(overtake.snapshot);
  }
}

function handleRetry(): void {
  if (!overtake.retry()) {
    return;
  }
  const state = overtake.snapshot;
  car.setSimulationState(state.playerTotalProgress, state.playerSpeedKmh, {
    lateralOffset: state.playerLateralOffsetMetres,
  });
  renderGameplay(state);
  updateCamera(0, true);
}

type CameraMode = 'driver' | 'chase';
let cameraMode: CameraMode = 'driver';

const worldUp = new THREE.Vector3(0, 1, 0);
const trackTangent = new THREE.Vector3();
const carUp = new THREE.Vector3();
const desiredCameraPosition = new THREE.Vector3();
const desiredLookTarget = new THREE.Vector3();
const cameraLookTarget = new THREE.Vector3();

function updateDriverCamera(deltaSeconds: number, snap = false): void {
  trackTangent.copy(track.curve.getTangentAt(car.progress)).normalize();
  carUp.copy(worldUp).applyQuaternion(car.object.quaternion).normalize();

  desiredCameraPosition
    .copy(car.object.position)
    .addScaledVector(trackTangent, 0.95)
    .addScaledVector(carUp, 1.82);
  desiredLookTarget
    .copy(car.object.position)
    .addScaledVector(trackTangent, 19)
    .addScaledVector(carUp, 1.01);

  const lookSmoothing = snap ? 1 : 1 - Math.exp(-11 * deltaSeconds);
  camera.position.copy(desiredCameraPosition);
  cameraLookTarget.lerp(desiredLookTarget, lookSmoothing);
  camera.lookAt(cameraLookTarget);
}

/** Retained for engineering comparison, but intentionally has no player menu. */
function updateChaseCamera(deltaSeconds: number, snap = false): void {
  trackTangent.copy(track.curve.getTangentAt(car.progress)).normalize();
  carUp.copy(worldUp).applyQuaternion(car.object.quaternion).normalize();

  desiredCameraPosition
    .copy(car.object.position)
    .addScaledVector(trackTangent, -11)
    .addScaledVector(carUp, 5.5);
  desiredLookTarget
    .copy(car.object.position)
    .addScaledVector(trackTangent, 8)
    .addScaledVector(carUp, 1.15);

  const smoothing = snap ? 1 : 1 - Math.exp(-5 * deltaSeconds);
  camera.position.lerp(desiredCameraPosition, smoothing);
  cameraLookTarget.lerp(desiredLookTarget, smoothing);
  camera.lookAt(cameraLookTarget);
}

function updateCamera(deltaSeconds: number, snap = false): void {
  if (cameraMode === 'driver') {
    updateDriverCamera(deltaSeconds, snap);
  } else {
    updateChaseCamera(deltaSeconds, snap);
  }
}

function resize(): void {
  const width = Math.max(1, driverFeed.clientWidth);
  const height = Math.max(1, driverFeed.clientHeight);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height, false);
}

function renderGameplay(state: CoreOvertakeSnapshot): void {
  engineerPanel.setNextCorner(
    track.gameplayCorner.direction,
    state.distanceToCornerMetres,
  );
  engineerPanel.setRaceGap(state.relativeGapSeconds, state.gapRelation);
  engineerPanel.setIntentState(
    state.canCallIntent,
    state.intent,
    null,
  );
  engineerPanel.setGameplayState(
    state.canCallNow,
    state.nowCalled,
    state.canRetry,
    state.driverMessage,
  );
  engineerPanel.setTacticalPositions(
    state.opponentLateralOffsetMetres,
    state.playerLateralOffsetMetres,
    track.getRoadWidthAt(car.progress),
    state.playerDistanceMetres,
    state.opponentDistanceMetres,
    overtake.tuning.eventDistanceMetres,
  );
  debugPanel?.update();
}

window.addEventListener('resize', resize);
renderGameplay(initialState);
resize();
updateCamera(0, true);

let previousFrameTime = performance.now();

renderer.setAnimationLoop(() => {
  const currentFrameTime = performance.now();
  const deltaSeconds = Math.min(
    (currentFrameTime - previousFrameTime) / 1_000,
    0.1,
  );
  previousFrameTime = currentFrameTime;

  const state = overtake.update(deltaSeconds);
  car.setSimulationState(state.playerTotalProgress, state.playerSpeedKmh, {
    lateralOffset: state.playerLateralOffsetMetres,
  });
  renderGameplay(state);
  updateCamera(deltaSeconds);
  renderer.render(scene, camera);
});
