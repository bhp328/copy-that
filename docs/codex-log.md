# Codex Log

## 2026-08-07 - First stable Git checkpoint

- Initialized the local Git repository and committed the stable prototype as
  `bf279b54318f1c4889df5a97115cfd56af927f88`.
- No remote repository was added and nothing was connected or pushed to GitHub.

## 2026-08-07 - Browser-based 3D foundation

### Task goal

Create the first reliable, playable foundation for COPY THAT? with Three.js,
TypeScript, Vite, deterministic automatic driving, a chase camera, pace controls,
a speed display, and minimal English/Korean localization.

### Implementation summary

- Initialized a vanilla TypeScript Vite project with no framework or backend.
- Built a closed Catmull-Rom track with a road ribbon, ground, edge markers,
  pylons, a start line, shadows, and basic lighting using primitive geometry.
- Built a low-poly primitive car and a deterministic curve-based controller.
- Added smooth, frame-rate-independent transitions between 60 km/h SAFE,
  130 km/h NORMAL, and 230 km/h PUSH targets.
- Added a smoothed third-person chase camera and responsive resizing.
- Added a DOM HUD with current speed, three pace buttons, selected-state and
  keyboard-focus feedback, and an `EN | Korean` language toggle.
- Added a small typed localization dictionary for the UI text that exists now.
- Verified desktop and narrow mobile layouts, pace transitions, localization,
  default state, animation, and browser console output.

### Files created or changed

- `.gitignore` - ignores installed packages and generated build output.
- `AGENTS.md` - stores the persistent project and collaboration rules.
- `index.html` - provides the Vite page shell and application mount point.
- `package.json` / `package-lock.json` - define scripts and lock dependencies.
- `tsconfig.json` - enables strict TypeScript checking for the browser project.
- `src/main.ts` - creates the scene, renderer, car, camera, animation loop, and HUD.
- `src/track.ts` - defines the curve and builds the primitive track environment.
- `src/carController.ts` - builds and deterministically moves the car.
- `src/hud.ts` - creates and updates the speed, pace, and language controls.
- `src/localization.ts` - contains the English/Korean UI dictionary and types.
- `src/style.css` - lays out the full-screen game and responsive HUD.
- `src/vite-env.d.ts` - loads Vite's browser and CSS import declarations.
- `docs/codex-log.md` - records this implementation work.
- `dist/` - generated production output from the successful build (ignored).

### Commands run

- `npm install three`
- `npm install --save-dev typescript vite`
- `npm install --save-dev @types/three`
- `npm run build` (rerun after fixes; final run succeeded)
- `npm run dev -- --host 127.0.0.1 --port 4174 --strictPort`
- `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4173 --strictPort`
- Local HTTP and in-browser desktop/mobile interaction checks against the dev server.

### Problems encountered

- The attached brief contained corrupted Korean characters. The implemented UI
  strings were restored as valid UTF-8 text.
- Node and npm were installed but not present on this terminal's PATH. Commands
  were run through the installed Node/npm location with a temporary PATH update.
- The sandbox initially blocked npm registry access. The dependency commands were
  rerun after the required download approval was granted.
- The first TypeScript integration build lacked Three.js declarations and Vite's
  CSS import declaration, and retained a nullable app reference inside a callback.
- Browser testing reported deprecated `THREE.Clock` and `PCFSoftShadowMap` usage.

### Solutions

- Installed `@types/three`, added `src/vite-env.d.ts`, and explicitly narrowed the
  application element before using it in callbacks.
- Replaced `THREE.Clock` with a small `performance.now()` frame timer and used
  `PCFShadowMap`, removing all browser console warnings and errors.
- Kept the generated Three.js bundle intact for this small prototype. Vite still
  prints a non-blocking chunk-size advisory because the single Three.js entry
  chunk is slightly above 500 kB; it does not affect playability or build success.
