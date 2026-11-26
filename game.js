import * as THREE from './lib/three.module.min.js';

/* ==========================================================================
   RING DROP 3D — High-Craft Three.js PBR Weapon Ball Battle Arena
   ========================================================================== */

const mount = document.getElementById('threeMount');
const overlayLayer = document.getElementById('overlayLayer');

// Renderer with real tone mapping & soft shadows
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;
mount.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#10141d');
scene.fog = new THREE.Fog('#10141d', 28, 62);

// Elevated Sports Broadcast 3D Camera (balanced nicely above the bottom Gift Board)
const camera = new THREE.PerspectiveCamera(38, 9 / 16, 0.5, 140);
const baseCamPos = new THREE.Vector3(0, 32.0, 25.5);
const camTarget = new THREE.Vector3(0, -1.8, 1.2);
camera.position.copy(baseCamPos);
camera.lookAt(camTarget);

// Procedural Studio Softbox Environment Map (gives realistic metallic/glass reflections!)
function createStudioEnvMap() {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color('#141923');

  const panelGeo = new THREE.PlaneGeometry(18, 18);
  const topLight = new THREE.Mesh(panelGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
  topLight.position.set(0, 14, 0);
  topLight.rotation.x = Math.PI / 2;
  envScene.add(topLight);

  const warmPanel = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), new THREE.MeshBasicMaterial({ color: 0xffe4c4, side: THREE.DoubleSide }));
  warmPanel.position.set(14, 6, 8);
  warmPanel.lookAt(0, 0, 0);
  envScene.add(warmPanel);

  const coolPanel = new THREE.Mesh(new THREE.PlaneGeometry(16, 10), new THREE.MeshBasicMaterial({ color: 0x7dd3fc, side: THREE.DoubleSide }));
  coolPanel.position.set(-15, 5, -6);
  coolPanel.lookAt(0, 0, 0);
  envScene.add(coolPanel);

  const rimStrip = new THREE.Mesh(new THREE.PlaneGeometry(20, 3), new THREE.MeshBasicMaterial({ color: 0xff7043, side: THREE.DoubleSide }));
  rimStrip.position.set(0, -5, -14);
  rimStrip.lookAt(0, 0, 0);
  envScene.add(rimStrip);

  const envRT = pmrem.fromScene(envScene, 0.04);
  pmrem.dispose();
  return envRT.texture;
}
scene.environment = createStudioEnvMap();

// Studio 3-Point Lighting + Real Shadows
const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 0.65);
scene.add(hemiLight);

const keyLight = new THREE.DirectionalLight(0xfff8f0, 2.2);
keyLight.position.set(10, 22, 12);
keyLight.castShadow = true;
keyLight.shadow.mapSize.width = 2048;
keyLight.shadow.mapSize.height = 2048;
keyLight.shadow.camera.near = 6;
keyLight.shadow.camera.far = 48;
const shadowBound = 13;
keyLight.shadow.camera.left = -shadowBound;
keyLight.shadow.camera.right = shadowBound;
keyLight.shadow.camera.top = shadowBound;
keyLight.shadow.camera.bottom = -shadowBound;
keyLight.shadow.bias = -0.0005;
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0x60a5fa, 1.0);
rimLight.position.set(-12, 10, -14);
scene.add(rimLight);

const underGlowLight = new THREE.PointLight(0xff5b37, 2.2, 24);
underGlowLight.position.set(0, -4.5, 0);
scene.add(underGlowLight);

// Resize handler
function handleResize() {
  const rect = mount.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
  renderer.setSize(rect.width, rect.height, false);
}
new ResizeObserver(handleResize).observe(mount);
handleResize();

// ==========================================================================
// ARCHITECTURAL 3D MULTI-RING ARENA (Collapsible Modular Wedges!)
// ==========================================================================
const RING_SPECS = [
  { id: 0, innerR: 0, outerR: 4.5, segments: 1, color: '#1e2534', accent: '#334155', metalness: 0.55, roughness: 0.34 },
  { id: 1, innerR: 4.58, outerR: 6.85, segments: 10, color: '#262f42', accent: '#475569', metalness: 0.42, roughness: 0.38 },
  { id: 2, innerR: 6.93, outerR: 9.0, segments: 14, color: '#1a202d', accent: '#ff5b37', metalness: 0.52, roughness: 0.35 }
];

const arenaGroup = new THREE.Group();
scene.add(arenaGroup);

// Subtle architectural structural rings floating in background depth
const bgRingMat = new THREE.MeshStandardMaterial({ color: '#1b2333', metalness: 0.7, roughness: 0.35 });
const outerFrameRing = new THREE.Mesh(new THREE.TorusGeometry(12.8, 0.08, 12, 64), bgRingMat);
outerFrameRing.rotation.x = Math.PI / 2;
outerFrameRing.position.y = -2.2;
scene.add(outerFrameRing);

const outerFrameRing2 = new THREE.Mesh(new THREE.TorusGeometry(15.2, 0.04, 12, 64), bgRingMat);
outerFrameRing2.rotation.x = Math.PI / 2;
outerFrameRing2.position.y = -4.5;
scene.add(outerFrameRing2);

// Center subtle frosted glass emblem + metallic trim
function createCoreTopTexture() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#1b2231';
  g.fillRect(0, 0, 512, 512);

  // Subtle radial brushed lines
  g.strokeStyle = 'rgba(255,255,255,0.06)';
  g.lineWidth = 2;
  for (const r of [72, 150, 224]) {
    g.beginPath();
    g.arc(256, 256, r, 0, Math.PI * 2);
    g.stroke();
  }
  // Crosshairs
  g.strokeStyle = 'rgba(255,255,255,0.05)';
  g.beginPath();
  g.moveTo(256, 20); g.lineTo(256, 492);
  g.moveTo(20, 256); g.lineTo(492, 256);
  g.stroke();

  // Center brushed ring
  g.strokeStyle = 'rgba(255, 91, 55, 0.45)';
  g.lineWidth = 4;
  g.beginPath();
  g.arc(256, 256, 36, 0, Math.PI * 2);
  g.stroke();

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  return tex;
}
const coreTopTex = createCoreTopTexture();

let ringTiles = []; // { ringId, mesh, state: 'solid'|'shaking'|'falling'|'gone', vy, rx, rz, basePos, delay }

