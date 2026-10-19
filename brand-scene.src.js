import * as THREE from 'three';

const canvas = document.getElementById('brand-scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.6;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(37, 1, 0.1, 100);
camera.position.set(0, 0, 12);
scene.add(new THREE.AmbientLight(0xb9e9bd, 2.1));
const key = new THREE.DirectionalLight(0xffffff, 4.5);
key.position.set(-4, 7, 8);
scene.add(key);
const rim = new THREE.DirectionalLight(0x9df675, 5.5);
rim.position.set(6, -1, -2);
scene.add(rim);

function markShape(vertices) {
  const shape = new THREE.Shape();
  vertices.forEach(([x, y], index) => {
    const px = x - 12;
    const py = 12 - y;
    if (index === 0) shape.moveTo(px, py);
    else shape.lineTo(px, py);
  });
  shape.closePath();
  return shape;
}
const bars = [
  [[5, 15.1034], [10.2096, 15.1034], [13.6257, 2], [8.41582, 2]],
  [[14.7901, 8.89655], [20, 8.89655], [16.5838, 22], [11.3743, 22]]
];
const front = new THREE.MeshPhysicalMaterial({
  color: 0x7cdb76, metalness: 0.48, roughness: 0.24,
  clearcoat: 0.6, clearcoatRoughness: 0.18, emissive: 0x153f1d, emissiveIntensity: 0.42
});
const side = new THREE.MeshStandardMaterial({ color: 0x205c32, metalness: 0.55, roughness: 0.34 });
const mark = new THREE.Group();
bars.forEach((points) => {
  const geometry = new THREE.ExtrudeGeometry(markShape(points), {
    depth: 1.1, steps: 1, bevelEnabled: true, bevelThickness: 0.15, bevelSize: 0.1, bevelSegments: 3
  });
  const mesh = new THREE.Mesh(geometry, [front, side]);
  mesh.castShadow = true;
  mark.add(mesh);
});
mark.scale.setScalar(0.2);
mark.position.set(2.65, 0, 0);
scene.add(mark);

const signalField = new THREE.Group();
scene.add(signalField);
const particles = [];
const links = [];
const particleMaterial = new THREE.MeshBasicMaterial({ color: 0xb8f0a1, transparent: true, opacity: 0.65 });
const particleGeometry = new THREE.IcosahedronGeometry(0.032, 0);
for (let i = 0; i < 70; i++) {
  const angle = i * 2.39996;
  const radius = 2.3 + Math.sqrt(i / 70) * 2.5;
  const dot = new THREE.Mesh(particleGeometry, particleMaterial);
  dot.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.7, ((i * 17) % 13 - 6) * 0.12 - 1);
  dot.userData.phase = angle;
  dot.userData.baseY = dot.position.y;
  signalField.add(dot);
  particles.push(dot);
  if (i % 3 === 0) {
    const points = [new THREE.Vector3(0, 0, -0.7), dot.position.clone()];
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({ color: 0x91d7a6, transparent: true, opacity: 0.12 })
    );
    signalField.add(line);
    links.push(line);
  }
}

let width = 0;
let height = 0;
function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();
let frames = 0;
let last = performance.now();
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
function animate(now) {
  const delta = Math.min(0.08, (now - last) / 1000);
  last = now;
  const isClients = window.__landingSection === 'clients';
  const visible = isClients && !document.hidden;
  if (visible) {
    const mobile = width < 760;
    const targetX = isClients ? 0 : mobile ? 0 : 2.65;
    const targetY = isClients ? mobile ? -0.6 : -0.8 : mobile ? -2.15 : 0;
    const targetScale = isClients ? mobile ? 0.105 : 0.17 : mobile ? 0.11 : 0.2;
    const ease = Math.min(1, delta * 5);
    mark.position.x += (targetX - mark.position.x) * ease;
    mark.position.y += (targetY - mark.position.y) * ease;
    mark.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), ease);
    signalField.position.x += ((isClients ? 0 : mobile ? 0 : 2.65) - signalField.position.x) * ease;
    signalField.position.y += ((isClients ? mobile ? -0.6 : -0.8 : mobile ? -2.15 : 0) - signalField.position.y) * ease;
    signalField.scale.setScalar(isClients ? mobile ? 0.55 : 0.72 : mobile ? 0.7 : 1);
    if (!reduced.matches) {
      mark.rotation.y = Math.sin(now * 0.00045) * 0.17 - 0.28;
      mark.rotation.x = Math.sin(now * 0.0003) * 0.06;
      for (const dot of particles) dot.position.y = dot.userData.baseY + Math.sin(now * 0.0007 + dot.userData.phase) * 0.065;
    }
    const showParticles = isClients ? 0.16 : 0.5;
    particleMaterial.opacity += (showParticles - particleMaterial.opacity) * ease;
    links.forEach((line) => { line.material.opacity += ((isClients ? 0.025 : 0.08) - line.material.opacity) * ease; });
    renderer.render(scene, camera);
    frames++;
  }
  requestAnimationFrame(animate);
}
window.__landing3d = { ready: true, get frames() { return frames; }, get mark() { return mark; }, camera, renderer };
requestAnimationFrame(animate);
