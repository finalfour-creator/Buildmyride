# Build Studio Landing Page — Implementation Playbook (Refined for this project)

> **Status:** Refined to fit the `BuildMyRide` Next.js project (App Router, **JavaScript/.jsx**, React 19, MUI 7, existing R3F + GSAP + Redux Toolkit dependencies). The original generic playbook is preserved in **Appendix A** at the bottom — the body of this doc is the version you actually execute against.

---

## 0. Context

The user is building a cinematic 3D car-builder landing page based on `build-studio-complete.html`. The original playbook was written generically (TypeScript, `app/studio`, `components/studio/...`, fully-procedural car geometry). This project has its own conventions and a real `Honda-Civic.glb` model. This document re-architects the playbook to:

1. Match the project's **feature-folder + JavaScript** layout.
2. Reuse existing providers (`ThemeRegistry`, `SessionProvider`) instead of inventing new ones.
3. Replace the procedural car with `public/models/Honda-Civic.glb` (loaded via drei `useGLTF`).
4. Keep the rest of the app (login, dashboard, customize) visually intact by scoping the dark studio theme.

Intended outcome: a drop-in 9-prompt build that produces a polished landing experience at `/`, with no regression to other routes.

---

## 1. Project conventions (must follow)

| Aspect | Convention in this repo |
|---|---|
| Language | **JavaScript (.jsx)** — no TypeScript. Drop type annotations from playbook code; use JSDoc only where helpful. |
| Feature layout | `src/feature/<name>/<Name>Page.jsx` + `src/feature/<name>/components/*.jsx`. See `feature/customize`, `feature/landing`. |
| Routing | `src/app/<route>/page.jsx` is a thin server component that imports a feature page. |
| Path alias | `@/*` → `src/*`. |
| Providers | `src/providers/ThemeRegistry.jsx` (MUI + CssBaseline) and `SessionProvider.jsx` already wired in `app/layout.jsx`. **Reuse, don't replace.** |
| Shared layout | `src/components/layout/{LandingNav,Footer,DashboardNav,...}.jsx` exist. The studio has its own bespoke `Navigation` overlay, so these are not used inside the studio, but remain in use elsewhere. |
| 3D loading precedent | `src/components/ui/ThreeViewer.jsx` already loads GLBs via R3F — mirror its loader pattern in the studio `CarModel`. |
| Models on disk | `public/models/Honda-Civic.glb` (primary), `Honda_City_2022.glb`, plus per-part GLBs in `Bumper/`, `Spoilers/`, `Wheels/`, `Hood/`, `Trunk/`, `Door/`, `Lights/`, `Name_Plates/`, `Chassis/`. |
| Existing libs in `package.json` | `@react-three/fiber`, `three`, `@reduxjs/toolkit`, `gsap`, `framer-motion`, `@mui/material`, `motion`. |
| **Missing libs to add** | `@react-three/drei`, `react-redux`, `@gsap/react`, `@mui/material-nextjs`. |

---

## 2. Refined folder structure

The studio lives entirely under `src/feature/landing/`. The store is at top level (`src/store/`) like `providers/` and `lib/`. The existing v1 landing files move to `_archive/` (recoverable, not deleted).

