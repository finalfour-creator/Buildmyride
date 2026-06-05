"use client";
import {
  useEffect, useRef, useState, useImperativeHandle, forwardRef,
} from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Box, Typography, CircularProgress } from "@mui/material";

/* ── Design tokens (match landing page) ─────────────────────── */
const CP  = "#00ffcc";
const CS  = "#ff0077";
const BG  = "#050811";
const GB  = "rgba(10,14,30,.72)";
const GBR = "rgba(0,255,204,.14)";
const FD  = "'Orbitron', monospace";

/* ── Camera presets — front-facing hero shot (matches landing page) */
const EXT_POS    = new THREE.Vector3(0, 1.4, 5.2);
const EXT_TARGET = new THREE.Vector3(0, 0.3, 0);
const INT_POS    = new THREE.Vector3(0, 0.55, 0.9);
const INT_TARGET = new THREE.Vector3(0, 0.45, -0.7);

/* ══════════════════════════════════════════════════════════════
   HELPERS  (paint / wheel / spoiler — all unchanged)
══════════════════════════════════════════════════════════════ */

function isBodyPaintMesh(meshName) {
  const n = (meshName || "").toLowerCase();
  const EXCLUDE = [
    "glass","window","windshield","windscreen",
    "light","lamp","headlight","taillight","fog","indicator","signal","lens",
    "interior","seat","dashboard","dash","steering","console","pedal","knob",
    "tyre","tire","wheel","rim","brake","disc","caliper",
    "chrome","emblem","logo","badge","plate","number","text",
    "mirror_glass","wiper","antenna","grille","grill","mesh",
    "rubber","seal","trim","molding","plastic","carbon",
    "exhaust","pipe","muffler","tip",
    "underbody","undercarriage","chassis","frame","suspension","engine","radiator","motor",
  ];
  for (const p of EXCLUDE) if (n.includes(p)) return false;
  const INCLUDE = [
    "body","door","hood","bonnet","fender","bumper",
    "roof","trunk","boot","panel","quarter","pillar",
    "skirt","spoiler","wing","paint","exterior","shell",
  ];
  for (const p of INCLUDE) if (n.includes(p)) return true;
  return true;
}

function applyColorToPaintableMeshes(object, color) {
  if (!object || !color) return;
  object.traverse((node) => {
    if (node.isMesh && node.material && isBodyPaintMesh(node.name)) {
      const mats = Array.isArray(node.material) ? node.material : [node.material];
      mats.forEach((m) => { if (m.color) m.color.set(color); });
    }
  });
}

function classifyWheelPosition(mesh) {
  const name = (mesh.name || "").toUpperCase();
  if (name.includes("_FL_") || name.includes("_FL") || name.startsWith("FL_")) return "front-left";
  if (name.includes("_FR_") || name.includes("_FR") || name.startsWith("FR_")) return "front-right";
  if (name.includes("_BL_") || name.includes("_BL") || name.startsWith("BL_")) return "rear-left";
  if (name.includes("_BR_") || name.includes("_BR") || name.startsWith("BR_")) return "rear-right";
  if (name.includes("_RL_") || name.includes("_RL") || name.startsWith("RL_")) return "rear-left";
  if (name.includes("_RR_") || name.includes("_RR") || name.startsWith("RR_")) return "rear-right";
  const wp = new THREE.Vector3();
  mesh.getWorldPosition(wp);
  const side = wp.x >= 0 ? "right" : "left";
  const end  = wp.z >= 0 ? "front" : "rear";
  return `${end}-${side}`;
}

function discoverWheelMeshes(model) {
  const candidates = [];
  model.traverse((node) => {
    if (node.isMesh) console.log(`  mesh: "${node.name}"`);
  });
  model.traverse((node) => {
    if (node.isMesh || node.isGroup) {
      const n = (node.name || "").toLowerCase();
      const isWheelPart = n.includes("wheel") || n.includes("tire") || n.includes("tyre") || n.includes("rim");
      const isAnchor = (n.includes("pos_") || n.includes("anchor_")) &&
        (n.includes("fl") || n.includes("fr") || n.includes("bl") || n.includes("br") || n.includes("rl") || n.includes("rr"));
      if (isWheelPart || isAnchor) candidates.push(node);
    }
  });
  if (candidates.length === 0) {
    const box    = new THREE.Box3().setFromObject(model);
    const size   = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const xOff   = size.x * 0.48;
    const zOff   = size.z * 0.32;
    const yPos   = box.min.y + size.y * 0.15;
    const virtualAnchors = new Map();
    [
      { id: "front-left",  pos: [center.x - xOff, yPos, center.z + zOff] },
      { id: "front-right", pos: [center.x + xOff, yPos, center.z + zOff] },
      { id: "rear-left",   pos: [center.x - xOff, yPos, center.z - zOff] },
      { id: "rear-right",  pos: [center.x + xOff, yPos, center.z - zOff] },
    ].forEach(p => {
      const a = new THREE.Group(); a.name = `virtual_anchor_${p.id}`; a.position.set(...p.pos);
      virtualAnchors.set(p.id, a);
    });
    return virtualAnchors;
  }
  const roots = candidates.filter(c => !candidates.some(o => o !== c && isDescendant(c, o)));
  const posMap = new Map(); const posCount = {};
  for (const node of roots) {
    let posId = classifyWheelPosition(node);
    if (posMap.has(posId)) { const s = (posCount[posId] = (posCount[posId] || 1) + 1); posId = `${posId}-${s}`; }
    posMap.set(posId, node);
  }
  return posMap;
}

