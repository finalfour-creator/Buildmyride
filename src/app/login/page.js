"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ─── Moving Cars Canvas Background ───────────────────────────────────────────
function CarsBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const getLanes = () => {
      const count = Math.floor(canvas.height / 80);
      return Array.from({ length: count }, (_, i) => ({
        y: 40 + i * 80,
        dir: i % 2 === 0 ? 1 : -1,
      }));
    };

    const createCar = (lane) => {
      const dir = lane.dir;
      const speed = (1.2 + Math.random() * 2.2) * dir;
      const w = 48 + Math.random() * 28;
      const h = 18 + Math.random() * 8;
      const x = dir === 1 ? -w - Math.random() * 400 : canvas.width + Math.random() * 400;
      const shade = Math.floor(Math.random() * 80);
      const bodyColor = `rgb(${shade},${shade},${shade})`;
      return { x, y: lane.y, w, h, speed, bodyColor, dir };
    };

    let lanes = getLanes();
    let cars = lanes.flatMap((lane) => Array.from({ length: 4 }, () => createCar(lane)));

    const drawCar = (car) => {
      const { x, y, w, h, bodyColor, dir } = car;
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.10)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;

      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.roundRect(x, y - h / 2, w, h, 5);
      ctx.fill();

      ctx.fillStyle = "rgba(0,0,0,0.5)";
      const roofX = dir === 1 ? x + w * 0.25 : x + w * 0.15;
      ctx.beginPath();
      ctx.roundRect(roofX, y - h / 2 - h * 0.42, w * 0.5, h * 0.42, [4, 4, 0, 0]);
      ctx.fill();

      ctx.shadowBlur = 0;

      const wr = h * 0.28;
      [[x + w * 0.2, y + h / 2 - wr * 0.4], [x + w * 0.78, y + h / 2 - wr * 0.4]].forEach(([wx, wy]) => {
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.ellipse(wx, wy, wr * 1.1, wr * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#555";
        ctx.beginPath();
        ctx.ellipse(wx, wy, wr * 0.5, wr * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      const lx = dir === 1 ? x + w - 5 : x;
      ctx.fillStyle = dir === 1 ? "rgba(255,255,255,0.9)" : "rgba(255,200,60,0.85)";
      ctx.shadowColor = dir === 1 ? "#fff" : "rgba(255,200,60,0.7)";
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.roundRect(lx, y - h / 2 + 3, 5, h - 6, 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
    };

    const drawRoadLines = () => {
      lanes.forEach((lane) => {
        ctx.strokeStyle = "rgba(0,0,0,0.05)";
        ctx.lineWidth = 1;
        ctx.setLineDash([24, 24]);
        ctx.beginPath();
        ctx.moveTo(0, lane.y + 30);
        ctx.lineTo(canvas.width, lane.y + 30);
        ctx.stroke();
        ctx.setLineDash([]);
      });
    };

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawRoadLines();
      cars.forEach((car) => {
        car.x += car.speed;
        if (car.dir === 1 && car.x > canvas.width + car.w + 50) {
          const lane = lanes.find((l) => l.y === car.y);
          Object.assign(car, createCar(lane));
          car.x = -car.w - Math.random() * 200;
        } else if (car.dir === -1 && car.x < -car.w - 50) {
          const lane = lanes.find((l) => l.y === car.y);
          Object.assign(car, createCar(lane));
          car.x = canvas.width + Math.random() * 200;
        }
        drawCar(car);
      });
      animationId = requestAnimationFrame(tick);
    };

    tick();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", inset: 0,
        width: "100%", height: "100%",
        zIndex: 0, opacity: 0.38, pointerEvents: "none",
      }}
    />
  );
}

// ─── Floating Label Input ─────────────────────────────────────────────────────
function Input({ label, type = "text", value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  const raised = focused || value?.length > 0;

  return (
    <div style={{ position: "relative", marginBottom: 20 }}>
      <label
        style={{
          position: "absolute", left: 14,
          top: raised ? -9 : 14,
          fontSize: raised ? 10.5 : 14,
          color: focused ? "#000" : "#999",
          background: "#fff", padding: "0 4px",
          transition: "all 0.22s cubic-bezier(.4,0,.2,1)",
          pointerEvents: "none",
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: focused ? 700 : 400,
          letterSpacing: raised ? "0.07em" : 0,
          textTransform: raised ? "uppercase" : "none",
          zIndex: 1,
        }}
      >
        {label}
      </label>
      <input
        type={type} value={value} onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={focused ? placeholder : ""}
        style={{
          width: "100%", padding: "14px 14px", fontSize: 14,
          fontFamily: "'DM Sans', sans-serif",
          border: `1.5px solid ${focused ? "#000" : "#e2e2e2"}`,
          borderRadius: 10, outline: "none",
          background: "#fff", color: "#111",
          boxSizing: "border-box",
          transition: "border-color 0.22s, box-shadow 0.22s",
          boxShadow: focused ? "0 0 0 3px rgba(0,0,0,0.07)" : "none",
        }}
      />
    </div>
  );
}

// ─── Primary Button ───────────────────────────────────────────────────────────
function PrimaryButton({ children, onClick, loading }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={loading}
      style={{
        width: "100%", padding: "15px",
        fontSize: 12.5,
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 700, letterSpacing: "0.11em",
        textTransform: "uppercase",
        background: "#000", color: "#fff",
        border: "none", borderRadius: 10,
        cursor: loading ? "default" : "pointer",
        transition: "transform 0.18s, box-shadow 0.18s",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? "0 12px 32px rgba(0,0,0,0.22)" : "0 4px 14px rgba(0,0,0,0.1)",
        opacity: loading ? 0.65 : 1,
      }}
    >
      {loading ? "Signing in…" : children}
    </button>
  );
}

