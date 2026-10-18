"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { motionAt, beginMove, arrivalPose } from "@/lib/motion";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { makeStage } from "@/lib/stage";
import { interpolate, ease } from "@/lib/journey";
import { pieceSquare, squarePosition, gameMoves } from "@/lib/chess";
import { studies as studyData } from "@/lib/studies";
type Props = {
  progress: React.RefObject<number>;
  paused: boolean;
  step: number;
  onReady: (ok: boolean) => void;
};
export default function World({ progress, paused, step, onReady }: Props) {
  const host = useRef<HTMLDivElement>(null),
    state = useRef({ paused, step });
  useEffect(() => {
    state.current = { paused, step };
  }, [paused, step]);
  useEffect(() => {
    if (!host.current) return;
    let stage: ReturnType<typeof makeStage>;
    try {
      stage = makeStage(host.current);
    } catch {
      onReady(false);
      return;
    }
    const { renderer, scene, camera, key, hemi, reduced, mobile } = stage;
    key.intensity = 3;
    hemi.intensity = 1.6;
    scene.environmentIntensity = 0.45;
    renderer.toneMappingExposure = 1;
    let disposed = false,
      frame = 0,
      last = performance.now(),
      elapsed = 0,
      current = progress.current;
    scene.background = new THREE.Color("#f3f1ec");
    scene.fog = new THREE.Fog("#f3f1ec", 45, 90);
    const ivory = new THREE.MeshPhysicalMaterial({
      color: "#cfc6b4",
      roughness: 0.25,
      clearcoat: 0.7,
      clearcoatRoughness: 0.2,
    });
    const obsidian = new THREE.MeshPhysicalMaterial({
      color: "#252d30",
      roughness: 0.29,
      clearcoat: 0.6,
    });
    const vermilion = new THREE.MeshPhysicalMaterial({
      color: "#ce3c23",
      roughness: 0.27,
      clearcoat: 0.7,
    });
    const brass = new THREE.MeshStandardMaterial({
      color: "#a49a7e",
      metalness: 0.75,
      roughness: 0.24,
    });
    const dark = new THREE.MeshStandardMaterial({
      color: "#292b2d",
      roughness: 0.6,
    });
    function add(
      parent: THREE.Object3D,
      g: THREE.BufferGeometry,
      m: THREE.Material,
      x = 0,
      y = 0,
      z = 0,
    ) {
      const mesh = new THREE.Mesh(g, m);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    }
    const ground = add(
      scene,
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshStandardMaterial({ color: "#e8e5df", roughness: 0.82 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    function rounded(
      parent: THREE.Object3D,
      w: number,
      h: number,
      d: number,
      m: THREE.Material,
      x = 0,
      y = 0,
      z = 0,
    ) {
      return add(parent, new RoundedBoxGeometry(w, h, d, 4, 0.045), m, x, y, z);
    }
    function turned(
      parent: THREE.Object3D,
      points: number[][],
      m: THREE.Material,
    ) {
      const curve = new THREE.SplineCurve(
        points.map((p) => new THREE.Vector2(p[0], p[1])),
      );
      const ps = curve
        .getPoints(72)
        .map((p) => new THREE.Vector2(Math.max(0, p.x), p.y));
      return add(parent, new THREE.LatheGeometry(ps, 64), m);
    }
    const contactCanvas = document.createElement("canvas");
    contactCanvas.width = contactCanvas.height = 64;
    const contactContext = contactCanvas.getContext("2d")!;
    const contactGradient = contactContext.createRadialGradient(
      32,
      32,
      8,
      32,
      32,
      32,
    );
    contactGradient.addColorStop(0, "rgba(25, 24, 22, .45)");
    contactGradient.addColorStop(0.6, "rgba(25, 24, 22, .2)");
    contactGradient.addColorStop(1, "rgba(25, 24, 22, 0)");
    contactContext.fillStyle = contactGradient;
    contactContext.fillRect(0, 0, 64, 64);
    const contactMaterial = new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(contactCanvas),
      transparent: true,
      depthWrite: false,
    });
    const contactGeometry = new THREE.PlaneGeometry(1.25, 1.25);
    function piece(type: string, m: THREE.Material) {
      const group = new THREE.Group();
      const contact = new THREE.Mesh(contactGeometry, contactMaterial.clone());
      contact.name = "contact-shadow";
      contact.rotation.x = -Math.PI / 2;
      contact.position.y = 0.005;
      group.add(contact);
      turned(
        group,
        [
          [0, 0],
          [0.36, 0],
          [0.45, 0.035],
          [0.48, 0.11],
          [0.47, 0.18],
          [0.39, 0.23],
          [0.35, 0.28],
          [0.31, 0.34],
          [0.28, 0.4],
          [0.21, 0.64],
          [0.16, 0.91],
          [0.19, 1.05],
          [0.27, 1.1],
          [0.28, 1.18],
          [0.2, 1.23],
          [0, 1.23],
        ],
        m,
      );
      turned(
        group,
        [
          [0.35, 0.24],
          [0.37, 0.26],
          [0.35, 0.285],
        ],
        brass,
      );
      if (type === "p")
        add(group, new THREE.SphereGeometry(0.285, 40, 28), m, 0, 1.37, 0);
      if (type === "r") {
        add(
          group,
          new THREE.CylinderGeometry(0.34, 0.28, 0.32, 48),
          m,
          0,
          1.33,
          0,
        );
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          const b = rounded(
            group,
            0.19,
            0.22,
            0.2,
            m,
            Math.sin(a) * 0.26,
            1.57,
            Math.cos(a) * 0.26,
          );
          b.rotation.y = a;
        }
      }
      if (type === "b") {
        // The mitre has an actual open notch, including its bevel and inner surface.
        const mitre = new THREE.Shape();
        mitre.moveTo(0, 1.18);
        mitre.bezierCurveTo(-0.49, 1.27, -0.34, 1.68, 0, 1.98);
        mitre.quadraticCurveTo(0.13, 1.85, 0.2, 1.71);
        mitre.lineTo(-0.015, 1.48);
        mitre.quadraticCurveTo(-0.045, 1.43, 0.015, 1.42);
        mitre.lineTo(0.265, 1.64);
        mitre.bezierCurveTo(0.43, 1.4, 0.31, 1.2, 0, 1.18);
        const geo = new THREE.ExtrudeGeometry(mitre, {
          depth: 0.24,
          bevelEnabled: true,
          bevelThickness: 0.07,
          bevelSize: 0.035,
          bevelSegments: 6,
          curveSegments: 48,
        });
        geo.translate(0, 0, -0.12);
        geo.deleteAttribute("normal");
        geo.deleteAttribute("uv");
        const smooth = mergeVertices(geo);
        smooth.computeVertexNormals();
        geo.dispose();
        add(group, smooth, m);
        add(group, new THREE.SphereGeometry(0.065, 24, 16), m, 0, 2.025, 0);
      }
      if (type === "q") {
        turned(
          group,
          [
            [0.2, 1.2],
            [0.23, 1.36],
            [0.33, 1.58],
            [0.37, 1.7],
            [0.3, 1.77],
            [0.19, 1.72],
            [0, 1.7],
          ],
          m,
        );
        for (let i = 0; i < 7; i++) {
          const a = (i / 7) * Math.PI * 2;
          add(
            group,
            new THREE.SphereGeometry(0.09, 20, 16),
            m,
            Math.sin(a) * 0.31,
            1.81,
            Math.cos(a) * 0.31,
          );
        }
        add(group, new THREE.SphereGeometry(0.1, 20, 16), m, 0, 1.89, 0);
      }
      if (type === "k") {
        turned(
          group,
          [
            [0.2, 1.2],
            [0.25, 1.45],
            [0.31, 1.62],
            [0.29, 1.7],
            [0.14, 1.78],
            [0, 1.78],
          ],
          m,
        );
        rounded(group, 0.13, 0.6, 0.14, m, 0, 1.99, 0);
        rounded(group, 0.43, 0.13, 0.14, m, 0, 2.07, 0);
      }
      if (type === "n") {
        const s = new THREE.Shape();
        s.moveTo(-0.35, 1.08);
        s.bezierCurveTo(-0.4, 1.45, -0.45, 1.65, -0.23, 1.96);
        s.lineTo(-0.2, 2.2);
        s.lineTo(-0.04, 2.08);
        s.quadraticCurveTo(0.2, 2.07, 0.3, 1.9);
        s.lineTo(0.55, 1.65);
        s.quadraticCurveTo(0.64, 1.45, 0.41, 1.43);
        s.lineTo(0.12, 1.5);
        s.quadraticCurveTo(-0.07, 1.37, 0.3, 1.08);
        s.closePath();
        const g = new THREE.ExtrudeGeometry(s, {
          depth: 0.35,
          bevelEnabled: true,
          bevelThickness: 0.085,
          bevelSize: 0.075,
          bevelSegments: 6,
          curveSegments: 48,
        });
        g.translate(0, 0, -0.175);
        g.deleteAttribute("normal");
        g.deleteAttribute("uv");
        const smooth = mergeVertices(g);
        smooth.computeVertexNormals();
        g.dispose();
        add(group, smooth, m);
        for (const side of [-1, 1])
          add(
            group,
            new THREE.SphereGeometry(0.037, 16, 12),
            dark,
            0.17,
            1.85,
            side * 0.26,
          );
        for (let j = 0; j < 5; j++) {
          const mane = rounded(
            group,
            0.08,
            0.045,
            0.4,
            m,
            -0.31 + j * 0.015,
            1.48 + j * 0.09,
            0,
          );
          mane.rotation.z = -0.3;
        }
      }
      return group;
    }
    const board = new THREE.Group();
    scene.add(board);
    rounded(board, 9.55, 0.45, 9.55, dark, 0, -0.17, 0);
    rounded(board, 9.36, 0.04, 9.36, brass, 0, 0.075, 0);
    const lightTile = new THREE.MeshStandardMaterial({
        color: "#d9d6ca",
        roughness: 0.46,
      }),
      darkTile = new THREE.MeshStandardMaterial({
        color: "#687272",
        roughness: 0.5,
      });
    const tileGeo = new THREE.BoxGeometry(1.12, 0.1, 1.12);
    for (let r = 0; r < 8; r++)
      for (let f = 0; f < 8; f++)
        add(
          board,
          tileGeo,
          (r + f) % 2 ? darkTile : lightTile,
          (f - 3.5) * 1.12,
          0.12,
          (r - 3.5) * 1.12,
        );
    const labels = document.createElement("canvas");
    labels.width = labels.height = 1024;
    const lc = labels.getContext("2d")!;
    lc.clearRect(0, 0, 1024, 1024);
    lc.fillStyle = "#c8c6bb";
    lc.font = "18px monospace";
    lc.textAlign = "center";
    for (let i = 0; i < 8; i++) {
      lc.fillText("abcdefgh"[i], (i + 0.5) * 112 + 64, 1010);
      lc.fillText(String(8 - i), 20, (i + 0.5) * 112 + 66);
    }
    const labelTexture = new THREE.CanvasTexture(labels);
    labelTexture.colorSpace = THREE.SRGBColorSpace;
    const labelPlane = add(
      board,
      new THREE.PlaneGeometry(9.55, 9.55),
      new THREE.MeshBasicMaterial({
        map: labelTexture,
        transparent: true,
        depthWrite: false,
      }),
      0,
      0.2,
      0,
    );
    labelPlane.rotation.x = -Math.PI / 2;
    const pieces: {
      object: THREE.Group;
      start: string;
      motion: ReturnType<typeof beginMove>;
      destination: string | null;
      materials: THREE.Material[];
      alpha: number;
    }[] = [];
    const back = ["r", "n", "b", "q", "k", "b", "n", "r"];
    // The board and its pieces travel together. Close-ups are independent sculptures.
    for (const white of [true, false])
      for (let i = 0; i < 16; i++) {
        const file = i % 8,
          rank = i < 8 ? (white ? 1 : 8) : white ? 2 : 7,
          type = i < 8 ? back[file] : "p",
          start = "abcdefgh"[file] + rank;
        const { object, materials } = sculpture(
          type,
          start === "d1" ? vermilion : white ? ivory : obsidian,
        );
        board.add(object);
        if (type === "n") object.rotation.y = white ? -0.35 : Math.PI - 0.35;
        const [x, z] = squarePosition(start);
        object.position.set(x, 0.171, z);
        pieces.push({
          object,
          materials,
          alpha: 1,
          start,
          destination: start,
          motion: beginMove([x, 0, z], [x, z], 0),
        });
      }
    function sculpture(type: string, mat: THREE.Material) {
      const object = piece(type, mat);
      const materials = new Map<THREE.Material, THREE.Material>();
      object.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          const source = o.material as THREE.Material;
          if (!materials.has(source)) materials.set(source, source.clone());
          o.material = materials.get(source)!;
          if (o.name === "contact-shadow") source.dispose();
        }
      });
      // Cloned contact materials are now owned by the sculpture; discard the unattached source.
      scene.add(object);
      return { object, materials: [...materials.values()] };
    }
    function opacity(item: ReturnType<typeof sculpture>, value: number) {
      item.materials.forEach((m) => {
        m.transparent = true;
        m.opacity = value;
        m.depthWrite = value > 0.98 && !(m instanceof THREE.MeshBasicMaterial);
      });
      item.object.visible = value > 0.0001;
    }
    const hero = ["g1", "a8", "d1"].map((id) =>
      pieces.find((p) => p.start === id)!,
    );
    const studies = ["p", "n", "b", "r", "q", "k"].map((type) =>
      sculpture(type, type === "q" ? vermilion : ivory),
    );
    const studyKeys = studies.map((_, i) =>
      Array.from({ length: 10 }, (_, chapter) => [
        3.2 + (i - (chapter - 2)) * 22,
      ]),
    );
    const boardKeys = [
      [38, 0],
      [0, 0],
      [-38, 0],
      [-38, -60],
      [38, -60],
      [38, 0],
      [38, 0],
      [38, 0],
      [0, 0],
      [0, 0],
    ];
    const distanceKeys = [
      [1.65],
      [1.95],
      [1.65],
      [1.65],
      [1.65],
      [1.65],
      [1.65],
      [1.65],
      [1.95],
      [1.95],
    ];
    const mobileFocusKeys = [
      [2.3],
      [0],
      [3.2],
      [3.2],
      [3.2],
      [3.2],
      [3.2],
      [3.2],
      [0],
      [0],
    ];
    // A single printed movement field per sculpture keeps the mobile draw cost small.
    const fields = studyData.map((data) => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 640;
      const ctx = canvas.getContext("2d")!;
      for (let row = 0; row < 5; row++)
        for (let col = 0; col < 5; col++) {
          const x = col * 128,
            y = row * 128;
          ctx.fillStyle =
            (col + row) % 2 ? "rgba(62,74,73,.045)" : "rgba(62,74,73,.09)";
          ctx.fillRect(x + 1, y + 1, 126, 126);
          ctx.strokeStyle = "rgba(62,74,73,.15)";
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 1, y + 1, 126, 126);
          if (data.moves.some(([a, b]) => a === col - 2 && b === row - 2)) {
            ctx.fillStyle = "rgba(198,62,38,.18)";
            ctx.fillRect(x + 4, y + 4, 120, 120);
            ctx.strokeStyle = "rgba(198,62,38,.6)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x + 64, y + 64, 13, 0, Math.PI * 2);
            ctx.stroke();
          }
          if (data.captures.some(([a, b]) => a === col - 2 && b === row - 2)) {
            ctx.strokeStyle = "rgba(198,62,38,.7)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x + 50, y + 50);
            ctx.lineTo(x + 78, y + 78);
            ctx.moveTo(x + 78, y + 50);
            ctx.lineTo(x + 50, y + 78);
            ctx.stroke();
          }
        }
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(
        8,
        renderer.capabilities.getMaxAnisotropy(),
      );
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        opacity: 0,
      });
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(11, 11), material);
      plane.rotation.x = -Math.PI / 2;
      scene.add(plane);
      return plane;
    });
    const moveHighlights = [0, 1].map(() => {
      const mat = new THREE.MeshBasicMaterial({
        color: "#c63e26",
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const tile = new THREE.Mesh(new THREE.PlaneGeometry(1.09, 1.09), mat);
      tile.rotation.x = -Math.PI / 2;
      board.add(tile);
      return tile;
    });
    const cameraKeys = [
      [16, 10, 24, -3.3, 2, 0],
      [14, 21, 20, -4.8, 0.7, 0],
      [13, 10, 24, -3.6, 1.9, 0],
      [13, 10, 24, -3.6, 2.1, 0],
      [16, 14, 24, -3.6, 1.7, 0],
      [14, 14, 24, -3.6, 1.5, 0],
      [12, 10, 24, -3.6, 2.1, 0],
      [14, 11, 25, -3.6, 1.7, 0],
      [13, 18, 18, -3.3, 0, 0],
      [12, 23, 15, -3.8, 0, 0],
    ];
    const look = new THREE.Vector3();
    function render(now: number) {
      if (disposed || document.hidden) return;
      const dt = Math.min(0.064, (now - last) / 1000);
      last = now;
      if (!state.current.paused && !reduced.matches) elapsed += dt;
      current = reduced.matches
        ? progress.current
        : THREE.MathUtils.damp(current, progress.current, 10, dt);
      const k = interpolate(cameraKeys, current),
        distance = mobile.matches
          ? interpolate(distanceKeys, current)[0] *
            Math.max(1, 0.48 / camera.aspect)
          : 1;
      camera.position.set(k[0] * distance, k[1] * distance, k[2] * distance);
      look.set(
        mobile.matches ? interpolate(mobileFocusKeys, current)[0] : k[3],
        k[4],
        k[5],
      );
      camera.lookAt(look);
      const boardPose = interpolate(boardKeys, current);
      board.position.set(boardPose[0], -0.105, boardPose[1]);
      studies.forEach((item, i) => {
        const x = interpolate(studyKeys[i], current)[0],
          visibility = 1 - ease((Math.abs(x - 3.2) - 3) / 12);
        item.object.position.set(x, -0.5, 1.5);
        item.object.scale.setScalar(2.8);
        item.object.rotation.y = i === 1 ? -0.35 : i === 2 ? -0.12 : 0;
        let jump = 0;
        if (i === 1 && !reduced.matches) {
          const weight = ease(1 - Math.abs(current - 3) * 1.6),
            cycle = (elapsed % 8) / 8;
          const journey =
            ease((cycle - 0.18) / 0.28) * (1 - ease((cycle - 0.68) / 0.25));
          item.object.position.x += ease(journey / 0.67) * 4.4 * weight;
          item.object.position.z +=
            ease((journey - 0.67) / 0.33) * 2.2 * weight;
          jump = Math.sin(Math.PI * journey) * 0.7 * weight;
          item.object.position.y += jump;
        }
        opacity(item, visibility);
        fields[i].position.set(x, -0.488, 1.5);
        fields[i].material.opacity = visibility * 0.8;
        fields[i].visible = visibility > 0.001;
        const contact = item.object.getObjectByName(
          "contact-shadow",
        ) as THREE.Mesh;
        contact.position.y = (0.005 - jump) / 2.8;
        contact.scale.setScalar(1 + jump * 0.3);
        (contact.material as THREE.MeshBasicMaterial).opacity =
          visibility * (1 - jump * 0.45);
      });
      pieces.forEach((p) => {
        const destination =
          current < 8.15 ? p.start : pieceSquare(p.start, state.current.step);
        if (destination !== p.destination) {
          if (destination)
            p.motion = beginMove(
              motionAt(p.motion, now / 1000),
              squarePosition(destination),
              now / 1000,
            );
          p.destination = destination;
        }
        const pos = motionAt(
          p.motion,
          reduced.matches ? now / 1000 + 1 : now / 1000,
        );
        p.alpha = reduced.matches
          ? Number(destination !== null)
          : THREE.MathUtils.damp(p.alpha, Number(destination !== null), 16, dt);
        opacity(p, p.alpha);
        p.object.scale.setScalar(0.92 + 0.08 * p.alpha);
        p.object.position.set(
          pos[0],
          0.171 + pos[1] + (1 - p.alpha) * 0.25,
          pos[2],
        );
        const contact = p.object.getObjectByName(
          "contact-shadow",
        ) as THREE.Mesh;
        contact.position.y = 0.002 - pos[1] - (1 - p.alpha) * 0.25;
        contact.scale.setScalar(1 + pos[1] * 0.35);
        (contact.material as THREE.MeshBasicMaterial).opacity =
          p.alpha * (1 - pos[1] * 0.5);
      });
      // No swaps or duplicates: the three hero pieces land on their own squares.
      if (current < 1)
        hero.forEach((p, i) => {
          const pose = arrivalPose(current, i, squarePosition(p.start));
          p.object.position.set(
            pose.x - board.position.x,
            pose.y - board.position.y,
            pose.z - board.position.z,
          );
          p.object.scale.setScalar(pose.scale);
          const contact = p.object.getObjectByName(
            "contact-shadow",
          ) as THREE.Mesh;
          contact.position.y = (pose.surface - pose.y + 0.005) / pose.scale;
          contact.scale.setScalar(1 + (pose.y - pose.surface) * 0.25);
          (contact.material as THREE.MeshBasicMaterial).opacity = Math.max(
            0.18,
            1 - (pose.y - pose.surface) * 0.2,
          );
        });
      const move = gameMoves[state.current.step - 1];
      moveHighlights.forEach((tile, i) => {
        tile.material.opacity = ease((current - 8.4) / 0.6) * (move ? 0.32 : 0);
        if (move) {
          const [x, z] = squarePosition(i === 0 ? move.from : move.to);
          tile.position.set(x, 0.176, z);
        }
      });
      key.position.x = -8 + Math.sin(elapsed * 0.18) * 0.3;
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
