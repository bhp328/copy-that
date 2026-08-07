import * as THREE from 'three';
import { CarController } from './carController';
import { HUD } from './hud';
import { createRaceTrack } from './track';
import './style.css';

const appElement = document.querySelector<HTMLDivElement>('#app');

if (!appElement) {
  throw new Error('The #app element is missing from index.html.');
}

const app: HTMLDivElement = appElement;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9fd3ee);
scene.fog = new THREE.Fog(0x9fd3ee, 85, 185);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(app.clientWidth, app.clientHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.domElement.setAttribute('aria-label', 'COPY THAT? race track');
app.append(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
  55,
  app.clientWidth / app.clientHeight,
  0.1,
  300,
);

const track = createRaceTrack();
scene.add(track.group);

const car = new CarController(track.curve, 'normal', 0.01);
scene.add(car.object);

const hud = new HUD({
  parent: app,
  initialPace: car.paceMode,
  onPaceChange: (paceMode) => car.setPaceMode(paceMode),
});

const worldUp = new THREE.Vector3(0, 1, 0);
const trackTangent = new THREE.Vector3();
const carUp = new THREE.Vector3();
const desiredCameraPosition = new THREE.Vector3();
const desiredLookTarget = new THREE.Vector3();
const cameraLookTarget = new THREE.Vector3();

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

function resize(): void {
  const width = app.clientWidth;
  const height = app.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
}

window.addEventListener('resize', resize);

updateChaseCamera(0, true);
hud.setSpeed(car.speedKmh);

let previousFrameTime = performance.now();

renderer.setAnimationLoop(() => {
  const currentFrameTime = performance.now();
  const deltaSeconds = Math.min(
    (currentFrameTime - previousFrameTime) / 1_000,
    0.1,
  );
  previousFrameTime = currentFrameTime;

  car.update(deltaSeconds);
  updateChaseCamera(deltaSeconds);
  hud.setSpeed(car.speedKmh);
  renderer.render(scene, camera);
});
