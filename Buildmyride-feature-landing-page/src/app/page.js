"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// HeroSection.jsx  —  Real car photography via Unsplash (free, no API key)
// Usage: import HeroSection from "@/components/HeroSection";
//        <HeroSection />
// ─────────────────────────────────────────────────────────────────────────────

// Real car photos — Unsplash free-use URLs (no API key needed, w=1600 for HD)
// Each slide has a primary photo + a subtle secondary (used as blurred BG layer)
const SLIDES = [
  {
    id:          "hero-1",
    tag:         "SIGNATURE PERSPECTIVE",
    title:       "Built to",
    titleAccent: "Dominate",
    sub:         "Honda Civic Type-R in its most iconic three-quarter stance. Every line sculpted to slice the air.",
    stat1:       { v: "315",   u: "HP"     },
    stat2:       { v: "2.0L",  u: "VTEC"   },
    label:       "3/4 Front",
    // Honda Civic Type R — 3/4 front
    img:         "https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=1400&q=85&auto=format&fit=crop",
    imgFallback: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1400&q=80&auto=format&fit=crop",
  },
  {
    id:          "hero-2",
    tag:         "PURE SILHOUETTE",
    title:       "Lines that",
    titleAccent: "Inspire",
    sub:         "The fastback profile — a perfect marriage of aerodynamics and head-turning aggression.",
    stat1:       { v: "0–100", u: "5.4s"   },
    stat2:       { v: "270",   u: "km/h"   },
    label:       "Side Profile",
    // Sleek sports car side profile
    img:         "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1400&q=85&auto=format&fit=crop",
    imgFallback: "https://images.unsplash.com/photo-1542362567-b07e54358753?w=1400&q=80&auto=format&fit=crop",
  },
  {
    id:          "hero-3",
    tag:         "FACE THE FUTURE",
    title:       "Engineered",
    titleAccent: "Fierce",
    sub:         "Razor DRL strips, sculpted hood, and a front fascia that means business at every intersection.",
    stat1:       { v: "AWD",   u: "SPORT"  },
    stat2:       { v: "6MT",   u: "MANUAL" },
    label:       "Front View",
    // Car front face dramatic lighting
    img:         "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1400&q=85&auto=format&fit=crop",
    imgFallback: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1400&q=80&auto=format&fit=crop",
  },
  {
    id:          "hero-4",
    tag:         "THE FINALE",
    title:       "Leave them",
    titleAccent: "Behind",
    sub:         "Dual exhaust, race-tuned diffuser, and LED tail lights painting the night. This is what they see last.",
    stat1:       { v: "SPORT", u: "EXHAUST"},
    stat2:       { v: "LSD",   u: "DIFF"   },
    label:       "Rear",
    // Car rear night shot
    img:         "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1400&q=85&auto=format&fit=crop",
    imgFallback: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=1400&q=80&auto=format&fit=crop",
  },
];

