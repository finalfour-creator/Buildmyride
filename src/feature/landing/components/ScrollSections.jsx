import Link from "next/link";

export default function ScrollSections() {
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
            <Link href="/configurator/selection" className="btn-p">START BUILDING</Link>
            <a href="#" className="btn-s">VIEW IN AR</a>
          </div>
        </div>
      </section>

      <section className="ssec ssec-2" id="sec-2">
        <div className="scont">
          <div className="stag">// Level 02 — COCKPIT SPECS</div>
          <h2 className="stitle">Precision<br />Engineering</h2>
          <div className="spec-grid">
            <div className="sg-item"><div className="sg-num">320</div><div className="sg-unit">BHP Output</div></div>
            <div className="sg-item"><div className="sg-num">4.2</div><div className="sg-unit">0–100 km/h (s)</div></div>
            <div className="sg-item"><div className="sg-num">285</div><div className="sg-unit">Top Speed km/h</div></div>
            <div className="sg-item"><div className="sg-num">∞</div><div className="sg-unit">Config Options</div></div>
          </div>
          <p className="ssub">Every curve. Every bolt. Every choice. Yours to command.</p>
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
            <Link href="/configurator/selection" className="btn-p">CONFIGURE NOW</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
