"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { makeStage } from "@/lib/stage";
import { interpolate } from "@/lib/journey";
import { houses, nightAt, windowLight, cue } from "@/lib/story";
import {
  material,
  mesh,
  box,
  ellipsoid,
  makeWolf,
  cardTexture,
} from "@/lib/models";

type Props = {
  progress: React.RefObject<number>;
  paused: boolean;
  role: number;
  victim: number;
  vision: number;
  accused: number;
  players: number;
  onReady: (ok: boolean) => void;
};
export default function World({
  progress,
  paused,
  role,
  victim,
  vision,
  accused,
  players,
  onReady,
}: Props) {
  const host = useRef<HTMLDivElement>(null);
  const state = useRef({ paused, role, victim, vision, accused, players });
  useEffect(() => {
    state.current = { paused, role, victim, vision, accused, players };
  }, [paused, role, victim, vision, accused, players]);
  useEffect(() => {
    if (!host.current) return;
    let stage: ReturnType<typeof makeStage>;
    try {
      stage = makeStage(host.current, true);
    } catch {
      onReady(false);
      return;
    }
    const { renderer, scene, camera, key, hemi, fill, reduced, mobile } = stage;
    let frame = 0,
      disposed = false,
      elapsed = 0,
      last = performance.now(),
      scroll = progress.current;
    scene.fog = new THREE.FogExp2("#101b19", 0.012);
    scene.environmentIntensity = 0.4;
    const stone = material("#69766b", 0.85),
      timber = material("#4c3b29", 0.73),
      roof = material("#344e48", 0.43, 0.18),
      brass = material("#b99a5e", 0.33, 0.65),
      cream = material("#d4c6a0", 0.7),
      leaves = material("#193c32", 0.9);
    const grainCanvas = document.createElement("canvas");
    grainCanvas.width = grainCanvas.height = 256;
    const gc = grainCanvas.getContext("2d")!;
    gc.fillStyle = "#8f8f8f";
    gc.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 100; i++) {
      const y = i * 2.6;
      gc.strokeStyle = `rgba(45,45,45,${0.06 + (i % 4) * 0.025})`;
      gc.lineWidth = 0.6;
      gc.beginPath();
      for (let x = 0; x <= 256; x += 4) {
        const yy = y + Math.sin(x * 0.03 + i) * 1.8;
        x === 0 ? gc.moveTo(x, yy) : gc.lineTo(x, yy);
      }
      gc.stroke();
    }
    const grain = new THREE.CanvasTexture(grainCanvas);
    grain.wrapS = grain.wrapT = THREE.RepeatWrapping;
    grain.repeat.set(2, 2);
    timber.bumpMap = grain;
    timber.bumpScale = 0.025;
    roof.bumpMap = grain;
    roof.bumpScale = 0.012;
    const floor = mesh(
      scene,
      new THREE.PlaneGeometry(200, 200),
      material("#182c24", 0.95),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.75;
    const island = mesh(
      scene,
      new THREE.CylinderGeometry(10.4, 10.1, 0.65, 128),
      material("#293c32"),
      0,
      -0.34,
      0,
    );
    island.receiveShadow = true;
    mesh(
      scene,
      new THREE.TorusGeometry(10.23, 0.045, 10, 160),
      brass,
      0,
      -0.37,
      0,
    ).rotation.x = Math.PI / 2;
    // Every building stays in place; shutters and lights carry the night's consequences.
    const seamMaterial = material("#52685e", 0.67, 0.1);
    const homes = houses.map((house, i) => {
      const angle = -2.45 + (i * 4.9) / 7,
        r = 7.1;
      const root = new THREE.Group();
      root.position.set(Math.sin(angle) * r, 0, -Math.cos(angle) * r);
      root.rotation.y = -angle;
      scene.add(root);
      const h = 1.6 + (i % 3) * 0.24;
      box(root, 1.8, h, 1.9, stone, 0, h / 2, 0, 0.09);
      const shape = new THREE.Shape();
      shape.moveTo(-1.13, 0);
      shape.lineTo(0, 1.25);
      shape.lineTo(1.13, 0);
      shape.closePath();
      const rg = new THREE.ExtrudeGeometry(shape, {
        depth: 2.35,
        bevelEnabled: true,
        bevelSegments: 3,
        bevelSize: 0.035,
        bevelThickness: 0.035,
      });
      rg.translate(0, 0, -1.175);
      mesh(root, rg, roof, 0, h - 0.02, 0);
      const seams = new THREE.InstancedMesh(
        new THREE.BoxGeometry(0.018, 0.018, 2.34),
        seamMaterial,
        10,
      );
      const seamPose = new THREE.Object3D();
      for (let j = 0; j < 10; j++) {
        const x = (j - 4.5) * 0.215;
        seamPose.position.set(
          x,
          h + 1.25 * (1 - Math.abs(x) / 1.13) + 0.008,
          0,
        );
        seamPose.updateMatrix();
        seams.setMatrixAt(j, seamPose.matrix);
      }
      root.add(seams);
      for (const x of [-0.87, 0, 0.87])
        box(root, 0.055, h, 0.07, timber, x, h / 2, 0.98, 0.012);
      box(root, 1.85, 0.09, 0.06, timber, 0, 0.12, 0.98);
      box(root, 0.4, 0.8, 0.07, timber, 0, 0.4, 1.01);
      ellipsoid(root, brass, 0.12, 0.42, 1.06, 0.035, 0.035, 0.025);
      box(root, 0.3, 0.9, 0.38, stone, 0.55, h + 0.6, -0.4);
      const glow = new THREE.MeshStandardMaterial({
        color: "#ffcf83",
        emissive: "#ffad40",
        emissiveIntensity: 1.2,
        roughness: 0.5,
      });
      const shutters: THREE.Group[] = [];
      for (const x of [-0.56, 0.56]) {
        box(root, 0.36, 0.48, 0.035, glow, x, h * 0.65, 1.001, 0.01);
        for (const side of [-1, 1]) {
          const hinge = new THREE.Group();
          hinge.position.set(x + side * 0.19, h * 0.65, 1.04);
          root.add(hinge);
          box(hinge, 0.18, 0.52, 0.055, timber, -side * 0.09, 0, 0, 0.015);
          hinge.userData.side = side;
          shutters.push(hinge);
        }
        box(root, 0.025, 0.49, 0.04, brass, x, h * 0.65, 1.034, 0.005);
      }
      // Lantern, footing and a continuous little path ground the house in the model.
      mesh(
        root,
        new THREE.CylinderGeometry(0.035, 0.035, 1.1, 12),
        brass,
        1.17,
        0.55,
        0.85,
      );
      const lantern = box(root, 0.2, 0.29, 0.2, glow, 1.17, 1.17, 0.85, 0.025);
      mesh(
        root,
        new THREE.ConeGeometry(0.2, 0.12, 4),
        brass,
        1.17,
        1.38,
        0.85,
      ).rotation.y = Math.PI / 4;
      box(root, 2.05, 0.12, 2.15, material("#536057"), 0, 0.015, 0, 0.06);
      for (let k = 0; k < 7; k++)
        box(
          root,
          0.48,
          0.055,
          0.34,
          stone,
          (k % 2) * 0.05,
          0.035,
          1.25 + k * 0.39,
          0.04,
        );
      return { root, glow, shutters, lantern };
    });
    const treeGeo = new THREE.ConeGeometry(1, 3, 32),
      trees = new THREE.InstancedMesh(treeGeo, leaves, 90),
      stems = new THREE.InstancedMesh(
        new THREE.CylinderGeometry(0.09, 0.16, 1.7, 10),
        timber,
        30,
      );
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 30; i++) {
      const a = -2.1 + (i * 4.2) / 29,
        r = 12.5 + (i % 4) * 1.25,
        x = Math.sin(a) * r,
        z = -Math.cos(a) * r,
        s = 0.75 + (i % 5) * 0.12;
      dummy.position.set(x, 0.45, z);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      stems.setMatrixAt(i, dummy.matrix);
      for (let j = 0; j < 3; j++) {
        dummy.position.set(x, 1.4 + j * 0.75 * s, z);
        dummy.scale.set(s * (1 - j * 0.2), s, s * (1 - j * 0.2));
        dummy.updateMatrix();
        trees.setMatrixAt(i * 3 + j, dummy.matrix);
      }
    }
    trees.castShadow = true;
    scene.add(trees, stems);
    const starPositions = new Float32Array(160 * 3);
    for (let i = 0; i < 160; i++)
      starPositions.set(
        [
          Math.sin(i * 123.2) * 45,
          9 + (i % 23) * 1.4,
          -18 - Math.abs(Math.cos(i * 63.3)) * 30,
        ],
        i * 3,
      );
    const starsGeo = new THREE.BufferGeometry();
    starsGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(starPositions, 3),
    );
    const starMat = new THREE.PointsMaterial({
      color: "#d9d6bb",
      size: 0.055,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    });
    scene.add(new THREE.Points(starsGeo, starMat));
    const table = new THREE.Group();
    table.position.z = 1.2;
    scene.add(table);
    mesh(
      table,
      new THREE.CylinderGeometry(3.15, 3.15, 0.22, 96),
      timber,
      0,
      1.28,
      0,
    );
    mesh(
      table,
      new THREE.CylinderGeometry(0.8, 1.2, 1.18, 48),
      timber,
      0,
      0.59,
      0,
    );
    mesh(
      table,
      new THREE.TorusGeometry(3.08, 0.045, 12, 128),
      brass,
      0,
      1.4,
      0,
    ).rotation.x = Math.PI / 2;
    const seats = houses.map((_, i) => {
      const a = (i / 8) * Math.PI * 2;
      const root = new THREE.Group();
      root.position.set(Math.sin(a) * 2.32, 1.4, Math.cos(a) * 2.32);
      root.rotation.y = a;
      table.add(root);
      const mat = material(i === 7 ? "#7daba1" : "#b5b59a", 0.42, 0.2);
      mesh(
        root,
        new THREE.CylinderGeometry(0.12, 0.24, 0.45, 32),
        mat,
        0,
        0.225,
        0,
      );
      ellipsoid(root, mat, 0, 0.59, 0, 0.18, 0.18, 0.18);
      mesh(
        root,
        new THREE.CylinderGeometry(0.28, 0.29, 0.06, 32),
        brass,
        0,
        0.03,
        0,
      );
      const token = mesh(
        table,
        new THREE.CylinderGeometry(0.14, 0.14, 0.045, 32),
        brass,
        Math.sin(a) * 2.7,
        1.425,
        Math.cos(a) * 2.7,
      );
      return { root, token, a, mat };
    });
    const deck = new THREE.Group();
    deck.position.set(0, 1.46, 1.2);
    scene.add(deck);
    const cards = Array.from({ length: 3 }, (_, i) => {
      const root = new THREE.Group();
      deck.add(root);
      box(root, 2.1, 3.12, 0.085, brass, 0, 0, 0, 0.06);
      const face = mesh(
        root,
        new THREE.PlaneGeometry(2.01, 3.02),
        new THREE.MeshStandardMaterial({
          map: cardTexture(i, renderer),
          roughness: 0.7,
        }),
        0,
        0,
        0.047,
      );
      face.castShadow = false;
      const back = mesh(
        root,
        new THREE.PlaneGeometry(2.01, 3.02),
        material("#28483e", 0.65),
        0,
        0,
        -0.047,
      );
      back.rotation.y = Math.PI;
      const backRing = mesh(
        root,
        new THREE.TorusGeometry(0.48, 0.015, 8, 64),
        brass,
        0,
        0,
        -0.05,
      );
      backRing.rotation.y = Math.PI;
      return root;
    });
    const wolf = makeWolf();
    scene.add(wolf.root);
    const wolfMaterials = new Set<THREE.Material>();
    wolf.root.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const mat = object.material as THREE.Material;
        mat.transparent = true;
        wolfMaterials.add(mat);
      }
    });
    wolf.root.scale.setScalar(1.25);
    const lens = new THREE.Group();
    lens.position.set(-2.7, 1.4, 1.1);
    scene.add(lens);
    mesh(
      lens,
      new THREE.CylinderGeometry(0.52, 0.62, 0.14, 48),
      brass,
      0,
      0,
      0,
    );
    const orb = ellipsoid(
      lens,
      new THREE.MeshPhysicalMaterial({
        color: "#7dc6ba",
        metalness: 0.3,
        roughness: 0.12,
        clearcoat: 1,
        emissive: "#2c716b",
        emissiveIntensity: 0.3,
      }),
      0,
      0.55,
      0,
      0.48,
      0.48,
      0.48,
    );
    const orbit = mesh(
      lens,
      new THREE.TorusGeometry(0.62, 0.018, 10, 64),
      brass,
      0,
      0.55,
      0,
    );
    orbit.rotation.x = 1.1;
    function marker(color: string, radius: number) {
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const ring = mesh(
        scene,
        new THREE.RingGeometry(radius, radius + 0.055, 96),
        mat,
        0,
        0.12,
        0,
      );
      ring.rotation.x = -Math.PI / 2;
      ring.castShadow = false;
      return ring;
    }
    const huntRing = marker("#dc9566", 1.65),
      seerRing = marker("#9de3ce", 1.75),
      voteRing = marker("#e1c48b", 1.65);
    const choicePositions = [
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
    ];
    [victim, vision, accused].forEach((v, i) =>
      choicePositions[i].copy(homes[v].root.position),
    );
    const guestLights = Array.from({ length: 18 }, (_, i) => {
      const a = (i / 18) * Math.PI * 2,
        mat = new THREE.MeshStandardMaterial({
          color: "#edc381",
          emissive: "#e8a252",
          emissiveIntensity: 0.2,
          roughness: 0.5,
        });
      return mesh(
        scene,
        new THREE.SphereGeometry(0.1, 16, 12),
        mat,
        Math.sin(a) * 9.65,
        0.13,
        Math.cos(a) * 9.65,
      );
    });
    const cameraKeys = [
      [23, 26, 35, 0, 1, 0],
      [18, 28, 30, 0, 0, 0],
      [7, 9, 18, 0, 2.7, 1.2],
      [10, 18, 27, 0, 1.3, -1],
      [12, 9, 23, 2, 1.7, 6.7],
      [8, 18, 25, 0, 1, 0],
      [18, 25, 29, 0, 1, 0],
      [7, 12, 17, 0, 1.5, 1.2],
      [6, 10, 17, 0, 1.5, 1.2],
      [24, 28, 35, 0, 1, 0],
    ];
    const mobileDistances = [
      [59],
      [58],
      [29],
      [49],
      [29],
      [51],
      [57],
      [29],
      [28],
      [59],
    ];
    const look = new THREE.Vector3(),
      eyeDirection = new THREE.Vector3();
    const moonlight = new THREE.Color("#f5e2c4"),
      sunlight = new THREE.Color("#ffe0a6");
    const nightColor = new THREE.Color("#101e1a"),
      dawnColor = new THREE.Color("#39473c"),
      morningColor = new THREE.Color("#59604c");
    function render(now: number) {
      if (disposed || document.hidden) return;
      const dt = Math.min(0.064, (now - last) / 1000);
      last = now;
      if (!state.current.paused && !reduced.matches) elapsed += dt;
      scroll = reduced.matches
        ? progress.current
        : THREE.MathUtils.damp(scroll, progress.current, 10, dt);
      const s = state.current,
        n = nightAt(scroll),
        k = interpolate(cameraKeys, scroll);
      look.set(k[3], k[4], k[5]);
      camera.position.set(k[0], k[1], k[2]);
      if (mobile.matches) {
        eyeDirection.copy(camera.position).sub(look).normalize();
        const distance =
          interpolate(mobileDistances, scroll)[0] *
          Math.max(1, 0.48 / camera.aspect);
        camera.position.copy(look).addScaledVector(eyeDirection, distance);
      }
      camera.lookAt(look);
      homes.forEach((home, i) => {
        const brightness = windowLight(scroll, i, s.victim, s.accused);
        home.glow.emissiveIntensity = THREE.MathUtils.damp(
          home.glow.emissiveIntensity,
          0.035 + brightness * 1.65,
          8,
          dt,
        );
        home.glow.color.setRGB(
          0.15 + brightness * 0.85,
          0.12 + brightness * 0.5,
          0.07 + brightness * 0.18,
        );
        const closed =
          n.asleep * (1 - n.dawn) +
          (i === s.victim ? n.loss * n.dawn : 0) +
          (i === s.accused ? n.verdict : 0);
        home.shutters.forEach((shutter) => {
          shutter.rotation.y = THREE.MathUtils.damp(
            shutter.rotation.y,
            shutter.userData.side * (1 - Math.min(1, closed)) * 2.55,
            9,
            dt,
          );
        });
      });
      cards.forEach((card, i) => {
        const selected = i === s.role;
        const side = selected ? 0 : (i - s.role + 3) % 3 === 1 ? 1 : -1;
        const fan = n.deal * (1 - n.fold);
        card.position.x = THREE.MathUtils.damp(
          card.position.x,
          side * 1.5 * fan,
          8,
          dt,
        );
        card.position.y =
          i * 0.09 * (1 - fan) +
          (1.8 + (selected ? 0.22 : 0)) * Math.sin((fan * Math.PI) / 2);
        card.position.z = (selected ? 0.28 : -0.4) * fan;
        card.rotation.x =
          -Math.PI / 2 + (n.deal * Math.PI) / 2 + (n.fold * Math.PI) / 2;
        card.rotation.y = THREE.MathUtils.damp(
          card.rotation.y,
          -side * 0.2 * fan,
          8,
          dt,
        );
        card.rotation.z = -side * 0.13 * fan;
      });
      // A single route through the village. No teleport, repeated descent or reset.
      wolf.root.position.set(
        -30 + n.hunt * 32 + n.retreat * 22,
        0,
        7.5 + Math.sin(n.retreat * Math.PI) * 4 - n.retreat * 10,
      );
      const wolfPresence =
        cue(n.hunt, 0.58, 0.86) * (1 - cue(n.retreat, 0.7, 1));
      wolfMaterials.forEach((mat) => {
        mat.opacity = wolfPresence;
        mat.depthWrite = wolfPresence > 0.98;
      });
      wolf.root.visible = wolfPresence > 0.00001;
      wolf.root.position.y =
        -0.75 *
        cue(Math.hypot(wolf.root.position.x, wolf.root.position.z), 10.4, 11.1);
      wolf.root.rotation.y = -0.08 + n.retreat * 0.7;
      const walking =
        Math.sin(Math.PI * n.hunt) + Math.sin(Math.PI * n.retreat);
      const stride = (n.hunt * 15 + n.retreat * 16) * 2.6;
      wolf.legs.forEach(
        (leg, i) =>
          (leg.rotation.z =
            Math.sin(stride + (i === 0 || i === 3 ? 0 : Math.PI)) *
            0.27 *
            walking),
      );
      wolf.torso.scale.y =
        0.55 + (reduced.matches ? 0 : Math.sin(elapsed * 1.4) * 0.008);
      wolf.head.rotation.y = -0.12 + Math.sin(elapsed * 0.4) * 0.025;
      wolf.tail.rotation.x = Math.sin(elapsed * 0.7) * 0.035;
      orbit.rotation.z = elapsed * 0.12;
      (orb.material as THREE.MeshPhysicalMaterial).emissiveIntensity =
        0.16 + n.vision * 0.85;
      const ids = [s.victim, s.vision, s.accused],
        rings = [huntRing, seerRing, voteRing],
        weights = [
          n.hunt * (1 - n.loss) * 0.85,
          n.vision * 0.9,
          n.vote * (1 - n.verdict) * 0.9,
        ];
      rings.forEach((ring, i) => {
        choicePositions[i].lerp(
          homes[ids[i]].root.position,
          1 - Math.exp(-7 * dt),
        );
        ring.position.set(choicePositions[i].x, 0.13, choicePositions[i].z);
        (ring.material as THREE.MeshBasicMaterial).opacity = weights[i];
      });
      seats.forEach((seat, i) => {
        const leave =
          (i === s.victim ? n.loss : 0) + (i === s.accused ? n.verdict : 0);
        seat.root.rotation.x = THREE.MathUtils.damp(
          seat.root.rotation.x,
          (Math.min(1, leave) * Math.PI) / 2,
          8,
          dt,
        );
        seat.root.position.y = 1.4 + Math.sin(seat.root.rotation.x) * 0.3;
        const a = seats[s.accused].a,
          voteWeight = n.vote * (i === s.victim ? 0 : 1);
        const x = Math.sin(a) * 1.6 + (i - 3.5) * 0.13,
          z = Math.cos(a) * 1.6 + (i % 2) * 0.16;
        seat.token.position.x = THREE.MathUtils.damp(
          seat.token.position.x,
          Math.sin(seat.a) * 2.7 * (1 - voteWeight) + x * voteWeight,
          7,
          dt,
        );
        seat.token.position.z = THREE.MathUtils.damp(
          seat.token.position.z,
          Math.cos(seat.a) * 2.7 * (1 - voteWeight) + z * voteWeight,
          7,
          dt,
        );
      });
      guestLights.forEach((light, i) => {
        const mat = light.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = THREE.MathUtils.damp(
          mat.emissiveIntensity,
          i < s.players ? 0.3 + n.sunrise * 0.7 : 0.01,
          7,
          dt,
        );
      });
      (scene.background as THREE.Color)
        .copy(nightColor)
        .lerp(dawnColor, n.dawn)
        .lerp(morningColor, n.sunrise * 0.6);
      (scene.fog as THREE.FogExp2).color.copy(scene.background as THREE.Color);
      hemi.intensity = 1.35 + n.dawn * 0.7 + n.sunrise * 0.3;
      key.intensity = 3.4 + n.dawn * 0.9;
      key.color.copy(moonlight).lerp(sunlight, n.dawn);
      fill.intensity = 1.4 + n.dawn * 0.3;
      starMat.opacity = 0.65 * (1 - n.dawn);
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    }
    const visibility = () => {
      cancelAnimationFrame(frame);
      last = performance.now();
      if (!document.hidden) frame = requestAnimationFrame(render);
    };
    const lost = (e: Event) => {
      e.preventDefault();
      onReady(false);
      cancelAnimationFrame(frame);
    };
    document.addEventListener("visibilitychange", visibility);
    renderer.domElement.addEventListener("webglcontextlost", lost);
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
      document.removeEventListener("visibilitychange", visibility);
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      stage.dispose();
    };
  }, [progress, onReady]);
  return <div className="world" ref={host} aria-hidden="true" />;
}
