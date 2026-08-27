import * as THREE from 'three';
import type { GameplayCorner } from './cornerGameplay';

const WORLD_UP = new THREE.Vector3(0, 1, 0);
const BASE_ROAD_WIDTH = 11.2;
const TRACK_SEGMENTS = 720;

export const OVERTAKE_APPROACH_SPACE = Object.freeze({
  widenStartProgress: 0.49,
  fullWidthStartProgress: 0.525,
  fullWidthEndProgress: 0.715,
  narrowEndProgress: 0.76,
  width: 14.4,
});

/** The approved overtake model resolves at the braking zone of Turn 8. */
export const TEST_GAMEPLAY_CORNER = Object.freeze({
  approachStartProgress: 0.515,
  entryProgress: 0.715,
  apexProgress: 0.77,
  exitProgress: 0.835,
  direction: 'right',
} satisfies GameplayCorner);

export type CircuitCornerKey =
  | 'orbit'
  | 'compression'
  | 'northHairpin'
  | 'switchback'
  | 'finalChicane';

export interface CircuitCorner {
  key: CircuitCornerKey;
  progress: number;
  direction: 'left' | 'right';
}

export interface CircuitMapPoint {
  x: number;
  y: number;
}

export interface RaceTrack {
  group: THREE.Group;
  curve: THREE.CatmullRomCurve3;
  length: number;
  roadWidth: number;
  getRoadWidthAt: (progress: number) => number;
  gameplayCorner: GameplayCorner;
  corners: readonly CircuitCorner[];
  mapPoints: readonly CircuitMapPoint[];
  startLights: readonly THREE.Mesh[];
}

const CIRCUIT_CORNERS: readonly CircuitCorner[] = Object.freeze([
  { key: 'orbit', progress: 0.23, direction: 'right' },
  { key: 'compression', progress: 0.43, direction: 'left' },
  { key: 'northHairpin', progress: 0.735, direction: 'right' },
  { key: 'switchback', progress: 0.86, direction: 'right' },
  { key: 'finalChicane', progress: 0.955, direction: 'left' },
]);

/**
 * Builds Meridian Circuit: a deliberately shaped, closed fictional venue with
 * two long straights, fast direction changes, a technical western complex and
 * one clear late-braking overtake zone. Units are treated as metres.
 */
export function createRaceTrack(): RaceTrack {
  const group = new THREE.Group();
  group.name = 'meridian-circuit';

  const curve = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(-220, 0.34, 140),
      new THREE.Vector3(-92, 0.45, 145),
      new THREE.Vector3(55, 0.38, 143),
      new THREE.Vector3(202, 0.62, 133),
      new THREE.Vector3(298, 0.5, 78),
      new THREE.Vector3(326, 0.32, -18),
      new THREE.Vector3(286, 0.52, -113),
      new THREE.Vector3(192, 0.82, -158),
      new THREE.Vector3(60, 0.66, -171),
      new THREE.Vector3(-96, 0.42, -168),
      new THREE.Vector3(-236, 0.34, -151),
      new THREE.Vector3(-318, 0.48, -96),
      new THREE.Vector3(-332, 0.72, -12),
      new THREE.Vector3(-286, 0.84, 61),
      new THREE.Vector3(-224, 0.58, 76),
      new THREE.Vector3(-274, 0.42, 108),
    ],
    true,
    'centripetal',
    0.5,
  );
  curve.arcLengthDivisions = 3000;
  curve.updateArcLengths();

  group.add(createRoadRibbon(curve, getRoadWidthAt, TRACK_SEGMENTS));
  addRoadShoulders(group, curve, getRoadWidthAt, TRACK_SEGMENTS);
  addKerbs(group, curve, getRoadWidthAt, 280);
  addRacingReferences(group, curve, 150);
  addRunoffZones(group, curve);
  addBarriers(group, curve, getRoadWidthAt, 156);
  addBrakingBoards(group, curve);
  const startLights = addStartFinishComplex(group, curve, BASE_ROAD_WIDTH);
  addSectorMarkers(group, curve);
  addGroundAndVenue(group);
  addSky(group);
  addLighting(group);

  return {
    group,
    curve,
    length: curve.getLength(),
    roadWidth: BASE_ROAD_WIDTH,
    getRoadWidthAt,
    gameplayCorner: TEST_GAMEPLAY_CORNER,
    corners: CIRCUIT_CORNERS,
    mapPoints: createMapPoints(curve),
    startLights,
  };
}

