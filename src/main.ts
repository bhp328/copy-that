import * as THREE from 'three';
import { CarController } from './carController';
import type { DriverCommand } from './commandParser';
import { OvertakeDebugPanel } from './debugPanel';
import { FixedStepClock } from './fixedStep';
import { createFormulaCar } from './formulaCar';
import { OvertakePresentation } from './overtakeGameplay';
import {
  CoreOvertakeSimulation,
  type DefenseSelectionMode,
} from './overtakeSimulation';
import { RaceAudio } from './raceAudio';
import { RaceEngineerUI } from './raceEngineerUI';
import {
  SPRINT_OVERTAKE_START_TOTAL_PROGRESS,
  SprintRaceSession,
  type SprintRaceSnapshot,
} from './raceSession';
import {
  createRaceTrack,
  getNextCircuitCorner,
  placeTrackObject,
} from './track';
import { RaceSimulation } from './raceSimulation';
import {
  createRebuildBrowserSnapshot,
  raceActionForDriverCommand,
} from './raceSimulationAdapter';
import './release.css';

const appElement = document.querySelector<HTMLDivElement>('#app');
if (!appElement) throw new Error('The #app element is missing from index.html.');
appElement.className = 'release-shell';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x071522);
scene.fog = new THREE.Fog(0x536f7c, 110, 480);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.domElement.setAttribute('aria-label', 'Car 27 live onboard view');

const camera = new THREE.PerspectiveCamera(72, 1, 0.1, 900);
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
const sessionSeed = Number.isFinite(requestedSeed) ? requestedSeed : createSessionSeed();
const rebuildMode = queryParameters.get('legacy') !== '1';

const overtake = new CoreOvertakeSimulation(track.length, {
  defenseMode: forcedDefense,
  seed: sessionSeed,
  startTotalProgress: SPRINT_OVERTAKE_START_TOTAL_PROGRESS,
  repeatAddsLap: false,
});
const overtakePresentation = new OvertakePresentation(track.curve);
overtakePresentation.sync(overtake.snapshot);
overtakePresentation.opponent.visible = false;
scene.add(overtakePresentation.opponent);

const fieldRival = createFormulaCar({
  name: 'target-p2',
  bodyColor: 0x16d8d0,
  accentColor: 0x1857ff,
  helmetColor: 0xfff3c4,
}).group;
const raceLeader = createFormulaCar({
  name: 'race-leader',
  bodyColor: 0xd7dbe0,
  accentColor: 0x7f4dff,
  helmetColor: 0xffc857,
}).group;
scene.add(fieldRival, raceLeader);

const legacySession = rebuildMode ? null : new SprintRaceSession(track.length, overtake);
const raceSimulation = new RaceSimulation({ seed: sessionSeed, trackLengthMetres: track.length });
const debugStage = queryParameters.get('stage');
const initial = rebuildMode
  ? createRebuildBrowserSnapshot(raceSimulation, track.length)
  : legacySession?.snapshot ?? createRebuildBrowserSnapshot(raceSimulation, track.length);
const simulationClock = new FixedStepClock();
let latestSnapshot = initial;
const car = new CarController(track.curve, 'normal', initial.playerTotalProgress);
car.setSimulationState(initial.playerTotalProgress, initial.playerSpeedKmh);
scene.add(car.object);

const audio = new RaceAudio();
let lastRadioSequence = initial.radioSequence;
let lastOutcome = initial.outcome;

const ui = new RaceEngineerUI({
  parent: appElement,
  canvas: renderer.domElement,
  mapPoints: track.mapPoints,
  onStart: () => {
    void audio.start();
    simulationClock.reset();
    if (rebuildMode) {
      raceSimulation.enqueue({ kind: 'start' }, 'debug');
      raceSimulation.step();
      latestSnapshot = createRebuildBrowserSnapshot(raceSimulation, track.length);
    } else if (debugEnabled && (debugStage === 'pace' || debugStage === 'overtake')) {
      legacySession?.debugJumpTo(debugStage);
      latestSnapshot = legacySession?.snapshot ?? initial;
    } else {
      legacySession?.start();
      latestSnapshot = legacySession?.snapshot ?? initial;
    }
    renderInterface(latestSnapshot);
  },
  onRetry: () => {
    if (rebuildMode) {
      raceSimulation.enqueue({ kind: 'retry' }, 'debug');
      raceSimulation.step();
      latestSnapshot = createRebuildBrowserSnapshot(raceSimulation, track.length);
    } else {
      legacySession?.restart();
      legacySession?.start();
      simulationClock.reset();
      latestSnapshot = legacySession?.snapshot ?? initial;
    }
    lastRadioSequence = latestSnapshot.radioSequence;
    lastOutcome = 'pending';
    syncRaceView(latestSnapshot, true);
  },
  onCommand: handleCommand,
  onAudioToggle: () => audio.toggleMuted(),
});

