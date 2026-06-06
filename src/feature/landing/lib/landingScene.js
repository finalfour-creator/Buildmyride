/**
 * BuildMyRide immersive landing scene.
 *
 * Faithful port of the original landing.html vanilla Three.js experience,
 * adapted to ESM (three + examples/jsm) and gsap, and wrapped so it can be
 * mounted/unmounted cleanly from React (initLandingScene() returns a cleanup
 * function). The surrounding markup (rendered by React) keeps the same element
 * ids/classes, so the imperative wiring below works unchanged.
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import gsap from "gsap";

/* ── AUDIO ─────────────────────────────────────────────────── */
class AudioController {
  constructor() {
    this.ctx = null;
    this.engineGain = null;
    this.muted = false;
    this.ready = false;
  }
  init() {
    try {
      const Cls = window.AudioContext || window.webkitAudioContext;
      if (!Cls) return;
      this.ctx = new Cls();
      if (this.ctx.state === "suspended") this.ctx.resume();
      this._engine();
      this.ready = true;
    } catch (e) {
      console.warn("Audio:", e);
    }
  }
  _engine() {
    const ctx = this.ctx;
    this.engineGain = ctx.createGain();
    this.engineGain.gain.value = 0.04;
    this.engineGain.connect(ctx.destination);
    const o1 = ctx.createOscillator(); o1.type = "sawtooth"; o1.frequency.value = 42;
    const o2 = ctx.createOscillator(); o2.type = "triangle"; o2.frequency.value = 85;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.6;
    const lg = ctx.createGain(); lg.gain.value = 1.8;
    lfo.connect(lg); lg.connect(o1.frequency); lg.connect(o2.frequency);
    o1.connect(this.engineGain); o2.connect(this.engineGain);
    o1.start(); o2.start(); lfo.start();
    this._nodes = [o1, o2, lfo];
  }
  rev() {
    if (!this.ready || this.muted) return;
    const ctx = this.ctx, t = ctx.currentTime, g = ctx.createGain();
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.18, t + 0.1);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.9); g.connect(ctx.destination);
    const o = ctx.createOscillator(); o.type = "sawtooth";
    o.frequency.setValueAtTime(90, t); o.frequency.linearRampToValueAtTime(320, t + 0.18);
    o.frequency.exponentialRampToValueAtTime(65, t + 0.9);
    o.connect(g); o.start(t); o.stop(t + 0.9);
  }
  door(open) {
    if (!this.ready || this.muted) return;
    const ctx = this.ctx, t = ctx.currentTime, sr = ctx.sampleRate, len = sr * 0.5;
    const buf = ctx.createBuffer(1, len, sr), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) * 0.35;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = "bandpass";
    f.frequency.value = open ? 800 : 600; f.Q.value = 0.8;
    const g = ctx.createGain(); g.gain.value = open ? 0.45 : 0.3;
    src.connect(f); f.connect(g); g.connect(ctx.destination); src.start(t);
  }
  horn() {
    if (!this.ready || this.muted) return;
    const ctx = this.ctx, t = ctx.currentTime, g = ctx.createGain();
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.22, t + 0.06);
    g.gain.setValueAtTime(0.22, t + 0.42); g.gain.linearRampToValueAtTime(0, t + 0.55);
    g.connect(ctx.destination);
    [[523.25, 0], [659.25, 15]].forEach((fd) => {
      const o = ctx.createOscillator(); o.type = "triangle";
      o.frequency.value = fd[0]; o.detune.value = fd[1];
      o.connect(g); o.start(t); o.stop(t + 0.55);
    });
  }
  toggleMute() {
    this.muted = !this.muted;
    if (this.engineGain) this.engineGain.gain.setTargetAtTime(this.muted ? 0 : 0.04, this.ctx.currentTime, 0.3);
    return this.muted;
  }
  dispose() {
    try {
      if (this._nodes) this._nodes.forEach((n) => { try { n.stop(); } catch (e) {} });
      if (this.ctx) this.ctx.close();
    } catch (e) {}
  }
}

/**
 * Boots the experience. Returns a cleanup function that tears down listeners,
 * timers, the render loop and the WebGL context.
 */