export function getRoadWidthAt(progress: number): number {
  const wrapped = wrapProgress(progress);
  const zone = OVERTAKE_APPROACH_SPACE;
  if (wrapped < zone.widenStartProgress || wrapped >= zone.narrowEndProgress) {
    return BASE_ROAD_WIDTH;
  }
  if (wrapped < zone.fullWidthStartProgress) {
    const blend = THREE.MathUtils.smootherstep(
      wrapped,
      zone.widenStartProgress,
      zone.fullWidthStartProgress,
    );
    return THREE.MathUtils.lerp(BASE_ROAD_WIDTH, zone.width, blend);
  }
  if (wrapped <= zone.fullWidthEndProgress) return zone.width;
  const blend = THREE.MathUtils.smootherstep(
    wrapped,
    zone.fullWidthEndProgress,
    zone.narrowEndProgress,
  );
  return THREE.MathUtils.lerp(zone.width, BASE_ROAD_WIDTH, blend);
}

export function placeTrackObject(
  object: THREE.Object3D,
  curve: THREE.CatmullRomCurve3,
  totalProgress: number,
  lateralOffset = 0,
  rideHeight = 0.08,
): void {
  const progress = wrapProgress(totalProgress);
  const point = curve.getPointAt(progress);
  const frame = getTrackFrame(curve, progress);
  object.position
    .copy(point)
    .addScaledVector(frame.right, lateralOffset)
    .addScaledVector(frame.up, rideHeight);
  object.quaternion.copy(frame.quaternion);
}

export function getNextCircuitCorner(
  track: RaceTrack,
  totalProgress: number,
): { corner: CircuitCorner; distanceMetres: number } {
  const progress = wrapProgress(totalProgress);
  const corner =
    track.corners.find((candidate) => candidate.progress > progress) ??
    track.corners[0];
  const progressDistance =
    corner.progress >= progress
      ? corner.progress - progress
      : 1 - progress + corner.progress;
  return { corner, distanceMetres: progressDistance * track.length };
}

function createRoadRibbon(
  curve: THREE.CatmullRomCurve3,
  widthAt: (progress: number) => number,
  segments: number,
): THREE.Mesh {
  const positions: number[] = [];
  const colors: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const asphaltA = new THREE.Color(0x20262d);
  const asphaltB = new THREE.Color(0x252c33);

  for (let index = 0; index <= segments; index += 1) {
    const progress = index / segments;
    const point = curve.getPointAt(progress);
    const frame = getTrackFrame(curve, progress);
    const halfWidth = widthAt(progress) * 0.5;
    const left = point.clone().addScaledVector(frame.right, -halfWidth);
    const right = point.clone().addScaledVector(frame.right, halfWidth);
    const shade = Math.floor(index / 12) % 2 === 0 ? asphaltA : asphaltB;
    positions.push(left.x, left.y, left.z, right.x, right.y, right.z);
    colors.push(shade.r, shade.g, shade.b, shade.r, shade.g, shade.b);
    uvs.push(0, progress * 80, 1, progress * 80);
    if (index < segments) {
      const leftNow = index * 2;
      const rightNow = leftNow + 1;
      const leftNext = leftNow + 2;
      const rightNext = leftNow + 3;
      indices.push(leftNow, leftNext, rightNow, rightNow, leftNext, rightNext);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  const road = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.82,
      metalness: 0.06,
      side: THREE.DoubleSide,
    }),
  );
  road.name = 'circuit-asphalt';
  road.receiveShadow = true;
  return road;
}