function buildArena() {
  while (arenaGroup.children.length) {
    const ch = arenaGroup.children[0];
    arenaGroup.remove(ch);
  }
  ringTiles = [];

  // Ring 0: Solid central cylindrical slab + metallic bevel rim
  const coreGeo = new THREE.CylinderGeometry(RING_SPECS[0].outerR, RING_SPECS[0].outerR * 0.96, 0.9, 48);
  const coreMatTop = new THREE.MeshStandardMaterial({
    map: coreTopTex,
    metalness: 0.48,
    roughness: 0.34
  });
  const coreMatSide = new THREE.MeshStandardMaterial({ color: '#141925', metalness: 0.72, roughness: 0.28 });
  const coreMesh = new THREE.Mesh(coreGeo, [coreMatSide, coreMatTop, coreMatSide]);
  coreMesh.position.y = -0.45;
  coreMesh.receiveShadow = true;
  coreMesh.castShadow = true;
  arenaGroup.add(coreMesh);

  // Subtle recessed metallic divider ring
  const rim0 = new THREE.Mesh(
    new THREE.TorusGeometry(RING_SPECS[0].outerR, 0.045, 10, 64),
    new THREE.MeshStandardMaterial({ color: '#64748b', metalness: 0.85, roughness: 0.2 })
  );
  rim0.rotation.x = Math.PI / 2;
  rim0.position.y = 0.01;
  arenaGroup.add(rim0);

  // Rings 1 & 2: Individual beveled 3D wedge tiles that shake & fall off!
  for (let rIdx = 1; rIdx < RING_SPECS.length; rIdx++) {
    const spec = RING_SPECS[rIdx];
    const step = (Math.PI * 2) / spec.segments;
    const gap = 0.032;

    for (let s = 0; s < spec.segments; s++) {
      const a0 = s * step + gap;
      const a1 = (s + 1) * step - gap;
      const shape = new THREE.Shape();
      shape.absarc(0, 0, spec.outerR, a0, a1, false);
      shape.absarc(0, 0, spec.innerR, a1, a0, true);
      shape.closePath();

      const extrudeGeo = new THREE.ExtrudeGeometry(shape, {
        depth: 0.68,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.04,
        bevelSegments: 2,
        curveSegments: 8
      });
      // Rotate so shape lies flat in XZ plane, top surface at y = 0
      extrudeGeo.rotateX(Math.PI / 2);

      // Compute centroid so each wedge tumbles naturally around its own center
      const midA = (a0 + a1) * 0.5;
      const midR = (spec.innerR + spec.outerR) * 0.5;
      const cx = Math.cos(midA) * midR;
      const cz = Math.sin(midA) * midR;
      extrudeGeo.translate(-cx, 0, -cz);

      const mat = new THREE.MeshStandardMaterial({
        color: s % 2 === 0 ? spec.color : '#212838',
        metalness: spec.metalness,
        roughness: spec.roughness,
        emissive: new THREE.Color('#000000'),
        emissiveIntensity: 0
      });

      const tile = new THREE.Mesh(extrudeGeo, mat);
      tile.position.set(cx, -0.05, cz);
      tile.receiveShadow = true;
      tile.castShadow = true;

      // Crisp metallic outer lip trim on outermost ring
      if (rIdx === 2) {
        const arcShape = new THREE.Shape();
        arcShape.absarc(0, 0, spec.outerR - 0.04, a0 + 0.01, a1 - 0.01, false);
        arcShape.absarc(0, 0, spec.outerR - 0.16, a1 - 0.01, a0 + 0.01, true);
        const trimGeo = new THREE.ExtrudeGeometry(arcShape, { depth: 0.03, bevelEnabled: false, curveSegments: 6 });
        trimGeo.rotateX(Math.PI / 2);
        trimGeo.translate(-cx, 0.06, -cz);
        const trimMesh = new THREE.Mesh(
          trimGeo,
          new THREE.MeshStandardMaterial({
            color: '#ff5b37',
            emissive: '#ff4d2e',
            emissiveIntensity: 0.45,
            roughness: 0.3,
            metalness: 0.5
          })
        );
        tile.add(trimMesh);
      }

      arenaGroup.add(tile);
      ringTiles.push({
        ringId: rIdx,
        mesh: tile,
        mat,
        state: 'solid',
        vy: 0,
        rx: (Math.random() - 0.5) * 3.5,
        rz: (Math.random() - 0.5) * 3.5,
        baseX: cx,
        baseZ: cz,
        shakePhase: Math.random() * Math.PI * 2,
        delay: Math.random() * 0.4
      });
    }
  }
}

// ==========================================================================
// 3D FIGHTER FACTORY (PBR Ceramic/Metal Spheres + Machined 3D Weapons)
// ==========================================================================
const FIGHTER_PALETTES = [
  { hex: '#ff4d2e', band: '#111827', name: 'Vermilion' },
  { hex: '#2563eb', band: '#f8fafc', name: 'Cobalt' },
  { hex: '#06b6d4', band: '#0f172a', name: 'Cyan' },
  { hex: '#a3e635', band: '#141820', name: 'Acid' },
  { hex: '#f1f5f9', band: '#ff4d2e', name: 'Pearl' },
  { hex: '#f59e0b', band: '#18181b', name: 'Amber' },
  { hex: '#e11d48', band: '#f8fafc', name: 'Crimson' },
  { hex: '#8b5cf6', band: '#f8fafc', name: 'Indigo' }
];

const VIEWER_NAMES = [
  'Minh Anh', 'Khang Vũ', 'Huy Shadow', 'Linh Nhi', 'Tuấn Kiệt', 'Bảo Trâm',
  'Đức Mạnh', 'Gia Hân', 'Hoàng Nam', 'Phong Trần', 'Thảo Vy', 'Quỳnh Anh',
  'Khánh Linh', 'Duy Khang', 'Ngọc Diệp', 'Tùng Lâm', 'Sơn Bách', 'An Nhiên'
];

const chromeMat = new THREE.MeshStandardMaterial({
  color: '#e2e8f0',
  metalness: 0.94,
  roughness: 0.14
});

const gunmetalMat = new THREE.MeshStandardMaterial({
  color: '#1e2430',
  metalness: 0.85,
  roughness: 0.28
});

const goldMat = new THREE.MeshStandardMaterial({
  color: '#f5b942',
  metalness: 0.95,
  roughness: 0.16,
  emissive: '#92400e',
  emissiveIntensity: 0.2
});

function createSphereTexture(baseHex, bandHex, initials, isTitan = false) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 256;
  const g = c.getContext('2d');

  g.fillStyle = isTitan ? '#12151e' : baseHex;
  g.fillRect(0, 0, 512, 256);

  // Sleek machined equatorial racing stripe
  g.fillStyle = isTitan ? '#f5b942' : bandHex;
  g.fillRect(0, 102, 512, 52);

  // Subtle thin accent pin-stripes
  g.fillStyle = isTitan ? '#fff4cc' : 'rgba(255,255,255,0.45)';
  g.fillRect(0, 96, 512, 4);
  g.fillRect(0, 156, 512, 4);

  // Bold geometric monogram stamped on 2 sides
  g.fillStyle = isTitan ? '#0f131a' : baseHex;
  g.font = '800 38px "Space Grotesk", sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(initials, 128, 129);
  g.fillText(initials, 384, 129);

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  return tex;
}