const debugPanel = debugEnabled && queryParameters.get('panel') !== '0'
  ? new OvertakeDebugPanel(appElement, overtake)
  : null;

function handleCommand(command: DriverCommand): boolean {
  let accepted = false;
  if (rebuildMode) {
    const action = raceActionForDriverCommand(command);
    const engineerView = raceSimulation.getEngineerView();
    if (action && engineerView.allowedCalls.includes(action.kind)) {
      raceSimulation.enqueue(action, 'text');
      accepted = true;
    }
  } else {
    accepted = legacySession?.issueCommand(command) ?? false;
  }
  if (accepted) {
    audio.playRadioClick();
    latestSnapshot = rebuildMode
      ? createRebuildBrowserSnapshot(raceSimulation, track.length)
      : legacySession?.snapshot ?? latestSnapshot;
    renderInterface(latestSnapshot);
  }
  return accepted;
}

const worldUp = new THREE.Vector3(0, 1, 0);
const trackTangent = new THREE.Vector3();
const trackRight = new THREE.Vector3();
const carUp = new THREE.Vector3();
const desiredCameraPosition = new THREE.Vector3();
const desiredLookTarget = new THREE.Vector3();
const cameraLookTarget = new THREE.Vector3();
let cameraTime = 0;

function updateCamera(snapshot: SprintRaceSnapshot, deltaSeconds: number, snap = false): void {
  cameraTime += deltaSeconds;
  trackTangent.copy(track.curve.getTangentAt(car.progress)).normalize();
  trackRight.crossVectors(worldUp, trackTangent).normalize();
  carUp.copy(worldUp).applyQuaternion(car.object.quaternion).normalize();

  const speedFactor = THREE.MathUtils.clamp((snapshot.playerSpeedKmh - 70) / 105, 0, 1);
  const attacking = snapshot.core.phase === 'attacking' || snapshot.outcome === 'success';
  const vibration =
    snapshot.phase === 'ready' || snapshot.phase === 'countdown'
      ? 0
      : (0.006 + speedFactor * 0.022) * Math.sin(cameraTime * 31);
  const lateralPulse = speedFactor * 0.012 * Math.sin(cameraTime * 17.3);

  desiredCameraPosition
    .copy(car.object.position)
    .addScaledVector(trackTangent, -0.22)
    .addScaledVector(carUp, 2.06 + vibration)
    .addScaledVector(trackRight, lateralPulse);
  desiredLookTarget
    .copy(car.object.position)
    .addScaledVector(trackTangent, 29 + speedFactor * 13)
    .addScaledVector(carUp, 1.05)
    .addScaledVector(trackRight, lateralPulse * 2.2);

  const lookSmoothing = snap ? 1 : 1 - Math.exp(-10 * deltaSeconds);
  camera.position.copy(desiredCameraPosition);
  cameraLookTarget.lerp(desiredLookTarget, lookSmoothing);
  camera.lookAt(cameraLookTarget);

  const targetFov = 72 + speedFactor * 8 + (attacking ? 2.5 : 0);
  camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, snap ? 1 : 1 - Math.exp(-4 * deltaSeconds));
  camera.updateProjectionMatrix();
}