export default function initLandingScene() {
  /* ── STATE ────────────────────────────────────────────────── */
  let scene, camera, renderer, controls;
  let carGroup = null, leftDoorGrp = null, rightDoorGrp = null;
  const headlightMeshes = [], doorMeshes = [];
  const headlightSpots = [], lightBeams = [];
  let ambLight, sunLight, fillLight, rimLight;
  let dustSys = null, sparkSys = null, exhaustSys = null;
  let dustPos, dustVel;
  let isInterior = false, isDimmed = false;
  let hoveredDoor = null, doorAnimating = false;
  let activeLevel = 1, pointerStart = null, touchStart = null, cameraTransitioning = false;

  const audio = new AudioController();
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(-999, -999);
  const EXT_POS = new THREE.Vector3(0, 2.4, 9.5);
  const EXT_TGT = new THREE.Vector3(0, 0.6, 0);
  const INT_POS = new THREE.Vector3(0, 1.3, 2.0);
  const INT_TGT = new THREE.Vector3(0, 1.1, -1.5);

  let rafId = null, telemetryInterval = null, started = false, destroyed = false;
  const cleanups = [];
  const timeouts = [];

  const on = (target, type, handler, opts) => {
    target.addEventListener(type, handler, opts);
    cleanups.push(() => target.removeEventListener(type, handler, opts));
  };
  const later = (fn, ms) => {
    const id = setTimeout(() => { if (!destroyed) fn(); }, ms);
    timeouts.push(id);
    return id;
  };
  const $ = (id) => document.getElementById(id);

  /* ── THREE.JS ───────────────────────────────────────────────── */
  function init3D() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050811, 0.032);
    camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 200);
    camera.position.copy(EXT_POS); camera.lookAt(EXT_TGT);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    $("canvas-container").appendChild(renderer.domElement);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.08;
    controls.minDistance = 4; controls.maxDistance = 16;
    controls.maxPolarAngle = Math.PI * 0.85;
    controls.target.copy(EXT_TGT); controls.update();
    setupLighting(); buildEnvironment();
    createDust(); createSparks(); createExhaust();
    loadCar();
    on(renderer.domElement, "mousemove", onMouseMove);
    on(renderer.domElement, "pointerdown", onPointerDown);
    on(renderer.domElement, "pointerup", onPointerUp);
    on(renderer.domElement, "click", () => { if (!isInterior) audio.rev(); });
    on(window, "resize", onResize);
    on(window, "touchstart", (e) => { touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }, { passive: true });
    on(window, "touchend", (e) => {
      if (!touchStart) return;
      const dx = e.changedTouches[0].clientX - touchStart.x, dy = e.changedTouches[0].clientY - touchStart.y;
      touchStart = null;
      if (Math.abs(dx) > 52 && Math.abs(dy) < 44) { if (dx < 0 && !isInterior) toInterior(); else if (dx > 0 && isInterior) toExterior(); }
    }, { passive: true });
    animate();
  }

  function setupLighting() {
    ambLight = new THREE.AmbientLight(0x0a1a2e, 1.6); scene.add(ambLight);
    sunLight = new THREE.DirectionalLight(0xffffff, 2.2); sunLight.position.set(10, 20, 10);
    sunLight.castShadow = true; sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.camera.left = -20; sunLight.shadow.camera.right = 20;
    sunLight.shadow.camera.top = 20; sunLight.shadow.camera.bottom = -20; scene.add(sunLight);
    fillLight = new THREE.DirectionalLight(0x4444ff, 0.9); fillLight.position.set(-10, 5, -10); scene.add(fillLight);
    rimLight = new THREE.DirectionalLight(0x00ffcc, 0.65); rimLight.position.set(0, 10, -15); scene.add(rimLight);
    for (let i = 0; i < 2; i++) { const sp = new THREE.SpotLight(0xffeedd, 0, 28, Math.PI / 8, 0.45, 1.8); sp.castShadow = false; scene.add(sp); headlightSpots.push(sp); }
    const nl = new THREE.PointLight(0x00ffcc, 0.55, 22); nl.position.set(-8, 2, 0); scene.add(nl);
    const nr = new THREE.PointLight(0xff0077, 0.55, 22); nr.position.set(8, 2, 0); scene.add(nr);
  }

  function buildEnvironment() {
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshStandardMaterial({ color: 0x0a0e1e, roughness: 0.18, metalness: 0.82 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const grid = new THREE.GridHelper(100, 32, 0x00ffcc, 0x001a10);
    grid.position.y = 0.01; grid.material.opacity = 0.22; grid.material.transparent = true; scene.add(grid);
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(100, 32), new THREE.MeshStandardMaterial({ color: 0x050811, roughness: 0.95 }));
    wall.position.set(0, 16, -22); scene.add(wall);
    for (let i = -2; i <= 2; i++) {
      const bm = new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.028, side: THREE.BackSide });
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.9, 20, 8, 1, true), bm);
      beam.position.set(i * 6, 10, -6); lightBeams.push(beam); scene.add(beam);
    }
  }

  function loadCar() {
    const loader = new GLTFLoader();
    const paths = ["/models/Honda-Civic.glb", "/models/Honda_City_2022.glb", "/models/sports_car.glb", "/models/car.glb"];
    let idx = 0;
    function tryNext() {
      if (idx >= paths.length) { buildProceduralCar(); return; }
      loader.load(paths[idx], (gltf) => {
        if (destroyed) return;
        carGroup = gltf.scene;
        const box = new THREE.Box3().setFromObject(carGroup);
        const sz = box.getSize(new THREE.Vector3());
        const sc = 5 / Math.max(sz.x, sz.y, sz.z);
        carGroup.scale.setScalar(sc);
        const ctr = box.getCenter(new THREE.Vector3());
        carGroup.position.sub(ctr.multiplyScalar(sc)); carGroup.position.y = 0;
        carGroup.traverse((c) => {
          if (!c.isMesh) return; c.castShadow = c.receiveShadow = true;
          const n = (c.name || "").toLowerCase();
          if (n.includes("headlight") || n.includes("light_front") || n.includes("lamp_f")) headlightMeshes.push(c);
          if (n.includes("door")) doorMeshes.push(c);
        });
        scene.add(carGroup); carGroup.position.x = 18;
        gsap.to(carGroup.position, { x: 0, duration: 2.2, ease: "power3.out", delay: 0.4 });
        onCarReady();
      }, undefined, () => { idx++; tryNext(); });
    }
    tryNext();
  }

  function buildProceduralCar() {
    if (destroyed) return;
    carGroup = new THREE.Group();
    const bodyMat = new THREE.MeshPhysicalMaterial({ color: 0x1a1a2e, roughness: 0.08, metalness: 0.92, clearcoat: 1.0, clearcoatRoughness: 0.04 });
    const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x224466, roughness: 0, metalness: 0, transmission: 0.82, transparent: true, opacity: 0.28 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.85 });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.95 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x999999, metalness: 0.9, roughness: 0.1 });
    const neonMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc });
    const tlMat = new THREE.MeshStandardMaterial({ color: 0xff2200, emissive: new THREE.Color(0xff2200), emissiveIntensity: 2.5 });
    const hlMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: new THREE.Color(0xffffff), emissiveIntensity: 0 });
    function mk(geo, mat, px, py, pz, sh) { const m = new THREE.Mesh(geo, mat); if (px !== undefined) m.position.set(px, py, pz); if (sh) { m.castShadow = true; m.receiveShadow = true; } carGroup.add(m); return m; }
    mk(new THREE.BoxGeometry(4.2, 0.62, 2.05), bodyMat, 0, 0.82, 0, true);
    mk(new THREE.BoxGeometry(2.9, 0.72, 1.85), bodyMat, 0.18, 1.54, 0, true);
    const hood = mk(new THREE.BoxGeometry(1.55, 0.07, 2.0), bodyMat, 1.55, 1.14, 0, true); hood.rotation.z = -0.06;
    const trunk = mk(new THREE.BoxGeometry(1.1, 0.06, 1.95), bodyMat, -1.55, 1.08, 0, true); trunk.rotation.z = 0.05;
    const ws = mk(new THREE.BoxGeometry(0.06, 0.68, 1.7), glassMat, 1.43, 1.52, 0); ws.rotation.z = -Math.PI / 5;
    const rg = mk(new THREE.BoxGeometry(0.06, 0.58, 1.6), glassMat, -1.33, 1.52, 0); rg.rotation.z = Math.PI / 5;
    [-0.94, 0.94].forEach((z) => { const sg = mk(new THREE.BoxGeometry(1.0, 0.42, 0.04), glassMat, 0.25, 1.56, z); sg.rotation.y = Math.PI / 2; });
    leftDoorGrp = new THREE.Group(); leftDoorGrp.position.set(0.55, 0.82, -1.03);
    const ld = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.62, 0.06), bodyMat); ld.position.set(-0.7, 0, 0); ld.castShadow = true; ld.userData.isDoor = "left"; leftDoorGrp.add(ld); doorMeshes.push(ld); carGroup.add(leftDoorGrp);
    rightDoorGrp = new THREE.Group(); rightDoorGrp.position.set(0.55, 0.82, 1.03);
    const rd = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.62, 0.06), bodyMat); rd.position.set(-0.7, 0, 0); rd.castShadow = true; rd.userData.isDoor = "right"; rightDoorGrp.add(rd); doorMeshes.push(rd); carGroup.add(rightDoorGrp);
    const hlL = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.13, 0.5), hlMat.clone()); hlL.position.set(2.16, 0.96, -0.52); hlL.userData.isHeadlight = true; carGroup.add(hlL); headlightMeshes.push(hlL);
    const hlR = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.13, 0.5), hlMat.clone()); hlR.position.set(2.16, 0.96, 0.52); hlR.userData.isHeadlight = true; carGroup.add(hlR); headlightMeshes.push(hlR);
    headlightSpots[0].position.set(2.2, 1.0, -0.52); headlightSpots[0].target.position.set(12, 0, -0.52); scene.add(headlightSpots[0].target);
    headlightSpots[1].position.set(2.2, 1.0, 0.52); headlightSpots[1].target.position.set(12, 0, 0.52); scene.add(headlightSpots[1].target);
    [-0.58, 0.58].forEach((z) => { mk(new THREE.BoxGeometry(0.09, 0.22, 0.48), tlMat, -2.16, 1.0, z); });
    mk(new THREE.BoxGeometry(4.0, 0.02, 2.0), neonMat, 0, 0.4, 0);
    [[1.45, 0.42, 1.12], [1.45, 0.42, -1.12], [-1.45, 0.42, 1.12], [-1.45, 0.42, -1.12]].forEach((p) => {
      const tire = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.14, 10, 28), tireMat); tire.rotation.y = Math.PI / 2; tire.position.set(p[0], p[1], p[2]); tire.castShadow = true;
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.1, 14), rimMat); rim.rotation.z = Math.PI / 2; rim.position.set(p[0], p[1], p[2]);
      carGroup.add(tire, rim);
    });
    mk(new THREE.BoxGeometry(0.07, 0.4, 0.07), darkMat, -1.9, 1.42, 0);
    mk(new THREE.BoxGeometry(0.07, 0.09, 2.0), bodyMat, -1.9, 1.67, 0);
    [-1.06, 1.06].forEach((z) => { mk(new THREE.BoxGeometry(0.13, 0.09, 0.2), darkMat, 1.25, 1.24, z * 1.08); });
    [-0.25, 0.25].forEach((z) => { const ex = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.15, 12), darkMat); ex.rotation.z = Math.PI / 2; ex.position.set(-2.2, 0.46, z); carGroup.add(ex); });
    carGroup.position.y = 0; scene.add(carGroup); carGroup.position.x = 18;
    gsap.to(carGroup.position, { x: 0, duration: 2.2, ease: "power3.out", delay: 0.3 });
    onCarReady();
  }

  function buildInterior() {
    const ig = new THREE.Group();
    const dashMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9, metalness: 0.2 });
    const scrnMat = new THREE.MeshBasicMaterial({ color: 0x001a2e });
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x1a0808, roughness: 0.82 });
    const trimMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc });
    function mi(geo, mat, px, py, pz) { const m = new THREE.Mesh(geo, mat); m.position.set(px, py, pz); ig.add(m); return m; }
    mi(new THREE.BoxGeometry(3.6, 0.62, 0.9), dashMat, 0, 1.04, -1.88);
    mi(new THREE.BoxGeometry(0.85, 0.42, 0.03), scrnMat, 0.28, 1.38, -1.47);
    const sp = mi(new THREE.CylinderGeometry(0.16, 0.16, 0.03, 28), scrnMat, -0.62, 1.42, -1.45); sp.rotation.x = Math.PI / 2;
    mi(new THREE.BoxGeometry(3.5, 0.01, 0.01), trimMat, 0, 1.36, -1.46);
    mi(new THREE.BoxGeometry(0.35, 0.4, 0.9), dashMat, 0, 0.82, -1.3);
    const swMat = new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 0.5 });
    const sw = mi(new THREE.TorusGeometry(0.23, 0.028, 10, 28), swMat, -0.38, 1.28, -1.55); sw.rotation.x = Math.PI / 5;
    const hub = mi(new THREE.CylinderGeometry(0.045, 0.045, 0.05, 10), dashMat, -0.38, 1.28, -1.55); hub.rotation.x = Math.PI / 5;
    [[-0.42, 0.68, -0.82], [0.42, 0.68, -0.82]].forEach((p) => {
      mi(new THREE.BoxGeometry(0.52, 0.13, 0.64), seatMat, p[0], p[1], p[2]);
      const bk = mi(new THREE.BoxGeometry(0.52, 0.74, 0.12), seatMat, p[0], p[1] + 0.42, p[2] - 0.26); bk.rotation.x = 0.1;
      mi(new THREE.BoxGeometry(0.36, 0.22, 0.1), seatMat, p[0], p[1] + 0.84, p[2] - 0.24);
    });
    mi(new THREE.BoxGeometry(2.4, 0.13, 0.62), seatMat, 0, 0.68, 0.55);
    const rb = mi(new THREE.BoxGeometry(2.4, 0.62, 0.12), seatMat, 0, 1.0, 0.86); rb.rotation.x = -0.08;
    mi(new THREE.BoxGeometry(3.0, 0.06, 2.6), dashMat, 0, 2.02, -0.4);
    mi(new THREE.BoxGeometry(3.0, 0.01, 0.01), trimMat, 0, 2.04, -1.69);
    mi(new THREE.BoxGeometry(3.0, 0.01, 0.01), trimMat, 0, 2.04, 0.88);
    carGroup.add(ig);
  }

  function onCarReady() {
    buildInterior();
    later(() => { if (!carGroup) return; gsap.to(carGroup.rotation, { y: 0.045, duration: 4.2, ease: "sine.inOut", repeat: -1, yoyo: true }); }, 2900);
  }

  /* ── PARTICLES ──────────────────────────────────────────────── */
  function createDust() {
    const N = 220, geo = new THREE.BufferGeometry();
    dustPos = new Float32Array(N * 3); dustVel = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { dustPos[i * 3] = (Math.random() - .5) * 34; dustPos[i * 3 + 1] = Math.random() * 9; dustPos[i * 3 + 2] = (Math.random() - .5) * 22; dustVel[i * 3] = (Math.random() - .5) * 0.012; dustVel[i * 3 + 1] = Math.random() * 0.009 + 0.002; dustVel[i * 3 + 2] = (Math.random() - .5) * 0.012; }
    geo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    dustSys = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x00ffcc, size: 0.045, transparent: true, opacity: 0.58, blending: THREE.AdditiveBlending, depthWrite: false }));
    scene.add(dustSys);
  }

  function createSparks() {
    const N = 36, geo = new THREE.BufferGeometry(), pos = new Float32Array(N * 3);
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    sparkSys = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffcc00, size: 0.09, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    sparkSys.userData = { vel: new Float32Array(N * 3), life: new Float32Array(N), active: false };
    scene.add(sparkSys);
  }

  function fireSparks(origin) {
    const pos = sparkSys.geometry.attributes.position.array, vel = sparkSys.userData.vel, life = sparkSys.userData.life;
    for (let i = 0; i < life.length; i++) { pos[i * 3] = origin.x; pos[i * 3 + 1] = origin.y; pos[i * 3 + 2] = origin.z; vel[i * 3] = (Math.random() - .5) * 0.24; vel[i * 3 + 1] = Math.random() * 0.34 + 0.1; vel[i * 3 + 2] = (Math.random() - .5) * 0.24; life[i] = 1.0; }
    sparkSys.geometry.attributes.position.needsUpdate = true; sparkSys.material.opacity = 1; sparkSys.userData.active = true;
  }

  function tickSparks() {
    if (!sparkSys.userData.active) return;
    const pos = sparkSys.geometry.attributes.position.array, vel = sparkSys.userData.vel, life = sparkSys.userData.life;
    let any = false;
    for (let i = 0; i < life.length; i++) { if (life[i] <= 0) continue; life[i] -= 0.032; pos[i * 3] += vel[i * 3]; pos[i * 3 + 1] += vel[i * 3 + 1]; pos[i * 3 + 2] += vel[i * 3 + 2]; vel[i * 3 + 1] -= 0.014; if (life[i] > 0) any = true; }
    sparkSys.geometry.attributes.position.needsUpdate = true;
    if (!any) { sparkSys.material.opacity = 0; sparkSys.userData.active = false; }
    else sparkSys.material.opacity = Math.max.apply(null, Array.from(life)) * 0.85;
  }

  function createExhaust() {
    const N = 45, geo = new THREE.BufferGeometry(), pos = new Float32Array(N * 3);
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    exhaustSys = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xaaaaaa, size: 0.13, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false }));
    exhaustSys.userData = { vel: new Float32Array(N * 3), life: new Float32Array(N) }; scene.add(exhaustSys);
  }

  function tickExhaust() {
    if (!exhaustSys || !carGroup) return;
    const pos = exhaustSys.geometry.attributes.position.array, vel = exhaustSys.userData.vel, life = exhaustSys.userData.life;
    for (let i = 0; i < life.length; i++) {
      life[i] -= 0.024;
      if (life[i] <= 0) { const wp = new THREE.Vector3(-2.22 + ((Math.random() - .5) * 0.12), 0.48 + ((Math.random() - .5) * 0.12), (Math.random() - .5) * 0.35); wp.applyMatrix4(carGroup.matrixWorld); pos[i * 3] = wp.x; pos[i * 3 + 1] = wp.y; pos[i * 3 + 2] = wp.z; vel[i * 3] = -Math.random() * 0.045; vel[i * 3 + 1] = Math.random() * 0.022; vel[i * 3 + 2] = (Math.random() - .5) * 0.022; life[i] = Math.random() * 0.85 + 0.2; }
      pos[i * 3] += vel[i * 3]; pos[i * 3 + 1] += vel[i * 3 + 1]; pos[i * 3 + 2] += vel[i * 3 + 2];
    }
    exhaustSys.geometry.attributes.position.needsUpdate = true;
  }

  /* ── RAYCASTING ─────────────────────────────────────────────── */
  function onMouseMove(e) { const r = renderer.domElement.getBoundingClientRect(); mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1; mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1; }

  function checkHover() {
    if (!carGroup || isInterior) return;
    raycaster.setFromCamera(mouse, camera);
    const hlHit = raycaster.intersectObjects(headlightMeshes, false);
    if (hlHit.length) { headlightMeshes.forEach((m) => { gsap.to(m.material, { emissiveIntensity: 3.5, duration: 0.35 }); }); headlightSpots.forEach((s) => { gsap.to(s, { intensity: 4.0, duration: 0.35 }); }); renderer.domElement.style.cursor = "crosshair"; return; }
    headlightMeshes.forEach((m) => { gsap.to(m.material, { emissiveIntensity: isDimmed ? 0.6 : 0, duration: 0.55 }); });
    headlightSpots.forEach((s) => { gsap.to(s, { intensity: isDimmed ? 1.8 : 0, duration: 0.55 }); });
    const dHit = raycaster.intersectObjects(doorMeshes, true);
    if (dHit.length) { renderer.domElement.style.cursor = "pointer"; const hit = dHit[0].object; if (hoveredDoor !== hit && !doorAnimating) { hoveredDoor = hit; crackDoor(hit.userData.isDoor, true); } }
    else { renderer.domElement.style.cursor = ""; if (hoveredDoor && !doorAnimating) { crackDoor(hoveredDoor.userData.isDoor, false); hoveredDoor = null; } }
  }

  function crackDoor(side, open) {
    const grp = side === "left" ? leftDoorGrp : rightDoorGrp; if (!grp) return;
    doorAnimating = true; const angle = open ? (side === "left" ? -Math.PI / 11 : Math.PI / 11) : 0;
    if (open) { audio.door(true); const wp = new THREE.Vector3().setFromMatrixPosition(grp.matrixWorld); wp.y += 1.0; fireSparks(wp); }
    gsap.to(grp.rotation, { z: angle, duration: 0.65, ease: "power2.out", onComplete: () => { doorAnimating = false; } });
  }

  /* ── POINTER / SWIPE ────────────────────────────────────────── */
  function onPointerDown(e) { pointerStart = { x: e.clientX, y: e.clientY, t: Date.now() }; }
  function onPointerUp(e) {
    if (!pointerStart) return;
    const dx = e.clientX - pointerStart.x, dy = e.clientY - pointerStart.y, dt = Date.now() - pointerStart.t;
    pointerStart = null;
    if (Math.abs(dx) > 62 && Math.abs(dy) < 44 && dt < 650) { if (dx < 0 && !isInterior) toInterior(); else if (dx > 0 && isInterior) toExterior(); }
  }

  /* ── CAMERA TRANSITIONS ─────────────────────────────────────── */
  function toInterior() {
    if (isInterior || !carGroup) return; isInterior = true;
    if (navigator.vibrate) navigator.vibrate(50);
    cameraTransitioning = true; controls.enabled = false;
    $("blur-ov")?.classList.add("on");
    later(() => { const fl = $("flash"); gsap.fromTo(fl, { opacity: 0 }, { opacity: 0.55, duration: 0.14, onComplete: () => { gsap.to(fl, { opacity: 0, duration: 0.4 }); $("blur-ov")?.classList.remove("on"); } }); }, 420);
    gsap.to(camera.position, { x: INT_POS.x, y: INT_POS.y, z: INT_POS.z, duration: 1.25, ease: "power3.inOut" });
    gsap.to(controls.target, {
      x: INT_TGT.x, y: INT_TGT.y, z: INT_TGT.z, duration: 1.25, ease: "power3.inOut",
      onComplete: () => { cameraTransitioning = false; controls.minDistance = 0.5; controls.maxDistance = 3.2; controls.minAzimuthAngle = -Math.PI / 4; controls.maxAzimuthAngle = Math.PI / 4; controls.minPolarAngle = Math.PI * 0.35; controls.maxPolarAngle = Math.PI * 0.62; controls.enabled = true; controls.update(); }
    });
    $("btn-back")?.classList.add("in");
    $("swipe-ext")?.classList.remove("in");
    const si = $("swipe-int"); if (si) si.style.display = "flex";
    later(() => { $("swipe-int")?.classList.add("in"); }, 500);
    gsap.to(ambLight, { intensity: 0.7, duration: 1.0 });
  }

  function toExterior() {
    if (!isInterior) return; isInterior = false;
    if (navigator.vibrate) navigator.vibrate(50);
    cameraTransitioning = true; controls.enabled = false;
    const fl = $("flash");
    gsap.fromTo(fl, { opacity: 0 }, { opacity: 0.38, duration: 0.14, onComplete: () => { gsap.to(fl, { opacity: 0, duration: 0.4 }); } });
    gsap.to(camera.position, { x: EXT_POS.x, y: EXT_POS.y, z: EXT_POS.z, duration: 1.25, ease: "power3.inOut" });
    gsap.to(controls.target, {
      x: EXT_TGT.x, y: EXT_TGT.y, z: EXT_TGT.z, duration: 1.25, ease: "power3.inOut",
      onComplete: () => { cameraTransitioning = false; controls.minDistance = 4; controls.maxDistance = 16; controls.minAzimuthAngle = -Infinity; controls.maxAzimuthAngle = Infinity; controls.minPolarAngle = 0; controls.maxPolarAngle = Math.PI * 0.85; controls.enabled = true; controls.update(); }
    });
    $("btn-back")?.classList.remove("in");
    $("swipe-int")?.classList.remove("in");
    later(() => { const si = $("swipe-int"); if (si) si.style.display = "none"; $("swipe-ext")?.classList.add("in"); }, 450);
    gsap.to(ambLight, { intensity: isDimmed ? 0.15 : 1.6, duration: 1.0 });
    [leftDoorGrp, rightDoorGrp].forEach((g) => { if (g) gsap.to(g.rotation, { z: 0, duration: 0.8, ease: "power2.inOut" }); });
    hoveredDoor = null;
  }

  /* ── SCROLL ─────────────────────────────────────────────────── */
  function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    const t = Math.min(Math.max(window.scrollY / max, 0), 1);
    const sp = $("scroll-prog"); if (sp) sp.style.width = (t * 100) + "%";
    const lvl = t < 0.33 ? 1 : t < 0.66 ? 2 : 3;
    if (lvl !== activeLevel) { activeLevel = lvl; updateSections(); updateHUD(); }
    if (carGroup && !isInterior) {
      const angle = t > 0.08 ? Math.PI / 13 : 0;
      if (leftDoorGrp) gsap.to(leftDoorGrp.rotation, { z: -angle, duration: 0.6, overwrite: true });
      if (rightDoorGrp) gsap.to(rightDoorGrp.rotation, { z: angle, duration: 0.6, overwrite: true });
    }
  }

  function updateSections() { document.querySelectorAll(".ssec").forEach((el, i) => { el.classList.toggle("on", i + 1 === activeLevel); }); }

  function updateHUD() {
    ["lv1", "lv2", "lv3"].forEach((id, i) => {
      const el = $(id); if (!el) return;
      if (i + 1 < activeLevel) { el.textContent = "CLEARED"; el.style.color = "rgba(0,255,204,.38)"; }
      else if (i + 1 === activeLevel) { el.textContent = "ACTIVE"; el.style.color = "var(--cp)"; }
      else { el.textContent = "LOCKED"; el.style.color = "rgba(232,234,246,.28)"; }
    });
    ["pb1", "pb2", "pb3"].forEach((id, i) => { const el = $(id); if (el) el.style.width = (i + 1 < activeLevel ? 100 : i + 1 === activeLevel ? 65 : 0) + "%"; });
  }

  /* ── DIM ────────────────────────────────────────────────────── */
  function toggleDim() {
    isDimmed = !isDimmed; const d = isDimmed;
    gsap.to(ambLight, { intensity: d ? 0.14 : 1.6, duration: 1.2 });
    gsap.to(sunLight, { intensity: d ? 0.28 : 2.2, duration: 1.2 });
    gsap.to(fillLight, { intensity: d ? 0.10 : 0.9, duration: 1.2 });
    gsap.to(rimLight, { intensity: d ? 0.22 : 0.65, duration: 1.2 });
    headlightSpots.forEach((s) => { gsap.to(s, { intensity: d ? 2.0 : 0, duration: 1.2 }); });
    headlightMeshes.forEach((m) => { gsap.to(m.material, { emissiveIntensity: d ? 0.6 : 0, duration: 1.2 }); });
    $("btn-dim")?.classList.toggle("on", isDimmed);
  }

  /* ── TELEMETRY ──────────────────────────────────────────────── */
  function pulseTelemetry() {
    const a = $("sf-aero"), te = $("sf-temp"), p = $("sf-power");
    if (a) gsap.to(a, { width: (Math.random() * 28 + 52) + "%", duration: 1.0, ease: "power2.out" });
    if (te) gsap.to(te, { width: (Math.random() * 20 + 34) + "%", duration: 1.3, ease: "power2.out" });
    if (p) gsap.to(p, { width: (Math.random() * 14 + 72) + "%", duration: 0.85, ease: "power2.out" });
  }

  /* ── KEYBOARD ───────────────────────────────────────────────── */
  function onKey(e) {
    const k = e.key;
    if (k === "h" || k === "H") { audio.horn(); showToast("HONK!", 1400); }
    if (k === "r" || k === "R") audio.rev();
    if (k === "i" || k === "I") isInterior ? toExterior() : toInterior();
    if (k === "d" || k === "D") toggleDim();
  }

  /* ── TOAST ──────────────────────────────────────────────────── */
  function showToast(msg, dur) {
    const el = $("toast"); if (!el) return; el.textContent = msg; el.classList.add("in");
    later(() => { $("toast")?.classList.remove("in"); }, dur || 3000);
  }

  /* ── FALLBACK ───────────────────────────────────────────────── */
  function showFallback() {
    const cc = $("canvas-container"); if (cc) cc.style.display = "none";
    const fc = $("fallback-container"); if (fc) fc.style.display = "flex";
    ["main-header", "hud-left", "hud-right", "hud-hints"].forEach((id) => { $(id)?.classList.add("in"); });
    showToast("WebGL unavailable — showing static fallback.", 5000);
  }

  /* ── RESIZE ─────────────────────────────────────────────────── */
  function onResize() {
    if (!camera || !renderer) return;
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  }

  /* ── ANIMATE ────────────────────────────────────────────────── */
  function animate() {
    rafId = requestAnimationFrame(animate); const t = Date.now() * 0.001;
    if (controls && !cameraTransitioning) controls.update();
    if (dustSys && dustPos) {
      const pa = dustSys.geometry.attributes.position.array;
      for (let i = 0; i < pa.length / 3; i++) { pa[i * 3] += dustVel[i * 3] + Math.sin(t * 0.4 + i) * 0.001; pa[i * 3 + 1] += dustVel[i * 3 + 1]; pa[i * 3 + 2] += dustVel[i * 3 + 2] + Math.cos(t * 0.3 + i) * 0.001; if (pa[i * 3 + 1] > 10) pa[i * 3 + 1] = 0.05; if (Math.abs(pa[i * 3]) > 17) dustVel[i * 3] *= -1; if (Math.abs(pa[i * 3 + 2]) > 11) dustVel[i * 3 + 2] *= -1; }
      dustSys.geometry.attributes.position.needsUpdate = true;
    }
    tickSparks(); tickExhaust();
    lightBeams.forEach((b, i) => { b.material.opacity = 0.022 + Math.sin(t * 0.85 + i) * 0.012; });
    if (isDimmed) { headlightSpots.forEach((s, i) => { s.intensity = 1.8 + Math.sin(t * 2.2 + i) * 0.2; }); }
    checkHover();
    if (renderer && scene && camera) renderer.render(scene, camera);
  }

  /* ── BOOT ───────────────────────────────────────────────────── */
  function boot() {
    if (started) return;
    $("sound-overlay")?.classList.add("hiding");
    audio.init();
    const tc = document.createElement("canvas");
    const gl = tc.getContext("webgl") || tc.getContext("experimental-webgl");
    if (!gl) { showFallback(); return; }
    started = true;
    init3D();
    later(() => {
      ["main-header", "hud-left", "hud-right", "hud-hints"].forEach((id) => { $(id)?.classList.add("in"); });
      $("swipe-ext")?.classList.add("in");
    }, 700);
    later(() => {
      $("lb-top")?.classList.add("gone");
      $("lb-bot")?.classList.add("gone");
    }, 2600);
    on(window, "scroll", onScroll, { passive: true });
    on(window, "keydown", onKey);
    telemetryInterval = setInterval(pulseTelemetry, 3200);
  }

  /* ── UI WIRING ──────────────────────────────────────────────── */
  const btnEnter = $("btn-enter"); if (btnEnter) on(btnEnter, "click", boot);
  const btnDim = $("btn-dim"); if (btnDim) on(btnDim, "click", toggleDim);
  const btnMute = $("btn-mute"); if (btnMute) on(btnMute, "click", function () {
    const m = audio.toggleMute(); this.classList.toggle("on", m); this.textContent = m ? "UNMUTE SOUND" : "MUTE SOUND";
  });
  const btnBack = $("btn-back"); if (btnBack) on(btnBack, "click", toExterior);

  /* ── CLEANUP ────────────────────────────────────────────────── */
  return function cleanup() {
    destroyed = true;
    cleanups.forEach((fn) => { try { fn(); } catch (e) {} });
    timeouts.forEach((id) => clearTimeout(id));
    if (telemetryInterval) clearInterval(telemetryInterval);
    if (rafId) cancelAnimationFrame(rafId);
    try { gsap.globalTimeline.getChildren().forEach((tw) => tw.kill()); } catch (e) {}
    audio.dispose();
    if (renderer) {
      try { renderer.dispose(); } catch (e) {}
      const el = renderer.domElement;
      if (el && el.parentNode) el.parentNode.removeChild(el);
    }
  };
}