function buildWeaponRig(weaponType, radius) {
  const rig = new THREE.Group();

  // Machined collar ring around equator
  const collarMat = weaponType === 'TITAN' ? goldMat : gunmetalMat;
  const collar = new THREE.Mesh(new THREE.TorusGeometry(radius + 0.11, 0.065, 10, 32), collarMat);
  collar.rotation.x = Math.PI / 2;
  collar.castShadow = true;
  rig.add(collar);

  let weaponReach = radius + 0.55;

  if (weaponType === 'BLADE' || weaponType === 'TITAN') {
    const count = weaponType === 'TITAN' ? 4 : 2;
    const bladeLen = weaponType === 'TITAN' ? 1.45 : 1.05;
    weaponReach = radius + bladeLen;

    // Tapered sleek beveled sword blade shape
    const bShape = new THREE.Shape();
    bShape.moveTo(0, -0.09);
    bShape.lineTo(bladeLen * 0.78, -0.14);
    bShape.lineTo(bladeLen, 0.02);
    bShape.lineTo(bladeLen * 0.72, 0.11);
    bShape.lineTo(0, 0.09);
    bShape.closePath();

    const bGeo = new THREE.ExtrudeGeometry(bShape, {
      depth: 0.05,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2
    });
    bGeo.rotateX(Math.PI / 2);

    const bladeMaterial = weaponType === 'TITAN' ? goldMat : chromeMat;
    for (let i = 0; i < count; i++) {
      const holder = new THREE.Group();
      holder.rotation.y = (Math.PI * 2 * i) / count;
      const blade = new THREE.Mesh(bGeo, bladeMaterial);
      blade.position.set(radius + 0.05, 0.03, 0);
      blade.castShadow = true;
      holder.add(blade);
      rig.add(holder);
    }
  } else if (weaponType === 'MACE') {
    const spikeCount = 5;
    weaponReach = radius + 0.78;
    const spikeGeo = new THREE.ConeGeometry(0.18, 0.72, 8);
    spikeGeo.rotateZ(-Math.PI / 2);

    for (let i = 0; i < spikeCount; i++) {
      const holder = new THREE.Group();
      holder.rotation.y = (Math.PI * 2 * i) / spikeCount;
      const spike = new THREE.Mesh(spikeGeo, chromeMat);
      spike.position.set(radius + 0.42, 0, 0);
      spike.castShadow = true;
      holder.add(spike);
      rig.add(holder);
    }
  } else if (weaponType === 'SAW') {
    const teeth = 10;
    weaponReach = radius + 0.62;
    const toothGeo = new THREE.ConeGeometry(0.15, 0.52, 4);
    toothGeo.rotateZ(-Math.PI / 2);

    for (let i = 0; i < teeth; i++) {
      const holder = new THREE.Group();
      holder.rotation.y = (Math.PI * 2 * i) / teeth;
      const tooth = new THREE.Mesh(toothGeo, chromeMat);
      tooth.position.set(radius + 0.34, 0, 0);
      tooth.rotation.y = 0.35; // angled saw bite
      tooth.castShadow = true;
      holder.add(tooth);
      rig.add(holder);
    }
  }

  return { rig, weaponReach };
}

// ==========================================================================
// GAME STATE & ENTITIES
// ==========================================================================
const fighters = [];
const buffs = [];
const bombs = [];
const sparks = [];
const shockwaves = [];
const winCounts = new Map();

const state = {
  round: 1,
  activeOuterRing: 2, // 2 -> 1 -> 0
  shrinkTimer: 16,
  shrinkDuration: 16,
  ringWarningActive: false,
  warningTickTimer: 0,
  hitStop: 0,
  shake: 0,
  roundOver: false,
  nextRoundTimer: 0,
  autoLive: true,
  pace: 'normal',
  autoTimer: 0.8,
  hypeTimer: 12,
  viewers: 3420
};

// DOM Refs
const elRoundNum = document.getElementById('roundNum');
const elAliveCount = document.getElementById('aliveCount');
const elShrinkLabel = document.getElementById('shrinkLabel');
const elShrinkTimer = document.getElementById('shrinkTimer');
const elShrinkFill = document.getElementById('shrinkFill');
const elGiftSpotlightWrap = document.getElementById('giftSpotlightWrap');
const elKillFeed = document.getElementById('killFeed');
const elCenterCallout = document.getElementById('centerCallout');
const elMcSubtitle = document.getElementById('mcSubtitle');
const elMcSubtitleText = document.getElementById('mcSubtitleText');
const elGiftBoard = document.getElementById('giftBoard');
const elViewerCount = document.getElementById('viewerCount');
const elWinnerModal = document.getElementById('winnerModal');
const elWinRound = document.getElementById('winRound');
const elWinnerName = document.getElementById('winnerName');
const elWinnerKills = document.getElementById('winnerKills');
const elWinnerWeapon = document.getElementById('winnerWeapon');
const elNextRoundSec = document.getElementById('nextRoundSec');
const elLbList = document.getElementById('lbList');

// Connect live MC Voice Subtitle bar
window.arenaVoice.onSubtitle = (text) => {
  if (!text) {
    elMcSubtitle.classList.add('hidden');
  } else {
    elMcSubtitleText.textContent = text;
    elMcSubtitle.classList.remove('hidden');
  }
};

function showGiftSpotlight({ icon, userName, giftLabel, effectText, tierClass = '' }) {
  const card = document.createElement('div');
  card.className = `gift-spotlight ${tierClass}`;
  card.innerHTML = `
    <div class="gs-avatar">${icon}</div>
    <div class="gs-body">
      <span class="gs-thanks">CẢM ƠN TẶNG QUÀ!</span>
      <span class="gs-main">${userName} vừa tặng ${giftLabel}</span>
      <span class="gs-effect">${effectText}</span>
    </div>
  `;
  elGiftSpotlightWrap.innerHTML = '';
  elGiftSpotlightWrap.appendChild(card);
  clearTimeout(showGiftSpotlight._t);
  showGiftSpotlight._t = setTimeout(() => {
    if (card.parentNode) card.remove();
  }, 3600);
}

function getActiveArenaRadius() {
  return RING_SPECS[state.activeOuterRing].outerR;
}

function randomViewerName() {
  return VIEWER_NAMES[Math.floor(Math.random() * VIEWER_NAMES.length)];
}

function pushKillFeed(html, cls = '') {
  const item = document.createElement('div');
  item.className = `kill-item ${cls}`;
  item.innerHTML = html;
  elKillFeed.appendChild(item);
  while (elKillFeed.children.length > 4) elKillFeed.removeChild(elKillFeed.firstChild);
  setTimeout(() => {
    if (item.parentNode) item.parentNode.removeChild(item);
  }, 4500);
}

function showCallout(text, cls = '') {
  elCenterCallout.innerHTML = `<div class="callout-pill ${cls}">${text}</div>`;
  clearTimeout(showCallout._t);
  showCallout._t = setTimeout(() => {
    elCenterCallout.innerHTML = '';
  }, 2400);
}

function spawnHitPop(worldPos, text, cls = '') {
  const v = worldPos.clone().project(camera);
  if (v.z > 1) return;
  const x = (v.x * 0.5 + 0.5) * mount.clientWidth;
  const y = (-v.y * 0.5 + 0.5) * mount.clientHeight;
  const el = document.createElement('div');
  el.className = `hit-pop ${cls}`;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.textContent = text;
  overlayLayer.appendChild(el);
  setTimeout(() => el.remove(), 780);
}

// ==========================================================================
// 3D FX: SPARKS & SHOCKWAVES
// ==========================================================================
const sparkGeo = new THREE.BoxGeometry(0.08, 0.08, 0.34);

function emitSparks(pos, count = 14, colorHex = '#ffaa33', speedMult = 1) {
  for (let i = 0; i < count; i++) {
    const mat = new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? '#ffffff' : colorHex });
    const mesh = new THREE.Mesh(sparkGeo, mat);
    mesh.position.copy(pos);
    const angle = Math.random() * Math.PI * 2;
    const spd = (4 + Math.random() * 9) * speedMult;
    const vx = Math.cos(angle) * spd;
    const vy = 3.5 + Math.random() * 6.5;
    const vz = Math.sin(angle) * spd;
    scene.add(mesh);
    sparks.push({ mesh, mat, vx, vy, vz, life: 0.35 + Math.random() * 0.25, maxLife: 0.6 });
  }
}