// ─── Floating particles ───────────────────────────────────────────────────────
function Particles() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    let id;
    const resize = () => { c.width = c.offsetWidth; c.height = c.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const pts = Array.from({ length: 45 }, () => ({
      x:  Math.random() * c.width,
      y:  Math.random() * c.height,
      r:  Math.random() * 1.2 + 0.3,
      vx: (Math.random() - .5) * .22,
      vy: (Math.random() - .5) * .22,
      o:  Math.random() * .12 + .03,
    }));
    const tick = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > c.width)  p.vx *= -1;
        if (p.y < 0 || p.y > c.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.o})`;
        ctx.fill();
      });
      id = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, []);
  return (
    <canvas
      ref={ref}
      style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:3 }}
    />
  );
}

// ─── Stat ring ────────────────────────────────────────────────────────────────
function StatRing({ value, unit, animKey }) {
  const [dash, setDash] = useState(0);
  useEffect(() => {
    setTimeout(() => setDash(0), 0);
    const t = setTimeout(() => setDash(182.2), 100);
    return () => clearTimeout(t);
  }, [animKey]);
  return (
    <svg width="74" height="74" viewBox="0 0 74 74">
      <circle cx="37" cy="37" r="29" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3.5"/>
      <circle cx="37" cy="37" r="29" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="3.5"
        strokeDasharray={`${dash} 182.2`} strokeDashoffset="45" strokeLinecap="round"
        style={{
          transition: "stroke-dasharray 1.3s cubic-bezier(.4,0,.2,1)",
          transformOrigin: "center",
          transform: "rotate(-90deg) scaleX(-1) translateX(-74px)",
        }}
      />
      <text x="37" y="35" textAnchor="middle" fill="white" fontSize="13" fontWeight="800" fontFamily="'Barlow Condensed',sans-serif">{value}</text>
      <text x="37" y="48" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="8" fontFamily="'Barlow Condensed',sans-serif">{unit}</text>
    </svg>
  );
}

// ─── Car image with reveal animation ─────────────────────────────────────────
function CarImage({ src, fallback, alt, visible, dir }) {
  const [imgSrc, setImgSrc] = useState(src);
  const [loaded,  setLoaded]  = useState(false);

  // Reset loaded state when src changes
  useEffect(() => {
    setTimeout(() => setLoaded(false), 0);
    setTimeout(() => setImgSrc(src), 0);
  }, [src]);

  const style = {
    width:      "100%",
    height:     "100%",
    objectFit:  "cover",
    objectPosition: "center",
    opacity:    loaded && visible ? 1 : 0,
    transform:  loaded && visible
      ? "scale(1) translateX(0)"
      : `scale(1.06) translateX(${dir * 40}px)`,
    transition: "opacity 0.65s ease, transform 0.75s cubic-bezier(.4,0,.2,1)",
    position:   "absolute",
    inset:      0,
  };

  return (
    <>
      {/* Skeleton shimmer while loading */}
      {!loaded && (
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg, #111 25%, #1a1a1a 50%, #111 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite",
        }}/>
      )}
      <img
        src={imgSrc}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => { setImgSrc(fallback); }}
        style={style}
        draggable={false}
      />
    </>
  );
}

// ─── Main HeroSection ─────────────────────────────────────────────────────────
export default function HeroSection() {
  const [cur,     setCur]     = useState(0);
  const [prev,    setPrev]    = useState(null);
  const [phase,   setPhase]   = useState("idle"); // idle | exit | enter
  const [textIn,  setTextIn]  = useState(true);
  const [dir,     setDir]     = useState(1);
  const autoRef = useRef(null);
  const slide = SLIDES[cur];

  const goTo = useCallback((idx, d = 1) => {
    if (idx === cur || phase !== "idle") return;
    clearInterval(autoRef.current);
    setDir(d);
    setPhase("exit");
    setTextIn(false);

    setTimeout(() => {
      setPrev(cur);
      setCur(idx);
      setPhase("enter");
      setTimeout(() => {
        setPhase("idle");
        setTextIn(true);
        setPrev(null);
      }, 700);
    }, 420);

    autoRef.current = setInterval(() => setCur(c => (c + 1) % SLIDES.length), 6000);
  }, [cur, phase]);

  const goNext = useCallback(() => goTo((cur + 1) % SLIDES.length, 1),  [cur, goTo]);
  const goPrev = useCallback(() => goTo((cur - 1 + SLIDES.length) % SLIDES.length, -1), [cur, goTo]);

  useEffect(() => {
    autoRef.current = setInterval(goNext, 6000);
    return () => clearInterval(autoRef.current);
  }, [goNext]);

  return (
    <section style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", overflow:"hidden", background:"#050505" }}>

      {/* ── Fullscreen car image background ── */}
      <div style={{ position:"absolute", inset:0, zIndex:1 }}>
        {/* Current slide image */}
        <CarImage
          src={slide.img}
          fallback={slide.imgFallback}
          alt={slide.label}
          visible={phase !== "exit"}
          dir={dir}
        />

        {/* Cinematic darkening overlays */}
        {/* Left gradient — where text lives */}
        <div style={{
          position:   "absolute", inset: 0, zIndex: 2,
          background: "linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.70) 35%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.15) 80%, transparent 100%)",
        }}/>
        {/* Bottom vignette */}
        <div style={{
          position:   "absolute", inset: 0, zIndex: 2,
          background: "linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 45%)",
        }}/>
        {/* Top vignette */}
        <div style={{
          position:   "absolute", inset: 0, zIndex: 2,
          background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 30%)",
        }}/>
      </div>

      {/* Subtle grid texture over image */}
      <div style={{
        position:"absolute", inset:0, zIndex:3, pointerEvents:"none",
        backgroundImage:"linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
        backgroundSize:"64px 64px",
      }}/>

      <Particles/>

      {/* ── Content ── */}
      <div style={{
        position:   "relative",
        zIndex:     10,
        width:      "100%",
        maxWidth:   1280,
        margin:     "0 auto",
        padding:    "120px 72px 100px",
        display:    "grid",
        gridTemplateColumns: "1fr 1fr",
        gap:        40,
        alignItems: "flex-end",
      }}>

        {/* ── LEFT: Text panel ── */}
        <div>
          {/* Tag */}
          <div style={{
            display:   "inline-flex", alignItems:"center", gap:10, marginBottom:24,
            opacity:   textIn ? 1 : 0,
            transform: textIn ? "none" : "translateY(-10px)",
            transition:"all 0.45s ease 0.05s",
          }}>
            <div style={{ width:28, height:1.5, background:"rgba(255,255,255,0.6)" }}/>
            <span style={{ fontSize:10.5, fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, letterSpacing:"0.22em", color:"rgba(255,255,255,0.65)", textTransform:"uppercase" }}>
              {slide.tag}
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize:   "clamp(56px, 7vw, 96px)",
            fontFamily: "'Barlow Condensed',sans-serif",
            fontWeight: 900,
            lineHeight: 0.92,
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            color:      "#fff",
            marginBottom: 22,
            opacity:    textIn ? 1 : 0,
            transform:  textIn ? "none" : "translateY(24px)",
            transition: "all 0.6s cubic-bezier(.34,1.4,.64,1) 0.18s",
            textShadow: "0 2px 30px rgba(0,0,0,0.6)",
          }}>
            {slide.title}
            <br/>
            <span style={{ WebkitTextStroke:"2px rgba(255,255,255,0.9)", color:"transparent", textShadow:"0 0 80px rgba(255,255,255,0.08)" }}>
              {slide.titleAccent}
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize:   15,
            color:      "rgba(255,255,255,0.6)",
            lineHeight: 1.75,
            fontFamily: "'Barlow',sans-serif",
            maxWidth:   420,
            marginBottom: 38,
            opacity:    textIn ? 1 : 0,
            transform:  textIn ? "none" : "translateY(16px)",
            transition: "all 0.5s ease 0.3s",
            textShadow: "0 1px 10px rgba(0,0,0,0.8)",
          }}>
            {slide.sub}
          </p>

          {/* Stats */}
          <div style={{
            display:     "flex", gap:24, alignItems:"center", marginBottom:46,
            opacity:     textIn ? 1 : 0,
            transform:   textIn ? "none" : "translateY(12px)",
            transition:  "all 0.5s ease 0.4s",
          }}>
            <StatRing value={slide.stat1.v} unit={slide.stat1.u} animKey={cur}/>
            <StatRing value={slide.stat2.v} unit={slide.stat2.u} animKey={cur}/>
            <div style={{ width:1, height:64, background:"rgba(255,255,255,0.12)", marginLeft:4 }}/>
            <div>
              <div style={{ fontSize:44, fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, color:"rgba(255,255,255,0.06)", lineHeight:1 }}>
                0{cur + 1}
              </div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.28)", letterSpacing:"0.1em", fontFamily:"'Barlow Condensed',sans-serif" }}>
                / 04
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div style={{
            display:    "flex", gap:14,
            opacity:    textIn ? 1 : 0,
            transform:  textIn ? "none" : "translateY(14px)",
            transition: "all 0.5s ease 0.48s",
          }}>
            <Link
              href="/auth"
              style={{ padding:"15px 42px", fontSize:12, fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, letterSpacing:"0.14em", textTransform:"uppercase", background:"#fff", color:"#000", border:"none", borderRadius:10, cursor:"pointer", boxShadow:"0 6px 30px rgba(0,0,0,0.5)", transition:"all 0.22s", textDecoration:"none", display:"inline-flex", alignItems:"center", justifyContent:"center" }}
              onMouseEnter={e=>{ e.target.style.transform="translateY(-3px)"; e.target.style.boxShadow="0 14px 40px rgba(0,0,0,0.6)"; }}
              onMouseLeave={e=>{ e.target.style.transform="none"; e.target.style.boxShadow="0 6px 30px rgba(0,0,0,0.5)"; }}
            >Get Started</Link>
            <Link
              href="/explore"
              style={{ padding:"15px 42px", fontSize:12, fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", background:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.85)", border:"1.5px solid rgba(255,255,255,0.25)", borderRadius:10, cursor:"pointer", backdropFilter:"blur(8px)", transition:"all 0.22s", textDecoration:"none", display:"inline-flex", alignItems:"center", justifyContent:"center" }}
              onMouseEnter={e=>{ e.target.style.background="rgba(255,255,255,0.15)"; e.target.style.borderColor="rgba(255,255,255,0.55)"; e.target.style.color="#fff"; e.target.style.transform="translateY(-3px)"; }}
              onMouseLeave={e=>{ e.target.style.background="rgba(255,255,255,0.08)"; e.target.style.borderColor="rgba(255,255,255,0.25)"; e.target.style.color="rgba(255,255,255,0.85)"; e.target.style.transform="none"; }}
            >Explore Models</Link>
          </div>
        </div>

        {/* ── RIGHT: Slide thumbnails panel ── */}
        <div style={{
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "flex-end",
          gap:            12,
          paddingBottom:  8,
        }}>
          {SLIDES.map((s, i) => {
            const active = i === cur;
            return (
              <button
                key={s.id}
                onClick={() => goTo(i, i > cur ? 1 : -1)}
                style={{
                  display:      "flex",
                  alignItems:   "center",
                  gap:          14,
                  padding:      "10px 14px 10px 10px",
                  background:   active ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.35)",
                  border:       `1px solid ${active ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 12,
                  cursor:       "pointer",
                  backdropFilter: "blur(16px)",
                  transition:   "all 0.3s",
                  transform:    active ? "translateX(-8px) scale(1.02)" : "none",
                  boxShadow:    active ? "0 8px 28px rgba(0,0,0,0.5)" : "none",
                  width:        220,
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; }}}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "rgba(0,0,0,0.35)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}}
              >
                {/* Thumbnail */}
                <div style={{
                  width: 52, height: 38, borderRadius: 7, overflow:"hidden",
                  border: `1px solid ${active ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)"}`,
                  flexShrink: 0,
                  position: "relative",
                }}>
                  <img
                    src={`${s.img}&w=120&q=70`}
                    alt={s.label}
                    style={{ width:"100%", height:"100%", objectFit:"cover" }}
                  />
                  {active && (
                    <div style={{ position:"absolute", inset:0, background:"rgba(255,255,255,0.15)" }}/>
                  )}
                </div>

                {/* Text */}
                <div style={{ textAlign:"left" }}>
                  <div style={{ fontSize:11, fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color: active ? "#fff" : "rgba(255,255,255,0.5)", transition:"color 0.3s" }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize:10, color:"rgba(255,255,255,0.28)", fontFamily:"'Barlow',sans-serif", marginTop:2 }}>
                    0{i + 1} / 04
                  </div>
                </div>

                {/* Active indicator dot */}
                {active && (
                  <div style={{ marginLeft:"auto", width:6, height:6, borderRadius:"50%", background:"#fff", flexShrink:0, boxShadow:"0 0 10px rgba(255,255,255,0.7)" }}/>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Bottom info bar ── */}
      <div style={{
        position:       "absolute",
        bottom:         0, left:0, right:0,
        zIndex:         10,
        padding:        "18px 72px",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        background:     "linear-gradient(0deg, rgba(0,0,0,0.75) 0%, transparent 100%)",
        borderTop:      "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(2px)",
      }}>
        {/* Slide label */}
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:36, height:1, background:"rgba(255,255,255,0.3)" }}/>
          <span style={{ fontSize:11, fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(255,255,255,0.45)" }}>
            {slide.label}
          </span>
        </div>

        {/* Progress dots */}
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => goTo(i, i > cur ? 1 : -1)} style={{
              width:      i === cur ? 24 : 6,
              height:     6,
              borderRadius: 3,
              background: i === cur ? "#fff" : "rgba(255,255,255,0.25)",
              border:     "none",
              cursor:     "pointer",
              transition: "all 0.4s ease",
              padding:    0,
              boxShadow:  i === cur ? "0 0 10px rgba(255,255,255,0.5)" : "none",
            }}/>
          ))}
        </div>

        {/* Arrow controls */}
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={goPrev} style={{
            width:46, height:46,
            background:   "rgba(255,255,255,0.07)",
            border:       "1px solid rgba(255,255,255,0.15)",
            borderRadius: "50%",
            cursor:       "pointer",
            display:      "flex", alignItems:"center", justifyContent:"center",
            color:        "rgba(255,255,255,0.65)",
            fontSize:     20,
            backdropFilter: "blur(12px)",
            transition:   "all 0.22s",
          }}
          onMouseEnter={e=>{ e.currentTarget.style.background="#fff"; e.currentTarget.style.color="#000"; e.currentTarget.style.borderColor="#fff"; e.currentTarget.style.boxShadow="0 0 20px rgba(255,255,255,0.25)"; }}
          onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.07)"; e.currentTarget.style.color="rgba(255,255,255,0.65)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.15)"; e.currentTarget.style.boxShadow="none"; }}
          >‹</button>
          <button onClick={goNext} style={{
            width:46, height:46,
            background:   "rgba(255,255,255,0.07)",
            border:       "1px solid rgba(255,255,255,0.15)",
            borderRadius: "50%",
            cursor:       "pointer",
            display:      "flex", alignItems:"center", justifyContent:"center",
            color:        "rgba(255,255,255,0.65)",
            fontSize:     20,
            backdropFilter: "blur(12px)",
            transition:   "all 0.22s",
          }}
          onMouseEnter={e=>{ e.currentTarget.style.background="#fff"; e.currentTarget.style.color="#000"; e.currentTarget.style.borderColor="#fff"; e.currentTarget.style.boxShadow="0 0 20px rgba(255,255,255,0.25)"; }}
          onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.07)"; e.currentTarget.style.color="rgba(255,255,255,0.65)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.15)"; e.currentTarget.style.boxShadow="none"; }}
          >›</button>
        </div>
      </div>

      {/* Progress line */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2, background:"rgba(255,255,255,0.05)", zIndex:11 }}>
        <div style={{ height:"100%", background:"rgba(255,255,255,0.6)", width:`${((cur+1)/SLIDES.length)*100}%`, transition:"width 0.6s ease", boxShadow:"0 0 8px rgba(255,255,255,0.4)" }}/>
      </div>

      {/* Keyframes */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;600;700;800;900&family=Barlow:wght@400;500;600&display=swap');
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>
    </section>
  );
}
