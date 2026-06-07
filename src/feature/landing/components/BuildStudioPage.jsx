"use client";

export default function BuildStudioPage() {
  return (
    <div className="build-studio">
      <div id="scroll-bar" />

      <div id="canvas-wrap">
        <canvas id="c" />
      </div>
      <div id="vignette" />
      <div id="grain" />

      <nav>
        <div className="logo" id="logo">
          Build Studio / 2025
        </div>
        <div className="nav-links" id="nav-links">
          <a id="nav-chassis">Chassis</a>
          <a id="nav-parts">Parts</a>
          <a id="nav-ar">AR Preview</a>
          <a id="nav-summary">Summary</a>
        </div>
      </nav>

      <div id="step-counter">
        <div className="step-pill">
          Step <span className="step-num" id="step-num">1</span> of 5
        </div>
      </div>

      <div id="parts-badge" />

      <div id="h-progress">
        <div className="h-step current" data-step="0" />
        <div className="h-step" data-step="1" />
        <div className="h-step" data-step="2" />
        <div className="h-step" data-step="3" />
        <div className="h-step" data-step="4" />
        <div className="h-step" data-step="5" />
      </div>

      <div id="mode-label">Parts Configuration</div>

      <div id="scroll-hint">
        <span>Scroll</span>
        <div className="hint-arrow">
          <i />
          <i />
          <i />
        </div>
      </div>

      <div id="h-arrow">
        <div className="h-arr-icon">
          <i />
          <i />
          <i />
        </div>
        <span>Continue</span>
      </div>

      <div id="phase-ui">
        <div className="phase-dot active" data-p="0" />
        <div className="phase-dot" data-p="1" />
        <div className="phase-dot" data-p="2" />
      </div>

      <div className="attach-flash" id="attach-flash">
        <span className="attach-flash-text" id="attach-text">ATTACHED</span>
      </div>

      {/* ═══ VERTICAL SCROLL (Hero → Manifesto × 2 → Chassis) ═══ */}
      <div id="v-scroll">
        <div id="v-track">

          {/* HERO */}
          <div className="v-slide" id="slide-hero">
            <div>
              <h1 className="hero-hl">
                <span className="line"><span>Build Your</span></span>
                <span className="line stroke"><span>Dream Car</span></span>
              </h1>
            </div>
            <div className="hero-meta">
              <span>SESSION · 2025.07.14</span>
              <span>STUDIO · BUILD 0042</span>
              <span>SIGNAL · STABLE</span>
            </div>
            <div className="hero-sub">
              <p className="yr">Studio Edition — 2025</p>
              <p>Compose. Preview. Commit.</p>
              <p>Bring the build into reality.</p>
            </div>
          </div>

          {/* MANIFESTO 1 */}
          <div className="v-slide" id="slide-manifesto-1">
            <div className="chapter-num">01</div>
            <div className="side-ticker left">
              <span>BORN IN THE STUDIO</span><span>·</span>
              <span>EVERY BOLT ENGINEERED</span><span>·</span>
              <span>BORN IN THE STUDIO</span><span>·</span>
              <span>EVERY BOLT ENGINEERED</span>
            </div>
            <div className="frame-mark tl" />
            <div className="frame-mark br" />
            <div className="manifesto-content">
              <div className="section-tag">Chapter 01</div>
              <h2 className="manifesto-title">
                <span className="line"><span>Born in</span></span>
                <span className="line stroke"><span>the studio.</span></span>
              </h2>
              <p className="manifesto-body">
                Where engineering meets obsession. Every chassis, every panel, every bolt —
                composed by you. From a blank carbon tub to a finished machine in a single
                seamless gesture.
              </p>
            </div>
          </div>

          {/* MANIFESTO 2 */}
          <div className="v-slide" id="slide-manifesto-2">
            <div className="chapter-num" style={{ left: "auto", right: 44 }}>02</div>
            <div className="side-ticker right">
              <span>MODIFY REALITY</span><span>·</span>
              <span>PROJECT YOUR BUILD</span><span>·</span>
              <span>MODIFY REALITY</span><span>·</span>
              <span>PROJECT YOUR BUILD</span>
            </div>
            <div className="frame-mark tr" />
            <div className="frame-mark bl" />
            <div className="manifesto-content right">
              <div
                className="section-tag"
                style={{ justifyContent: "flex-end", flexDirection: "row-reverse" }}
              >
                Chapter 02
                <span style={{ width: 18, height: 1, background: "var(--accent)" }} />
              </div>
              <h2 className="manifesto-title">
                <span className="line"><span>Modify in</span></span>
                <span className="line stroke"><span>reality.</span></span>
              </h2>
              <p className="manifesto-body">
                Point your phone at any car or any surface. Watch your modifications
                materialise — paint, wheels, kits, exhausts — projected at full scale,
                lit by the world around you.
              </p>
            </div>
          </div>

          {/* CHASSIS SELECTION */}
          <div className="v-slide interactive" id="slide-chassis">
            <div className="chassis-layout">
              <div className="chassis-left">
                <div className="section-tag">Step 01 / Foundation</div>
                <h2 className="section-title">
                  Select<br />Chassis
                </h2>
                <p className="section-body">
                  Choose your base platform. Each chassis unlocks a unique geometry and
                  performance profile that becomes the foundation of everything that follows.
                </p>
              </div>
              <div className="chassis-right" id="chassis-cards" />
            </div>
          </div>

        </div>
      </div>

      {/* ═══ HORIZONTAL SCROLL ═══ */}
      <div id="h-container">
        <div id="h-track">

          {/* ENGINE */}
          <div className="h-slide" id="h-slide-engine">
            <div className="part-layout">
              <div className="part-left">
                <div className="section-tag">Part 01 / Powerplant</div>
                <h2 className="section-title">
                  Engine<br />Block
                </h2>
                <p className="section-body">
                  The heart of your machine. Select a powerplant that defines the soul of
                  your build — from atmospheric purity to turbocharged force.
                </p>
              </div>
              <div className="part-right" id="pr-engine" />
            </div>
          </div>

          {/* BODY */}
          <div className="h-slide" id="h-slide-body">
            <div className="part-layout">
              <div className="part-left">
                <div className="section-tag">Part 02 / Aerodynamics</div>
                <h2 className="section-title">
                  Body<br />Kit
                </h2>
                <p className="section-body">
                  Aerodynamic panels, splitters, and spoilers that shape both form and function.
                  Sculpt the silhouette that defines your machine on the road.
                </p>
              </div>
              <div className="part-right" id="pr-body" />
            </div>
          </div>

          {/* WHEELS */}
          <div className="h-slide" id="h-slide-wheels">
            <div className="part-layout">
              <div className="part-left">
                <div className="section-tag">Part 03 / Contact Patch</div>
                <h2 className="section-title">
                  Wheels<br />& Rims
                </h2>
                <p className="section-body">
                  From forged track mono-blocks to full carbon street wheels. Every gram
                  counts where rubber meets road.
                </p>
              </div>
              <div className="part-right" id="pr-wheels" />
            </div>
          </div>

          {/* EXHAUST */}
          <div className="h-slide" id="h-slide-exhaust">
            <div className="part-layout">
              <div className="part-left">
                <div className="section-tag">Part 04 / Voice</div>
                <h2 className="section-title">
                  Exhaust<br />System
                </h2>
                <p className="section-body">
                  The voice of your car. From whispered titanium to thunderous race-spec
                  catback — choose how your build announces itself.
                </p>
              </div>
              <div className="part-right" id="pr-exhaust" />
            </div>
          </div>

          {/* AR PREVIEW */}
          <div className="h-slide" id="h-slide-ar">
            <div className="ar-layout">
              <div className="ar-left">
                <div className="section-tag">Step 05 / Live Preview</div>
                <h2 className="section-title">
                  AR<br />Preview
                </h2>
                <p className="section-body">
                  Project your build onto reality. Point your phone at any surface — your
                  machine materialises at 1:1 scale, lit by the world around it.
                </p>
                <div className="ar-features">
                  <div className="ar-feat">
                    <span className="arf-num">01</span>
                    <span className="arf-text">Real-time surface detection · depth tracking</span>
                  </div>
                  <div className="ar-feat">
                    <span className="arf-num">02</span>
                    <span className="arf-text">Full 360° walkaround at true 1:1 scale</span>
                  </div>
                  <div className="ar-feat">
                    <span className="arf-num">03</span>
                    <span className="arf-text">Live paint & material preview in AR</span>
                  </div>
                  <div className="ar-feat">
                    <span className="arf-num">04</span>
                    <span className="arf-text">Share as a spatial link · works on any device</span>
                  </div>
                </div>
                <button className="ar-launch-btn">Launch AR Preview <span>→</span></button>
              </div>
              <div className="ar-right">
                <div className="phone-glow" />
                <div className="phone-frame">
                  <div className="phone-notch" />
                  <div className="phone-screen">
                    <div className="ar-grid" />

                    <svg
                      className="ar-car-svg"
                      viewBox="0 0 160 80"
                      fill="none"
                      stroke="#c8a96e"
                      strokeWidth="0.7"
                      strokeLinecap="round"
                    >
                      <path d="M10 60 L25 38 L50 28 L100 26 L130 36 L150 52 L150 60 L10 60 Z" opacity=".9" />
                      <path d="M40 32 L55 22 L95 22 L110 30" opacity=".7" />
                      <circle cx="38" cy="60" r="9" opacity=".85" />
                      <circle cx="38" cy="60" r="4" opacity=".6" />
                      <circle cx="120" cy="60" r="9" opacity=".85" />
                      <circle cx="120" cy="60" r="4" opacity=".6" />
                      <path d="M10 60 L150 60" opacity=".5" />
                      <path d="M30 48 L130 48" opacity=".3" strokeDasharray="2 3" />
                    </svg>

                    <div className="ar-reticle">
                      <div className="corner tl" />
                      <div className="corner tr" />
                      <div className="corner bl" />
                      <div className="corner br" />
                    </div>

                    <div className="ar-scanline" />

                    <div className="ar-hud-top">
                      <span className="live">AR · LIVE</span>
                      <span>TRACKING</span>
                    </div>

                    <div className="ar-hud-bottom">
                      <div className="hub-label">PROJECTED MODEL</div>
                      <div className="hub-value" id="ar-model-label">HX-07 / SPORT</div>
                    </div>
                  </div>
                  <div className="phone-home" />
                </div>
              </div>
            </div>
          </div>

          {/* SUMMARY */}
          <div className="h-slide" id="h-slide-summary">
            <div className="summary-layout">
              <div className="summary-left">
                <div className="section-tag">Build Complete</div>
                <h2 className="section-title" id="build-title">
                  Your<br />
                  <span style={{ WebkitTextStroke: "1px var(--white)", color: "transparent" }}>
                    Build
                  </span>
                </h2>
                <p className="section-body">
                  Review your selections below. Your custom machine is configured,
                  previewed, and ready to commit.
                </p>
              </div>
              <div className="summary-right">
                <ul className="build-list" id="build-list" />
                <div style={{ marginTop: 18, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="build-cta" id="order-btn">
                    Place Order
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ marginLeft: 4 }}>
                      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button className="p-nav-btn" id="next-after-summary">See Community →</button>
                  <button className="p-nav-btn" id="restart-btn">Restart</button>
                </div>
              </div>
            </div>
          </div>

          {/* COMMUNITY */}
          <div className="h-slide" id="h-slide-community">
            <div className="community-layout">
              <div className="community-top">
                <div className="left">
                  <div className="section-tag">The Collective</div>
                  <h2 className="section-title">
                    Built<br />by makers.
                  </h2>
                </div>
                <div className="right">
                  Browse machines from the community. Remix configurations, view them in AR,
                  surface your own builds in the shared garage. 24,817 builders strong.
                </div>
              </div>
              <div className="community-grid" id="community-grid" />
            </div>
          </div>

          {/* FINAL CTA */}
          <div className="h-slide" id="h-slide-cta">
            <div className="cta-layout">
              <div className="cta-tag">Build · Preview · Commit</div>
              <h2 className="cta-title">
                <span className="line"><span>Your machine</span></span>
                <span className="line stroke"><span>starts here.</span></span>
              </h2>
              <p className="cta-sub">
                The studio is open. Compose your geometry, preview it in your driveway, and
                commit when it feels right. Machines of the next decade are not waiting.
              </p>
              <div className="cta-buttons">
                <button className="cta-primary" id="cta-start">
                  Enter The Studio
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button className="cta-secondary" id="cta-demo">Watch Film</button>
              </div>
              <div className="cta-stats">
                <div className="cs-block">
                  <span className="cs-block-num" data-target="24817">0</span>
                  <span className="cs-block-lbl">Builders</span>
                </div>
                <div className="cs-block">
                  <span className="cs-block-num" data-target="198">0</span>
                  <span className="cs-block-lbl">K Builds</span>
                </div>
                <div className="cs-block">
                  <span className="cs-block-num" data-target="4">0</span>
                  <span className="cs-block-lbl">Modes</span>
                </div>
                <div className="cs-block">
                  <span className="cs-block-num" data-target="60">0</span>
                  <span className="cs-block-lbl">FPS · AR</span>
                </div>
              </div>
              <div className="cta-footer">
                <span>Build Studio © 2025</span>
                <span>All Systems Nominal</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