function emitShockwave(x, z, maxR = 4.2, colorHex = '#ffffff') {
  const geo = new THREE.RingGeometry(0.25, 0.48, 40);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({
    color: colorHex,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, 0.06, z);
  scene.add(mesh);
  shockwaves.push({ mesh, geo, mat, scale: 1, maxScale: maxR * 2.1, life: 0.42, maxLife: 0.42 });
}

// ==========================================================================
// SPAWN ACTIONS
// ==========================================================================
function spawnFighter(weaponType = 'BLADE', customName = null, dropX = null, dropZ = null, announceGift = false) {
  if (state.roundOver) return;
  if (fighters.filter(f => f.alive).length >= 12 && weaponType !== 'TITAN') return;

  const isTitan = weaponType === 'TITAN';
  const name = customName || randomViewerName();
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const pal = isTitan
    ? { hex: '#f5b942', band: '#12151e' }
    : FIGHTER_PALETTES[Math.floor(Math.random() * FIGHTER_PALETTES.length)];

  const radius = isTitan ? 1.05 : 0.72;
  const mass = isTitan ? 3.2 : weaponType === 'MACE' ? 1.35 : 1.0;

  const root = new THREE.Group();

  // Tactile Clearcoat Ceramic/Metal Ball
  const ballTex = createSphereTexture(pal.hex, pal.band, initials, isTitan);
  const ballMat = new THREE.MeshPhysicalMaterial({
    map: ballTex,
    metalness: isTitan ? 0.78 : 0.35,
    roughness: isTitan ? 0.2 : 0.22,
    clearcoat: 0.95,
    clearcoatRoughness: 0.1
  });
  const ballMesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 36, 28), ballMat);
  ballMesh.castShadow = true;
  ballMesh.receiveShadow = true;
  root.add(ballMesh);

  // Rotating 3D Machined Weapon Ring
  const { rig, weaponReach } = buildWeaponRig(weaponType, radius);
  root.add(rig);

  // Drop position safely inside current arena
  const maxSpawnR = Math.max(1.6, getActiveArenaRadius() - 2.0);
  const a = Math.random() * Math.PI * 2;
  const d = Math.sqrt(Math.random()) * maxSpawnR;
  const x = dropX !== null ? dropX : Math.cos(a) * d;
  const z = dropZ !== null ? dropZ : Math.sin(a) * d;

  root.position.set(x, 9.5, z);
  scene.add(root);

  // Crisp projected HTML tag
  const tagEl = document.createElement('div');
  tagEl.className = `fighter-tag ${isTitan ? 'titan' : ''}`;
  tagEl.innerHTML = `<span class="fighter-dot" style="background:${pal.hex}"></span><span>${name}</span><span class="fighter-kills"></span>`;
  overlayLayer.appendChild(tagEl);

  const fighter = {
    name,
    weaponType,
    colorHex: pal.hex,
    root,
    ballMesh,
    weaponRig: rig,
    tagEl,
    radius,
    baseRadius: radius,
    weaponReach,
    mass,
    x,
    y: 9.5,
    z,
    vx: (Math.random() - 0.5) * 3.5,
    vy: -2.0,
    vz: (Math.random() - 0.5) * 3.5,
    spinSpeed: weaponType === 'SAW' ? 11.5 : isTitan ? 5.2 : weaponType === 'BLADE' ? 7.8 : 6.2,
    spinDir: Math.random() < 0.5 ? 1 : -1,
    grounded: false,
    alive: true,
    fallingOff: false,
    kills: 0,
    lastHitBy: null,
    lastHitTime: 0,
    hitFlash: 0,
    scale: 1
  };

  fighters.push(fighter);
  updateAliveHUD();

  if (isTitan) {
    window.arenaAudio.playGiftFanfare(3);
    showCallout(`BOSS TITAN: ${name.toUpperCase()} XUẤT TRẬN!`, 'gold');
    pushKillFeed(`<b>${name}</b> tặng 🦁 <b>TITAN VÀNG</b>`, 'gold');
    showGiftSpotlight({
      icon: '🦁',
      userName: name,
      giftLabel: 'Sư Tử / Thiên Hà',
      effectText: 'Triệu hồi BOSS TITAN VÀNG • 4 Đại Kiếm!',
      tierClass: 'tier-titan'
    });
    window.arenaVoice.announceGift(name, 'titan');
  } else if (announceGift && weaponType === 'SAW') {
    window.arenaAudio.playGiftFanfare(1);
    pushKillFeed(`<b>${name}</b> tặng 🌹 <b>Bi Lưỡi Cưa</b>`, 'cyan');
    showGiftSpotlight({
      icon: '🌹',
      userName: name,
      giftLabel: 'Hoa Hồng',
      effectText: 'Lên sàn Bi Lưỡi Cưa tốc độ cao!',
      tierClass: 'tier-rose'
    });
    window.arenaVoice.announceGift(name, 'rose');
  } else if (announceGift && weaponType === 'MACE') {
    window.arenaAudio.playGiftFanfare(1);
    pushKillFeed(`<b>${name}</b> Follow • <b>Bi Chùy Gai</b>`, 'cyan');
    showGiftSpotlight({
      icon: '➕',
      userName: name,
      giftLabel: 'Follow Kênh',
      effectText: 'Bi Chùy Gai siêu nặng nhập trận!',
      tierClass: ''
    });
    window.arenaVoice.announceGift(name, 'follow');
  }
}

function dropBuffCrate() {
  if (state.roundOver || buffs.length >= 3) return;
  const maxR = Math.max(1.5, getActiveArenaRadius() - 1.8);
  const a = Math.random() * Math.PI * 2;
  const r = Math.random() * maxR;
  const x = Math.cos(a) * r;
  const z = Math.sin(a) * r;

  const group = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.46, 0),
    new THREE.MeshPhysicalMaterial({
      color: '#38bdf8',
      emissive: '#0284c7',
      emissiveIntensity: 0.6,
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.35,
      clearcoat: 1
    })
  );
  core.castShadow = true;
  group.add(core);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.62, 0.035, 8, 28),
    new THREE.MeshBasicMaterial({ color: '#7dd3fc' })
  );
  ring.rotation.x = Math.PI / 2;
  group.add(ring);

  group.position.set(x, 7.5, z);
  scene.add(group);
  buffs.push({ group, x, y: 7.5, z, vy: 0, life: 14 });
}

function dropShockwaveBomb(senderName = null) {
  if (state.roundOver) return;
  const name = senderName || randomViewerName();
  const a = Math.random() * Math.PI * 2;
  const r = Math.random() * Math.max(1.2, getActiveArenaRadius() * 0.45);
  const x = Math.cos(a) * r;
  const z = Math.sin(a) * r;

  const group = new THREE.Group();
  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.58, 1),
    new THREE.MeshStandardMaterial({
      color: '#1e2430',
      metalness: 0.85,
      roughness: 0.25,
      emissive: '#ff4d2e',
      emissiveIntensity: 0.4
    })
  );
  shell.castShadow = true;
  group.add(shell);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.75, 0.88, 32),
    new THREE.MeshBasicMaterial({ color: '#ff5b37', side: THREE.DoubleSide, transparent: true, opacity: 0.75 })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = -0.52;
  group.add(ring);

  group.position.set(x, 8.5, z);
  scene.add(group);
  bombs.push({ group, shell, ring, x, y: 8.5, z, vy: 0, fuse: 2.1, sender: name });
  window.arenaAudio.playGiftFanfare(2);
  showCallout(`${name.toUpperCase()} THẢ BOM XUNG KÍCH!`, 'danger');
  pushKillFeed(`<b>${name}</b> tặng 🍩 <b>Bom Xung Kích</b>`);
  showGiftSpotlight({
    icon: '🍩',
    userName: name,
    giftLabel: 'Donut • Bom Xung Kích',
    effectText: 'Cảnh báo nổ hất văng toàn bộ đối thủ!',
    tierClass: 'tier-bomb'
  });
  window.arenaVoice.announceGift(name, 'bomb');
}