```
src/
  app/
    layout.jsx                              # MODIFY: add fonts (Barlow_Condensed, Inter) + ReduxProvider
    page.jsx                                # unchanged path — still imports `@/feature/landing/LandingPage`
    globals.css                             # ADD: keyframes (arrPulse, hArrPulse, ar-scan, carWire,
                                            #      pulse, phoneFloat, tickerScroll); scoped
                                            #      `body.studio-active { overflow:hidden; height:100vh; background:#080808 }`

  feature/landing/
    LandingPage.jsx                         # entry — replaces v1 LandingPage. 'use client'.
                                            # Toggles `document.body.classList` for studio-active,
                                            # wraps everything in <StudioThemeProvider>, mounts <StudioRoot/>.

    StudioRoot.jsx                          # orchestrator. Calls useStudioScroll. Renders fixed
                                            # canvas wrapper, vertical-stack (phase 0),
                                            # horizontal-stack (phase 1+2), UI chrome, vignette, grain.

    scene/
      StudioCanvas.jsx                      # next/dynamic({ ssr:false }) around <Canvas>.
      Scene.jsx                             # composes lights, ground, CarModel, CameraRig.
      CarModel.jsx                          # ★ loads Honda-Civic.glb via useGLTF; applies float,
                                            #   yaw lerp, body tint by Redux chassis; spins wheels.
      SwappablePart.jsx                     # loads a per-part GLB when its Redux slot is non-null;
                                            #   wrapped by FlyInWrapper for entrance animation.
      CameraRig.jsx                         # useFrame lerps camera toward CAM keyframes.
      LightingRig.jsx                       # useFrame lerps 3 directional lights.
      Ground.jsx                            # floor + accent strip.
      FlyInWrapper.jsx                      # 750ms drop-in + fade for swapped parts.

    sections/
      HeroSection.jsx
      ManifestoSection.jsx                  # prop: chapter ∈ {1,2}
      ChassisSection.jsx
      PartSection.jsx                       # prop: category ∈ {'engine','body','wheels','exhaust'}
      ARPreviewSection.jsx
      SummarySection.jsx
      CommunitySection.jsx
      FinalCTASection.jsx

    ui/
      Navigation.jsx
      PhaseIndicator.jsx
      StepCounter.jsx
      ProgressBar.jsx
      ScrollHint.jsx
      HScrollHint.jsx
      ModeLabel.jsx
      PartsBadge.jsx
      AttachFlash.jsx
      ChassisCard.jsx
      PartCard.jsx
      CommunityCard.jsx
      PhoneMockup.jsx
      MagneticButton.jsx
      KineticText.jsx

    hooks/
      useStudioScroll.js                    # GSAP wheel/touch/key capture → Redux dispatches.
      useActiveCamKey.js                    # derives 'hero'|'engine'|... from phase/vIdx/hIdx.
      useLerp.js                            # lerp, lerpArr, lerpColor helpers.

    data/
      chassis.js                            # CHASSIS_DATA (with id, name, tag, weight, color hex)
      parts.js                              # PARTS_DATA, PART_KEYS, PART_LABELS, PART_ICONS.
                                            #   Each part adds `modelPath: '/models/Spoilers/...' | null`.
                                            #   null = UI-only selection (no 3D mesh swap).
      builds.js                             # BUILDS array for CommunitySection.
      cameraKeyframes.js                    # CAM (pos/look/fov per section), CAR_YAWS, LIGHTS.
      modeLabels.js                         # H_MODE_LABELS.

    theme/
      tokens.js                             # TOKENS — colors, fonts, spacing (mirrors playbook §1).
      studioTheme.js                        # createTheme(dark) using TOKENS — scoped, not global.

    _archive/                               # MOVE existing v1 files here (do not delete yet):
      IntroAnimation.jsx
      HeroSection.jsx                       # old particle-canvas hero
      StatsSection.jsx
      FeaturesSection.jsx
      FeaturedModelsSection.jsx
      PreviewSection.jsx
      CTASection.jsx
      LandingPage.jsx                       # old composer

    CLAUDE_CODE_IMPLEMENTATION_PLAN.md      # THIS FILE — source of truth.

  store/                                    # NEW — top-level, mirrors providers/, lib/
    index.js                                # configureStore({ build, navigation, ui })
    hooks.js                                # useAppSelector, useAppDispatch (plain re-exports)
    slices/
      buildSlice.js
      navigationSlice.js
      uiSlice.js

  providers/
    ThemeRegistry.jsx                       # MODIFY: wrap children with AppRouterCacheProvider from
                                            # `@mui/material-nextjs/v15-appRouter`. Palette unchanged.
    SessionProvider.jsx                     # unchanged
    ReduxProvider.jsx                       # NEW — 'use client', wraps children in <Provider store>.

  feature/landing/theme/
    StudioThemeProvider.jsx                 # 'use client' — nested ThemeProvider using studioTheme.
                                            # Used inside LandingPage.jsx only, so /login, /profile,
                                            # /customize keep the existing light theme.
```

### Differences from the original playbook

1. **`feature/landing/` instead of `components/studio/`** — matches `feature/customize`, `feature/dashboard`.
2. **`.jsx` not `.tsx`** — entire codebase is JS.
3. **Providers are additive** — keep existing `ThemeRegistry` + `SessionProvider`; add `ReduxProvider`. Do NOT create `app/providers.tsx`.
4. **Theme is scoped** — nested `StudioThemeProvider` inside `LandingPage` so the dark palette never leaks to other routes.
5. **`src/store/` at top level** — cross-cutting concern, matches `providers/`/`lib/`.
6. **No procedural `parts/` subdirectory** — replaced by `CarModel.jsx` (GLB) + `SwappablePart.jsx` (per-part GLB).

---

## 3. Honda Civic GLB adaptation

The single biggest change from the original playbook.

**`CarModel.jsx`:**
- `useGLTF('/models/Honda-Civic.glb')` from `@react-three/drei`. Call `useGLTF.preload('/models/Honda-Civic.glb')` at module scope so the first paint warms the cache.
- Render `<primitive object={scene.clone()} />` (clone to avoid mutating the cached scene).
- Behaviors carried over from the playbook's procedural version:
  - **Slow vertical float** — `useFrame` writes `group.position.y = Math.sin(t * 0.5) * 0.032`.
  - **Yaw lerp** — `group.rotation.y` lerps toward `CAR_YAWS[activeKey]`.
  - **Body color tint** — on Redux `build.chassis` change, traverse the cloned scene, find meshes whose names match the body paint pattern (inspect the GLB once with `useGLTF` debug to discover exact names — likely `Body`, `Paint_*`, or similar), and set `material.color`. Cache the cloned material per chassis so we don't mutate the shared cache.
  - **Wheel spin** — find groups named like `Wheel_FL`, `Wheel_FR`, `Wheel_RL`, `Wheel_RR` (confirm in the GLB), increment `rotation.x` ~0.009/frame.

**Swappable parts:**
- For parts that have GLBs on disk (`public/models/{Bumper,Spoilers,Wheels,Hood,...}`), `data/parts.js` records `modelPath`. `SwappablePart.jsx` loads on selection and mounts inside `FlyInWrapper`.
- For purely conceptual selections (e.g. "engine" tuning preset) with no `modelPath`, the 3D-side effect is a camera zoom + lighting shift only. The `PartCard` still dispatches `setPart` + `triggerFlash` so `PartsBadge` and `SummarySection` work uniformly.

**Implication for original playbook §6 Prompt 2:**
- Delete the `parts/` subdirectory work (ChassisMesh, Body, Wheels, Engine, Exhaust, Spoiler procedural meshes).
- Replace with `CarModel.jsx` (GLB) + `SwappablePart.jsx` (per-part GLB).

---

## 4. Theming approach

The existing global theme is **light** (`background.default: #fefcf8`). The studio design is **deeply dark** (`#080808`).

**Chosen approach — scoped:**
- Keep `ThemeRegistry.jsx` global palette unchanged.
- `feature/landing/theme/StudioThemeProvider.jsx` wraps `StudioRoot` in a nested `<ThemeProvider theme={studioTheme}>`.
- `LandingPage.jsx`, on mount, adds `studio-active` class to `document.body`; removes on unmount. `globals.css` defines `body.studio-active { overflow:hidden; height:100vh; background:#080808 }`.
- Result: `/login`, `/profile`, `/customize`, `/dashboard` keep their existing light theme and scroll behavior intact.

**Additionally:** `ThemeRegistry` gets `AppRouterCacheProvider` from `@mui/material-nextjs/v15-appRouter` to prevent MUI FOUC across all routes — one-line wrap, no palette change.

---

## 5. Integration steps (execution order)

1. **Install deps:** `npm i @react-three/drei react-redux @gsap/react @mui/material-nextjs`.
2. **Archive v1 landing:** create `src/feature/landing/_archive/`, move the seven existing `.jsx` files there. Don't delete.
3. **Create store** at `src/store/` (see §6, adapted from original Prompt 1).
4. **Create `ReduxProvider`** in `src/providers/`. Wire into `app/layout.jsx` between `ThemeRegistry` and `SessionProvider`.
5. **Update `ThemeRegistry`** — wrap children with `AppRouterCacheProvider`. Palette unchanged.
6. **Add fonts** in `app/layout.jsx` via `next/font/google` — `Barlow_Condensed` weights `[500,700,800,900]` as `--font-barlow`, `Inter` weights `[300,400,500,600]` as `--font-inter`. Keep `Geist`/`Geist_Mono`; new ones are additive on `<body>`.
7. **Extend `globals.css`** — add the seven looping keyframes; add `body.studio-active { ... }`.
8. **Port data** to `feature/landing/data/*.js` from `build-studio-complete.html`. Add `modelPath` field per part.
9. **Build scene** (adapted §6 Prompts 2–3) — `StudioCanvas` → `Scene` → `CarModel` (GLB) + `CameraRig` + `LightingRig` + `Ground`.
10. **Wire scroll** (`useStudioScroll`, adapted §6 Prompt 4), then UI chrome (§6 Prompt 5), then sections (§6 Prompts 6–8).
11. **Update `app/page.jsx`** — already imports `@/feature/landing/LandingPage`. The path is unchanged; once the new file is in place this is a no-op.
12. **Polish pass** (§6 Prompt 9): MagneticButton, KineticText on headlines, FlyInWrapper on swappable GLB parts, grain overlay, count-up stats.

---

## 6. Architecture decisions

### Library responsibility split (unchanged from original)

| Concern | Library |
|---|---|
| Scroll capture, pinning, scroll-driven progress | GSAP ScrollTrigger |
| 3D scene rendering, camera, lighting | R3F + drei |
| Camera lerp + light color transitions | `useFrame` + raw lerp |
| Section enter/exit reveals, card stagger | Framer Motion |
| Card hover, button feedback | Framer Motion + CSS |
| Continuous BG loops (scanlines, ticker, hint arrows) | CSS keyframes |
| Global state (chassis, parts, phase, navIdx) | Redux Toolkit |
| Local UI state (hover, modal open) | `useState` |
| Page chrome (modals, snackbars, tooltips) | MUI |
| Typography, theming, design tokens | MUI theme (scoped `studioTheme`) + `sx` prop |

### What MUI is and isn't for here

The design is bespoke. **Use MUI for:** the nested `ThemeProvider`, `Box`/`Stack` when natural, `sx` for one-offs, and standard primitives elsewhere in the app. **Don't use MUI for:** chassis/part/community cards, the magnetic CTA buttons, the phone mockup, the kinetic text. Build those as plain styled components via `@mui/material/styles`'s `styled` helper so they still participate in the studio theme.

### R3F architecture

The `<Canvas>` lives **once** in `StudioRoot.jsx` as a fixed-positioned full-screen element behind everything. Section UI sits on top as normal DOM. `CarModel` reads from Redux and re-skins (tint) / swaps GLBs when the build state changes. `CameraRig` and `LightingRig` read the active section from Redux and lerp toward target keyframes in `useFrame`.

---

## 7. Redux store shape

```js
// store/slices/buildSlice.js
// initial: { chassis: null, parts: { engine: null, body: null, wheels: null, exhaust: null }, lastAdded: null }
// reducers: setChassis, setPart (also writes lastAdded with timestamp), resetBuild

// store/slices/navigationSlice.js
// initial: { phase: 0, vIdx: 0, hIdx: 0, navLock: false }
// reducers: setVIdx, setHIdx, setPhase, lockNav, unlockNav, resetNav

// store/slices/uiSlice.js
// initial: { flashText: null, flashTimestamp: 0, hovering: false }
// reducers: triggerFlash (sets flashTimestamp = Date.now()), clearFlash, setHovering
```

`vIdx` is 0..3 (hero, manifesto-1, manifesto-2, chassis). `hIdx` is 0..7 (engine, body, wheels, exhaust, ar, summary, community, cta). Phase 0 = vertical intro, Phase 1 = build (h-scroll), Phase 2 = reveal (h-scroll continues at hIdx >= 6).

---

## 8. Critical gotchas

- **SSR + window/document.** R3F, GSAP ScrollTrigger, and anything reading `window` must not run server-side. `StudioCanvas.jsx` uses `dynamic(() => import('./Scene'), { ssr: false })`. `StudioRoot.jsx` is `'use client'`; all scroll logic inside `useEffect`.
- **React 18/19 StrictMode + GSAP.** Always use `useGSAP` from `@gsap/react`. Raw `gsap.context` without manual cleanup causes double-fire in dev.
- **Redux + App Router.** `ReduxProvider` is `'use client'`. Server components can't pass the store through directly.
- **MUI + App Router hydration.** Wrap `ThemeRegistry` children with `AppRouterCacheProvider` from `@mui/material-nextjs/v15-appRouter`.
- **next/font/google.** Don't use Google Fonts via CSS `@import`. Use `next/font/google` in `app/layout.jsx` — self-hosted, no layout shift.
- **Three.js color management.** `<Canvas gl={{ outputColorSpace: SRGBColorSpace }}>` and `toneMapping={ACESFilmicToneMapping}` set inside `onCreated`. drei's `<Environment>` is optional for HDR reflections.
- **Hydration mismatch from random values.** Any `Math.random()` or `Date.now()` for initial render must run inside `useEffect`/`useMemo`, not during render.
- **Scroll capture.** The studio is one giant pinned experience — wheel events drive Redux, not the page. `body.studio-active { overflow:hidden }`. Use `ScrollTrigger.observe()` or capture wheel events directly and dispatch.
- **GLB cache mutation.** drei's `useGLTF` caches by URL. Clone the scene with `scene.clone()` before mutating materials, or you'll see other consumers' cars take your tint.
- **Scoped theme leak.** If you wrap the studio in a nested `ThemeProvider`, double-check `Navigation` (and any MUI primitives inside the studio) doesn't accidentally use the global `theme.palette.primary` color via inheritance.

---

## 9. Implementation phases

| Phase | Outcome | Verifies |
|---|---|---|
| 1. Foundation | Theme tokens, store, providers, data, fonts wired. Studio route boots. | Visit `/` → see a black page that says "Studio". `/login` still light-themed. |
| 2. 3D scene | `<Canvas>` renders the **Honda Civic GLB**. No interactivity yet. | Civic visible, floats vertically, lit. |
| 3. Rigs | Camera + lighting react to Redux nav state. | Arrow keys cycle sections; camera lerps; lights subtly shift. |
| 4. Scroll | GSAP captures wheel/touch/key → dispatches Redux nav. | One section per gesture; dev overlay shows phase/vIdx/hIdx. |
| 5. UI chrome | Nav, dots, counter, progress bar, badges, flash. | All overlays animate correctly per section. |
| 6. Sections 1 | Hero, Manifesto×2, Chassis. | Vertical flow works; selecting chassis tints the GLB. |
| 7. Sections 2 | Parts ×4 + AR preview. | Horizontal flow; selecting a part with `modelPath` mounts the per-part GLB with fly-in. |
| 8. Sections 3 | Summary, Community, Final CTA. | Place Order flashes, community grid hovers, count-up animates once. |
| 9. Polish | Magnetic buttons, kinetic text, grain, perf pass. | Feels premium. 60fps on mid-range laptop. |

---

## 10. Verification checklist

**Functional:**
- [ ] `/` loads with no console errors on first paint.
- [ ] Wheel/touch/keyboard all navigate through all 12 sections.
- [ ] Selecting a chassis tints the Civic body.
- [ ] Selecting a part with `modelPath` mounts the per-part GLB with FlyIn (drop + fade).
- [ ] Selecting a part without `modelPath` still triggers PartsBadge + flash, with a camera/light shift.
- [ ] Camera reaches a distinct angle for every section.
- [ ] Lighting subtly shifts between sections.
- [ ] AR Preview's "PROJECTED MODEL" label shows current chassis/engine from Redux.
- [ ] Summary shows correct selections + computed price.
- [ ] Place Order flashes overlay, then advances to Community.
- [ ] Final CTA count-up runs once when entering the section.

**Visual polish:**
- [ ] Headlines stutter-reveal char by char (KineticText).
- [ ] CTAs have magnetic hover (MagneticButton).
- [ ] Flash overlay re-triggers reliably (uses `flashTimestamp` as key).
- [ ] Grain texture ~4% opacity, vignette darkens corners.
- [ ] Scroll hints appear/disappear correctly per phase.
- [ ] Phone mockup floats; scan line sweeps continuously.

**No regression:**
- [ ] `/login`, `/profile`, `/dashboard`, `/customize` keep their existing light theme.
- [ ] `body.studio-active` class is removed when leaving `/` — confirm by navigating away and back.

**SSR / hydration:**
- [ ] No "text content did not match" warnings.
- [ ] No FOUC from MUI on first paint.
- [ ] `view-source` on `/` shows no `<canvas>` in initial HTML (StudioCanvas is client-only dynamic).

**Performance:**
- [ ] 60fps on a mid-range laptop with the Civic visible.
- [ ] No memory leaks across 5 minutes of navigation.
- [ ] Studio route code-splits (Three.js + drei + GSAP are heavy).

---

## 11. If something breaks

| Symptom | Likely cause | Fix |
|---|---|---|
| `window is not defined` during build | Three.js/GSAP imported in a server component | Add `'use client'`; or `dynamic({ ssr:false })` for the canvas. |
| Canvas renders but stays black | Camera FOV/position issue, or no light reaching the GLB | Check `<Canvas camera={{ fov:40 }}>`; verify `LightingRig` mounted; verify GLB scale matches camera. |
| Civic looks tiny or huge | GLB scale mismatch vs. camera keyframes | Apply a `scale` prop on the `<primitive>` to match the playbook's procedural car footprint (~3m length). |
| GSAP ScrollTrigger fires twice in dev | React StrictMode | Use `useGSAP` from `@gsap/react`, not raw `gsap.context`. |
| MUI styles flash on initial load | Missing `AppRouterCacheProvider` | Wrap providers tree with `AppRouterCacheProvider` from `@mui/material-nextjs`. |
| Other routes turned dark | Studio theme leaked globally | Confirm `StudioThemeProvider` is nested inside `LandingPage`, not in root `app/layout.jsx`. |
| `body.studio-active` sticks after navigating away | LandingPage unmount cleanup missing | Add cleanup in `useEffect` return that removes the class. |
| Redux reads return undefined | Slice not registered or selector typo | Verify `configureStore` reducer object includes all three slices. |
| Navigation skips sections | navLock too short | Increase lock duration to 1000ms; or buffer wheel delta. |
| GLB material changes for one car leak to others | Mutated shared cached scene | `scene.clone()` and clone materials before tinting. |
| Phone mockup misaligned on mobile | Fixed width 240px | Add `max-width: 80vw`, min-width breakpoint. |
| Count-up runs forever | rAF loop missing termination | Cancelable ref pattern, cancel on unmount. |

---

## 12. Sequence summary

```
Step 0 → Install deps:       npm i @react-three/drei react-redux @gsap/react @mui/material-nextjs
Step 1 → Archive v1:         move existing landing files to feature/landing/_archive/
Step 2 → Foundation:         store, ReduxProvider, ThemeRegistry tweak, fonts, globals.css, data, tokens, StudioThemeProvider
Step 3 → 3D scene:           StudioCanvas + Scene + CarModel(GLB) + Ground + LightingRig (statics)
Step 4 → Rigs:               CameraRig + LightingRig (lerp), CarModel yaw + tint
Step 5 → Scroll:             useStudioScroll wires GSAP → Redux
Step 6 → UI chrome:          Navigation, PhaseIndicator, StepCounter, ProgressBar, ScrollHint, HScrollHint, ModeLabel, PartsBadge, AttachFlash
Step 7 → Sections 1:         Hero, Manifesto×2, Chassis, ChassisCard
Step 8 → Sections 2:         PartSection×4, PartCard, ARPreviewSection, PhoneMockup, SwappablePart, FlyInWrapper
Step 9 → Sections 3:         Summary, Community, CommunityCard, FinalCTA
Step 10 → Polish:            MagneticButton, KineticText, grain, count-up, perf pass
```

Reasonable pace: 2–4 hours of focused work per step. Total: ~2–3 days end-to-end.

Keep `build-studio-complete.html` open during every step — it's the source of truth for geometry numbers (where still relevant for proportions of swappable parts), color values, copy, animation timings, and layout proportions.

---

## Appendix A — Original generic playbook (preserved for reference)

The original TypeScript-flavored, procedural-car version of this playbook is retained below for reference. **Do not execute it directly** — use §1–§12 above. The generic version is useful when porting a section verbatim (data shapes, animation timings, copy).

### A.1 Original architecture decisions

| Concern | Library | Why |
|---|---|---|
| Scroll capture, scroll-pinning, scroll-driven progress | **GSAP ScrollTrigger** | Native wheel/touch handling, pin/unpin, scrubbing. The whole `phase 0 → phase 1 → phase 2` orchestration lives here. |
| 3D scene rendering, camera, lighting | **R3F + drei** | `useFrame` for the render loop, `<Canvas>` once at layout level, components for each car part. |
| Camera lerp + light color transitions | **useFrame + raw lerp** | Smoother than tweening with GSAP for per-frame interpolation. |
| Section enter/exit text reveals, card stagger | **Framer Motion** | `motion.div` with variants. Less code than equivalent GSAP timelines. |
| Card hover states, button press feedback | **Framer Motion + CSS** | `whileHover`, `whileTap`. |
| Continuous background loops | **CSS keyframes** | Browser-native, runs even when tab inactive. |
| Global state | **Redux Toolkit** | Multiple components read this. |
| Local UI state | **useState** | Don't put per-component ephemeral state in Redux. |
| Page chrome | **MUI** | If/when needed. |
| Typography, theming | **MUI theme + sx prop** | One source of truth. |

### A.2 Original file structure (generic, TypeScript)

```
app/
  layout.tsx
  providers.tsx
  globals.css
  studio/
    page.tsx

components/studio/
  StudioRoot.tsx
  scene/
    StudioCanvas.tsx
    Scene.tsx
    CarModel.tsx
    CameraRig.tsx
    LightingRig.tsx
    Ground.tsx
    parts/
      ChassisMesh.tsx
      Body.tsx
      Wheels.tsx
      Engine.tsx
      Exhaust.tsx
      Spoiler.tsx
    FlyInWrapper.tsx
  sections/
    HeroSection.tsx
    ManifestoSection.tsx
    ChassisSection.tsx
    PartSection.tsx
    ARPreviewSection.tsx
    SummarySection.tsx
    CommunitySection.tsx
    FinalCTASection.tsx
  ui/
    Navigation.tsx
    PhaseIndicator.tsx
    StepCounter.tsx
    ProgressBar.tsx
    ScrollHint.tsx
    HScrollHint.tsx
    ModeLabel.tsx
    PartsBadge.tsx
    AttachFlash.tsx
    ChassisCard.tsx
    PartCard.tsx
    CommunityCard.tsx
    PhoneMockup.tsx
    MagneticButton.tsx
    KineticText.tsx

store/
  index.ts
  hooks.ts
  slices/
    buildSlice.ts
    navigationSlice.ts
    uiSlice.ts

theme/
  tokens.ts
  muiTheme.ts

hooks/
  useStudioScroll.ts
  useLerp.ts
  useGSAP.ts

data/
  chassis.ts
  parts.ts
  builds.ts
  cameraKeyframes.ts
  modeLabels.ts
```

### A.3 Original 9 sequential prompts

The original playbook's nine Claude Code prompts (Foundation → R3F shell → Rigs → Scroll → UI → Sections × 3 → Polish) are kept as the procedural baseline. When executing this project, translate each prompt's intent to the refined structure in §2 above:

- `app/studio/page.tsx` → `src/app/page.jsx` (already exists, points to `feature/landing/LandingPage`)
- `components/studio/...` → `src/feature/landing/...`
- `store/` → `src/store/`
- `theme/` → `src/feature/landing/theme/` (+ minor tweak to `src/providers/ThemeRegistry.jsx`)
- `app/providers.tsx` → `src/providers/ReduxProvider.jsx` (new) and `src/providers/ThemeRegistry.jsx` (modified)
- `app/layout.tsx` → `src/app/layout.jsx` (add fonts + ReduxProvider only)
- Procedural `parts/` meshes → deleted; replaced by `CarModel.jsx` (Honda-Civic.glb via `useGLTF`) + `SwappablePart.jsx` (per-part GLBs from `public/models/{Bumper,Spoilers,Wheels,...}`).

For all other content (copy, timings, animation curves, Redux action names, navLock duration of 850ms, lighting keyframes, camera FOV 40, dpr cap of 2, etc.), the original prompts remain authoritative — port them verbatim into the refined file paths.
