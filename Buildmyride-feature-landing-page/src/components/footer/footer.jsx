"use client";
import { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Footer.jsx
// Usage: import Footer from "@/components/Footer";
//        <Footer />
// ─────────────────────────────────────────────────────────────────────────────

const FOOTER_LINKS = {
  Product:  ["Explore Models", "Custom Build", "Color Studio", "AR Preview", "Performance"],
  Company:  ["About Us", "Careers", "Press", "Partners", "Blog"],
  Support:  ["Help Center", "Contact Us", "Warranty", "Dealer Locator", "FAQs"],
  Legal:    ["Privacy Policy", "Terms of Service", "Cookie Policy", "Accessibility"],
};

const SOCIAL = [
  {
    label: "X (Twitter)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: "Instagram",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    label: "YouTube",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23 7s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C16.1 2.8 12 2.8 12 2.8s-4.1 0-6.8.2C4.6 3 3.3 3 2.2 4.2 1.3 5 1 7 1 7S.7 9.3.7 11.5v2.1c0 2.2.3 4.4.3 4.4s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2C7.6 22.1 12 22.1 12 22.1s4.1 0 6.8-.2c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.8 1.2-2.8s.3-2.3.3-4.5v-2c0-2.2-.3-4.3-.3-4.3zm-13.6 8.9V8.1l8.1 3.9-8.1 3.8z"/>
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
];

function FooterLink({ children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href="#"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:        "block",
        fontSize:       13,
        fontFamily:     "'Barlow', sans-serif",
        color:          hovered ? "#fff" : "rgba(255,255,255,0.38)",
        textDecoration: "none",
        marginBottom:   10,
        transition:     "color 0.2s",
        cursor:         "pointer",
      }}
    >
      {children}
    </a>
  );
}

function SocialButton({ icon, label }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      title={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width:      38,
        height:     38,
        background: hovered ? "#fff" : "rgba(255,255,255,0.06)",
        border:     `1px solid ${hovered ? "#fff" : "rgba(255,255,255,0.1)"}`,
        borderRadius: "50%",
        display:    "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor:     "pointer",
        color:      hovered ? "#000" : "rgba(255,255,255,0.55)",
        transition: "all 0.22s",
        transform:  hovered ? "translateY(-3px)" : "none",
        boxShadow:  hovered ? "0 6px 20px rgba(255,255,255,0.2)" : "none",
      }}
    >
      {icon}
    </button>
  );
}