function triggerRingCollapse(manual = false, senderName = null) {
  if (state.roundOver || state.activeOuterRing <= 0 || state.ringWarningActive) return;
  state.ringWarningActive = true;
  state.shrinkTimer = manual ? 2.0 : 2.6;
  elShrinkLabel.textContent = 'CẢNH BÁO: SẬP VÒNG NGOÀI!';
  elShrinkLabel.classList.add('danger');
  elShrinkFill.classList.add('danger');
  showCallout('SẬP VÒNG NGOÀI — CẨN THẬN MÉP SÀN!', 'danger');

  if (manual) {
    const donor = senderName || randomViewerName();
    window.arenaAudio.playGiftFanfare(2);
    pushKillFeed(`<b>${donor}</b> tặng 🕶️ <b>Sập Vòng Ngoài</b>`);
    showGiftSpotlight({
      icon: '🕶️',
      userName: donor,
      giftLabel: 'Kính Râm • Sập Sàn',
      effectText: 'Đánh sập ngay vòng sàn ngoài!',
      tierClass: 'tier-bomb'
    });
    window.arenaVoice.announceGift(donor, 'collapse');
  }

  for (const t of ringTiles) {
    if (t.ringId === state.activeOuterRing && t.state === 'solid') {
      t.state = 'shaking';
    }
  }
}

function executeRingDrop() {
  const dropRingId = state.activeOuterRing;
  for (const t of ringTiles) {
    if (t.ringId === dropRingId && t.state === 'shaking') {
      t.state = 'falling';
      t.vy = -1.2 - Math.random() * 1.5;
    }
  }
  state.activeOuterRing = Math.max(0, state.activeOuterRing - 1);
  state.ringWarningActive = false;
  state.shrinkTimer = state.activeOuterRing > 0 ? state.shrinkDuration : 0;
  state.shake = Math.max(state.shake, 0.45);
  window.arenaAudio.playSlam(true);

  elShrinkLabel.classList.remove('danger');
  elShrinkFill.classList.remove('danger');
  elShrinkLabel.textContent = state.activeOuterRing > 0 ? 'THU HẸP SÀN ĐẤU' : 'SÀN TỬ CHIẾN (NHỎ NHẤT)';
}

// ==========================================================================
// ROUND LIFECYCLE
// ==========================================================================
function clearEntities() {
  for (const f of fighters) {
    scene.remove(f.root);
    f.tagEl.remove();
  }
  fighters.length = 0;

  for (const b of buffs) scene.remove(b.group);
  buffs.length = 0;

  for (const b of bombs) scene.remove(b.group);
  bombs.length = 0;
}

function startNewRound(incrementRound = true) {
  if (incrementRound) state.round += 1;
  clearEntities();
  buildArena();

  state.activeOuterRing = 2;
  state.shrinkTimer = state.shrinkDuration;
  state.ringWarningActive = false;
  state.roundOver = false;
  elRoundNum.textContent = state.round;
  elWinnerModal.classList.add('hidden');
  elShrinkLabel.textContent = 'THU HẸP SÀN ĐẤU';
  elShrinkLabel.classList.remove('danger');
  elShrinkFill.classList.remove('danger');

  // Drop 5 varied fighters immediately so action starts at second 0!
  const starterWeapons = ['BLADE', 'MACE', 'SAW', 'BLADE', 'MACE'];
  starterWeapons.forEach((w, idx) => {
    setTimeout(() => {
      const angle = (Math.PI * 2 * idx) / starterWeapons.length + 0.3;
      spawnFighter(w, null, Math.cos(angle) * 4.4, Math.sin(angle) * 4.4);
    }, idx * 140);
  });
}

function updateAliveHUD() {
  const alive = fighters.filter(f => f.alive);
  elAliveCount.textContent = alive.length;

  // Check champion when round has settled and only 1 survives
  if (!state.roundOver && fighters.length >= 2 && alive.length === 1) {
    const champ = alive[0];
    state.roundOver = true;
    state.nextRoundTimer = 4.2;

    winCounts.set(champ.name, (winCounts.get(champ.name) || 0) + 1);
    renderLeaderboard();

    elWinRound.textContent = state.round;
    elWinnerName.textContent = champ.name;
    elWinnerKills.textContent = champ.kills;
    elWinnerWeapon.textContent = champ.weaponType;
    elWinnerModal.classList.remove('hidden');
    window.arenaAudio.playGiftFanfare(3);
    window.arenaVoice.announceWinner(champ.name, champ.kills);
    emitShockwave(champ.x, champ.z, 6.5, '#f5b942');
    emitSparks(new THREE.Vector3(champ.x, 1.2, champ.z), 28, '#f5b942', 1.3);
  } else if (!state.roundOver && fighters.length >= 2 && alive.length === 0) {
    state.roundOver = true;
    state.nextRoundTimer = 2.5;
    showCallout('HÒA! KHÔNG AI CÒN TRÊN SÀN!', 'danger');
  }
}

