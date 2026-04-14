"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const mainNav = [
  { href: '/configurator/dashboard', label: 'Dashboard' },
  { href: '/dashboard/builds', label: 'My Designs', badge: '7' },
  { href: '/configurator/customization', label: '3D Studio' },
  { href: '/ar-view', label: 'AR Preview' },
];

const toolsNav = [
  { href: '/ai-assistant', label: 'AI Assistant' },
  { href: '/dashboard/parts', label: 'Part Library' },
  { href: '/dashboard/colors', label: 'Color Picker' },
  { href: '/dashboard/wheels', label: 'Wheel & Rim' },
];

const accountNav = [
  { href: '/profile', icon: '👤', label: 'Profile' },
  { href: '/settings', icon: '⚙️', label: 'Settings' },
];

function NavItem({ href, icon, label, badge }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "10px 12px",
      textDecoration: "none",
      fontSize: 13,
      fontWeight: 500,
      color: isActive ? "#ffffff" : "#e2e8f0",
      background: isActive ? "rgba(44, 83, 100, 0.4)" : "transparent",
      borderLeft: isActive ? "2px solid #2c5364" : "none",
      transition: "all 0.2s"
    }}>
      <span style={{ fontSize: 16, width: 24 }}>{icon}</span>
      {label}
      {badge && <span style={{ marginLeft: "auto", background: "#2c5364", padding: "2px 6px", fontSize: 10, borderRadius: 12, color: "white" }}>{badge}</span>}
    </Link>
  );
}

export default function Sidebar() {
  return (
    <aside style={{
      width: "260px",
      position: "fixed",
      left: 0,
      top: "70px",
      bottom: 0,
      background: "#0f2027",
      overflowY: "auto",
      padding: "24px 16px",
      borderRight: "1px solid #2c5364"
    }}>
      <p style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "#8a9aa8", margin: "0 0 12px 12px" }}>Main</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {mainNav.map((item) => <NavItem key={item.href} {...item} />)}
      </div>

      <div style={{ height: 1, background: "#2c5364", margin: "20px 0" }} />

      <p style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "#8a9aa8", margin: "0 0 12px 12px" }}>Tools</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {toolsNav.map((item) => <NavItem key={item.href} {...item} />)}
      </div>

      <div style={{ height: 1, background: "#2c5364", margin: "20px 0" }} />

      <p style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "#8a9aa8", margin: "0 0 12px 12px" }}>Account</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {accountNav.map((item) => <NavItem key={item.href} {...item} />)}
      </div>

      <div style={{ marginTop: 32, padding: "16px 12px 0", borderTop: "1px solid #2c5364" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#8a9aa8", marginBottom: 8 }}>
          <span>Storage</span>
          <span>620 MB / 1 GB</span>
        </div>
        <div style={{ height: 4, background: "#2c5364", overflow: "hidden" }}>
          <div style={{ height: "100%", width: "62%", background: "#4a7c9c" }} />
        </div>
      </div>
    </aside>
  );
}