export default function Footer() {
  const [emailHover, setEmailHover] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <footer style={{
      background:   "#080808",
      borderTop:    "1px solid rgba(255,255,255,0.06)",
      fontFamily:   "'Barlow', sans-serif",
    }}>

      {/* ── Top strip — newsletter ── */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        padding:      "40px 60px",
        display:      "flex",
        alignItems:   "center",
        justifyContent: "space-between",
        gap:          24,
        flexWrap:     "wrap",
      }}>
        <div>
          <p style={{ fontSize:11, fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, letterSpacing:"0.16em", textTransform:"uppercase", color:"rgba(255,255,255,0.4)", marginBottom:6 }}>
            Stay in the fast lane
          </p>
          <h3 style={{ fontSize:22, fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, color:"#fff", letterSpacing:"-0.01em" }}>
            Get updates on new builds & releases
          </h3>
        </div>

        {/* Email input */}
        <div style={{ display:"flex", gap:0, flexShrink:0 }}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            style={{
              padding:      "12px 20px",
              fontSize:     13,
              fontFamily:   "'Barlow', sans-serif",
              background:   "rgba(255,255,255,0.05)",
              border:       "1px solid rgba(255,255,255,0.12)",
              borderRight:  "none",
              borderRadius: "8px 0 0 8px",
              color:        "#fff",
              outline:      "none",
              width:        240,
              transition:   "border-color 0.2s",
            }}
            onFocus={e  => e.target.style.borderColor = "rgba(255,255,255,0.35)"}
            onBlur={e   => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
          />
          <button
            onMouseEnter={() => setEmailHover(true)}
            onMouseLeave={() => setEmailHover(false)}
            style={{
              padding:      "12px 22px",
              fontSize:     11,
              fontFamily:   "'Barlow Condensed', sans-serif",
              fontWeight:   800,
              letterSpacing:"0.12em",
              textTransform:"uppercase",
              background:   emailHover ? "#e8e8e8" : "#fff",
              color:        "#000",
              border:       "none",
              borderRadius: "0 8px 8px 0",
              cursor:       "pointer",
              transition:   "background 0.2s",
              whiteSpace:   "nowrap",
            }}
          >
            Subscribe
          </button>
        </div>
      </div>

      {/* ── Main footer grid ── */}
      <div style={{
        padding:       "56px 60px 48px",
        display:       "grid",
        gridTemplateColumns: "1.8fr 1fr 1fr 1fr 1fr",
        gap:           40,
      }}>

        {/* Brand column */}
        <div>
          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
            <div style={{ width:32, height:32, background:"#fff", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ color:"#000", fontWeight:900, fontSize:16, fontFamily:"Georgia, serif" }}>B</span>
            </div>
            <span style={{ color:"#fff", fontWeight:800, fontSize:16, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:"0.1em", textTransform:"uppercase" }}>
              BUILD<span style={{ color:"rgba(255,255,255,0.32)" }}>MY</span>RIDE
            </span>
          </div>

          <p style={{ fontSize:13, color:"rgba(255,255,255,0.38)", lineHeight:1.75, maxWidth:240, marginBottom:28 }}>
            Design and customize your dream vehicle with our cutting-edge configurator. From paint to performance — it&apos;s all yours.
          </p>

          {/* Social icons */}
          <div style={{ display:"flex", gap:10 }}>
            {SOCIAL.map(s => <SocialButton key={s.label} icon={s.icon} label={s.label} />)}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
          <div key={heading}>
            <h4 style={{
              fontSize:      10.5,
              fontFamily:    "'Barlow Condensed', sans-serif",
              fontWeight:    700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color:         "rgba(255,255,255,0.7)",
              marginBottom:  18,
            }}>
              {heading}
            </h4>
            {links.map(l => <FooterLink key={l}>{l}</FooterLink>)}
          </div>
        ))}
      </div>

      {/* ── Features strip ── */}
      <div style={{
        borderTop:  "1px solid rgba(255,255,255,0.05)",
        padding:    "22px 60px",
        display:    "flex",
        justifyContent: "center",
        gap:        60,
        flexWrap:   "wrap",
      }}>
        {[
          { icon:"⚙️", label:"Custom Build",  desc:"100+ Options" },
          { icon:"🎨", label:"Color Studio",  desc:"Any Finish"   },
          { icon:"🏁", label:"Performance",   desc:"Track Ready"  },
          { icon:"💡", label:"AR Preview",    desc:"See it Live"  },
        ].map(({ icon, label, desc }) => (
          <FeatureItem key={label} icon={icon} label={label} desc={desc} />
        ))}
      </div>

      {/* ── Bottom bar ── */}
      <div style={{
        borderTop:      "1px solid rgba(255,255,255,0.04)",
        padding:        "18px 60px",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        flexWrap:       "wrap",
        gap:            12,
      }}>
        <span style={{ fontSize:11.5, color:"rgba(255,255,255,0.22)", fontFamily:"'Barlow', sans-serif" }}>
          © {new Date().getFullYear()} BuildMyRide. All rights reserved.
        </span>

        <div style={{ display:"flex", gap:24 }}>
          {["Privacy Policy", "Terms of Service", "Cookie Settings"].map(t => (
            <a key={t} href="#" style={{ fontSize:11.5, color:"rgba(255,255,255,0.22)", textDecoration:"none", fontFamily:"'Barlow', sans-serif", transition:"color 0.2s" }}
              onMouseEnter={e => e.target.style.color = "rgba(255,255,255,0.6)"}
              onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.22)"}
            >{t}</a>
          ))}
        </div>

        <span style={{ fontSize:11.5, color:"rgba(255,255,255,0.16)", fontFamily:"'Barlow', sans-serif" }}>
          Made with ♥ for car lovers
        </span>
      </div>
    </footer>
  );
}

function FeatureItem({ icon, label, desc }) {
  const [h, setH] = useState(false);
  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{ display:"flex", alignItems:"center", gap:12, cursor:"pointer" }}
    >
      <span style={{ fontSize:20, opacity: h ? 1 : 0.55, transition:"opacity 0.2s" }}>{icon}</span>
      <div>
        <div style={{ fontSize:12, fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color: h ? "#fff" : "rgba(255,255,255,0.45)", transition:"color 0.2s" }}>{label}</div>
        <div style={{ fontSize:11, color:"rgba(255,255,255,0.22)", fontFamily:"'Barlow', sans-serif" }}>{desc}</div>
      </div>
    </div>
  );
}
