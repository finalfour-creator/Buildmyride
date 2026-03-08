"use client";

export default function ContactPage() {
  return (
    <>
      <div style={{ minHeight: "100vh", background: "#0a0a0a", padding: "110px 68px 80px" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 24, height: 1.5, background: "rgba(255,255,255,0.45)" }} />
            <span style={{ fontSize: 11, fontFamily: "system-ui, sans-serif", fontWeight: 700, letterSpacing: "0.16em", color: "rgba(255,255,255,0.55)", textTransform: "uppercase" }}>
              BuildMyRide · Contact
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(36px,4.5vw,64px)", fontFamily: "system-ui, sans-serif", fontWeight: 900, lineHeight: 0.96, letterSpacing: "-0.02em", color: "#fff", marginBottom: 12 }}>
            Get in touch
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.52)", maxWidth: 600, lineHeight: 1.75, marginBottom: 26 }}>
            Questions, feedback, or partnership inquiries — we respond quickly.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16, background: "#101010" }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginBottom: 10 }}>
                Send a message
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                <input placeholder="Your name" style={{ padding: 10, borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#fff" }} />
                <input placeholder="Email" style={{ padding: 10, borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#fff" }} />
                <textarea placeholder="Message" rows={4} style={{ padding: 10, borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#fff", resize: "vertical" }} />
                <button style={{ padding: "10px 14px", fontSize: 12, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", background: "#fff", color: "#000", border: "none", borderRadius: 10, cursor: "pointer" }}>
                  Send
                </button>
              </div>
            </div>
            <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16, background: "#101010" }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginBottom: 10 }}>
                Quick info
              </div>
              <div style={{ display: "grid", gap: 8, color: "rgba(255,255,255,0.75)" }}>
                <div>📧 support@buildmyride.pk</div>
                <div>📍 Lahore · Karachi · Islamabad</div>
                <div>🕘 Mon–Sat: 9am–7pm</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
