import * as THREE from 'three';
import { CarController } from './carController';
import { CornerGameplayController } from './cornerGameplay';
import { EngineerPanel } from './engineerPanel';
import { OvertakeScenarioController } from './overtakeScenario';
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

// NORMAL remains the fixed, controlled baseline for this experiment.
const car = new CarController(track.curve, 'normal', 0.01);
car.setPaceMode('normal');
scene.add(car.object);

// The rejected command path remains in source control. Here it supplies only
// the competent automatic corner-driving baseline; no command is ever issued.
const automaticCornerDriving = new CornerGameplayController(
  track.gameplayCorner,
  track.length,
);

const overtakeScenario = new OvertakeScenarioController(
  track.curve,
  track.length,
  track.gameplayCorner,
);
scene.add(overtakeScenario.opponent);

const engineerPanel = new EngineerPanel({
  parent: app,
  driverFeedLabel: feedLabel,
  driverFeedStatus: feedStatus,
});

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
    .addScaledVector(carUp, 1.68);

  desiredLookTarget
    .copy(car.object.position)
    .addScaledVector(trackTangent, 19)
    .addScaledVector(carUp, 1.02);

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

window.addEventListener('resize', resize);

const initialScenario = overtakeScenario.update(
  car.totalProgress,
  car.speedKmh,
);
engineerPanel.setNextCorner(
  track.gameplayCorner.direction,
  initialScenario.distanceToCornerMetres,
);
engineerPanel.setDefenseSide(initialScenario.defenseSide);
engineerPanel.setGapSeconds(initialScenario.gapSeconds);
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

  const drivingModifiers = automaticCornerDriving.update(
    car.totalProgress,
    car.targetSpeedKmh,
  );
  car.update(deltaSeconds, drivingModifiers);

  const scenario = overtakeScenario.update(car.totalProgress, car.speedKmh);
  engineerPanel.setNextCorner(
    track.gameplayCorner.direction,
    scenario.distanceToCornerMetres,
  );
  engineerPanel.setDefenseSide(scenario.defenseSide);
  engineerPanel.setGapSeconds(scenario.gapSeconds);

  updateCamera(deltaSeconds);
  renderer.render(scene, camera);
});