function syncRaceView(snapshot: SprintRaceSnapshot, snapCamera = false): void {
  car.setSimulationState(
    snapshot.playerTotalProgress,
    snapshot.playerSpeedKmh,
    { lateralOffset: snapshot.playerLateralOffsetMetres },
  );

  const coreVisible =
    snapshot.phase === 'overtake' ||
    snapshot.phase === 'runout' ||
    snapshot.phase === 'finished';
  overtakePresentation.opponent.visible = coreVisible;
  overtakePresentation.sync(snapshot.core);
  fieldRival.visible = !coreVisible;
  if (!coreVisible) {
    placeTrackObject(fieldRival, track.curve, snapshot.rivalTotalProgress);
  }
  placeTrackObject(raceLeader, track.curve, snapshot.leaderTotalProgress);
  updateStartLights(snapshot);
  updateCamera(snapshot, 0, snapCamera);
  renderInterface(snapshot);
}

function renderInterface(snapshot: SprintRaceSnapshot): void {
  ui.render(snapshot, getNextCircuitCorner(track, snapshot.playerTotalProgress));
  debugPanel?.update();
}

function updateStartLights(snapshot: SprintRaceSnapshot): void {
  let lightsOn = 0;
  if (snapshot.phase === 'countdown' && snapshot.countdownValue !== null) {
    lightsOn =
      snapshot.countdownValue === 3
        ? 1
        : snapshot.countdownValue === 2
          ? 3
          : 5;
  }
  track.startLights.forEach((light, index) => {
    const material = light.material as THREE.MeshStandardMaterial;
    const active = index < lightsOn;
    material.color.setHex(active ? 0xff304d : 0x42131a);
    material.emissive.setHex(active ? 0xff102c : 0x250006);
    material.emissiveIntensity = active ? 4.2 : 0.5;
  });
}

function resize(): void {
  const width = Math.max(1, ui.feed.clientWidth);
  const height = Math.max(1, ui.feed.clientHeight);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height, false);
}

renderer.domElement.addEventListener('webglcontextlost', (event) => {
  event.preventDefault();
  ui.element.dataset.graphics = 'lost';
});
renderer.domElement.addEventListener('webglcontextrestored', () => {
  delete ui.element.dataset.graphics;
});
window.addEventListener('resize', resize);

syncRaceView(initial, true);
resize();

let previousFrameTime = performance.now();
let interfaceAccumulator = 0;
renderer.setAnimationLoop(() => {
  const currentFrameTime = performance.now();
  const deltaSeconds = Math.min((currentFrameTime - previousFrameTime) / 1_000, 0.1);
  previousFrameTime = currentFrameTime;

  simulationClock.advance(deltaSeconds, (fixedDeltaSeconds) => {
    if (rebuildMode) {
      raceSimulation.step();
      latestSnapshot = createRebuildBrowserSnapshot(raceSimulation, track.length);
    } else {
      latestSnapshot = legacySession?.update(fixedDeltaSeconds) ?? latestSnapshot;
    }
  });
  const snapshot = latestSnapshot;
  car.setSimulationState(
    snapshot.playerTotalProgress,
    snapshot.playerSpeedKmh,
    { lateralOffset: snapshot.playerLateralOffsetMetres },
  );

  const coreVisible =
    snapshot.phase === 'overtake' ||
    snapshot.phase === 'runout' ||
    snapshot.phase === 'finished';
  overtakePresentation.opponent.visible = coreVisible;
  overtakePresentation.sync(snapshot.core);
  fieldRival.visible = !coreVisible;
  if (!coreVisible) placeTrackObject(fieldRival, track.curve, snapshot.rivalTotalProgress);
  placeTrackObject(raceLeader, track.curve, snapshot.leaderTotalProgress);
  updateStartLights(snapshot);
  updateCamera(snapshot, deltaSeconds);

  if (snapshot.radioSequence !== lastRadioSequence) {
    lastRadioSequence = snapshot.radioSequence;
    if (snapshot.radioKey) audio.playRadioClick();
  }
  if (lastOutcome === 'pending' && snapshot.outcome !== 'pending') {
    audio.playOutcome(snapshot.outcome === 'success');
  }
  lastOutcome = snapshot.outcome;
  audio.update(
    snapshot.playerSpeedKmh,
    snapshot.core.phase === 'attacking' || snapshot.outcome === 'success',
  );

  interfaceAccumulator += deltaSeconds;
  if (interfaceAccumulator >= 0.08 || snapshot.phase === 'finished') {
    interfaceAccumulator = 0;
    renderInterface(snapshot);
  }

  renderer.render(scene, camera);
});

function createSessionSeed(): number {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return values[0];
}
