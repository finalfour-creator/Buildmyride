"use client";

export default function AboutPage() {
  return (
    <>
      <div style={{ minHeight: "100vh", background: "#0a0a0a", padding: "110px 68px 80px" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 24, height: 1.5, background: "rgba(255,255,255,0.45)" }} />
            <span style={{ fontSize: 11, fontFamily: "system-ui, sans-serif", fontWeight: 700, letterSpacing: "0.16em", color: "rgba(255,255,255,0.55)", textTransform: "uppercase" }}>
              BuildMyRide · About
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(36px,4.5vw,64px)", fontFamily: "system-ui, sans-serif", fontWeight: 900, lineHeight: 0.96, letterSpacing: "-0.02em", color: "#fff", marginBottom: 12 }}>
            Pakistan’s #1 Car Configurator
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.52)", maxWidth: 640, lineHeight: 1.75, marginBottom: 26 }}>
            BuildMyRide lets you explore models, customize configurations, and preview in AR — fast, free, and beautifully designed.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            {[{ v:"50K+", l:"Happy Customers" }, { v:"8+", l:"Car Brands" }, { v:"15+", l:"Dealerships" }].map(s => (
              <div key={s.l} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16, background: "#101010" }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>{s.v}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