function addRoadShoulders(
  group: THREE.Group,
  curve: THREE.CatmullRomCurve3,
  widthAt: (progress: number) => number,
  segments: number,
): void {
  const left: THREE.Vector3[] = [];
  const right: THREE.Vector3[] = [];
  for (let index = 0; index < segments; index += 1) {
    const progress = index / segments;
    const point = curve.getPointAt(progress);
    const frame = getTrackFrame(curve, progress);
    const halfWidth = widthAt(progress) * 0.5 - 0.15;
    left.push(point.clone().addScaledVector(frame.right, -halfWidth).addScaledVector(frame.up, 0.085));
    right.push(point.clone().addScaledVector(frame.right, halfWidth).addScaledVector(frame.up, 0.085));
  }
  const material = new THREE.LineBasicMaterial({ color: 0xe8edf2 });
  group.add(
    new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(left), material),
    new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(right), material),
  );
}

function addKerbs(
  group: THREE.Group,
  curve: THREE.CatmullRomCurve3,
  widthAt: (progress: number) => number,
  count: number,
): void {
  const segmentLength = curve.getLength() / count;
  const geometry = new THREE.BoxGeometry(0.9, 0.12, segmentLength * 0.93);
  const red = new THREE.InstancedMesh(
    geometry,
    new THREE.MeshStandardMaterial({ color: 0xe5364f, roughness: 0.68 }),
    count * 2,
  );
  const white = new THREE.InstancedMesh(
    geometry,
    new THREE.MeshStandardMaterial({ color: 0xf0f3f5, roughness: 0.7 }),
    count * 2,
  );
  const hidden = new THREE.Matrix4().makeScale(0, 0, 0);
  const matrix = new THREE.Matrix4();
  const scale = new THREE.Vector3(1, 1, 1);
  let redIndex = 0;
  let whiteIndex = 0;
  for (let index = 0; index < count; index += 1) {
    const progress = (index + 0.5) / count;
    const point = curve.getPointAt(progress);
    const frame = getTrackFrame(curve, progress);
    const halfWidth = widthAt(progress) * 0.5 + 0.25;
    for (const side of [-1, 1]) {
      const position = point.clone().addScaledVector(frame.right, halfWidth * side).addScaledVector(frame.up, 0.04);
      matrix.compose(position, frame.quaternion, scale);
      if (index % 2 === 0) red.setMatrixAt(redIndex++, matrix);
      else white.setMatrixAt(whiteIndex++, matrix);
    }
  }
  while (redIndex < count * 2) red.setMatrixAt(redIndex++, hidden);
  while (whiteIndex < count * 2) white.setMatrixAt(whiteIndex++, hidden);
  red.castShadow = true;
  red.receiveShadow = true;
  white.castShadow = true;
  white.receiveShadow = true;
  group.add(red, white);
}

function addRacingReferences(
  group: THREE.Group,
  curve: THREE.CatmullRomCurve3,
  count: number,
): void {
  const segmentLength = curve.getLength() / count;
  const marks = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.13, 0.035, segmentLength * 0.42),
    new THREE.MeshStandardMaterial({
      color: 0xaab4bd,
      transparent: true,
      opacity: 0.34,
      roughness: 0.82,
    }),
    count,
  );
  const matrix = new THREE.Matrix4();
  for (let index = 0; index < count; index += 1) {
    const progress = (index + 0.5) / count;
    const point = curve.getPointAt(progress);
    const frame = getTrackFrame(curve, progress);
    matrix.compose(
      point.clone().addScaledVector(frame.up, 0.08),
      frame.quaternion,
      new THREE.Vector3(1, 1, 1),
    );
    marks.setMatrixAt(index, matrix);
  }
  marks.receiveShadow = true;
  group.add(marks);
}

