import * as THREE from 'three';

const WORLD_UP = new THREE.Vector3(0, 1, 0);

export interface RaceTrack {
  /** Add this group to the scene. It contains the road, ground, markers, and lights. */
  group: THREE.Group;
  /** Closed center line used by the deterministic car controller. */
  curve: THREE.CatmullRomCurve3;
  /** Cached center-line length in Three.js units (treated as metres). */
  length: number;
  roadWidth: number;
}

/**
 * Creates the prototype circuit and its primitive environment.
 *
 * The curve is deliberately exposed: future gameplay can sample it for corner
 * timing and racing-line work without replacing the track implementation.
 */
export function createRaceTrack(): RaceTrack {
  const group = new THREE.Group();
  group.name = 'race-track';

  const curve = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(-48, 0.2, -4),
      new THREE.Vector3(-38, 1.2, -31),
      new THREE.Vector3(-8, 0.5, -44),
      new THREE.Vector3(27, 2.6, -39),
      new THREE.Vector3(51, 1.1, -17),
      new THREE.Vector3(53, 0.4, 17),
      new THREE.Vector3(31, 2.1, 39),
      new THREE.Vector3(2, 3.3, 46),
      new THREE.Vector3(-29, 1.0, 38),
      new THREE.Vector3(-51, 0.3, 20),
    ],
    true,
    'centripetal',
  );
  curve.arcLengthDivisions = 1200;
  curve.updateArcLengths();

  const roadWidth = 8.5;
  const road = createRoadRibbon(curve, roadWidth, 320);
  group.add(road);

  addRoadEdges(group, curve, roadWidth, 320);
  addKerbMarkers(group, curve, roadWidth, 72);
  addStartLine(group, curve, roadWidth);
  addTracksidePylons(group, curve, roadWidth, 18);
  addGround(group);
  addLighting(group);

  return {
    group,
    curve,
    length: curve.getLength(),
    roadWidth,
  };
}

function createRoadRibbon(
  curve: THREE.CatmullRomCurve3,
  width: number,
  segments: number,
): THREE.Mesh {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const halfWidth = width * 0.5;

  for (let index = 0; index <= segments; index += 1) {
    const progress = index / segments;
    const point = curve.getPointAt(progress);
    const frame = getTrackFrame(curve, progress);
    const left = point.clone().addScaledVector(frame.right, -halfWidth);
    const right = point.clone().addScaledVector(frame.right, halfWidth);

    positions.push(left.x, left.y, left.z, right.x, right.y, right.z);
    uvs.push(0, progress * 24, 1, progress * 24);

    if (index < segments) {
      const leftNow = index * 2;
      const rightNow = leftNow + 1;
      const leftNext = leftNow + 2;
      const rightNext = leftNow + 3;

      // Winding is chosen so the visible side faces away from the road surface.
      indices.push(leftNow, leftNext, rightNow, rightNow, leftNext, rightNext);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();

  const material = new THREE.MeshStandardMaterial({
    color: 0x252a31,
    roughness: 0.88,
    metalness: 0.02,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'road-surface';
  mesh.receiveShadow = true;
  return mesh;
}

function addRoadEdges(
  group: THREE.Group,
  curve: THREE.CatmullRomCurve3,
  width: number,
  segments: number,
): void {
  const halfWidth = width * 0.5;
  const leftPoints: THREE.Vector3[] = [];
  const rightPoints: THREE.Vector3[] = [];

  for (let index = 0; index < segments; index += 1) {
    const progress = index / segments;
    const point = curve.getPointAt(progress);
    const frame = getTrackFrame(curve, progress);
    leftPoints.push(
      point
        .clone()
        .addScaledVector(frame.right, -halfWidth)
        .addScaledVector(frame.up, 0.055),
    );
    rightPoints.push(
      point
        .clone()
        .addScaledVector(frame.right, halfWidth)
        .addScaledVector(frame.up, 0.055),
    );
  }

  const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xf6f0d0 });
  const leftEdge = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(leftPoints),
    edgeMaterial,
  );
  const rightEdge = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(rightPoints),
    edgeMaterial,
  );
  leftEdge.name = 'left-road-edge';
  rightEdge.name = 'right-road-edge';
  group.add(leftEdge, rightEdge);
}

