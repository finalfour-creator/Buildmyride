import Link from "next/link";

const featureCars = [
  { img: "/images/1.jpg", alt: "Car 1" },
  { img: "/images/2.jpg", alt: "Car 2" },
  { img: "/images/4.jpg", alt: "Car 3" },
];

export default function ScrollSections() {
  // Prevent GSAP/imperative experience from “fighting” scroll by ensuring smooth scroll behavior
  // is enabled at the document level (handled here to keep changes localized).
  if (typeof document !== "undefined") {
    document.documentElement.style.scrollBehavior = "smooth";
  }

  return (
    <div id="scroll-wrap">
      <section className="ssec ssec-1 on" id="sec-1">
        <div className="scont">
          <div className="stag">// Level 01 — SHOWROOM FLOOR</div>
          <h1 className="stitle">Build My<br />Ride</h1>
          <p className="ssub">
            Customize in 3D. Visualize in AR.<br />Drive your imagination.
          </p>
          <div className="cta-grp">
            <Link href="/login" className="btn-p">START BUILDING</Link>
            <Link href="/login" className="btn-s">VIEW IN AR</Link>
          </div>
        </div>
      </section>

      <section className="ssec ssec-2" id="sec-2">
        <div className="scont">
          <div className="stag">// Level 02 — 3D MODULAR PARTS</div>
          <h2 className="stitle">Swap Modules.
            <br />Shape Style.</h2>
          <div className="spec-grid" style={{ transform: "translateX(-18px)" }}>
            <div className="sg-item">
              <div className="sg-num" style={{ fontSize: "1.1rem" }}>Real Time Preview</div>
              <div className="sg-unit">Preview your changes instantly</div>
            </div>
            <div className="sg-item">
              <div className="sg-num" style={{ fontSize: "1.1rem" }}>SAVE BUILDS</div>
              <div className="sg-unit">Keep multiple configurations</div>
            </div>
            <div className="sg-item">
              <div className="sg-num" style={{ fontSize: "1.1rem" }}>TRENDING DESIGNS</div>
              <div className="sg-unit">Explore what’s popular</div>
            </div>
            <div className="sg-item">
              <div className="sg-num" style={{ fontSize: "1.1rem" }}>SWAP ANYTIME</div>
              <div className="sg-unit">Switch parts as you go</div>
            </div>
          </div>
          <p className="ssub">Big, bold module actions—preview, save, and trend-check your next build.</p>
        </div>
      </section>


      <section className="ssec ssec-3" id="sec-3">
        <div className="scont">
          <div className="stag">// Level 03 — STREET PERFORMANCE</div>
          <h2 className="stitle">Born for<br />the Street</h2>
          <p className="ssub">
            Real-time AR visualization lets you place your configured car in your
            world before you build it. See it. Feel it. Then drive it.
          </p>
          <div className="cta-grp">
            <Link href="/login" className="btn-p">CONFIGURE NOW</Link>
          </div>
        </div>
      </section>

      <section className="ssec ssec-4" id="sec-4">
        <div className="scont">
          <div className="stag">// Feature Cars — GALLERY</div>
          <h2 className="stitle">Choose Your
            <br />Model</h2>
          <div className="feature-row" style={{ marginBottom: 30, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {featureCars.map((c) => (
              <div key={c.img} className="sg-item" style={{ padding: 0, overflow: "hidden" }}>
                <img src={c.img} alt={c.alt} style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }} />
                <div style={{ padding: 14 }}>
                  <div className="car-name" style={{ fontFamily: "var(--fd)", color: "var(--cp)", fontWeight: 900 }}>{c.alt}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="ssub">Tap any spec to start building in 3D.</p>
        </div>
      </section>

      <section className="ssec ssec-5" id="sec-5">
        <div className="scont">
          <div className="stag">// Performance & Customization</div>
          <h2 className="stitle">Dial In
            <br />Your Identity</h2>
          <div className="spec-grid">
            <div className="sg-item"><div className="sg-num">Eco</div><div className="sg-unit">Fuel Mode</div></div>
            <div className="sg-item"><div className="sg-num">Sport</div><div className="sg-unit">Drive Profile</div></div>
            <div className="sg-item"><div className="sg-num">Neo</div><div className="sg-unit">Lighting Package</div></div>
            <div className="sg-item"><div className="sg-num">Pro</div><div className="sg-unit">Wheel Set</div></div>
          </div>
          <div className="cta-grp">
            <Link href="/login" className="btn-p">START CUSTOMIZING</Link>
            <Link href="/login" className="btn-s">CONTACT</Link>
          </div>
        </div>
      </section>

      <section className="ssec ssec-6" id="sec-6">
        <div className="scont">
          <div className="stag">// Call To Action</div>
          <h2 className="stitle">Book a
            <br />Test Drive</h2>
          <p className="ssub">Bring your build to life—schedule a visit and experience it in person.</p>
          <div className="cta-grp">
            <a href="/contact" className="btn-p">BOOK NOW</a>
            <Link href="/login" className="btn-s">CONFIGURE FIRST</Link>
          </div>
        </div>
      </section>


    </div>
  );
}