function addRunoffZones(group: THREE.Group, curve: THREE.CatmullRomCurve3): void {
  const asphaltRunoff = new THREE.MeshStandardMaterial({ color: 0x333a42, roughness: 0.95 });
  const gravel = new THREE.MeshStandardMaterial({ color: 0x806c50, roughness: 1 });
  const zones = [
    { progress: 0.235, radius: 46, material: asphaltRunoff },
    { progress: 0.735, radius: 54, material: gravel },
    { progress: 0.86, radius: 34, material: asphaltRunoff },
  ];
  zones.forEach((zone) => {
    const point = curve.getPointAt(zone.progress);
    const patch = new THREE.Mesh(new THREE.CircleGeometry(zone.radius, 36), zone.material);
    patch.rotation.x = -Math.PI * 0.5;
    patch.position.set(point.x, -0.24, point.z);
    patch.receiveShadow = true;
    group.add(patch);
  });
}

function addBarriers(
  group: THREE.Group,
  curve: THREE.CatmullRomCurve3,
  widthAt: (progress: number) => number,
  count: number,
): void {
  const segmentLength = curve.getLength() / count;
  const geometry = new THREE.BoxGeometry(0.32, 1.12, segmentLength * 0.82);
  const regular = new THREE.InstancedMesh(
    geometry,
    new THREE.MeshStandardMaterial({ color: 0x8b959d, roughness: 0.56, metalness: 0.54 }),
    count * 2,
  );
  const dark = new THREE.InstancedMesh(
    geometry,
    new THREE.MeshStandardMaterial({ color: 0x243441, roughness: 0.64, metalness: 0.22 }),
    count * 2,
  );
  const hidden = new THREE.Matrix4().makeScale(0, 0, 0);
  const matrix = new THREE.Matrix4();
  const scale = new THREE.Vector3(1, 1, 1);
  let regularIndex = 0;
  let darkIndex = 0;
  for (let index = 0; index < count; index += 1) {
    const progress = (index + 0.5) / count;
    const point = curve.getPointAt(progress);
    const frame = getTrackFrame(curve, progress);
    const distance = widthAt(progress) * 0.5 + 4.2;
    for (const side of [-1, 1]) {
      const position = point.clone().addScaledVector(frame.right, distance * side).addScaledVector(frame.up, 0.44);
      matrix.compose(position, frame.quaternion, scale);
      if (index % 7 <= 1) dark.setMatrixAt(darkIndex++, matrix);
      else regular.setMatrixAt(regularIndex++, matrix);
    }
  }
  while (regularIndex < count * 2) regular.setMatrixAt(regularIndex++, hidden);
  while (darkIndex < count * 2) dark.setMatrixAt(darkIndex++, hidden);
  regular.castShadow = true;
  regular.receiveShadow = true;
  dark.castShadow = true;
  dark.receiveShadow = true;
  group.add(regular, dark);
}

function addBrakingBoards(group: THREE.Group, curve: THREE.CatmullRomCurve3): void {
  const markers = [
    { progress: 0.638, label: '150' },
    { progress: 0.671, label: '100' },
    { progress: 0.698, label: '50' },
  ];
  markers.forEach(({ progress, label }) => {
    const point = curve.getPointAt(progress);
    const frame = getTrackFrame(curve, progress);
    const board = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 2.6),
      new THREE.MeshBasicMaterial({ map: createBoardTexture(label) }),
    );
    board.position
      .copy(point)
      .addScaledVector(frame.right, getRoadWidthAt(progress) * 0.5 + 6)
      .addScaledVector(frame.up, 2.2);
    board.quaternion.copy(frame.quaternion);
    board.rotateY(Math.PI);
    group.add(board);
  });
}