// ─── Social Button ────────────────────────────────────────────────────────────
function SocialButton({ icon, label }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1, padding: "11px 8px", fontSize: 12,
        fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        background: hovered ? "#f5f5f5" : "#fff", color: "#333",
        border: "1.5px solid #e2e2e2", borderRadius: 10, cursor: "pointer",
        transition: "all 0.2s",
        transform: hovered ? "translateY(-1px)" : "none",
        boxShadow: hovered ? "0 5px 14px rgba(0,0,0,0.08)" : "none",
      }}
    >
      <span style={{ fontSize: 15 }}>{icon}</span>
      {label}
    </button>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function Divider({ text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
      <div style={{ flex: 1, height: 1, background: "#ebebeb" }} />
      <span style={{ fontSize: 10.5, color: "#bbb", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.09em", textTransform: "uppercase" }}>
        {text}
      </span>
      <div style={{ flex: 1, height: 1, background: "#ebebeb" }} />
    </div>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleLogin = () => {
    setLoading(true);
    // TODO: replace with your actual login logic / API call
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=DM+Serif+Display&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fff; }
        input::placeholder { color: #c8c8c8; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>

        {/* Subtle grid */}
        <div style={{
          position: "fixed", inset: 0,
          backgroundImage: "linear-gradient(rgba(0,0,0,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.028) 1px, transparent 1px)",
          backgroundSize: "64px 64px", zIndex: 1, pointerEvents: "none",
        }} />

        <CarsBackground />

        {/* Card */}
        <div style={{
          background: "#fff", borderRadius: 22, padding: "44px 40px", width: 400,
          boxShadow: "0 24px 64px rgba(0,0,0,0.11), 0 4px 18px rgba(0,0,0,0.06)",
          border: "1px solid rgba(0,0,0,0.055)",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.97)",
          transition: "opacity 0.4s ease, transform 0.42s cubic-bezier(.34,1.5,.64,1)",
          position: "relative", zIndex: 10,
        }}>

          {/* Logo */}
          <div style={{ height: 38, background: "#000", borderRadius: 11, marginBottom: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: 20, fontFamily: "Georgia, serif" }}>BuildmyRide</span>
          </div>

          <h1 style={{ margin: "0 0 6px", fontSize: 23, fontWeight: 700, fontFamily: "'DM Serif Display', serif", color: "#0a0a0a", letterSpacing: "-0.02em" }}>
            Welcome back
          </h1>
          <p style={{ margin: "0 0 28px", fontSize: 13.5, color: "#909090", fontFamily: "'DM Sans', sans-serif" }}>
            Sign in to continue your journey.
          </p>

          {/* Social */}
          <div style={{ display: "flex", gap: 10 }}>
            <SocialButton icon="G" label="Google" />
            <SocialButton icon="𝕏" label="Twitter" />
          </div>

          <Divider text="or continue with email" />

          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />

          {/* Forgot password */}
          <div style={{ textAlign: "right", marginTop: -12, marginBottom: 20 }}>
            <span style={{ fontSize: 12, color: "#555", fontFamily: "'DM Sans', sans-serif", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>
              Forgot password?
            </span>
          </div>

          <PrimaryButton onClick={handleLogin} loading={loading}>
            Sign In
          </PrimaryButton>

          <p style={{ textAlign: "center", margin: "22px 0 0", fontSize: 13, color: "#999", fontFamily: "'DM Sans', sans-serif" }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" style={{ color: "#000", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 3 }}>
              Sign up
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div style={{ position: "fixed", bottom: 22, left: "50%", transform: "translateX(-50%)", fontSize: 10.5, color: "#ccc", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.09em", textTransform: "uppercase", zIndex: 10 }}>
          © 2026 Acme Inc. · Privacy · Terms
        </div>
      </div>
    </>
  );
}