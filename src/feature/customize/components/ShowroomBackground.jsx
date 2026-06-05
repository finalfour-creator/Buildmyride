"use client";

import { useEffect, useRef, useState, createContext, useContext } from "react";
import { Box } from "@mui/material";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export const ShowroomContext = createContext(null);
export const useShowroom = () => useContext(ShowroomContext);

export default function ShowroomBackground({ children, sx = {} }) {
  const mountRef = useRef(null);
  const [ctx, setCtx] = useState(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const w = container.clientWidth  || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;

    /* ── Scene ──────────────────────────────────────────────────────── */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040710);
    scene.fog = new THREE.FogExp2(0x040710, 0.018); // lighter fog than before

    /* ── Camera ─────────────────────────────────────────────────────── */
    const camera = new THREE.PerspectiveCamera(62, w / h, 0.1, 300);
    camera.position.set(0, 1.8, 14); // low & pulled back for cinematic floor view
    camera.lookAt(0, 0, 0);

    /* ── Renderer ───────────────────────────────────────────────────── */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.6; // brighter overall exposure
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x040710, 1);
    container.appendChild(renderer.domElement);

    /* ── Orbit Controls ─────────────────────────────────────────────── */
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping   = true;
    controls.dampingFactor   = 0.08;
    controls.enablePan       = false;
    controls.minDistance     = 5;
    controls.maxDistance     = 22;
    controls.maxPolarAngle   = Math.PI * 0.48; // ← KEY FIX: prevents looking down
    controls.target.set(0, 0, 0);
    controls.update();

    /* ── Lighting ───────────────────────────────────────────────────── */

    // Stronger ambient so nothing goes pure black
    const ambient = new THREE.AmbientLight(0x0a1020, 2.5);
    scene.add(ambient);

    // Soft overhead key
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(0, 20, 5);
    scene.add(keyLight);

    // ── CENTRE: white-cyan hotspot
    const centreHot = new THREE.PointLight(0xaaffee, 28.0, 20);
    centreHot.position.set(0, 0.3, 3);
    scene.add(centreHot);

    const centreHalo = new THREE.PointLight(0x00ffcc, 14.0, 30);
    centreHalo.position.set(0, 0.8, 5);
    scene.add(centreHalo);

    // ── LEFT: electric blue
    const blueL = new THREE.PointLight(0x0055ff, 22.0, 50);
    blueL.position.set(-13, 1.2, 5);
    scene.add(blueL);

    const blueL2 = new THREE.PointLight(0x0033cc, 12.0, 30);
    blueL2.position.set(-7, 0.5, 7);
    scene.add(blueL2);

    const tealBridge = new THREE.PointLight(0x00aaaa, 8.0, 22);
    tealBridge.position.set(-4, 0.5, 3);
    scene.add(tealBridge);

    // ── RIGHT: hot magenta
    const magentaR = new THREE.PointLight(0xff0088, 24.0, 45);
    magentaR.position.set(9, 1.2, 5);
    scene.add(magentaR);

    const magentaR2 = new THREE.PointLight(0xff1177, 12.0, 28);
    magentaR2.position.set(5, 0.5, 7);
    scene.add(magentaR2);

    // ── FAR RIGHT: amber
    const amberFR = new THREE.PointLight(0xff8800, 22.0, 42);
    amberFR.position.set(18, 1.5, 5);
    scene.add(amberFR);

    const amberFR2 = new THREE.PointLight(0xff6600, 10.0, 24);
    amberFR2.position.set(14, 0.5, 0);
    scene.add(amberFR2);

    /* ── Environment ────────────────────────────────────────────────── */

    // Near-mirror floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(400, 400),
      new THREE.MeshStandardMaterial({
        color:     0x050810,
        roughness: 0.05, // even more mirror-like
        metalness: 0.98,
      })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Grid — brighter lines so they show up
    const grid = new THREE.GridHelper(400, 70, 0x334466, 0x111830);
    grid.position.y = 0.01;
    grid.material.opacity = 0.7;
    grid.material.transparent = true;
    scene.add(grid);

    // Centre floor glow disk
    const diskGeo = new THREE.CircleGeometry(6, 64);
    const diskMat = new THREE.MeshBasicMaterial({
      color:       0x00ffee,
      transparent: true,
      opacity:     0.12,
      blending:    THREE.AdditiveBlending,
      depthWrite:  false,
      side:        THREE.DoubleSide,
    });
    const disk = new THREE.Mesh(diskGeo, diskMat);
    disk.rotation.x = -Math.PI / 2;
    disk.position.y  = 0.015;
    scene.add(disk);

    // Back wall
    const wall = new THREE.Mesh(
      new THREE.PlaneGeometry(400, 80),
      new THREE.MeshStandardMaterial({ color: 0x040710, roughness: 0.98, metalness: 0.0 })
    );
    wall.position.set(0, 40, -36);
    scene.add(wall);

    /* ── Volumetric ceiling beams ────────────────────────────────────── */
    const beams = [];
    const beamGeo = new THREE.CylinderGeometry(0.04, 1.1, 22, 8, 1, true);
    [-2, -1, 0, 1, 2].forEach((i) => {
      const bm = new THREE.MeshBasicMaterial({
        color:       0x00ffcc,
        transparent: true,
        opacity:     0.025,
        side:        THREE.BackSide,
      });
      const beam = new THREE.Mesh(beamGeo, bm);
      beam.position.set(i * 6, 11, -7);
      beams.push(beam);
      scene.add(beam);
    });

    /* ── Floating dust motes ─────────────────────────────────────────── */
    const N = 220;
    const dGeo = new THREE.BufferGeometry();
    const dPos = new Float32Array(N * 3);
    const dVel = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      dPos[i * 3]     = (Math.random() - 0.5) * 34;
      dPos[i * 3 + 1] = Math.random() * 10 + 0.5;
      dPos[i * 3 + 2] = (Math.random() - 0.5) * 22;
      dVel[i * 3]     = (Math.random() - 0.5) * 0.012;
      dVel[i * 3 + 1] = Math.random() * 0.009 + 0.002;
      dVel[i * 3 + 2] = (Math.random() - 0.5) * 0.012;
    }
    dGeo.setAttribute("position", new THREE.BufferAttribute(dPos, 3));
    const dust = new THREE.Points(dGeo, new THREE.PointsMaterial({
      color:       0xffffff,
      size:        0.05,
      transparent: true,
      opacity:     0.7,
      blending:    THREE.AdditiveBlending,
      depthWrite:  false,
    }));
    scene.add(dust);

    /* ── Expose to children via context ─────────────────────────────── */
    setCtx({ scene, camera, renderer, controls });

    /* ── Animation loop ─────────────────────────────────────────────── */
    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = Date.now() * 0.001;

      controls.update();

      // Dust drift
      const pa = dust.geometry.attributes.position.array;
      for (let i = 0; i < pa.length / 3; i++) {
        pa[i * 3]     += dVel[i * 3]     + Math.sin(t * 0.4 + i) * 0.001;
        pa[i * 3 + 1] += dVel[i * 3 + 1];
        pa[i * 3 + 2] += dVel[i * 3 + 2] + Math.cos(t * 0.3 + i) * 0.001;
        if (pa[i * 3 + 1] > 11)           pa[i * 3 + 1] = 0.5;
        if (Math.abs(pa[i * 3])     > 17)  dVel[i * 3]     *= -1;
        if (Math.abs(pa[i * 3 + 2]) > 11)  dVel[i * 3 + 2] *= -1;
      }
      dust.geometry.attributes.position.needsUpdate = true;

      // Beam pulse
      beams.forEach((b, i) => {
        b.material.opacity = 0.018 + Math.sin(t * 0.85 + i) * 0.01;
      });

      // Centre hotspot breathe
      const breathe = Math.sin(t * 0.5) * 0.5 + 0.5;
      centreHot.intensity  = 26.0 + breathe * 5.0;
      centreHalo.intensity = 12.0 + breathe * 4.0;
      disk.material.opacity = 0.09 + breathe * 0.06;

      // Blue left
      blueL.intensity  = 20.0 + Math.sin(t * 0.38) * 3.0;
      blueL2.intensity = 10.0 + Math.sin(t * 0.45) * 2.0;

      // Magenta right
      magentaR.intensity  = 22.0 + Math.sin(t * 0.55 + 1.2) * 4.0;
      magentaR2.intensity = 10.0 + Math.sin(t * 0.60 + 1.2) * 2.0;

      // Amber far-right
      amberFR.intensity  = 20.0 + Math.sin(t * 0.42 + 2.8) * 3.0;
      amberFR2.intensity =  8.0 + Math.sin(t * 0.48 + 2.8) * 2.0;

      renderer.render(scene, camera);
    };
    animate();

    /* ── Resize ─────────────────────────────────────────────────────── */
    const handleResize = () => {
      const el = mountRef.current;
      if (!el) return;
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <ShowroomContext.Provider value={ctx}>
      <Box sx={{ position: "relative", width: "100%", height: "100%", ...sx }}>
        <Box
          ref={mountRef}
          sx={{ position: "absolute", inset: 0, overflow: "hidden" }}
        />
        {children}
      </Box>
    </ShowroomContext.Provider>
  );
}