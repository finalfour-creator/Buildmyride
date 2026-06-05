"use client";
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import apiClient from '@/lib/axios';
import { useSession } from 'next-auth/react';

const mainNav = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/configurator/designs', label: 'My Designs', badge: '7' },
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
  const [designCount, setDesignCount] = useState(0);
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      apiClient.get("/designs").then(res => {
        setDesignCount(res.data.length);
      }).catch(err => console.error("Sidebar count fetch failed", err));
    }
  }, [status]);

  return (
    <aside style={{
      width: "260px",
      position: "fixed",
      left: 0,
      top: "70px",
      bottom: 0,
      display: "flex",
      flexDirection: "column",
      background: "#0f2027",
      overflowY: "auto",
      padding: "24px 16px",
      borderRight: "1px solid #2c5364"
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {mainNav.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            badge={item.label === 'My Designs' ? designCount.toString() : null}
          />
        ))}
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ height: 1, background: "#2c5364", margin: "20px 0" }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {accountNav.map((item) => <NavItem key={item.href} {...item} />)}
      </div>
    </aside>
  );
}