function isDescendant(child, parent) {
  let cur = child.parent;
  while (cur) { if (cur === parent) return true; cur = cur.parent; }
  return false;
}

function discoverSpoilerMesh(model) {
  let anchor = null; let isExistingSpoiler = false;
  const fullBox = new THREE.Box3().setFromObject(model);
  const size    = fullBox.getSize(new THREE.Vector3());
  model.traverse((node) => {
    if ((node.isMesh || node.isGroup) && !anchor) {
      const n = (node.name || "").toLowerCase();
      const isSpoiler = (n.includes("spoiler") || n.includes("wing")) && !n.includes("mirror") && !n.includes("antenna") && !n.includes("wiper");
      if (isSpoiler) {
        const nb = new THREE.Box3().setFromObject(node);
        const ns = nb.getSize(new THREE.Vector3());
        anchor = node;
        isExistingSpoiler = (ns.x < size.x * 0.7 && ns.y < size.y * 0.4);
      }
    }
  });
  if (!anchor) {
    model.traverse((node) => {
      if ((node.isMesh || node.isGroup) && !anchor) {
        const n = (node.name || "").toLowerCase();
        if (n.includes("trunk") || n.includes("boot") || n.includes("rear_deck")) {
          const nb = new THREE.Box3().setFromObject(node);
          const ns = nb.getSize(new THREE.Vector3());
          if (ns.x < size.x * 0.95) { anchor = node; isExistingSpoiler = false; }
        }
      }
    });
  }
  if (!anchor) {
    const rearLimitZ = fullBox.max.z - size.z * 0.2; let highestY = -Infinity;
    model.traverse((node) => {
      if (node.isMesh) {
        const box = new THREE.Box3().setFromObject(node);
        const c   = box.getCenter(new THREE.Vector3());
        const ns  = box.getSize(new THREE.Vector3());
        if (c.z > rearLimitZ && ns.x < size.x * 0.8 && Math.abs(c.x) < size.x * 0.3 && box.max.y > highestY) {
          highestY = box.max.y; anchor = node; isExistingSpoiler = false;
        }
      }
    });
  }
  return { mesh: anchor, isExistingSpoiler };
}

/* ══════════════════════════════════════════════════════════════
   CANVAS BUTTON (overlay control)
══════════════════════════════════════════════════════════════ */
function CanvasBtn({ children, onClick, active }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        fontFamily: FD,
        fontSize: "0.58rem",
        fontWeight: 700,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: active ? BG : CP,
        background: active ? `linear-gradient(135deg,${CP},#0088ff)` : GB,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: `1px solid ${active ? CP : GBR}`,
        px: 1.5, py: 0.7,
        cursor: "pointer",
        userSelect: "none",
        transition: "all .25s",
        whiteSpace: "nowrap",
        "&:hover": {
          background: active ? `linear-gradient(135deg,${CP},#0088ff)` : "rgba(0,255,204,.12)",
          borderColor: CP,
          boxShadow: `0 0 14px rgba(0,255,204,.25)`,
        },
      }}
    >
      {children}
    </Box>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
