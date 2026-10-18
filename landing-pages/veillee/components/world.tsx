"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { makeStage } from "@/lib/stage";
import { interpolate } from "@/lib/journey";
type Props = {
  progress: React.RefObject<number>;
  paused: boolean;
  role: number;
  onReady: (ok: boolean) => void;
};
export default function World({ progress, paused, role, onReady }: Props) {
  const host = useRef<HTMLDivElement>(null),
    state = useRef({ paused, role });
  useEffect(() => {
    state.current = { paused, role };
  }, [paused, role]);
  useEffect(() => {
    if (!host.current) return;
    let stage: ReturnType<typeof makeStage>;
    try {
      stage = makeStage(host.current, true);
    } catch {
      onReady(false);
      return;
    }
    const { renderer, scene, camera, key, hemi, reduced, mobile } = stage;
    let frame = 0,
      disposed = false,
      elapsed = 0,
      last = performance.now(),
      scroll = progress.current;
    scene.fog = new THREE.FogExp2("#101b19", 0.018);
    const material = (color: string, roughness = 0.7, metalness = 0) =>
      new THREE.MeshStandardMaterial({ color, roughness, metalness });
    const stone = material("#44534b"),
      wood = material("#47382c"),
      roof = material("#343d39"),
      copper = material("#b6824c", 0.3, 0.65),
      cream = material("#d4c6a0"),
      leaves = material("#182f29"),
      trunk = material("#344036");
    const glow = new THREE.MeshStandardMaterial({
      color: "#ffc775",
      emissive: "#f7ab4e",
      emissiveIntensity: 1.6,
    });
    function mesh(
      parent: THREE.Object3D,
      g: THREE.BufferGeometry,
      m: THREE.Material,
      x = 0,
      y = 0,
      z = 0,
    ) {
      const o = new THREE.Mesh(g, m);
      o.position.set(x, y, z);
      o.castShadow = true;
      o.receiveShadow = true;
      parent.add(o);
      return o;
    }
    function box(
      parent: THREE.Object3D,
      w: number,
      h: number,
      d: number,
      m: THREE.Material,
      x = 0,
      y = 0,
      z = 0,
    ) {
      return mesh(parent, new RoundedBoxGeometry(w, h, d, 3, 0.04), m, x, y, z);
    }
    const ground = mesh(
      scene,
      new THREE.PlaneGeometry(220, 220),
      material("#1d2d26"),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.2;
    // A continuous village: the camera revisits the same place at night and dawn.
    const village = new THREE.Group();
    scene.add(village);
    for (let i = 0; i < 11; i++) {
      const a = (i / 11) * Math.PI * 2,
        r = 7 + (i % 3) * 0.45;
      const house = new THREE.Group();
      house.position.set(Math.sin(a) * r, 0, Math.cos(a) * r);
      house.rotation.y = a;
      village.add(house);
      const h = 1.6 + (i % 3) * 0.3;
      box(house, 1.9, h, 2.2, stone, 0, h / 2, 0);
      const rg = new THREE.ConeGeometry(1.8, 1.65, 4);
      rg.rotateY(Math.PI / 4);
      mesh(house, rg, roof, 0, h + 0.7, 0).scale.z = 1.15;
      box(house, 0.45, 0.7, 0.09, wood, 0, 0.35, 1.14);
      for (const x of [-0.58, 0.58]) {
        box(house, 0.34, 0.43, 0.05, glow, x, h * 0.62, 1.14);
        box(house, 0.03, 0.46, 0.06, wood, x, h * 0.62, 1.18);
        box(house, 0.37, 0.03, 0.06, wood, x, h * 0.62, 1.18);
      }
      box(house, 0.28, 0.8, 0.35, stone, 0.5, h + 1, -0.25);
    }
    const trees = new THREE.InstancedMesh(
        new THREE.ConeGeometry(1, 3.5, 32),
        leaves,
        156,
      ),
      trunks = new THREE.InstancedMesh(
        new THREE.CylinderGeometry(0.08, 0.16, 2, 8),
        trunk,
        52,
      );
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 52; i++) {
      const a = i * 2.39996,
        r = 12 + (i % 8) * 1.4,
        x = Math.cos(a) * r;
      let z = Math.sin(a) * r;
      // Leave an open sightline from the camera to the cards, mask and oracle.
      if (z > 4 && x > -5 && x < 22) z = -Math.abs(z) - 8;
      const s = 0.8 + (i % 5) * 0.18;
      dummy.position.set(x, 1, z);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      trunks.setMatrixAt(i, dummy.matrix);
      for (let j = 0; j < 3; j++) {
        dummy.position.set(x, 2 + j * 0.85 * s, z);
        dummy.scale.set(s * (1 - j * 0.17), s, s * (1 - j * 0.17));
        dummy.updateMatrix();
        trees.setMatrixAt(i * 3 + j, dummy.matrix);
      }
    }
    trees.receiveShadow = true;
    scene.add(trees, trunks);
    // Cratered moon, with a locally generated surface rather than a remote image.
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 256;
    const c = canvas.getContext("2d")!;
    c.fillStyle = "#bdb8a4";
    c.fillRect(0, 0, 256, 256);
    let seed = 22;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let i = 0; i < 180; i++) {
      const x = rand() * 256,
        y = rand() * 256,
        r = rand() * 14 + 1;
      const g = c.createRadialGradient(x - r * 0.2, y - r * 0.2, 0, x, y, r);
      g.addColorStop(0, "#77766b");
      g.addColorStop(0.7, "#a4a391");
      g.addColorStop(1, "#c2bdab");
      c.fillStyle = g;
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.fill();
    }
    const moonTexture = new THREE.CanvasTexture(canvas);
    const moon = mesh(
      scene,
      new THREE.SphereGeometry(5.4, 64, 48),
      new THREE.MeshStandardMaterial({
        color: "#ddd3b5",
        map: moonTexture,
        bumpMap: moonTexture,
        bumpScale: 0.16,
        roughness: 1,
        emissive: "#a89974",
        emissiveIntensity: 0.22,
      }),
      5,
      13,
      -15,
    );
    moon.castShadow = false;
    const stars = new Float32Array(210 * 3);
    for (let i = 0; i < 210; i++)
      stars.set(
        [(rand() - 0.5) * 100, 8 + rand() * 50, (rand() - 0.7) * 90],
        i * 3,
      );
    const sg = new THREE.BufferGeometry();
    sg.setAttribute("position", new THREE.BufferAttribute(stars, 3));
    scene.add(
      new THREE.Points(
        sg,
        new THREE.PointsMaterial({
          color: "#d6d1b5",
          size: 0.055,
          transparent: true,
          opacity: 0.65,
        }),
      ),
    );
    const firePositions = new Float32Array(55 * 3);
    for (let i = 0; i < 55; i++)
      firePositions.set(
        [(rand() - 0.5) * 18, rand() * 7 + 0.7, (rand() - 0.5) * 18],
        i * 3,
      );
    const fg = new THREE.BufferGeometry();
    fg.setAttribute("position", new THREE.BufferAttribute(firePositions, 3));
    const fireflies = new THREE.Points(
      fg,
      new THREE.PointsMaterial({
        color: "#f2bf69",
        size: 0.065,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
      }),
    );
    scene.add(fireflies);
    function cardTexture(type: number) {
      const cv = document.createElement("canvas");
      cv.width = 512;
      cv.height = 768;
      const ctx = cv.getContext("2d")!;
      ctx.fillStyle =
        type === 0 ? "#652e25" : type === 1 ? "#c6b992" : "#293f3a";
      ctx.fillRect(0, 0, 512, 768);
      ctx.strokeStyle = type === 1 ? "#33443c" : "#d8bc7e";
      ctx.fillStyle = ctx.strokeStyle;
      ctx.lineWidth = 2;
      ctx.strokeRect(26, 26, 460, 716);
      ctx.strokeRect(35, 35, 442, 698);
      ctx.textAlign = "center";
      ctx.font = "18px Georgia";
      ctx.fillText("V E I L L É E", 256, 90);
      ctx.font = "36px Georgia";
      ctx.fillText(
        ["THE WEREWOLF", "THE VILLAGER", "THE SEER"][type],
        256,
        635,
      );
      ctx.font = "13px Georgia";
      ctx.fillText(
        ["KEEP YOUR SECRET", "TRUST YOUR INSTINCT", "LOOK A LITTLE CLOSER"][
          type
        ],
        256,
        677,
      );
      ctx.save();
      ctx.translate(256, 345);
      ctx.lineWidth = 3;
      if (type === 0) {
        ctx.beginPath();
        ctx.moveTo(-125, -150);
        ctx.lineTo(-106, 15);
        ctx.lineTo(-30, 98);
        ctx.lineTo(0, 123);
        ctx.lineTo(30, 98);
        ctx.lineTo(106, 15);
        ctx.lineTo(125, -150);
        ctx.lineTo(54, -77);
        ctx.lineTo(0, -63);
        ctx.lineTo(-54, -77);
        ctx.closePath();
        ctx.stroke();
        for (const s of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(s * 23, 10);
          ctx.lineTo(s * 73, -10);
          ctx.lineTo(s * 55, 24);
          ctx.closePath();
          ctx.fill();
        }
        ctx.beginPath();
        ctx.moveTo(-18, 79);
        ctx.lineTo(18, 79);
        ctx.lineTo(0, 98);
        ctx.closePath();
        ctx.fill();
      } else if (type === 1) {
        ctx.strokeRect(-75, -20, 150, 140);
        ctx.beginPath();
        ctx.moveTo(-110, -20);
        ctx.lineTo(0, -125);
        ctx.lineTo(110, -20);
        ctx.stroke();
        ctx.strokeRect(-19, 40, 38, 80);
        ctx.beginPath();
        ctx.arc(90, -120, 25, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.ellipse(0, 0, 136, 66, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 43, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * 150, Math.sin(a) * 115);
          ctx.lineTo(Math.cos(a) * 170, Math.sin(a) * 135);
          ctx.stroke();
        }
      }
      ctx.restore();
      const tx = new THREE.CanvasTexture(cv);
      tx.colorSpace = THREE.SRGBColorSpace;
      tx.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      return tx;
    }
    const deck = new THREE.Group();
    scene.add(deck);
    const cards: THREE.Group[] = [];
    for (let i = 0; i < 3; i++) {
      const card = new THREE.Group();
      card.position.set(
        (i - 1) * 2.6,
        i === 1 ? 0.35 : 0,
        -Math.abs(i - 1) * 0.7,
      );
      card.rotation.set(0.04, (i - 1) * -0.2, (i - 1) * -0.14);
      box(card, 3.65, 5.45, 0.13, copper);
      const front = mesh(
        card,
        new THREE.PlaneGeometry(3.5, 5.3),
        new THREE.MeshStandardMaterial({
          map: cardTexture(i),
          roughness: 0.63,
        }),
        0,
        0,
        0.076,
      );
      front.castShadow = false;
      deck.add(card);
      cards.push(card);
    }
    // Original cast-bronze wolf mask with actual eye openings and bevelled edges.
    const mask = new THREE.Group();
    scene.add(mask);
    mask.scale.setScalar(1.8);
    const outline = new THREE.Shape();
    outline.moveTo(-1.65, 2.4);
    outline.quadraticCurveTo(-1.4, 0.1, -0.55, -0.7);
    outline.quadraticCurveTo(0, -1.7, 0.55, -0.7);
    outline.quadraticCurveTo(1.4, 0.1, 1.65, 2.4);
    outline.lineTo(0.7, 1.55);
    outline.quadraticCurveTo(0, 1.75, -0.7, 1.55);
    outline.closePath();
    for (const s of [-1, 1]) {
      const eye = new THREE.Path();
      eye.absellipse(
        s * 0.65,
        0.65,
        0.35,
        0.15,
        0,
        Math.PI * 2,
        true,
        s * -0.28,
      );
      outline.holes.push(eye);
    }
    mesh(
      mask,
      new THREE.ExtrudeGeometry(outline, {
        depth: 0.26,
        bevelEnabled: true,
        bevelThickness: 0.12,
        bevelSize: 0.1,
        bevelSegments: 6,
        curveSegments: 48,
      }),
      copper,
    );
    const snout = mesh(
      mask,
      new THREE.SphereGeometry(1, 40, 28),
      copper,
      0,
      -0.25,
      0.27,
    );
    snout.scale.set(0.38, 0.64, 0.4);
    const nose = mesh(
      mask,
      new THREE.SphereGeometry(1, 32, 24),
      wood,
      0,
      -0.61,
      0.62,
    );
    nose.scale.set(0.24, 0.14, 0.15);
    const oracle = new THREE.Group();
    scene.add(oracle);
    oracle.scale.setScalar(1.6);
    mesh(
      oracle,
      new THREE.CylinderGeometry(1.25, 1.5, 0.25, 64),
      copper,
      0,
      0,
      0,
    );
    const orb = mesh(
      oracle,
      new THREE.SphereGeometry(1.25, 64, 48),
      new THREE.MeshPhysicalMaterial({
        color: "#82b7a9",
        roughness: 0.13,
        metalness: 0.25,
        clearcoat: 1,
        emissive: "#2c796e",
        emissiveIntensity: 0.2,
      }),
      0,
      1.35,
      0,
    );
    const orbit = mesh(
      oracle,
      new THREE.TorusGeometry(1.65, 0.025, 10, 96),
      copper,
      0,
      1.35,
      0,
    );
    orbit.rotation.x = 1.1;
    const table = new THREE.Group();
    scene.add(table);
    mesh(
      table,
      new THREE.CylinderGeometry(2.7, 2.7, 0.22, 64),
      wood,
      0,
      1.2,
      0,
    );
    mesh(
      table,
      new THREE.CylinderGeometry(0.7, 1.25, 1.2, 48),
      wood,
      0,
      0.5,
      0,
    );
    const flames: THREE.Mesh[] = [];
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      mesh(
        table,
        new THREE.CylinderGeometry(0.12, 0.14, 0.55, 20),
        cream,
        Math.sin(a) * 2.05,
        1.6,
        Math.cos(a) * 2.05,
      );
      const flame = mesh(
        table,
        new THREE.SphereGeometry(0.1, 16, 12),
        glow,
        Math.sin(a) * 2.05,
        1.95,
        Math.cos(a) * 2.05,
      );
      flame.scale.y = 1.9;
      flames.push(flame);
    }
    const cameraKeys = [
      [19, 12, 29, -5, 4, 0],
      [18, 22, 29, -3, 0, 0],
      [13, 9, 24, -4, 4, 0],
      [6, 5, 22, -3, 2, -3],
      [12, 7, 24, -4, 4, 0],
      [13, 8, 23, -4, 4, 0],
      [15, 13, 23, -4, 1, 0],
      [10, 8, 22, -3, 1, 0],
      [18, 19, 30, -4, 1, 0],
      [17, 11, 28, -5, 3, 0],
    ];
    const deckKeys = [
      [3.5, 5.7, 3, 0.65],
      [12, -8, 0, 0],
      [3.5, 5.7, 3, 0.65],
      [13, -8, 0, 0],
      [13, -8, 0, 0],
      [13, -8, 0, 0],
      [13, -8, 0, 0],
      [13, -8, 0, 0],
      [13, -8, 0, 0],
      [4, 5.7, 3, 0.65],
    ];
    const maskKeys = Array.from({ length: 10 }, (_, i) => [
      i === 4 ? 3 : 12,
      i === 4 ? 5 : -9,
      4,
    ]);
    const orbKeys = Array.from({ length: 10 }, (_, i) => [
      i === 5 ? 3 : 12,
      i === 5 ? 3 : -9,
      3,
    ]);
    const target = new THREE.Vector3(),
      nightColor = new THREE.Color("#101b19"),
      dawnColor = new THREE.Color("#43483c");
    function render(now: number) {
      if (disposed || document.hidden) return;
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      if (!state.current.paused && !reduced.matches) elapsed += dt;
      scroll = THREE.MathUtils.damp(
        scroll,
        progress.current,
        reduced.matches ? 100 : 7,
        dt,
      );
      const k = interpolate(cameraKeys, scroll);
      const distance = mobile.matches ? 1.45 : 1;
      camera.position.set(k[0] * distance, k[1] * distance, k[2] * distance);
      target.set(mobile.matches ? 0 : k[3], k[4], k[5]);
      camera.lookAt(target);
      const d = interpolate(deckKeys, scroll);
      deck.position.set(d[0], d[1] + Math.sin(elapsed * 0.6) * 0.13, d[2]);
      deck.rotation.y = d[3];
      cards.forEach((card, i) => {
        const order = (i - state.current.role + 3) % 3;
        const side = order === 0 ? 0 : order === 1 ? 1 : -1;
        card.position.x = THREE.MathUtils.damp(
          card.position.x,
          side * 2.6,
          6,
          dt,
        );
        card.position.y = THREE.MathUtils.damp(
          card.position.y,
          side ? 0 : 0.35,
          6,
          dt,
        );
        card.position.z = THREE.MathUtils.damp(
          card.position.z,
          side ? -0.7 : 0.4,
          6,
          dt,
        );
        card.rotation.z = THREE.MathUtils.damp(
          card.rotation.z,
          -side * 0.14,
          6,
          dt,
        );
        card.rotation.y = THREE.MathUtils.damp(
          card.rotation.y,
          -side * 0.2 + Math.sin(elapsed * 0.4 + i) * 0.035,
          6,
          dt,
        );
      });
      const m = interpolate(maskKeys, scroll);
      mask.position.set(m[0], m[1] + Math.sin(elapsed * 0.7) * 0.14, m[2]);
      mask.rotation.set(0.02, 0.42 + Math.sin(elapsed * 0.3) * 0.1, 0);
      const o = interpolate(orbKeys, scroll);
      oracle.position.set(o[0], o[1], o[2]);
      orb.position.y = 1.35 + Math.sin(elapsed * 0.8) * 0.07;
      orbit.rotation.z = elapsed * 0.12;
      flames.forEach(
        (f, i) => (f.scale.y = 1.9 + Math.sin(elapsed * 3 + i) * 0.2),
      );
      fireflies.rotation.y = elapsed * 0.015;
      const dawn =
        THREE.MathUtils.smoothstep(scroll, 7, 8) *
        (1 - THREE.MathUtils.smoothstep(scroll, 8.5, 9));
      (scene.background as THREE.Color).copy(nightColor).lerp(dawnColor, dawn);
      (scene.fog as THREE.FogExp2).color.copy(scene.background as THREE.Color);
      hemi.intensity = 1.4 + dawn * 1.8;
      key.intensity = 3.8 + dawn * 1.4;
      moon.position.y = 13 - dawn * 7;
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