function renderLeaderboard() {
  const sorted = [...winCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  if (sorted.length === 0) return;
  elLbList.innerHTML = sorted
    .map(([name, wins], idx) => `
      <div class="lb-row">
        <div><span class="lb-rank">#${idx + 1}</span><span>${name}</span></div>
        <span class="lb-wins">${wins} WIN</span>
      </div>
    `)
    .join('');
}

// ==========================================================================
// PHYSICS & COMBAT SIMULATION LOOP
// ==========================================================================
const clock = new THREE.Clock();
const rollAxis = new THREE.Vector3();
const rollQuat = new THREE.Quaternion();
const tempVec = new THREE.Vector3();

function updatePhysics(dt) {
  if (state.hitStop > 0) {
    state.hitStop -= dt;
    return;
  }

  // Round restart countdown
  if (state.roundOver) {
    state.nextRoundTimer -= dt;
    elNextRoundSec.textContent = Math.max(1, Math.ceil(state.nextRoundTimer));
    if (state.nextRoundTimer <= 0) startNewRound(true);
  }

  // Shrink timer logic
  if (!state.roundOver && state.activeOuterRing > 0) {
    state.shrinkTimer -= dt;
    if (!state.ringWarningActive) {
      const pct = Math.max(0, state.shrinkTimer / state.shrinkDuration) * 100;
      elShrinkFill.style.width = `${pct}%`;
      elShrinkTimer.textContent = `${Math.max(0, state.shrinkTimer).toFixed(1)}s`;
      if (state.shrinkTimer <= 0) triggerRingCollapse(false);
    } else {
      elShrinkFill.style.width = '100%';
      elShrinkTimer.textContent = `${Math.max(0, state.shrinkTimer).toFixed(1)}s`;
      state.warningTickTimer -= dt;
      if (state.warningTickTimer <= 0) {
        state.warningTickTimer = 0.42;
        window.arenaAudio.playWarning();
      }
      if (state.shrinkTimer <= 0) executeRingDrop();
    }
  } else if (state.activeOuterRing === 0) {
    elShrinkTimer.textContent = 'MAX';
    elShrinkFill.style.width = '100%';
  }

  // Animate collapsible floor wedges
  const elapsed = clock.elapsedTime;
  for (const t of ringTiles) {
    if (t.state === 'shaking') {
      const pulse = 0.5 + 0.5 * Math.sin(elapsed * 22 + t.shakePhase);
      t.mat.emissive.setHex(0xff3b1f);
      t.mat.emissiveIntensity = 0.25 + pulse * 0.65;
      t.mesh.position.x = t.baseX + (Math.random() - 0.5) * 0.08;
      t.mesh.position.z = t.baseZ + (Math.random() - 0.5) * 0.08;
    } else if (t.state === 'falling') {
      if (t.delay > 0) {
        t.delay -= dt;
      } else {
        t.vy -= 22 * dt;
        t.mesh.position.y += t.vy * dt;
        t.mesh.rotation.x += t.rx * dt;
        t.mesh.rotation.z += t.rz * dt;
        if (t.mesh.position.y < -28) {
          t.state = 'gone';
          t.mesh.visible = false;
        }
      }
    }
  }

  const arenaR = getActiveArenaRadius();

  // Update Fighters
  for (let i = fighters.length - 1; i >= 0; i--) {
    const f = fighters[i];

    // Spin weapon ring continuously
    f.weaponRig.rotation.y += f.spinSpeed * f.spinDir * dt;

    if (!f.grounded && !f.fallingOff) {
      // Sky drop entry
      f.vy -= 30 * dt;
      f.y += f.vy * dt;
      if (f.y <= f.radius) {
        f.y = f.radius;
        f.vy = 0;
        f.grounded = true;
        const heavy = f.weaponType === 'TITAN';
        window.arenaAudio.playSlam(heavy);
        state.shake = Math.max(state.shake, heavy ? 0.55 : 0.16);
        emitShockwave(f.x, f.z, heavy ? 5.2 : 2.1, f.colorHex);
        emitSparks(new THREE.Vector3(f.x, 0.2, f.z), heavy ? 22 : 8, f.colorHex);

        // Titan landing blasts nearby enemies!
        if (heavy) {
          for (const other of fighters) {
            if (other === f || !other.alive) continue;
            const dx = other.x - f.x;
            const dz = other.z - f.z;
            const dist = Math.hypot(dx, dz) || 0.1;
            if (dist < 5.5) {
              const push = (1 - dist / 5.5) * 14;
              other.vx += (dx / dist) * push;
              other.vz += (dz / dist) * push;
              other.lastHitBy = f;
              other.lastHitTime = elapsed;
            }
          }
        }
      }
    } else if (f.fallingOff) {
      // Tumbling off the edge into the abyss!
      f.vy -= 30 * dt;
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      f.z += f.vz * dt;
      f.root.rotation.x += dt * 4.5;
      f.root.rotation.z += dt * 3.5;

      if (f.y < -22) {
        scene.remove(f.root);
        f.tagEl.remove();
        fighters.splice(i, 1);
        continue;
      }
    } else if (f.alive) {
      // Smart aggressive AI steering toward nearest rival or buff + stay inside shrinking edge!
      let targetX = 0, targetZ = 0, foundTarget = false;
      let bestDist = Infinity;

      // Prioritize nearby buff crate
      for (const b of buffs) {
        if (b.y <= 0.75) {
          const d = Math.hypot(b.x - f.x, b.z - f.z);
          if (d < 4.5 && d < bestDist) {
            bestDist = d;
            targetX = b.x;
            targetZ = b.z;
            foundTarget = true;
          }
        }
      }

      if (!foundTarget) {
        for (const other of fighters) {
          if (other === f || !other.alive || !other.grounded) continue;
          const d = Math.hypot(other.x - f.x, other.z - f.z);
          if (d < bestDist) {
            bestDist = d;
            targetX = other.x;
            targetZ = other.z;
            foundTarget = true;
          }
        }
      }

      const distCenter = Math.hypot(f.x, f.z);
      const accel = f.weaponType === 'TITAN' ? 7.8 : 10.5;

      if (distCenter > arenaR - 1.35) {
        // Panic steer back toward center when close to edge
        const nx = -f.x / Math.max(0.1, distCenter);
        const nz = -f.z / Math.max(0.1, distCenter);
        f.vx += nx * accel * 1.45 * dt;
        f.vz += nz * accel * 1.45 * dt;
      } else if (foundTarget) {
        const dx = targetX - f.x;
        const dz = targetZ - f.z;
        const d = Math.hypot(dx, dz) || 0.1;
        // Slight curving attack vector for exciting orbiting clashes
        const tangentX = -dz / d;
        const tangentZ = dx / d;
        f.vx += ((dx / d) * 0.92 + tangentX * 0.25 * f.spinDir) * accel * dt;
        f.vz += ((dz / d) * 0.92 + tangentZ * 0.25 * f.spinDir) * accel * dt;
      }

      // Arena friction & speed cap
      const damping = Math.pow(0.42, dt);
      f.vx *= damping;
      f.vz *= damping;

      const spd = Math.hypot(f.vx, f.vz);
      const maxSpd = 18;
      if (spd > maxSpd) {
        f.vx = (f.vx / spd) * maxSpd;
        f.vz = (f.vz / spd) * maxSpd;
      }

      f.x += f.vx * dt;
      f.z += f.vz * dt;

      // Physically roll the inner sphere matching velocity!
      if (spd > 0.05) {
        rollAxis.set(f.vz / spd, 0, -f.vx / spd);
        rollQuat.setFromAxisAngle(rollAxis, (spd * dt) / f.radius);
        f.ballMesh.quaternion.premultiply(rollQuat);
      }

      // Edge Ring-Out Check!
      const newDistCenter = Math.hypot(f.x, f.z);
      if (newDistCenter > arenaR + f.radius * 0.35) {
        f.alive = false;
        f.fallingOff = true;
        f.vy = -1.5;
        f.tagEl.style.opacity = '0';
        window.arenaAudio.playKO();
        spawnHitPop(new THREE.Vector3(f.x, 1.5, f.z), 'RING OUT!', 'ko');

        if (f.lastHitBy && f.lastHitBy.alive && elapsed - f.lastHitTime < 4.5) {
          f.lastHitBy.kills += 1;
          const kSpan = f.lastHitBy.tagEl.querySelector('.fighter-kills');
          if (kSpan) kSpan.textContent = `★${f.lastHitBy.kills}`;
          pushKillFeed(`<b>${f.lastHitBy.name}</b> hạ <b>${f.name}</b>`);
        } else {
          pushKillFeed(`<b>${f.name}</b> rơi khỏi sàn đấu`);
        }
        updateAliveHUD();
      }
    }

    // Apply transform
    f.root.position.set(f.x, f.y, f.z);
  }

  // Fighter-to-Fighter Body & Spinning Weapon Collisions!
  for (let i = 0; i < fighters.length; i++) {
    const a = fighters[i];
    if (!a.alive || !a.grounded) continue;

    for (let j = i + 1; j < fighters.length; j++) {
      const b = fighters[j];
      if (!b.alive || !b.grounded) continue;

      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const dist = Math.hypot(dx, dz) || 0.001;
      const nx = dx / dist;
      const nz = dz / dist;

      const minBodyDist = a.radius + b.radius;
      const weaponClashDist = Math.max(a.weaponReach + b.radius, b.weaponReach + a.radius) * 0.92;

      if (dist < weaponClashDist) {
        // Weapon impact & elastic bounce!
        const overlap = Math.max(0, minBodyDist - dist);
        if (overlap > 0) {
          const totalM = a.mass + b.mass;
          a.x -= nx * overlap * (b.mass / totalM);
          a.z -= nz * overlap * (b.mass / totalM);
          b.x += nx * overlap * (a.mass / totalM);
          b.z += nz * overlap * (a.mass / totalM);
        }

        const rvx = b.vx - a.vx;
        const rvz = b.vz - a.vz;
        const velAlongNormal = rvx * nx + rvz * nz;

        if (velAlongNormal < 4.5) {
          // Weapon knockback bonus based on weapon class & spin speed
          const powerA = (a.weaponType === 'MACE' ? 9.5 : a.weaponType === 'TITAN' ? 12.5 : a.weaponType === 'SAW' ? 7.8 : 8.5) * a.scale;
          const powerB = (b.weaponType === 'MACE' ? 9.5 : b.weaponType === 'TITAN' ? 12.5 : b.weaponType === 'SAW' ? 7.8 : 8.5) * b.scale;

          const baseBounce = Math.max(0, -velAlongNormal) * 0.95;
          const pushToB = (baseBounce + powerA) / b.mass;
          const pushToA = (baseBounce + powerB) / a.mass;

          b.vx += nx * pushToB;
          b.vz += nz * pushToB;
          a.vx -= nx * pushToA;
          a.vz -= nz * pushToA;

          // Reverse spin on hard clash for Beyblade feel
          if (Math.random() < 0.35) {
            a.spinDir *= -1;
            b.spinDir *= -1;
          }

          a.lastHitBy = b; a.lastHitTime = elapsed;
          b.lastHitBy = a; b.lastHitTime = elapsed;

          // Crunchy sparks, sound, and micro hit-stop!
          const mid = new THREE.Vector3((a.x + b.x) * 0.5, 0.8, (a.z + b.z) * 0.5);
          const impact = Math.min(2, (pushToA + pushToB) / 14);
          emitSparks(mid, Math.round(9 + impact * 10), '#ffb347', 0.8 + impact * 0.45);
          window.arenaAudio.playClash(impact);
          state.shake = Math.max(state.shake, 0.14 + impact * 0.14);
          if (impact > 1.05) state.hitStop = 0.022;
        }
      }
    }
  }

  // Update Power-Up Buff Crates
  for (let i = buffs.length - 1; i >= 0; i--) {
    const b = buffs[i];
    b.life -= dt;
    if (b.y > 0.65) {
      b.vy -= 26 * dt;
      b.y = Math.max(0.65, b.y + b.vy * dt);
    }
    b.group.position.set(b.x, b.y + Math.sin(elapsed * 4 + i) * 0.1, b.z);
    b.group.rotation.y += dt * 2.4;

    let picked = false;
    for (const f of fighters) {
      if (!f.alive || !f.grounded) continue;
      if (Math.hypot(f.x - b.x, f.z - b.z) < f.radius + 0.65) {
        picked = true;
        f.scale = Math.min(1.42, f.scale + 0.15);
        f.radius = f.baseRadius * f.scale;
        f.mass *= 1.18;
        f.spinSpeed *= 1.18;
        f.root.scale.setScalar(f.scale);
        window.arenaAudio.playBuff();
        emitShockwave(b.x, b.z, 2.8, '#38bdf8');
        spawnHitPop(new THREE.Vector3(f.x, 1.8, f.z), 'POWER UP!', 'buff');
        pushKillFeed(`<b>${f.name}</b> ăn hộp tăng sức mạnh`, 'cyan');
        break;
      }
    }

    if (picked || b.life <= 0 || Math.hypot(b.x, b.z) > arenaR) {
      scene.remove(b.group);
      buffs.splice(i, 1);
    }
  }

  // Update Shockwave Bombs
  for (let i = bombs.length - 1; i >= 0; i--) {
    const bm = bombs[i];
    if (bm.y > 0.6) {
      bm.vy -= 28 * dt;
      bm.y = Math.max(0.6, bm.y + bm.vy * dt);
    } else {
      bm.fuse -= dt;
      const pulse = 1 + Math.sin(elapsed * 26) * 0.12;
      bm.shell.scale.setScalar(pulse);
      bm.shell.material.emissiveIntensity = 0.6 + (2.1 - bm.fuse) * 1.4;
      bm.ring.scale.setScalar(1 + (2.1 - bm.fuse) * 1.3);
    }
    bm.group.position.set(bm.x, bm.y, bm.z);

    if (bm.fuse <= 0) {
      window.arenaAudio.playExplosion();
      state.shake = 0.65;
      emitShockwave(bm.x, bm.z, 7.2, '#ff5b37');
      emitSparks(new THREE.Vector3(bm.x, 0.7, bm.z), 36, '#ff6b3d', 1.5);

      // Blast everyone radially outward!
      for (const f of fighters) {
        if (!f.alive || !f.grounded) continue;
        const dx = f.x - bm.x;
        const dz = f.z - bm.z;
        const dist = Math.hypot(dx, dz) || 0.1;
        if (dist < 7.8) {
          const force = ((1 - dist / 7.8) * 18 + 6) / f.mass;
          f.vx += (dx / dist) * force;
          f.vz += (dz / dist) * force;
        }
      }
      scene.remove(bm.group);
      bombs.splice(i, 1);
    }
  }

  // Update 3D Sparks
  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i];
    s.life -= dt;
    s.vy -= 26 * dt;
    s.mesh.position.x += s.vx * dt;
    s.mesh.position.y += s.vy * dt;
    s.mesh.position.z += s.vz * dt;
    if (s.mesh.position.y < 0.05 && Math.hypot(s.mesh.position.x, s.mesh.position.z) < arenaR) {
      s.mesh.position.y = 0.05;
      s.vy *= -0.45;
    }
    s.mesh.lookAt(s.mesh.position.x + s.vx, s.mesh.position.y + s.vy, s.mesh.position.z + s.vz);
    s.mesh.scale.setScalar(Math.max(0.01, s.life / s.maxLife));
    if (s.life <= 0) {
      scene.remove(s.mesh);
      s.mat.dispose();
      sparks.splice(i, 1);
    }
  }

  // Update Shockwaves
  for (let i = shockwaves.length - 1; i >= 0; i--) {
    const sw = shockwaves[i];
    sw.life -= dt;
    const t = 1 - sw.life / sw.maxLife;
    const sc = 1 + t * sw.maxScale;
    sw.mesh.scale.set(sc, sc, 1);
    sw.mat.opacity = (1 - t) * 0.85;
    if (sw.life <= 0) {
      scene.remove(sw.mesh);
      sw.geo.dispose();
      sw.mat.dispose();
      shockwaves.splice(i, 1);
    }
  }

  // Auto-Live Viewer Bot
  if (state.autoLive && !state.roundOver) {
    state.autoTimer -= dt;
    if (state.autoTimer <= 0) {
      const paces = { normal: [2.4, 4.4], fast: [1.1, 2.3], mayhem: [0.5, 1.15] };
      const [lo, hi] = paces[state.pace] || paces.normal;
      state.autoTimer = lo + Math.random() * (hi - lo);

      const r = Math.random();
      if (r < 0.36) {
        spawnFighter('BLADE');
      } else if (r < 0.50) {
        spawnFighter('MACE', null, null, null, Math.random() < 0.45);
      } else if (r < 0.64) {
        spawnFighter('SAW', null, null, null, Math.random() < 0.55);
      } else if (r < 0.82) {
        dropBuffCrate();
      } else if (r < 0.94) {
        dropShockwaveBomb();
      } else {
        spawnFighter('TITAN', null, null, null, true);
      }
    }
  }

  // Periodic MC Hype Voice lines encouraging likes, comments, and gifts
  if (window.arenaVoice.enabled && window.arenaVoice.autoHype && !state.roundOver) {
    state.hypeTimer -= dt;
    if (state.hypeTimer <= 0) {
      state.hypeTimer = 15 + Math.random() * 8;
      if (!window.arenaVoice.speaking && window.arenaVoice.queue.length === 0) {
        window.arenaVoice.speakHype();
      }
    }
  }

  // Subtle viewer count fluctuation
  if (Math.random() < dt * 0.6) {
    const base = state.pace === 'mayhem' ? 14800 : state.pace === 'fast' ? 6800 : 3400;
    state.viewers = Math.round(base + (Math.random() - 0.45) * base * 0.08);
    elViewerCount.textContent = `${(state.viewers / 1000).toFixed(1)}K`;
  }
}

