"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// Navbar.jsx
// Usage: import Navbar from "@/components/Navbar";
//        <Navbar />
// ─────────────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Explore", href: "/explore" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [hovered, setHovered]     = useState(null);
  const [btnHover, setBtnHover]   = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* ── Global font import — add once per project in layout.jsx instead ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600&display=swap');
        @keyframes nav-drop { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        .nav-root { animation: nav-drop 0.5s cubic-bezier(.34,1.56,.64,1) both; }
      `}</style>

      <nav
        className="nav-root"
        style={{
          position:       "fixed",
          top:            0,
          left:           0,
          right:          0,
          zIndex:         100,
          padding:        scrolled ? "12px 48px" : "22px 48px",
          background:     scrolled ? "rgba(6,6,6,0.96)" : "transparent",
          backdropFilter: scrolled ? "blur(24px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(24px)" : "none",
          borderBottom:   scrolled ? "1px solid rgba(255,255,255,0.07)" : "none",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          transition:     "padding 0.4s ease, background 0.4s ease, border-bottom 0.4s ease",
        }}
      >
        {/* ── Logo ── */}
        <Link href="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
          <div style={{
            width: 34, height: 34,
            background: "#fff",
            borderRadius: 9,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: scrolled ? "0 0 0 rgba(255,255,255,0)" : "0 0 18px rgba(255,255,255,0.15)",
            transition: "box-shadow 0.4s",
          }}>
            <span style={{ color:"#000", fontWeight:900, fontSize:17, fontFamily:"Georgia, serif" }}>B</span>
          </div>
          <span style={{
            color: "#fff",
            fontWeight: 800,
            fontSize: 17,
            fontFamily: "'Barlow Condensed', sans-serif",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}>
            BUILD
            <span style={{ color:"rgba(255,255,255,0.35)" }}>MY</span>
            RIDE
          </span>
        </Link>

        {/* ── Desktop nav links ── */}
        <div style={{ display:"flex", gap:36, alignItems:"center" }}>
          {NAV_LINKS.map(({ name, href }) => (
            <Link
              key={name}
              href={href}
              onMouseEnter={() => setHovered(name)}
              onMouseLeave={() => setHovered(null)}
              style={{
                color:          hovered === name ? "#fff" : "rgba(255,255,255,0.5)",
                fontSize:       12,
                fontFamily:     "'Barlow Condensed', sans-serif",
                fontWeight:     700,
                letterSpacing:  "0.12em",
                textTransform:  "uppercase",
                textDecoration: "none",
                transition:     "color 0.2s",
                position:       "relative",
              }}
            >
              {name}
              <span style={{
                position:   "absolute",
                bottom:     -4,
                left:       "50%",
                transform:  "translateX(-50%)",
                width:      hovered === name ? 4 : 0,
                height:     4,
                borderRadius: "50%",
                background: "#fff",
                transition: "width 0.2s ease",
              }}/>
            </Link>
          ))}
        </div>

        {/* ── CTA Buttons ── */}
        <div style={{ display:"flex", gap:12, alignItems:"center" }}>
          {/* Log in */}
          <button
            onClick={() => window.location.href = "/login"}
            onMouseEnter={() => setBtnHover("login")}
            onMouseLeave={() => setBtnHover(null)}
            style={{
              padding:        "9px 26px",
              fontSize:       11,
              fontFamily:     "'Barlow Condensed', sans-serif",
              fontWeight:     700,
              letterSpacing:  "0.12em",
              textTransform:  "uppercase",
              background:     "transparent",
              color:          btnHover === "login" ? "#fff" : "rgba(255,255,255,0.7)",
              border:         `1.5px solid ${btnHover === "login" ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.18)"}`,
              borderRadius:   8,
              cursor:         "pointer",
              transition:     "all 0.22s",
            }}
          >
            Log in
          </button>

          {/* Sign up */}
          <button
            onClick={() => window.location.href = "/signup"}
            onMouseEnter={() => setBtnHover("signup")}
            onMouseLeave={() => setBtnHover(null)}
            style={{
              padding:        "9px 26px",
              fontSize:       11,
              fontFamily:     "'Barlow Condensed', sans-serif",
              fontWeight:     700,
              letterSpacing:  "0.12em",
              textTransform:  "uppercase",
              background:     "#fff",
              color:          "#000",
              border:         "none",
              borderRadius:   8,
              cursor:         "pointer",
              boxShadow:      btnHover === "signup"
                ? "0 8px 32px rgba(255,255,255,0.32)"
                : "0 4px 20px rgba(255,255,255,0.2)",
              transform:      btnHover === "signup" ? "translateY(-2px)" : "none",
              transition:     "all 0.22s",
            }}
          >
            Sign up
          </button>
        </div>
      </nav>
    </>
  );
}
