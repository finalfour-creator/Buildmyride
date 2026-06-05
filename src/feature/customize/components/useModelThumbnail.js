"use client";
import { useEffect, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

/*
 * Module-level caches survive re-renders and hot-reloads.
 * Each GLTF is fetched and rendered exactly once, then the JPEG is reused.
 */
const cache   = new Map();   // modelUrl → JPEG data-URL
const pending = new Map();   // modelUrl → in-flight Promise<string>

/**
 * Returns { thumbnail, loading } for a given GLTF model URL.
 * Pass null / undefined to skip loading.
 *
 * The render happens in an offscreen canvas — no DOM node required.
 */
export function useModelThumbnail(modelUrl) {
  const [dataUrl, setDataUrl] = useState(() => cache.get(modelUrl) ?? null);
  const [loading, setLoading] = useState(!cache.has(modelUrl) && !!modelUrl);

  useEffect(() => {
    if (!modelUrl) { setLoading(false); return; }

    // Already cached — use immediately
    if (cache.has(modelUrl)) {
      setDataUrl(cache.get(modelUrl));
      setLoading(false);
      return;
    }

    /*
     * `cancelled` is LOCAL to this effect run.
     * It prevents stale state updates after unmount / React-strict-mode double-invoke,
     * but it must NOT abort the underlying render — the sibling effect run needs
     * the resolved promise.
     */
    let cancelled = false;

    const run = async () => {
      // Piggyback on an already-running load for the same URL
      if (pending.has(modelUrl)) {
        try {
          const url = await pending.get(modelUrl);
          if (!cancelled) { setDataUrl(url); setLoading(false); }
        } catch {
          if (!cancelled) setLoading(false);
        }
        return;
      }

      // ── Build the offscreen renderer ────────────────────────────────────
      const canvas  = document.createElement("canvas");
      canvas.width  = 160;
      canvas.height = 120;

      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
      } catch {
        // WebGL not available (SSR guard or headless env)
        if (!cancelled) setLoading(false);
        return;
      }

      renderer.setPixelRatio(1);
      renderer.setClearColor(0x0a1a24, 1);   // solid dark-teal — no transparency → no black JPEG

      const scene  = new THREE.Scene();
      scene.background = new THREE.Color(0x0a1a24);

      const camera = new THREE.PerspectiveCamera(40, 160 / 120, 0.01, 1000);

      // Studio lighting — bright enough to reveal even dark / glass parts
      scene.add(new THREE.AmbientLight(0xffffff, 2.5));
      const key = new THREE.DirectionalLight(0xffffff, 2.2);
      key.position.set(4, 6, 5);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0x88ccff, 1.0);
      fill.position.set(-4, 2, -3);
      scene.add(fill);
      const rim = new THREE.DirectionalLight(0x00f2fe, 0.7);
      rim.position.set(0, -2, -5);
      scene.add(rim);

      // ── Promise wraps the async GLTFLoader ───────────────────────────────
      const promise = new Promise((resolve, reject) => {
        new GLTFLoader().load(
          modelUrl,
          (gltf) => {
            /*
             * KEY FIX: do NOT check `cancelled` here.
             * Always complete the render so sibling effect runs (React strict mode)
             * can use the resolved value from `pending`.
             */
            const model = gltf.scene;

            // Make every mesh visible regardless of its source material
            model.traverse((child) => {
              if (!child.isMesh) return;
              const mats = Array.isArray(child.material)
                ? child.material
                : [child.material];

              mats.forEach((m) => {
                // Force glass / transparent surfaces opaque
                m.transparent = false;
                m.opacity      = 1;
                m.depthWrite   = true;

                // Lift near-black colours to a visible steel-blue
                if (m.color) {
                  const { r, g, b } = m.color;
                  if (r < 0.15 && g < 0.15 && b < 0.15) m.color.set(0x607080);
                }

                // Replace unlit (MeshBasicMaterial) with shaded so lights work
                if (m.type === "MeshBasicMaterial") {
                  const prev = m;
                  const next = new THREE.MeshStandardMaterial({
                    color:     prev.color ?? new THREE.Color(0x607080),
                    roughness: 0.45,
                    metalness: 0.55,
                  });
                  if (Array.isArray(child.material)) {
                    child.material[child.material.indexOf(prev)] = next;
                  } else {
                    child.material = next;
                  }
                  prev.dispose();
                }
              });
            });

            scene.add(model);

            // Auto-fit camera
            const box    = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size   = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z) || 1;
            const fovRad = (camera.fov * Math.PI) / 180;
            const dist   = (maxDim / (2 * Math.tan(fovRad / 2))) * 1.75;

            camera.position.set(
              center.x + dist * 0.65,
              center.y + dist * 0.40,
              center.z + dist * 0.90,
            );
            camera.lookAt(center);

            renderer.render(scene, camera);
            const dataURL = canvas.toDataURL("image/jpeg", 0.85);
            renderer.dispose();
            resolve(dataURL);         // always resolve — never reject on cancel
          },
          undefined,
          (err) => {
            console.warn("[ModelThumb] load failed:", modelUrl, err?.message ?? err);
            renderer.dispose();
            reject(err);
          },
        );
      });

      pending.set(modelUrl, promise);

      try {
        const url = await promise;
        cache.set(modelUrl, url);             // cache for all future renders
        if (!cancelled) { setDataUrl(url); setLoading(false); }
      } catch {
        if (!cancelled) setLoading(false);    // load failed — fall back to ▣ icon
      } finally {
        pending.delete(modelUrl);
      }
    };

    run();
    return () => { cancelled = true; };       // cleanup: stop state updates, not the render
  }, [modelUrl]);

  return { thumbnail: dataUrl, loading };
}