function updateCameraAndOverlays(dt) {
  // Smooth subtle zoom in as arena shrinks
  const zoomFactor = state.activeOuterRing === 2 ? 1.0 : state.activeOuterRing === 1 ? 0.88 : 0.76;
  const targetX = Math.sin(clock.elapsedTime * 0.25) * 1.1;
  const targetY = baseCamPos.y * zoomFactor;
  const targetZ = baseCamPos.z * zoomFactor;

  camera.position.x += (targetX - camera.position.x) * Math.min(1, dt * 2.5);
  camera.position.y += (targetY - camera.position.y) * Math.min(1, dt * 2.5);
  camera.position.z += (targetZ - camera.position.z) * Math.min(1, dt * 2.5);

  if (state.shake > 0.01) {
    camera.position.x += (Math.random() - 0.5) * state.shake;
    camera.position.y += (Math.random() - 0.5) * state.shake * 0.6;
    state.shake = Math.max(0, state.shake - dt * 2.4);
  }

  camera.lookAt(camTarget);

  // Project crisp HTML nameplates above each 3D fighter
  const w = mount.clientWidth;
  const h = mount.clientHeight;
  for (const f of fighters) {
    if (!f.alive) continue;
    tempVec.set(f.x, f.y + f.radius + 0.55, f.z);
    tempVec.project(camera);
    const sx = (tempVec.x * 0.5 + 0.5) * w;
    const sy = (-tempVec.y * 0.5 + 0.5) * h;
    f.tagEl.style.left = `${sx}px`;
    f.tagEl.style.top = `${sy}px`;
  }
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(0.04, clock.getDelta());
  outerFrameRing.rotation.z += dt * 0.08;
  outerFrameRing2.rotation.z -= dt * 0.05;

  updatePhysics(dt);
  updateCameraAndOverlays(dt);
  renderer.render(scene, camera);
}

