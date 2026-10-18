import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
export function makeStage(host: HTMLDivElement, dark = false) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = dark ? 1.15 : 1.1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  host.appendChild(renderer.domElement);
  renderer.domElement.setAttribute("aria-hidden", "true");
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(dark ? "#101b19" : "#e8e5df");
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 180);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const env = pmrem.fromScene(room, 0.04);
  scene.environment = env.texture;
  scene.environmentIntensity = dark ? 0.25 : 0.65;
  room.dispose();
  pmrem.dispose();
  const hemi = new THREE.HemisphereLight(
    dark ? "#b4d9d3" : "#fff7e5",
    dark ? "#201d15" : "#737a83",
    dark ? 1.4 : 2.4,
  );
  scene.add(hemi);
  const key = new THREE.DirectionalLight(
    dark ? "#ffe4af" : "#fff8eb",
    dark ? 3.8 : 4,
  );
  key.position.set(-8, 16, 12);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, {
    left: -18,
    right: 18,
    top: 18,
    bottom: -18,
    near: 0.5,
    far: 90,
  });
  key.shadow.normalBias = 0.025;
  key.shadow.radius = 3;
  key.shadow.bias = -0.0001;
  scene.add(key, key.target);
  const fill = new THREE.DirectionalLight(
    dark ? "#8dbab8" : "#d9e1ff",
    dark ? 1.3 : 1.4,
  );
  fill.position.set(9, 5, -8);
  scene.add(fill);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const mobile = matchMedia(
    "(max-width: 760px), (max-width: 1024px) and (orientation: portrait)",
  );
  function resize() {
    const w = host.clientWidth,
      h = host.clientHeight;
    renderer.setPixelRatio(
      Math.min(
        devicePixelRatio,
        1.7,
        Math.sqrt((mobile.matches ? 1000000 : 2200000) / (w * h)),
      ),
    );
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.clearViewOffset();
    if (mobile.matches) camera.setViewOffset(w, h, 0, -h * 0.2, w, h);
    else camera.setViewOffset(w, h, -w * 0.21, 0, w, h);
    camera.updateProjectionMatrix();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();
  function dispose() {
    observer.disconnect();
    const geometry = new Set<THREE.BufferGeometry>(),
      materials = new Set<THREE.Material>(),
      textures = new Set<THREE.Texture>();
    scene.traverse((o) => {
      if (
        o instanceof THREE.Mesh ||
        o instanceof THREE.Sprite ||
        o instanceof THREE.Points ||
        o instanceof THREE.Line
      ) {
        geometry.add(o.geometry);
        for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
          materials.add(m);
          for (const v of Object.values(m))
            if (v instanceof THREE.Texture) textures.add(v);
        }
      }
    });
    geometry.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
    textures.forEach((t) => t.dispose());
    env.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  }
  return { renderer, scene, camera, key, hemi, fill, reduced, mobile, dispose };
}