function addStartFinishComplex(
  group: THREE.Group,
  curve: THREE.CatmullRomCurve3,
  width: number,
): THREE.Mesh[] {
  const point = curve.getPointAt(0);
  const frame = getTrackFrame(curve, 0);
  const start = new THREE.Group();
  start.position.copy(point);
  start.quaternion.copy(frame.quaternion);
  const lightTile = new THREE.MeshStandardMaterial({ color: 0xf1f3f5 });
  const darkTile = new THREE.MeshStandardMaterial({ color: 0x11151b });
  const tileCount = 12;
  const tileWidth = width / tileCount;
  for (let row = 0; row < 2; row += 1) {
    for (let index = 0; index < tileCount; index += 1) {
      const tile = new THREE.Mesh(
        new THREE.BoxGeometry(tileWidth, 0.055, 0.8),
        (row + index) % 2 === 0 ? lightTile : darkTile,
      );
      tile.position.set(-width * 0.5 + tileWidth * (index + 0.5), 0.08, row * 0.8);
      tile.receiveShadow = true;
      start.add(tile);
    }
  }
  const gantryMaterial = new THREE.MeshStandardMaterial({ color: 0x151c24, roughness: 0.5, metalness: 0.48 });
  for (const side of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.7, 7.6, 0.7), gantryMaterial);
    post.position.set(side * (width * 0.5 + 1.5), 3.8, 0);
    post.castShadow = true;
    start.add(post);
  }
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(width + 4, 1.05, 1.05), gantryMaterial);
  bridge.position.y = 7.2;
  bridge.castShadow = true;
  start.add(bridge);
  const lights: THREE.Mesh[] = [];
  for (let index = 0; index < 5; index += 1) {
    const light = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 12, 8),
      new THREE.MeshStandardMaterial({
        color: 0x42131a,
        emissive: 0x250006,
        emissiveIntensity: 0.5,
      }),
    );
    light.position.set((index - 2) * 1.05, 7.14, -0.56);
    lights.push(light);
    start.add(light);
  }
  group.add(start);
  return lights;
}

function addSectorMarkers(group: THREE.Group, curve: THREE.CatmullRomCurve3): void {
  const material = new THREE.MeshStandardMaterial({
    color: 0xffc857,
    emissive: 0x9b5a00,
    emissiveIntensity: 0.7,
  });
  for (const progress of [1 / 3, 2 / 3]) {
    const point = curve.getPointAt(progress);
    const frame = getTrackFrame(curve, progress);
    for (const side of [-1, 1]) {
      const marker = new THREE.Mesh(new THREE.BoxGeometry(0.34, 3.6, 0.34), material);
      marker.position
        .copy(point)
        .addScaledVector(frame.right, side * (getRoadWidthAt(progress) * 0.5 + 2.2))
        .addScaledVector(frame.up, 1.75);
      marker.quaternion.copy(frame.quaternion);
      marker.castShadow = true;
      group.add(marker);
    }
  }
}

