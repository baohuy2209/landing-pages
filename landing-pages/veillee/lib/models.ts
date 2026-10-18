import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
export function material(color: string, roughness = 0.65, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}
export function mesh(
  parent: THREE.Object3D,
  geometry: THREE.BufferGeometry,
  mat: THREE.Material,
  x = 0,
  y = 0,
  z = 0,
) {
  const object = new THREE.Mesh(geometry, mat);
  object.position.set(x, y, z);
  object.castShadow = true;
  object.receiveShadow = true;
  parent.add(object);
  return object;
}
export function box(
  parent: THREE.Object3D,
  w: number,
  h: number,
  d: number,
  mat: THREE.Material,
  x = 0,
  y = 0,
  z = 0,
  r = 0.04,
) {
  return mesh(parent, new RoundedBoxGeometry(w, h, d, 3, r), mat, x, y, z);
}
export function ellipsoid(
  parent: THREE.Object3D,
  mat: THREE.Material,
  x: number,
  y: number,
  z: number,
  sx: number,
  sy: number,
  sz: number,
) {
  const o = mesh(parent, new THREE.SphereGeometry(1, 40, 28), mat, x, y, z);
  o.scale.set(sx, sy, sz);
  return o;
}
export function makeWolf() {
  const root = new THREE.Group();
  const fur = new THREE.MeshPhysicalMaterial({
    color: "#4c5c56",
    roughness: 0.78,
    metalness: 0.12,
    clearcoat: 0.06,
  });
  const muzzle = material("#788578", 0.72, 0.08),
    black = material("#182320", 0.24);
  const amber = new THREE.MeshStandardMaterial({
    color: "#edc68b",
    emissive: "#fda443",
    emissiveIntensity: 0.75,
    roughness: 0.25,
  });
  // A connected, sculpted silhouette: lifted shoulders, long muzzle, hocks and brush tail.
  const torso = ellipsoid(root, fur, 0, 1.15, 0, 1.25, 0.55, 0.43);
  ellipsoid(root, fur, 0.77, 1.36, 0, 0.54, 0.72, 0.49).rotation.z = -0.24;
  ellipsoid(root, fur, -0.84, 1.11, 0, 0.49, 0.52, 0.42);
  const head = new THREE.Group();
  head.position.set(1.05, 1.8, 0);
  root.add(head);
  ellipsoid(head, fur, 0.1, 0.08, 0, 0.43, 0.46, 0.34);
  ellipsoid(head, muzzle, 0.44, -0.04, 0, 0.53, 0.15, 0.18).rotation.z = 0.1;
  ellipsoid(head, black, 0.98, -0.01, 0, 0.08, 0.07, 0.11);
  ellipsoid(head, fur, 0.42, -0.19, 0, 0.4, 0.08, 0.19);
  for (const s of [-1, 1]) {
    const earShape = new THREE.Shape();
    earShape.moveTo(-0.2, 0);
    earShape.quadraticCurveTo(-0.17, 0.27, 0, 0.49);
    earShape.quadraticCurveTo(0.16, 0.3, 0.2, 0.02);
    earShape.closePath();
    const ear = mesh(
      head,
      new THREE.ExtrudeGeometry(earShape, {
        depth: 0.08,
        bevelEnabled: true,
        bevelSize: 0.035,
        bevelThickness: 0.035,
        bevelSegments: 5,
        curveSegments: 20,
      }),
      fur,
      -0.04,
      0.34,
      s * 0.23,
    );
    ear.rotation.x = s * 0.14;
    ear.rotation.z = 0.08;
    ellipsoid(head, black, 0.33, 0.17, s * 0.27, 0.065, 0.045, 0.025);
    ellipsoid(head, amber, 0.36, 0.18, s * 0.294, 0.026, 0.023, 0.016);
  }
  const legs: THREE.Group[] = [];
  for (const x of [-0.8, 0.75])
    for (const z of [-0.3, 0.3]) {
      const leg = new THREE.Group();
      leg.position.set(x, 1.1, z);
      root.add(leg);
      ellipsoid(
        leg,
        fur,
        x < 0 ? -0.05 : 0,
        -0.32,
        0,
        0.19,
        0.47,
        0.18,
      ).rotation.z = x < 0 ? -0.3 : 0.05;
      const lower = ellipsoid(
        leg,
        fur,
        x < 0 ? -0.16 : 0.03,
        -0.75,
        0,
        0.09,
        0.34,
        0.105,
      );
      lower.rotation.z = x < 0 ? 0.24 : -0.05;
      ellipsoid(leg, fur, x < 0 ? -0.12 : 0.12, -1.03, 0, 0.19, 0.085, 0.13);
      legs.push(leg);
    }
  const tail = new THREE.Group();
  tail.position.set(-1.05, 1.22, 0);
  root.add(tail);
  // Tapered rings make a smooth continuous brush, attached at the haunch.
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(-0.45, -0.15, 0.05),
    new THREE.Vector3(-0.8, -0.5, 0.12),
    new THREE.Vector3(-1, -0.62, 0.2),
  ]);
  const tailGeo = new THREE.TubeGeometry(curve, 40, 0.2, 16, false);
  const attr = tailGeo.getAttribute("position");
  for (let i = 0; i <= 40; i++) {
    const c = curve.getPointAt(i / 40);
    const taper = 0.12 + Math.sin(Math.PI * (0.2 + (0.8 * i) / 40)) * 0.88;
    for (let j = 0; j <= 16; j++) {
      const n = i * 17 + j;
      attr.setXYZ(
        n,
        c.x + (attr.getX(n) - c.x) * taper,
        c.y + (attr.getY(n) - c.y) * taper,
        c.z + (attr.getZ(n) - c.z) * taper,
      );
    }
  }
  tailGeo.computeVertexNormals();
  mesh(tail, tailGeo, fur);
  return { root, head, legs, tail, torso };
}
export function cardTexture(type: number, renderer: THREE.WebGLRenderer) {
  const cv = document.createElement("canvas");
  cv.width = 512;
  cv.height = 768;
  const ctx = cv.getContext("2d")!;
  ctx.fillStyle = type === 0 ? "#652e25" : type === 1 ? "#c6b992" : "#293f3a";
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
  ctx.fillText(["THE WEREWOLF", "THE VILLAGER", "THE SEER"][type], 256, 635);
  ctx.font = "13px Georgia";
  ctx.fillText(
    ["KEEP YOUR SECRET", "TRUST YOUR INSTINCT", "LOOK A LITTLE CLOSER"][type],
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
