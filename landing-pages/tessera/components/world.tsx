"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

type Props = {
  progress: React.RefObject<number>;
  paused: boolean;
  palette: number;
  onReady: (ok: boolean) => void;
};
export default function World({ progress, paused, palette, onReady }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const state = useRef({ paused, palette });
  useEffect(() => {
    state.current = { paused, palette };
  }, [paused, palette]);
  useEffect(() => {
    if (!host.current) return;
    const container = host.current;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      });
    } catch {
      onReady(false);
      return;
    }
    let disposed = false,
      frame = 0,
      elapsed = 0,
      previous = performance.now(),
      current = 0;
    const scene = new THREE.Scene();
    const backgrounds = [
      "#e9e5db",
      "#e5dcd2",
      "#dddfe3",
      "#d5ded3",
      "#e6dac9",
      "#dfd9e5",
      "#222d42",
      "#e8e2d3",
    ].map((c) => new THREE.Color(c));
    scene.background = backgrounds[0].clone();
    scene.fog = new THREE.Fog(backgrounds[0], 35, 100);
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 180);
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.5 : 1.8),
    );
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    const environmentScene = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(environmentScene, 0.04);
    scene.environment = environment.texture;
    scene.environmentIntensity = 0.28;
    environmentScene.dispose();
    pmrem.dispose();
    container.appendChild(renderer.domElement);
    renderer.domElement.setAttribute("aria-hidden", "true");
    const hemi = new THREE.HemisphereLight(0xfff8e9, 0x8e8b7d, 2.8);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff0d9, 4.1);
    sun.position.set(-9, 15, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -15;
    sun.shadow.camera.right = 15;
    sun.shadow.camera.top = 15;
    sun.shadow.camera.bottom = -15;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 65;
    sun.shadow.normalBias = 0.045;
    sun.shadow.bias = -0.0001;
    sun.shadow.radius = 4;
    scene.add(sun, sun.target);
    const fill = new THREE.DirectionalLight(0xc3d4ff, 1.7);
    fill.position.set(8, 7, -8);
    scene.add(fill);
    // A tiny locally generated plaster grain adds variation without external assets.
    const grainCanvas = document.createElement("canvas");
    grainCanvas.width = grainCanvas.height = 128;
    const ctx = grainCanvas.getContext("2d")!;
    const pixels = ctx.createImageData(128, 128);
    let seed = 41;
    for (let i = 0; i < pixels.data.length; i += 4) {
      seed = (seed * 16807) % 2147483647;
      const v = 160 + (seed % 65);
      pixels.data.set([v, v, v, 255], i);
    }
    ctx.putImageData(pixels, 0, 0);
    const grain = new THREE.CanvasTexture(grainCanvas);
    grain.wrapS = grain.wrapT = THREE.RepeatWrapping;
    grain.repeat.set(3, 3);
    const mat = (color: string, roughness = 0.8) =>
      new THREE.MeshStandardMaterial({
        color,
        roughness,
        bumpMap: grain,
        bumpScale: 0.022,
      });
    const clay = mat("#bf7357"),
      chalk = mat("#ede6d5"),
      blue = mat("#455c96"),
      lilac = mat("#9b8da9"),
      sage = mat("#6d8e7c"),
      dark = mat("#273c49"),
      sand = mat("#c9b791");
    const brass = new THREE.MeshStandardMaterial({
      color: "#c5a671",
      roughness: 0.3,
      metalness: 0.65,
    });
    const water = new THREE.MeshPhysicalMaterial({
      color: "#3d958e",
      roughness: 0.16,
      metalness: 0.22,
      clearcoat: 1,
    });
    const lamp = new THREE.MeshStandardMaterial({
      color: "#ffdeb0",
      emissive: "#ffc47a",
      emissiveIntensity: 2,
    });
    const materials = [
      clay,
      chalk,
      blue,
      lilac,
      sage,
      dark,
      sand,
      brass,
      water,
      lamp,
    ];
    const boxGeo = new Map<string, THREE.BufferGeometry>();
    function box(
      parent: THREE.Object3D,
      w: number,
      h: number,
      d: number,
      x: number,
      y: number,
      z: number,
      m: THREE.Material = chalk,
      r = 0.055,
    ) {
      const key = `${w},${h},${d},${r}`;
      let geometry = boxGeo.get(key);
      if (!geometry) {
        geometry = new RoundedBoxGeometry(
          w,
          h,
          d,
          3,
          Math.min(r, w / 4, h / 4, d / 4),
        );
        boxGeo.set(key, geometry);
      }
      const mesh = new THREE.Mesh(geometry, m);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    }
    const archGeometries = new Map<string, THREE.ExtrudeGeometry>();
    function arch(
      parent: THREE.Object3D,
      x: number,
      y: number,
      z: number,
      m: THREE.Material = clay,
      scale = 1,
      rotation = 0,
    ) {
      const key = "arch";
      let geometry = archGeometries.get(key);
      if (!geometry) {
        const s = new THREE.Shape();
        s.moveTo(-2, 0);
        s.lineTo(-2, 3);
        s.absarc(0, 3, 2, Math.PI, 0, true);
        s.lineTo(2, 0);
        s.lineTo(1.3, 0);
        s.lineTo(1.3, 3);
        s.absarc(0, 3, 1.3, 0, Math.PI, false);
        s.lineTo(-1.3, 0);
        s.closePath();
        geometry = new THREE.ExtrudeGeometry(s, {
          depth: 0.6,
          bevelEnabled: true,
          bevelThickness: 0.045,
          bevelSize: 0.045,
          bevelSegments: 3,
          curveSegments: 48,
          steps: 1,
        });
        geometry.translate(0, 0, -0.3);
        archGeometries.set(key, geometry);
      }
      const mesh = new THREE.Mesh(geometry, m);
      mesh.position.set(x, y, z);
      mesh.scale.setScalar(scale);
      mesh.rotation.y = rotation;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    }
    function cylinder(
      parent: THREE.Object3D,
      r: number,
      h: number,
      x: number,
      y: number,
      z: number,
      m: THREE.Material = chalk,
    ) {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 48), m);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    }
    function steps(
      parent: THREE.Object3D,
      n: number,
      x: number,
      z: number,
      m: THREE.Material = chalk,
      dir = 0,
    ) {
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.rotation.y = dir;
      parent.add(group);
      for (let j = 0; j < n; j++)
        box(
          group,
          2,
          0.25 * (j + 1),
          0.42,
          0,
          0.125 * (j + 1),
          -j * 0.4,
          m,
          0.025,
        );
      return group;
    }
    function plinth(parent: THREE.Group, m = chalk) {
      box(parent, 10, 0.5, 9, 0, -0.3, 0, m, 0.2);
      box(parent, 10.8, 0.25, 9.8, 0, -0.67, 0, sand, 0.1);
    }
    const rooms: THREE.Group[] = [];
    for (let i = 0; i < 8; i++) {
      const group = new THREE.Group();
      group.position.x = i * 23;
      scene.add(group);
      rooms.push(group);
      plinth(group, i === 6 ? dark : chalk);
    }
    // 01 — a sun gate, grounded on a real flight of shallow steps.
    const gate = rooms[0];
    box(gate, 6, 0.35, 4, 0, 0.15, 0, clay);
    box(gate, 5.4, 0.35, 3.5, 0, 0.5, -0.2, clay);
    arch(gate, 0, 0.68, -0.7, clay, 1.3);
    for (let i = 0; i < 5; i++)
      box(
        gate,
        3.3,
        0.13 * (i + 1),
        0.34,
        0,
        0.065 * (i + 1),
        2.4 - i * 0.33,
        chalk,
        0.025,
      );
    cylinder(gate, 0.5, 1.6, 3.2, 0.8, -1.7, sage);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.53, 48, 32), brass);
    orb.position.set(3.2, 1.85, -1.7);
    orb.castShadow = true;
    gate.add(orb);
    // 02 — a deep rhythm of connected portals, each opening genuinely modelled.
    for (let j = 0; j < 6; j++) {
      arch(rooms[1], 0, 0, 2.8 - j * 1.2, j % 2 ? chalk : clay, 0.86);
      box(rooms[1], 0.8, 0.3, 7, -2.3, 0.1, -0.3, clay);
    }
    box(rooms[1], 1.5, 0.035, 7, 0, 0.025, -0.3, blue, 0.005);
    // 03 — folded staircases rising around a quiet solid core.
    const stair = rooms[2];
    box(stair, 2.5, 4, 2.5, 0, 2, -1, blue);
    steps(stair, 14, -2, 2, chalk);
    const landing = steps(stair, 10, 2, -3, lilac, Math.PI);
    landing.position.y = 2.7;
    box(stair, 4.1, 0.3, 2, -0.8, 3.5, -3.8, chalk);
    box(stair, 3, 0.3, 2, 1.6, 5.3, 0.8, lilac);
    arch(stair, 2, 5.45, 0.8, blue, 0.48);
    // 04 — a tiled courtyard, a still pool and open-air columns.
    const court = rooms[3];
    for (let x = -4; x <= 4; x++)
      for (let z = -3; z <= 3; z++)
        box(
          court,
          0.98,
          0.055,
          0.98,
          x,
          0.02,
          z,
          (x + z) % 2 ? sage : chalk,
          0.006,
        );
    box(court, 5, 0.25, 4, 0, 0.18, 0, chalk);
    box(court, 4.5, 0.06, 3.5, 0, 0.32, 0, water, 0.03);
    for (const x of [-2.38, 2.38])
      box(court, 0.25, 0.22, 4, x, 0.38, 0, chalk, 0.035);
    for (const z of [-1.88, 1.88])
      box(court, 4.5, 0.22, 0.25, 0, 0.38, z, chalk, 0.035);
    for (const x of [-3.5, 3.5])
      for (const z of [-2.7, 0, 2.7]) {
        cylinder(court, 0.22, 3.5, x, 1.8, z, chalk);
        box(court, 0.65, 0.14, 0.65, x, 3.6, z, chalk);
      }
    box(court, 8, 0.35, 0.6, 0, 3.85, -2.7, sage);
    // 05 — a thick oculus roof. Real geometry casts a circular opening on the floor.
    const light = rooms[4];
    for (const x of [-3, 3])
      for (const z of [-2.5, 2.5]) cylinder(light, 0.32, 4.4, x, 2.2, z, sand);
    const roofShape = new THREE.Shape();
    roofShape.moveTo(-3.7, -3.2);
    roofShape.lineTo(3.7, -3.2);
    roofShape.lineTo(3.7, 3.2);
    roofShape.lineTo(-3.7, 3.2);
    roofShape.closePath();
    const hole = new THREE.Path();
    hole.absarc(0, 0, 1.8, 0, Math.PI * 2, true);
    roofShape.holes.push(hole);
    const roof = new THREE.Mesh(
      new THREE.ExtrudeGeometry(roofShape, {
        depth: 0.4,
        bevelEnabled: true,
        bevelThickness: 0.06,
        bevelSize: 0.06,
        bevelSegments: 3,
        curveSegments: 64,
      }),
      sand,
    );
    roof.rotation.x = -Math.PI / 2;
    roof.position.y = 4.35;
    roof.castShadow = true;
    roof.receiveShadow = true;
    light.add(roof);
    cylinder(light, 1.2, 0.22, 0, 0.11, 0, clay);
    cylinder(light, 0.8, 1, 0, 0.6, 0, chalk);
    // 06 — gravity is deliberately suspended; the clear gaps are the subject.
    const floating: THREE.Object3D[] = [];
    for (let j = 0; j < 7; j++) {
      const b = box(
        rooms[5],
        2.5,
        0.28,
        2.2,
        Math.sin(j * 0.8) * 2,
        0.4 + j * 0.65,
        2 - j * 0.7,
        j % 2 ? lilac : chalk,
        0.07,
      );
      floating.push(b);
    }
    arch(rooms[5], 0, 4.8, -2.5, lilac, 0.65);
    cylinder(rooms[5], 0.7, 1.8, 3, 0.9, 1, blue);
    // 07 — a midnight arcade, warm emissive lanterns against blue plaster.
    const night = rooms[6];
    for (let j = 0; j < 4; j++) {
      arch(night, 0, 0, 2.5 - j * 1.7, blue, 0.95);
      for (const x of [-3.3, 3.3]) {
        cylinder(night, 0.09, 1.8, x, 0.9, 2.5 - j * 1.7, brass);
        cylinder(night, 0.23, 0.5, x, 2, 2.5 - j * 1.7, lamp);
      }
    }
    box(night, 1.5, 0.04, 8, 0, 0.04, -0.2, brass, 0.01);
    // 08 — an inhabited skyline, assembled from the vocabulary of the journey.
    const roofWorld = rooms[7];
    arch(roofWorld, -2.5, 0, -1.5, clay, 0.65);
    steps(roofWorld, 10, 1.1, 2, blue);
    box(roofWorld, 3, 0.3, 3, 1.1, 2.6, -1.6, blue);
    arch(roofWorld, 1.1, 2.75, -1.6, chalk, 0.55);
    cylinder(roofWorld, 0.75, 2.8, 3, 1.4, 2, sage);
    box(roofWorld, 3, 0.15, 2, -2, 0.1, 2, water);
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(260, 120),
      new THREE.MeshStandardMaterial({ color: "#e4dfd3", roughness: 1 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(80, -0.82, 0);
    floor.receiveShadow = true;
    scene.add(floor);
    const pointer = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const resize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    resize();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const smooth = (v: number) => {
      v = THREE.MathUtils.clamp(v, 0, 1);
      return v * v * (3 - 2 * v);
    };
    const target = new THREE.Vector3(),
      cameraPosition = new THREE.Vector3();
    const background = new THREE.Color();
    let lastPalette = -1;
    function render(now: number) {
      if (disposed) return;
      const dt = THREE.MathUtils.clamp((now - previous) / 1000, 0, 0.05);
      previous = now;
      const active = !state.current.paused && !reduced.matches;
      if (active) elapsed += dt;
      current = THREE.MathUtils.damp(
        current,
        progress.current,
        reduced.matches ? 100 : 9,
        dt,
      );
      if (Math.abs(current - progress.current) < 0.0005)
        current = progress.current;
      const section = THREE.MathUtils.clamp(Math.floor(current), 0, 7);
      const local = current - section;
      const travel = section === 7 ? 0 : smooth((local - 0.58) / 0.42);
      const worldX = (section + travel) * 23;
      const mobile = container.clientWidth < 760;
      const angle =
        0.38 +
        Math.sin(current * 0.55) * 0.14 +
        Math.sin(local * Math.PI) * 0.12 +
        (active ? pointer.x * 0.018 : 0);
      const distance = mobile ? 27 : 19;
      const cameraHeight =
        THREE.MathUtils.lerp(
          section === 4 ? 13 : 9,
          section + 1 === 4 ? 13 : 9,
          travel,
        ) + (mobile ? 2 : 0);
      target.set(worldX - (mobile ? 0 : 2.7), mobile ? 2.2 : 2.1, 0);
      cameraPosition.set(
        worldX + Math.sin(angle) * distance - (mobile ? 0 : 2.7),
        cameraHeight + (active ? pointer.y * 0.15 : 0),
        Math.cos(angle) * distance,
      );
      camera.position.copy(cameraPosition);
      camera.lookAt(target);
      const bg = background
        .copy(backgrounds[section])
        .lerp(backgrounds[Math.min(7, section + 1)], travel);
      (scene.background as THREE.Color).copy(bg);
      (scene.fog as THREE.Fog).color.copy(bg);
      (floor.material as THREE.MeshStandardMaterial).color.copy(bg);
      sun.position.set(worldX - 9, 15, 8);
      sun.target.position.set(worldX, 0, 0);
      const darkness = section === 6 ? 1 - travel : section === 5 ? travel : 0;
      hemi.intensity = 2.8 - darkness * 1.8;
      sun.intensity = 4.1 - darkness * 2.2;
      rooms.forEach((room, i) => {
        room.visible =
          (i === section && travel < 0.99) ||
          (travel > 0.005 && i === section + 1);
      });
      floating.forEach((b, i) => {
        b.position.y = 0.4 + i * 0.65 + Math.sin(elapsed * 0.55 + i) * 0.07;
      });
      water.roughness = 0.15 + Math.sin(elapsed * 0.4) * 0.025;
      if (lastPalette !== state.current.palette) {
        lastPalette = state.current.palette;
        clay.color.set(["#bf7357", "#bb927c", "#cd965c"][lastPalette]);
        blue.color.set(["#455c96", "#716d8e", "#427e79"][lastPalette]);
      }
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    }
    const contextLost = (e: Event) => {
      e.preventDefault();
      onReady(false);
      cancelAnimationFrame(frame);
    };
    renderer.domElement.addEventListener("webglcontextlost", contextLost);
    try {
      renderer.compile(scene, camera);
      render(performance.now());
      requestAnimationFrame(() => {
        if (!disposed) onReady(true);
      });
    } catch {
      onReady(false);
    }
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      const geometries = new Set<THREE.BufferGeometry>();
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) geometries.add(o.geometry);
      });
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      (floor.material as THREE.Material).dispose();
      grain.dispose();
      environment.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [onReady, progress]);
  return <div className="world" ref={host} />;
}