function addGroundAndVenue(group: THREE.Group): void {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(860, 540),
    new THREE.MeshStandardMaterial({ color: 0x203828, roughness: 1, metalness: 0 }),
  );
  ground.rotation.x = -Math.PI * 0.5;
  ground.position.y = -0.42;
  ground.receiveShadow = true;
  group.add(ground);

  const hillGeometry = new THREE.DodecahedronGeometry(48, 0);
  const hills = new THREE.InstancedMesh(
    hillGeometry,
    new THREE.MeshStandardMaterial({ color: 0x172a25, roughness: 1, flatShading: true }),
    16,
  );
  const matrix = new THREE.Matrix4();
  const positions = [
    [-440, -275], [-320, -300], [-170, -315], [-20, -325],
    [140, -315], [300, -290], [440, -240], [470, -90],
    [465, 210], [340, 300], [170, 320], [0, 330],
    [-175, 315], [-330, 300], [-455, 235], [-480, 40],
  ];
  positions.forEach(([x, z], index) => {
    const scale = 0.52 + (index % 4) * 0.09;
    matrix.compose(
      new THREE.Vector3(x, 8 + (index % 3) * 3, z),
      new THREE.Quaternion().setFromAxisAngle(WORLD_UP, index * 0.63),
      new THREE.Vector3(scale * (1.2 + (index % 3) * 0.22), scale * 0.72, scale),
    );
    hills.setMatrixAt(index, matrix);
  });
  hills.receiveShadow = true;
  group.add(hills);

  const mastGeometry = new THREE.CylinderGeometry(0.15, 0.2, 9, 6);
  const masts = new THREE.InstancedMesh(
    mastGeometry,
    new THREE.MeshStandardMaterial({ color: 0x66747e, roughness: 0.5, metalness: 0.5 }),
    28,
  );
  for (let index = 0; index < 28; index += 1) {
    const angle = (index / 28) * Math.PI * 2;
    matrix.compose(
      new THREE.Vector3(
        Math.cos(angle) * (360 + (index % 3) * 12),
        4.1,
        Math.sin(angle) * (210 + (index % 4) * 8),
      ),
      new THREE.Quaternion(),
      new THREE.Vector3(1, 1, 1),
    );
    masts.setMatrixAt(index, matrix);
  }
  group.add(masts);
}

function addSky(group: THREE.Group): void {
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(620, 32, 14),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        topColor: { value: new THREE.Color(0x071522) },
        horizonColor: { value: new THREE.Color(0x5f7d8f) },
        offset: { value: 0.12 },
        exponent: { value: 0.72 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 horizonColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + vec3(0.0, offset, 0.0)).y;
          gl_FragColor = vec4(mix(horizonColor, topColor, pow(max(h, 0.0), exponent)), 1.0);
        }
      `,
    }),
  );
  sky.name = 'venue-sky';
  group.add(sky);
}

function addLighting(group: THREE.Group): void {
  const hemisphere = new THREE.HemisphereLight(0x9fc5df, 0x1b271e, 1.5);
  const sun = new THREE.DirectionalLight(0xffd6a0, 3.4);
  sun.position.set(-180, 260, 95);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -380;
  sun.shadow.camera.right = 380;
  sun.shadow.camera.top = 280;
  sun.shadow.camera.bottom = -280;
  sun.shadow.camera.near = 20;
  sun.shadow.camera.far = 620;
  sun.shadow.bias = -0.00012;
  sun.target.position.set(0, 0, 0);
  group.add(hemisphere, sun, sun.target);
}

function createMapPoints(curve: THREE.CatmullRomCurve3): CircuitMapPoint[] {
  const source = Array.from({ length: 181 }, (_, index) => curve.getPointAt(index / 180));
  const xs = source.map((point) => point.x);
  const zs = source.map((point) => point.z);
  const minimumX = Math.min(...xs);
  const maximumX = Math.max(...xs);
  const minimumZ = Math.min(...zs);
  const maximumZ = Math.max(...zs);
  const width = Math.max(1, maximumX - minimumX);
  const height = Math.max(1, maximumZ - minimumZ);
  return source.map((point) => ({
    x: 12 + ((point.x - minimumX) / width) * 216,
    y: 10 + (1 - (point.z - minimumZ) / height) * 120,
  }));
}

function createBoardTexture(label: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 104;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = '#f5f7f7';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = '#151b22';
    context.lineWidth = 7;
    context.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
    context.fillStyle = '#111821';
    context.font = '700 45px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(label, canvas.width * 0.5, canvas.height * 0.52);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function getTrackFrame(
  curve: THREE.CatmullRomCurve3,
  progress: number,
): {
  tangent: THREE.Vector3;
  right: THREE.Vector3;
  up: THREE.Vector3;
  quaternion: THREE.Quaternion;
} {
  const tangent = curve.getTangentAt(progress).normalize();
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

function wrapProgress(progress: number): number {
  return ((progress % 1) + 1) % 1;
}