// ==========================================================================
// CONTROLS, RAYCAST CLICK-TO-DROP & TIKFINITY API
// ==========================================================================
function runCommand(cmd, user = null) {
  switch (cmd) {
    case 'spawnBlade': spawnFighter('BLADE', user, null, null, false); break;
    case 'spawnMace': spawnFighter('MACE', user, null, null, true); break;
    case 'spawnSaw': spawnFighter('SAW', user, null, null, true); break;
    case 'dropBuff': dropBuffCrate(); break;
    case 'dropBomb': dropShockwaveBomb(user); break;
    case 'collapseRing': triggerRingCollapse(true, user); break;
    case 'spawnTitan': spawnFighter('TITAN', user, null, null, true); break;
  }
}

document.querySelectorAll('[data-cmd]').forEach(btn => {
  btn.addEventListener('click', () => runCommand(btn.dataset.cmd));
});

// Click directly on the 3D arena floor to drop a fighter right where you click!
const raycaster = new THREE.Raycaster();
const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const hitPoint = new THREE.Vector3();

renderer.domElement.addEventListener('pointerdown', (e) => {
  const rect = renderer.domElement.getBoundingClientRect();
  const ndc = new THREE.Vector2(
    ((e.clientX - rect.left) / rect.width) * 2 - 1,
    -((e.clientY - rect.top) / rect.height) * 2 + 1
  );
  raycaster.setFromCamera(ndc, camera);
  if (raycaster.ray.intersectPlane(floorPlane, hitPoint)) {
    const maxR = Math.max(1.2, getActiveArenaRadius() - 1.0);
    const d = Math.hypot(hitPoint.x, hitPoint.z);
    if (d <= maxR + 1.5) {
      const clampedScale = d > maxR ? maxR / d : 1;
      const w = ['BLADE', 'MACE', 'SAW'][Math.floor(Math.random() * 3)];
      spawnFighter(w, 'Bạn', hitPoint.x * clampedScale, hitPoint.z * clampedScale);
    }
  }
});

// Keyboard shortcuts 1–7 + H for MC Hype
const keys = {
  '1': 'spawnBlade', '2': 'spawnMace', '3': 'spawnSaw',
  '4': 'dropBuff', '5': 'dropBomb', '6': 'collapseRing', '7': 'spawnTitan'
};
window.addEventListener('keydown', (e) => {
  if (keys[e.key]) runCommand(keys[e.key]);
  else if (e.key.toLowerCase() === 'h') window.arenaVoice.speakHype();
});

// MC Voice, Auto-Hype & On-Screen Gift Board controls
const toggleVoice = document.getElementById('toggleVoice');
toggleVoice.addEventListener('change', () => {
  window.arenaVoice.setEnabled(toggleVoice.checked);
});

const toggleAutoHype = document.getElementById('toggleAutoHype');
toggleAutoHype.addEventListener('change', () => {
  window.arenaVoice.autoHype = toggleAutoHype.checked;
});

const toggleGiftBoard = document.getElementById('toggleGiftBoard');
toggleGiftBoard.addEventListener('change', () => {
  elGiftBoard.classList.toggle('hidden', !toggleGiftBoard.checked);
});

document.getElementById('btnHypeNow').addEventListener('click', () => {
  window.arenaVoice.speakHype();
});

// Auto-live toggle & pace
const toggleAuto = document.getElementById('toggleAuto');
toggleAuto.addEventListener('change', () => { state.autoLive = toggleAuto.checked; });

document.querySelectorAll('.seg-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.pace = btn.dataset.pace;
  });
});

// Sound, OBS clean mode, Reset Round
const btnSound = document.getElementById('btnSound');
btnSound.addEventListener('click', () => {
  const on = window.arenaAudio.toggle();
  btnSound.classList.toggle('muted', !on);
});

const appShell = document.getElementById('appShell');
const btnExitObs = document.getElementById('btnExitObs');
document.getElementById('btnObs').addEventListener('click', () => {
  appShell.classList.add('obs-mode');
  btnExitObs.classList.remove('hidden');
  setTimeout(handleResize, 50);
});
btnExitObs.addEventListener('click', () => {
  appShell.classList.remove('obs-mode');
  btnExitObs.classList.add('hidden');
  setTimeout(handleResize, 50);
});

document.getElementById('btnResetRound').addEventListener('click', () => startNewRound(false));

// Public API for real TikTok LIVE connection (TikFinity / tiktok-live-connector)
window.RingDropAPI = {
  onComment: (username) => spawnFighter('BLADE', username, null, null, false),
  onFollow: (username) => spawnFighter('MACE', username, null, null, true),
  onLike: () => dropBuffCrate(),
  onGift: (username, type) => {
    if (type === 'titan') spawnFighter('TITAN', username, null, null, true);
    else if (type === 'bomb') dropShockwaveBomb(username);
    else if (type === 'collapse') triggerRingCollapse(true, username);
    else spawnFighter('SAW', username, null, null, true);
  }
};

// Boot Round 1
startNewRound(false);
animate();