const ThreeViewer = forwardRef(({
  modelPath,
  backgroundColor = "#ffffff",
  modelColor = null,
  wheelReplacements = {},
  spoilerReplacement = null,
  currentBuild = {},
  onWheelClick = null,
  sx = {},
}, ref) => {

  const mountRef      = useRef(null);
  const sceneRef      = useRef(null);
  const cameraRef     = useRef(null);
  const rendererRef   = useRef(null);
  const modelRef      = useRef(null);
  const controlsRef   = useRef(null);
  const animFrameRef  = useRef(null);

  /* environment refs */
  const lightRefs     = useRef({});
  const dustRef       = useRef(null);
  const dustPosRef    = useRef(null);
  const dustVelRef    = useRef(null);
  const beamsRef      = useRef([]);

  /* audio ref */
  const audioRef      = useRef(null);

  /* camera lerp refs */
  const cameraTransRef  = useRef(false);
  const lerpPosRef      = useRef(null);
  const lerpTargetRef   = useRef(null);

  /* wheel / spoiler / modular (unchanged) */
  const wheelMeshMapRef      = useRef(new Map());
  const originalWheelDataRef = useRef(new Map());
  const customWheelsRef      = useRef(new Map());
  const originalSpoilerRef   = useRef(null);
  const originalSpoilerDataRef = useRef(null);
  const customSpoilerRef     = useRef(null);
  const modularPartsRef      = useRef(new Map());

  const raycasterRef  = useRef(new THREE.Raycaster());
  const mouseRef      = useRef(new THREE.Vector2());
  const onWheelClickRef = useRef(onWheelClick);
  useEffect(() => { onWheelClickRef.current = onWheelClick; }, [onWheelClick]);

  const [error, setError]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [isDimmed, setIsDimmed]   = useState(false);
  const [isMuted, setIsMuted]     = useState(false);
  const [isInterior, setIsInterior] = useState(false);

  /* screenshot */
  useImperativeHandle(ref, () => ({
    takeScreenshot: () => {
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        return rendererRef.current.domElement.toDataURL("image/png");
      }
      return null;
    },
  }));

  /* ── Audio helpers ───────────────────────────────────────── */
  const initAudio = () => {
    if (audioRef.current?.ctx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx  = new AC();
      const gain = ctx.createGain(); gain.gain.value = 0.03; gain.connect(ctx.destination);
      const o1 = ctx.createOscillator(); o1.type = "sawtooth"; o1.frequency.value = 42;
      const o2 = ctx.createOscillator(); o2.type = "triangle"; o2.frequency.value = 85;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.55;
      const lg  = ctx.createGain(); lg.gain.value = 1.5;
      lfo.connect(lg); lg.connect(o1.frequency); lg.connect(o2.frequency);
      o1.connect(gain); o2.connect(gain);
      o1.start(); o2.start(); lfo.start();
      audioRef.current = { ctx, gain };
    } catch { /* audio blocked */ }
  };

  const handleMute = () => {
    initAudio();
    const next = !isMuted; setIsMuted(next);
    if (audioRef.current?.gain) {
      audioRef.current.gain.gain.setTargetAtTime(next ? 0 : 0.03, audioRef.current.ctx.currentTime, 0.3);
    }
  };

  /* ── Dim / Illuminate ───────────────────────────────────── */
  const handleDim = () => {
    const next = !isDimmed; setIsDimmed(next);
    const L = lightRefs.current;
    if (next) {
      if (L.ambient) L.ambient.intensity = 0.4;
      if (L.key)     L.key.intensity     = 0.2;
      if (L.fill)    L.fill.intensity    = 0.1;
      if (L.rim)     L.rim.intensity     = 0.3;
      if (L.neonL)   L.neonL.intensity   = 2.0;
      if (L.neonR)   L.neonR.intensity   = 2.0;
    } else {
      if (L.ambient) L.ambient.intensity = 3.0;
      if (L.key)     L.key.intensity     = 2.0;
      if (L.fill)    L.fill.intensity    = 0.8;
      if (L.rim)     L.rim.intensity     = 0.9;
      if (L.neonL)   L.neonL.intensity   = 0.7;
      if (L.neonR)   L.neonR.intensity   = 0.5;
    }
  };

  /* ── Interior / Exterior toggle ─────────────────────────── */
  const handleInteriorToggle = () => {
    const next = !isInterior; setIsInterior(next);
    if (!controlsRef.current || !cameraRef.current) return;
    controlsRef.current.enabled = false;
    cameraTransRef.current = true;
    if (next) {
      lerpPosRef.current    = INT_POS.clone();
      lerpTargetRef.current = INT_TARGET.clone();
      controlsRef.current.minDistance     = 0.3;
      controlsRef.current.maxDistance     = 2.2;
      controlsRef.current.minAzimuthAngle = -Math.PI / 4;
      controlsRef.current.maxAzimuthAngle =  Math.PI / 4;
      controlsRef.current.minPolarAngle   =  Math.PI * 0.35;
      controlsRef.current.maxPolarAngle   =  Math.PI * 0.62;
    } else {
      lerpPosRef.current    = EXT_POS.clone();
      lerpTargetRef.current = EXT_TARGET.clone();
      controlsRef.current.minDistance     = 1;
      controlsRef.current.maxDistance     = 20;
      controlsRef.current.minAzimuthAngle = -Infinity;
      controlsRef.current.maxAzimuthAngle =  Infinity;
      controlsRef.current.minPolarAngle   =  0;
      controlsRef.current.maxPolarAngle   =  Math.PI * 0.85;
    }
  };

  /* ════════════════════════════════════════════════════════════
     SCENE SETUP
  ════════════════════════════════════════════════════════════ */
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width  = container.clientWidth  || 800;
    const height = container.clientHeight || 500;

    /* ── Scene ───────────────────────────────────────────────── */
    const scene = new THREE.Scene();
    /* Explicit teal-navy background — same colour visible in landing page sky */
    scene.background = new THREE.Color(0x0e2840);
    scene.fog = new THREE.FogExp2(0x0e2840, 0.018);
    sceneRef.current = scene;

    /* Camera */
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.05, 500);
    camera.position.copy(EXT_POS);
    camera.lookAt(EXT_TARGET);
    cameraRef.current = camera;

    /* Renderer */
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    /* LinearToneMapping — no ACES colour shift, teal stays teal */
    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setClearColor(0x0e2840, 1);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    /* Controls */
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping  = true;
    controls.dampingFactor  = 0.08;
    controls.enableZoom     = true;
    controls.enablePan      = false;
    controls.minDistance    = 1;
    controls.maxDistance    = 20;
    controls.maxPolarAngle  = Math.PI * 0.85;
    controls.target.copy(EXT_TARGET);
    controls.update();
    controlsRef.current = controls;

    /* ── Lighting ────────────────────────────────────────────── */
    /* Teal-tinted ambient — fills scene with the landing-page mood */
    const ambient = new THREE.AmbientLight(0x183850, 3.0);
    scene.add(ambient); lightRefs.current.ambient = ambient;

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(10, 20, 10);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.left   = -15; keyLight.shadow.camera.right = 15;
    keyLight.shadow.camera.top    =  15; keyLight.shadow.camera.bottom = -15;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight); lightRefs.current.key = keyLight;

    const fillLight = new THREE.DirectionalLight(0x4466aa, 0.8);
    fillLight.position.set(-10, 5, -10);
    scene.add(fillLight); lightRefs.current.fill = fillLight;

    /* Teal rim from behind — primary source of teal floor reflection */
    const rimLight = new THREE.DirectionalLight(0x00ffcc, 0.9);
    rimLight.position.set(0, 10, -15);
    scene.add(rimLight); lightRefs.current.rim = rimLight;

    const neonL = new THREE.PointLight(0x00ffcc, 0.7, 24);
    neonL.position.set(-8, 2, 0);
    scene.add(neonL); lightRefs.current.neonL = neonL;

    const neonR = new THREE.PointLight(0xff0077, 0.5, 24);
    neonR.position.set(8, 2, 0);
    scene.add(neonR); lightRefs.current.neonR = neonR;

    /* Studio spotlight — creates the bright glow circle on the floor */
    const topSpot = new THREE.SpotLight(0xffffff, 2.8, 20, Math.PI / 6, 0.45, 1.3);
    topSpot.position.set(0, 10, 1);
    topSpot.target.position.set(0, 0, 0);
    scene.add(topSpot); scene.add(topSpot.target);

    /* ── Environment ─────────────────────────────────────────── */
    /* Floor — dark metallic so teal lights reflect off it */
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshStandardMaterial({ color: 0x0a1e30, roughness: 0.14, metalness: 0.86 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.55;
    floor.receiveShadow = true;
    scene.add(floor);

    /* Neon teal grid — same as landing page */
    const grid = new THREE.GridHelper(100, 32, 0x00ffcc, 0x001a10);
    grid.position.y = -0.545;
    grid.material.opacity = 0.22;
    grid.material.transparent = true;
    scene.add(grid);

    /* Back wall — same colour as scene.background so sky is seamless */
    const wall = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 32),
      new THREE.MeshStandardMaterial({ color: 0x0e2840, roughness: 0.95 })
    );
    wall.position.set(0, 16, -22);
    scene.add(wall);

    // Volumetric ceiling beams
    const beamGeo = new THREE.CylinderGeometry(0.03, 0.65, 16, 6, 1, true);
    [-5, 0, 5].forEach((x, i) => {
      const bm = new THREE.MeshBasicMaterial({
        color: 0x00ffcc, transparent: true, opacity: 0.022, side: THREE.BackSide,
      });
      const beam = new THREE.Mesh(beamGeo, bm);
      beam.position.set(x, 8, -5);
      beamsRef.current.push(beam);
      scene.add(beam);
    });

    // Dust / particle motes
    const N = 160;
    const dGeo = new THREE.BufferGeometry();
    const dPos = new Float32Array(N * 3);
    const dVel = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      dPos[i*3]   = (Math.random() - 0.5) * 22;
      dPos[i*3+1] = Math.random() * 7;
      dPos[i*3+2] = (Math.random() - 0.5) * 14;
      dVel[i*3]   = (Math.random() - 0.5) * 0.008;
      dVel[i*3+1] = Math.random() * 0.006 + 0.001;
      dVel[i*3+2] = (Math.random() - 0.5) * 0.008;
    }
    dGeo.setAttribute("position", new THREE.BufferAttribute(dPos, 3));
    const dust = new THREE.Points(dGeo, new THREE.PointsMaterial({
      color: 0x00ffcc, size: 0.032, transparent: true, opacity: 0.52,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    scene.add(dust);
    dustRef.current = dust; dustPosRef.current = dPos; dustVelRef.current = dVel;

    /* ── Wheel raycasting click ─────────────────────────────── */
    const handleClick = (event) => {
      if (!onWheelClickRef.current || wheelMeshMapRef.current.size === 0) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top)  / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const allWheelMeshes = []; const meshToPos = new Map();
      for (const [posId, root] of wheelMeshMapRef.current) {
        root.traverse(c => { if (c.isMesh) { allWheelMeshes.push(c); meshToPos.set(c, posId); } });
      }
      for (const [posId, root] of customWheelsRef.current) {
        if (root) root.traverse(c => { if (c.isMesh) { allWheelMeshes.push(c); meshToPos.set(c, posId); } });
      }
      const hits = raycasterRef.current.intersectObjects(allWheelMeshes, false);
      if (hits.length > 0) {
        const posId = meshToPos.get(hits[0].object);
        if (posId) onWheelClickRef.current(posId);
      }
    };
    renderer.domElement.addEventListener("click", handleClick);

    /* ── Animation loop ─────────────────────────────────────── */
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const t = Date.now() * 0.001;

      // Camera lerp for interior/exterior transition
      if (cameraTransRef.current && lerpPosRef.current) {
        camera.position.lerp(lerpPosRef.current, 0.065);
        controls.target.lerp(lerpTargetRef.current, 0.065);
        if (camera.position.distanceTo(lerpPosRef.current) < 0.008) {
          camera.position.copy(lerpPosRef.current);
          controls.target.copy(lerpTargetRef.current);
          cameraTransRef.current = false;
          controls.enabled = true;
        }
      } else {
        controls.update();
      }

      // Dust motes
      if (dustRef.current && dustPosRef.current) {
        const pa = dustRef.current.geometry.attributes.position.array;
        const vel = dustVelRef.current;
        for (let i = 0; i < pa.length / 3; i++) {
          pa[i*3]   += vel[i*3]   + Math.sin(t * 0.35 + i) * 0.0004;
          pa[i*3+1] += vel[i*3+1];
          pa[i*3+2] += vel[i*3+2] + Math.cos(t * 0.28 + i) * 0.0004;
          if (pa[i*3+1] > 8)           pa[i*3+1] = 0.05;
          if (Math.abs(pa[i*3])   > 11) vel[i*3]   *= -1;
          if (Math.abs(pa[i*3+2]) > 7)  vel[i*3+2] *= -1;
        }
        dustRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Beam pulse
      beamsRef.current.forEach((b, i) => {
        b.material.opacity = 0.016 + Math.sin(t * 0.75 + i) * 0.009;
      });

      renderer.render(scene, camera);
    };
    animate();

    /* ── Resize ─────────────────────────────────────────────── */
    const handleResize = () => {
      const c = mountRef.current; if (!c) return;
      const w = c.clientWidth, h = c.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);
    setTimeout(handleResize, 100);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("click", handleClick);
      if (audioRef.current?.ctx) { try { audioRef.current.ctx.close(); } catch {} audioRef.current = null; }
      sceneRef.current = null; cameraRef.current = null; controlsRef.current = null;
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      renderer.dispose(); rendererRef.current = null;
      dustRef.current = null; beamsRef.current = [];
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ════════════════════════════════════════════════════════════
     MODEL LOADING
  ════════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (!modelPath || !sceneRef.current) return;
    setLoading(true); setError(null);
    let isMounted = true;
    const loader = new GLTFLoader();

    loader.load(modelPath, (gltf) => {
      if (!isMounted || !sceneRef.current) return;

      if (modelRef.current) { sceneRef.current.remove(modelRef.current); modelRef.current = null; }
      wheelMeshMapRef.current = new Map();
      originalWheelDataRef.current = new Map();
      customWheelsRef.current.forEach(cw => { if (cw?.parent) cw.parent.remove(cw); });
      customWheelsRef.current = new Map();

      const model = gltf.scene;
      model.traverse(node => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
          // ── Material enhancement for showroom look ──
          const mats = Array.isArray(node.material) ? node.material : [node.material];
          mats.forEach(m => {
            if (m.isMeshStandardMaterial || m.isMeshPhysicalMaterial) {
              const n = (node.name || "").toLowerCase();
              const isGlass = n.includes("glass") || n.includes("window") || n.includes("windshield");
              if (!isGlass) {
                m.roughness   = Math.min(m.roughness, 0.22);
                m.metalness   = Math.max(m.metalness, 0.68);
                m.needsUpdate = true;
              } else {
                // Improve glass transparency
                m.transparent = true;
                m.opacity     = Math.min(m.opacity || 1, 0.35);
                m.roughness   = 0;
                m.metalness   = 0.1;
                m.needsUpdate = true;
              }
            }
          });
        }
      });

      const box    = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size   = box.getSize(new THREE.Vector3());
      const scale  = 1.8 / Math.max(size.x, size.y, size.z);
      model.scale.setScalar(scale);
      model.position.set(-center.x * scale, -box.min.y * scale - 0.45, -center.z * scale);

      sceneRef.current.add(model);
      modelRef.current = model;

      requestAnimationFrame(() => {
        model.updateMatrixWorld(true);
        const posMap = discoverWheelMeshes(model);
        wheelMeshMapRef.current = posMap;
        for (const [posId, node] of posMap) {
          originalWheelDataRef.current.set(posId, {
            position: node.position.clone(), quaternion: node.quaternion.clone(),
            scale: node.scale.clone(), parent: node.parent, visible: node.visible,
          });
        }
        const spoilerResult = discoverSpoilerMesh(model);
        if (spoilerResult.mesh) {
          const { mesh: sn, isExistingSpoiler } = spoilerResult;
          originalSpoilerRef.current = sn;
          originalSpoilerDataRef.current = {
            position: sn.position.clone(), quaternion: sn.quaternion.clone(),
            scale: sn.scale.clone(), parent: sn.parent, visible: sn.visible, isExistingSpoiler,
          };
        }
      });

      if (modelColor) applyColorToPaintableMeshes(model, modelColor);
      if (controlsRef.current) { controlsRef.current.target.copy(EXT_TARGET); controlsRef.current.update(); }
      setLoading(false);
    },
    undefined,
    (err) => {
      if (!isMounted) return;
      setError(`Failed to load model: ${err.message}`);
      setLoading(false);
    });

    return () => { isMounted = false; };
  }, [modelPath]);

  /* ── Color effect ───────────────────────────────────────── */
  useEffect(() => {
    if (!modelColor) return;
    if (modelRef.current) applyColorToPaintableMeshes(modelRef.current, modelColor);
    modularPartsRef.current.forEach(p => applyColorToPaintableMeshes(p, modelColor));
    if (customSpoilerRef.current) applyColorToPaintableMeshes(customSpoilerRef.current, modelColor);
  }, [modelColor]);

  /* ── Wheel replacement effect ───────────────────────────── */
  useEffect(() => {
    if (!sceneRef.current || wheelMeshMapRef.current.size === 0) return;
    const loader = new GLTFLoader();

    for (const [posId, wheelUrl] of Object.entries(wheelReplacements)) {
      const originalData = originalWheelDataRef.current.get(posId);
      const originalMesh = wheelMeshMapRef.current.get(posId);
      if (!originalMesh || !originalData) continue;

      const existingCustom = customWheelsRef.current.get(posId);
      if (existingCustom) { if (existingCustom.parent) existingCustom.parent.remove(existingCustom); customWheelsRef.current.delete(posId); }

      if (!wheelUrl) { originalMesh.visible = true; originalMesh.traverse(c => { c.visible = true; }); continue; }

      originalMesh.traverse(c => { c.visible = true; });
      originalMesh.updateMatrixWorld(true);
      const origBox = new THREE.Box3().setFromObject(originalMesh);
      const origSize = new THREE.Vector3(); origBox.getSize(origSize);
      let origCenter = new THREE.Vector3();
      if (origSize.length() < 0.01) originalMesh.getWorldPosition(origCenter);
      else origBox.getCenter(origCenter);
      originalMesh.visible = false; originalMesh.traverse(c => { c.visible = false; });

      loader.load(wheelUrl, (gltf) => {
        if (!sceneRef.current) return;
        const cw = gltf.scene;
        cw.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
        const cb = new THREE.Box3().setFromObject(cw);
        const cs = cb.getSize(new THREE.Vector3());
        const targetSizeY = origSize.y > 0 ? origSize.y : 0.26;
        const finalScale  = cs.y > 0 ? targetSizeY / cs.y : 1;
        const pws = new THREE.Vector3(1, 1, 1);
        if (originalData.parent) originalData.parent.getWorldScale(pws);
        cw.scale.setScalar(finalScale / pws.y);
        cw.quaternion.copy(originalData.quaternion);
        if (posId.includes("left")) cw.rotateY(Math.PI);
        const ap = originalMesh.parent || sceneRef.current;
        if (ap) ap.add(cw);
        cw.updateMatrixWorld(true);
        const ncb = new THREE.Box3().setFromObject(cw);
        const ncc = ncb.getCenter(new THREE.Vector3());
        const wOff = new THREE.Vector3().subVectors(origCenter, ncc);
        cw.position.add(new THREE.Vector3(wOff.x / pws.x, wOff.y / pws.y, wOff.z / pws.z));
        customWheelsRef.current.set(posId, cw);
      }, undefined, () => { originalMesh.visible = true; originalMesh.traverse(c => { c.visible = true; }); });
    }
  }, [wheelReplacements]);

  /* ── Modular part effect ────────────────────────────────── */
  useEffect(() => {
    if (!sceneRef.current || !modelRef.current) return;
    const loader = new GLTFLoader();
    Array.from(modularPartsRef.current.keys()).forEach(slotKey => {
      if (!currentBuild[slotKey]) {
        const old = modularPartsRef.current.get(slotKey);
        if (old?.parent) old.parent.remove(old);
        modularPartsRef.current.delete(slotKey);
      }
    });
    Object.keys(currentBuild).forEach(slotKey => {
      const partUrl = currentBuild[slotKey]; if (!partUrl) return;
      if (modularPartsRef.current.get(slotKey)?.userData?.url === partUrl) return;
      loader.load(partUrl, (gltf) => {
        if (!modelRef.current) return;
        const newPart = gltf.scene; newPart.userData.url = partUrl;
        let anchor = null;
        const names = [`pos_${slotKey}`, `anchor_${slotKey}`, `POS_${slotKey}`, `ANCHOR_${slotKey}`, slotKey];
        modelRef.current.traverse(n => { if (!anchor && names.includes(n.name)) anchor = n; });
        if (!anchor) modelRef.current.traverse(n => { if (!anchor && n.name.toLowerCase().includes(slotKey.toLowerCase())) anchor = n; });
        const old = modularPartsRef.current.get(slotKey);
        if (old?.parent) old.parent.remove(old);
        newPart.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
        if (anchor) { anchor.add(newPart); newPart.position.set(0,0,0); newPart.quaternion.set(0,0,0,1); newPart.scale.set(1,1,1); }
        else modelRef.current.add(newPart);
        modularPartsRef.current.set(slotKey, newPart);
        if (modelColor) applyColorToPaintableMeshes(newPart, modelColor);
      });
    });
  }, [currentBuild]);

  /* ── Spoiler effect ─────────────────────────────────────── */
  useEffect(() => {
    if (!sceneRef.current || !originalSpoilerRef.current || !originalSpoilerDataRef.current) return;
    const loader = new GLTFLoader();
    const originalMesh = originalSpoilerRef.current;
    const originalData = originalSpoilerDataRef.current;
    if (customSpoilerRef.current) { if (customSpoilerRef.current.parent) customSpoilerRef.current.parent.remove(customSpoilerRef.current); customSpoilerRef.current = null; }
    if (!spoilerReplacement) { originalMesh.visible = originalData.visible; originalMesh.traverse(c => { c.visible = true; }); return; }
    if (originalData.isExistingSpoiler) { originalMesh.visible = false; originalMesh.traverse(c => { c.visible = false; }); }
    else { originalMesh.visible = true; originalMesh.traverse(c => { c.visible = true; }); }
    loader.load(spoilerReplacement, (gltf) => {
      if (!sceneRef.current) return;
      const cs = gltf.scene;
      cs.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
      const wasVisible = originalMesh.visible; originalMesh.visible = true; originalMesh.updateMatrixWorld(true);
      const origBox = new THREE.Box3().setFromObject(originalMesh);
      const origCenter = origBox.getCenter(new THREE.Vector3());
      const origSize   = origBox.getSize(new THREE.Vector3());
      originalMesh.visible = wasVisible;
      if (originalData.parent) originalData.parent.add(cs); else sceneRef.current.add(cs);
      cs.position.set(0,0,0); cs.quaternion.set(0,0,0,1); cs.scale.set(1,1,1); cs.updateMatrixWorld(true);
      const tb = new THREE.Box3().setFromObject(cs); const ts = tb.getSize(new THREE.Vector3());
      if (ts.z > ts.x) { cs.rotateY(Math.PI / 2); cs.updateMatrixWorld(true); }
      const cb2 = new THREE.Box3().setFromObject(cs); const cs2 = cb2.getSize(new THREE.Vector3());
      const targetW = origSize.x * 0.85; const sf = Math.min(targetW / (cs2.x || 1), 100);
      cs.scale.setScalar(sf); cs.updateMatrixWorld(true);
      const ccb = new THREE.Box3().setFromObject(cs); const ccc = ccb.getCenter(new THREE.Vector3());
      const wOff = new THREE.Vector3().subVectors(origCenter, ccc);
      const pws = new THREE.Vector3(1,1,1); const pwq = new THREE.Quaternion();
      if (cs.parent) { cs.parent.getWorldScale(pws); cs.parent.getWorldQuaternion(pwq); }
      const invQ = pwq.clone().invert(); const lOff = wOff.clone().applyQuaternion(invQ);
      cs.position.add(new THREE.Vector3(lOff.x/pws.x, lOff.y/pws.y, lOff.z/pws.z));
      cs.updateMatrixWorld(true);
      const ub = new THREE.Box3().setFromObject(cs);
      const yCorr = (origBox.max.y - ub.min.y) + 0.08;
      const invQY = pwq.clone().invert(); const lY = new THREE.Vector3(0, yCorr, 0).applyQuaternion(invQY);
      cs.position.y += lY.y / pws.y;
      customSpoilerRef.current = cs;
      if (modelColor) applyColorToPaintableMeshes(cs, modelColor);
    }, undefined, () => { originalMesh.visible = true; originalMesh.traverse(c => { c.visible = true; }); });
  }, [spoilerReplacement]);

  /* ════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════ */
  return (
    <Box sx={{ width: "100%", height: "100%", minHeight: 450, position: "relative", ...sx }}>
      <Box ref={mountRef} sx={{ width: "100%", height: "100%", minHeight: 450 }} />

      {/* ── Canvas overlay controls ─────────────────────────── */}

      {/* Bottom-left: dim + sound */}
      {!loading && !error && (
        <Box sx={{ position: "absolute", bottom: 16, left: 16, display: "flex", gap: 1, zIndex: 10 }}>
          <CanvasBtn onClick={handleDim} active={isDimmed}>
            {isDimmed ? "ILLUMINATE" : "DIM"}
          </CanvasBtn>
          <CanvasBtn onClick={handleMute} active={isMuted}>
            {isMuted ? "UNMUTE" : "SOUND"}
          </CanvasBtn>
        </Box>
      )}

      {/* Right edge: interior indicator */}
      {!loading && !error && !isInterior && (
        <Box
          onClick={handleInteriorToggle}
          sx={{
            position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
            zIndex: 10, cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 0.8,
            py: 2, px: 1,
            background: GB,
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderLeft: `1px solid ${GBR}`,
            borderTop: `1px solid ${GBR}`,
            borderBottom: `1px solid ${GBR}`,
            transition: "all .25s",
            "&:hover": { background: "rgba(0,255,204,.1)", borderColor: CP },
          }}
        >
          <Typography sx={{
            fontFamily: FD, fontSize: "0.55rem", fontWeight: 700,
            letterSpacing: "0.15em", color: CP,
            writingMode: "vertical-rl", textOrientation: "mixed",
          }}>
            INTERIOR
          </Typography>
          <Typography sx={{ color: CP, fontSize: "0.85rem", lineHeight: 1 }}>&#8594;</Typography>
        </Box>
      )}

      {/* Top-center: back to exterior */}
      {!loading && !error && isInterior && (
        <Box
          onClick={handleInteriorToggle}
          sx={{
            position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)",
            zIndex: 10, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 1,
            px: 2, py: 0.8,
            background: GB,
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: `1px solid ${GBR}`,
            transition: "all .25s",
            "&:hover": { background: "rgba(0,255,204,.1)", borderColor: CP },
          }}
        >
          <Typography sx={{ color: CP, fontSize: "0.85rem", lineHeight: 1 }}>&#8592;</Typography>
          <Typography sx={{
            fontFamily: FD, fontSize: "0.58rem", fontWeight: 700,
            letterSpacing: "0.14em", color: CP,
          }}>
            EXTERIOR VIEW
          </Typography>
        </Box>
      )}

      {/* Loading overlay */}
      {loading && !error && (
        <Box sx={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 2,
          background: "rgba(5,8,17,.85)", zIndex: 20,
        }}>
          <Typography sx={{ fontFamily: FD, fontSize: "0.72rem", color: CP, letterSpacing: "0.2em" }}>
            LOADING MODEL…
          </Typography>
          <Box sx={{ width: 180, height: 2, background: "rgba(0,255,204,.15)", overflow: "hidden" }}>
            <Box sx={{
              height: "100%", width: "40%", background: CP, boxShadow: `0 0 8px ${CP}`,
              animation: "slideLoad 1.2s ease-in-out infinite",
              "@keyframes slideLoad": {
                "0%":   { transform: "translateX(-100%)" },
                "100%": { transform: "translateX(350%)" },
              },
            }} />
          </Box>
        </Box>
      )}

      {/* Error overlay */}
      {error && (
        <Box sx={{
          position: "absolute", inset: 0, display: "flex",
          alignItems: "center", justifyContent: "center",
          background: "rgba(5,8,17,.85)", zIndex: 20,
        }}>
          <Typography color="error" sx={{ px: 3, textAlign: "center", fontFamily: FD, fontSize: "0.72rem" }}>
            {error}
          </Typography>
        </Box>
      )}
    </Box>
  );
});

ThreeViewer.displayName = "ThreeViewer";
export default ThreeViewer;
