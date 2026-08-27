import * as THREE from 'three';

export interface FormulaCarOptions {
  name: string;
  bodyColor: number;
  accentColor: number;
  helmetColor?: number;
}

export interface FormulaCarModel {
  group: THREE.Group;
  wheels: THREE.Mesh[];
}

/**
 * A compact, primitive-only fictional formula car. The proportions and open
 * wheels do more of the visual work than polygon count, which keeps the car
 * readable at racing speed without introducing an asset-loading dependency.
 */
export function createFormulaCar(options: FormulaCarOptions): FormulaCarModel {
  const group = new THREE.Group();
  group.name = options.name;

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: options.bodyColor,
    roughness: 0.34,
    metalness: 0.18,
  });
  const accentMaterial = new THREE.MeshStandardMaterial({
    color: options.accentColor,
    roughness: 0.42,
    metalness: 0.12,
  });
  const carbonMaterial = new THREE.MeshStandardMaterial({
    color: 0x11151b,
    roughness: 0.62,
    metalness: 0.22,
  });
  const tyreMaterial = new THREE.MeshStandardMaterial({
    color: 0x090b0e,
    roughness: 0.92,
    metalness: 0.02,
  });
  const cockpitMaterial = new THREE.MeshStandardMaterial({
    color: 0x080b10,
    roughness: 0.2,
    metalness: 0.48,
  });
  const helmetMaterial = new THREE.MeshStandardMaterial({
    color: options.helmetColor ?? options.accentColor,
    roughness: 0.32,
    metalness: 0.14,
  });
  const rainLightMaterial = new THREE.MeshStandardMaterial({
    color: 0xff263e,
    emissive: 0xff102c,
    emissiveIntensity: 3,
    roughness: 0.35,
  });

  const chassis = mesh(
    new THREE.BoxGeometry(1.28, 0.42, 4.2),
    bodyMaterial,
    0,
    0.64,
    0.02,
  );
  group.add(chassis);

  const nose = mesh(
    new THREE.BoxGeometry(0.48, 0.25, 2.45),
    accentMaterial,
    0,
    0.56,
    2.55,
  );
  nose.scale.set(0.82, 0.86, 1);
  group.add(nose);

  const noseCap = mesh(
    new THREE.BoxGeometry(0.58, 0.16, 0.54),
    bodyMaterial,
    0,
    0.52,
    3.82,
  );
  group.add(noseCap);

  const floor = mesh(
    new THREE.BoxGeometry(2.05, 0.09, 3.6),
    carbonMaterial,
    0,
    0.39,
    -0.12,
  );
  group.add(floor);

  for (const side of [-1, 1]) {
    const sidepod = mesh(
      new THREE.BoxGeometry(0.72, 0.5, 1.72),
      side === -1 ? bodyMaterial : accentMaterial,
      side * 0.82,
      0.67,
      -0.32,
    );
    sidepod.rotation.y = side * -0.055;
    sidepod.scale.set(1, 0.9, 1);
    group.add(sidepod);

    const intake = mesh(
      new THREE.BoxGeometry(0.5, 0.2, 0.08),
      carbonMaterial,
      side * 0.82,
      0.84,
      0.58,
    );
    group.add(intake);
  }

  const engineCover = mesh(
    new THREE.BoxGeometry(0.82, 0.62, 1.8),
    bodyMaterial,
    0,
    0.89,
    -1.16,
  );
  engineCover.scale.set(0.88, 1, 1);
  group.add(engineCover);

  const cockpit = mesh(
    new THREE.SphereGeometry(0.58, 14, 8),
    cockpitMaterial,
    0,
    0.98,
    0.28,
  );
  cockpit.scale.set(0.82, 0.58, 1.3);
  group.add(cockpit);

  const helmet = mesh(
    new THREE.SphereGeometry(0.3, 12, 8),
    helmetMaterial,
    0,
    1.2,
    0.12,
  );
  helmet.scale.set(0.9, 1, 0.92);
  group.add(helmet);

  const halo = mesh(
    new THREE.TorusGeometry(0.49, 0.055, 6, 20),
    carbonMaterial,
    0,
    1.24,
    0.25,
  );
  halo.rotation.x = Math.PI * 0.5;
  halo.scale.z = 1.28;
  group.add(halo);

  const haloPillar = mesh(
    new THREE.BoxGeometry(0.075, 0.5, 0.075),
    carbonMaterial,
    0,
    1.18,
    0.78,
  );
  haloPillar.rotation.x = -0.22;
  group.add(haloPillar);

  const frontWing = mesh(
    new THREE.BoxGeometry(3.15, 0.1, 0.48),
    carbonMaterial,
    0,
    0.39,
    3.68,
  );
  group.add(frontWing);
  for (const side of [-1, 1]) {
    const endplate = mesh(
      new THREE.BoxGeometry(0.08, 0.42, 0.6),
      accentMaterial,
      side * 1.53,
      0.54,
      3.66,
    );
    group.add(endplate);
  }

  const rearWing = mesh(
    new THREE.BoxGeometry(2.78, 0.16, 0.62),
    carbonMaterial,
    0,
    1.24,
    -2.18,
  );
  rearWing.rotation.x = -0.08;
  group.add(rearWing);
  for (const side of [-1, 1]) {
    const support = mesh(
      new THREE.BoxGeometry(0.09, 0.72, 0.11),
      carbonMaterial,
      side * 0.66,
      0.88,
      -2.12,
    );
    group.add(support);
  }

  const rainLight = mesh(
    new THREE.BoxGeometry(0.24, 0.18, 0.08),
    rainLightMaterial,
    0,
    0.62,
    -2.18,
  );
  group.add(rainLight);

  const wheelGeometry = new THREE.CylinderGeometry(0.48, 0.48, 0.42, 14);
  wheelGeometry.rotateZ(Math.PI * 0.5);
  const wheelRimMaterial = new THREE.MeshStandardMaterial({
    color: 0x5c6670,
    roughness: 0.48,
    metalness: 0.72,
  });
  const wheels: THREE.Mesh[] = [];

  for (const x of [-1.23, 1.23]) {
    for (const z of [-1.48, 1.5]) {
      const wheel = mesh(wheelGeometry, tyreMaterial, x, 0.49, z);
      wheels.push(wheel);
      group.add(wheel);

      const rim = mesh(
        new THREE.CylinderGeometry(0.25, 0.25, 0.435, 12),
        wheelRimMaterial,
        x,
        0.49,
        z,
      );
      rim.geometry.rotateZ(Math.PI * 0.5);
      group.add(rim);
    }
  }

  return { group, wheels };
}

function mesh(
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  x: number,
  y: number,
  z: number,
): THREE.Mesh {
  const result = new THREE.Mesh(geometry, material);
  result.position.set(x, y, z);
  result.castShadow = true;
  result.receiveShadow = true;
  return result;
}