function addKerbMarkers(
  group: THREE.Group,
  curve: THREE.CatmullRomCurve3,
  width: number,
  markerCount: number,
): void {
  const markerGeometry = new THREE.BoxGeometry(0.7, 0.12, 2.25);
  const whiteMaterial = new THREE.MeshStandardMaterial({
    color: 0xf2f1e9,
    roughness: 0.72,
  });
  const redMaterial = new THREE.MeshStandardMaterial({
    color: 0xe64242,
    roughness: 0.72,
  });
  const halfWidth = width * 0.5 - 0.18;

  for (let index = 0; index < markerCount; index += 1) {
    const progress = index / markerCount;
    const point = curve.getPointAt(progress);
    const frame = getTrackFrame(curve, progress);
    const material = index % 2 === 0 ? whiteMaterial : redMaterial;

    for (const side of [-1, 1]) {
      const marker = new THREE.Mesh(markerGeometry, material);
      marker.position
        .copy(point)
        .addScaledVector(frame.right, halfWidth * side)
        .addScaledVector(frame.up, 0.07);
      marker.quaternion.copy(frame.quaternion);
      marker.castShadow = true;
      marker.receiveShadow = true;
      group.add(marker);
    }
  }
}

function addStartLine(
  group: THREE.Group,
  curve: THREE.CatmullRomCurve3,
  width: number,
): void {
  const tileCount = 8;
  const tileWidth = width / tileCount;
  const tileGeometry = new THREE.BoxGeometry(tileWidth, 0.055, 1.15);
  const lightMaterial = new THREE.MeshStandardMaterial({ color: 0xf8f8f2 });
  const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x111418 });
  const point = curve.getPointAt(0);
  const frame = getTrackFrame(curve, 0);

  for (let index = 0; index < tileCount; index += 1) {
    const offset = -width * 0.5 + tileWidth * (index + 0.5);
    const tile = new THREE.Mesh(
      tileGeometry,
      index % 2 === 0 ? lightMaterial : darkMaterial,
    );
    tile.position
      .copy(point)
      .addScaledVector(frame.right, offset)
      .addScaledVector(frame.up, 0.07);
    tile.quaternion.copy(frame.quaternion);
    tile.receiveShadow = true;
    group.add(tile);
  }
}

function addTracksidePylons(
  group: THREE.Group,
  curve: THREE.CatmullRomCurve3,
  width: number,
  pylonCount: number,
): void {
  const geometry = new THREE.ConeGeometry(0.7, 2.4, 6);
  const cyanMaterial = new THREE.MeshStandardMaterial({
    color: 0x38d9e6,
    roughness: 0.55,
    flatShading: true,
  });
  const yellowMaterial = new THREE.MeshStandardMaterial({
    color: 0xffd43b,
    roughness: 0.55,
    flatShading: true,
  });
  const distanceFromCentre = width * 0.5 + 3.5;

  for (let index = 0; index < pylonCount; index += 1) {
    const progress = (index + 0.5) / pylonCount;
    const point = curve.getPointAt(progress);
    const frame = getTrackFrame(curve, progress);
    const side = index % 2 === 0 ? -1 : 1;
    const pylon = new THREE.Mesh(
      geometry,
      index % 3 === 0 ? yellowMaterial : cyanMaterial,
    );
    pylon.position
      .copy(point)
      .addScaledVector(frame.right, distanceFromCentre * side)
      .addScaledVector(WORLD_UP, 1.1);
    pylon.castShadow = true;
    group.add(pylon);
  }
}

function addGround(group: THREE.Group): void {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(180, 180),
    new THREE.MeshStandardMaterial({
      color: 0x2f6b45,
      roughness: 1,
      metalness: 0,
    }),
  );
  ground.name = 'ground';
  ground.rotation.x = -Math.PI * 0.5;
  ground.position.y = -1.35;
  ground.receiveShadow = true;
  group.add(ground);

  const grid = new THREE.GridHelper(180, 36, 0x244f36, 0x386f4d);
  grid.name = 'ground-grid';
  grid.position.y = -1.32;
  group.add(grid);
}

function addLighting(group: THREE.Group): void {
  const skyLight = new THREE.HemisphereLight(0xbfe4ff, 0x29452f, 1.65);
  skyLight.name = 'sky-light';

  const sun = new THREE.DirectionalLight(0xfff0d2, 2.6);
  sun.name = 'sun-light';
  sun.position.set(-35, 55, 25);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -75;
  sun.shadow.camera.right = 75;
  sun.shadow.camera.top = 75;
  sun.shadow.camera.bottom = -75;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 140;
  sun.target.position.set(0, 0, 0);

  group.add(skyLight, sun, sun.target);
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
