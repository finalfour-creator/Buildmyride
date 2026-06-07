"use client";

import Link from "next/link";
import { Box, Typography, Button, Skeleton } from "@mui/material";
import DesignCard from "@/feature/dashboard/components/DesignCard";
import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback, useRef } from "react";
import apiClient from "@/lib/axios";
import { useSearchParams } from "next/navigation";
import gsap from "gsap";

const quickActions = [
  { href: "/configurator/customization", title: "New Design", desc: "Create a custom vehicle configuration" },
  { href: "/ar-view", title: "AR Preview", desc: "Visualize modifications on your vehicle" },
  { href: "/ai-assistant", title: "AI Assistant", desc: "Get intelligent design recommendations" },
];

function DashboardSkeleton() {
  return (
    <Box sx={{ maxWidth: 1400, margin: "0 auto", px: { xs: 2, md: 4 }, py: 4 }}>
      {/* Welcome skeleton */}
      <Skeleton variant="rounded" height={100} sx={{ borderRadius: 3, mb: 5, bgcolor: "rgba(0,0,0,0.06)" }} animation="wave" />

      {/* Section label */}
      <Skeleton variant="rounded" width={140} height={14} sx={{ borderRadius: 1, mb: 2.5, bgcolor: "rgba(0,0,0,0.05)" }} animation="wave" />

      {/* Quick actions skeleton */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 3, mb: 6 }}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} variant="rounded" height={96} sx={{ borderRadius: 3, bgcolor: "rgba(0,0,0,0.06)" }} animation="wave" />
        ))}
      </Box>

      {/* Tabs skeleton */}
      <Box sx={{ display: "flex", gap: 2, mb: 4, borderBottom: "1px solid rgba(0,0,0,0.06)", pb: 1.5 }}>
        <Skeleton variant="rounded" width={100} height={20} sx={{ borderRadius: 1, bgcolor: "rgba(0,0,0,0.05)" }} animation="wave" />
        <Skeleton variant="rounded" width={120} height={20} sx={{ borderRadius: 1, bgcolor: "rgba(0,0,0,0.05)" }} animation="wave" />
      </Box>

      {/* Design cards skeleton */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 3, mb: 6 }}>
        {[0, 1, 2].map((i) => (
          <Box key={i} sx={{ borderRadius: 3, overflow: "hidden", bgcolor: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <Skeleton variant="rectangular" height={140} sx={{ bgcolor: "rgba(0,0,0,0.08)" }} animation="wave" />
            <Box sx={{ p: 2 }}>
              <Skeleton variant="rounded" width="60%" height={16} sx={{ borderRadius: 1, mb: 1, bgcolor: "rgba(0,0,0,0.06)" }} animation="wave" />
              <Skeleton variant="rounded" width="40%" height={12} sx={{ borderRadius: 1, bgcolor: "rgba(0,0,0,0.04)" }} animation="wave" />
            </Box>
          </Box>
        ))}
      </Box>

      {/* Stats skeleton */}
      <Skeleton variant="rounded" height={110} sx={{ borderRadius: 3, bgcolor: "rgba(0,0,0,0.06)" }} animation="wave" />
    </Box>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "designs");
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const pageRef = useRef(null);
  const welcomeRef = useRef(null);
  const quickActionsRef = useRef(null);
  const tabBarRef = useRef(null);
  const contentRef = useRef(null);
  const statsRef = useRef(null);

  useEffect(() => {
    if (tabParam) setActiveTab(tabParam);
  }, [tabParam]);

  const fetchDesigns = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await apiClient.get("/designs");
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.designs ?? res.data?.data ?? [];
      setDesigns(data);
    } catch (error) {
      console.error("Failed to fetch designs:", error);
      setFetchError("Could not load your designs. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchDesigns();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, fetchDesigns]);

  // GSAP entry animations
  useEffect(() => {
    if (loading || status !== "authenticated" || !pageRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.fromTo(welcomeRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 });

      tl.fromTo(
        quickActionsRef.current?.querySelectorAll(".quick-action-card"),
        { scale: 0.55, y: 24, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 0.65, stagger: 0.08, ease: "back.out(1.4)" },
        "-=0.3"
      );

      tl.fromTo(tabBarRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, "-=0.2");
      tl.fromTo(contentRef.current, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, "-=0.2");
      tl.fromTo(statsRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, "-=0.2");

      // Count-up animation for stat numbers
      const counters = statsRef.current?.querySelectorAll(".stat-value");
      counters?.forEach((counter) => {
        const target = parseFloat(counter.dataset.target) || 0;
        const isDecimal = counter.dataset.decimal === "true";
        counter.textContent = "0";
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 1.5,
          delay: 0.8,
          ease: "power2.out",
          onUpdate: () => {
            counter.textContent = isDecimal
              ? obj.val.toFixed(1)
              : Math.floor(obj.val).toLocaleString();
          },
        });
      });
    }, pageRef);

    return () => ctx.revert();
  }, [loading, status]);

  const userName = session?.user?.name || "User";

  // Skeleton loading state
  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <Box sx={{ minHeight: "100vh", background: "#f0f4f8" }}>
        <DashboardSkeleton />
      </Box>
    );
  }

  const stats = [
    { label: "Total Designs", value: designs.length.toString() },
    { label: "Hours Spent", value: "24.5" },
    { label: "AI Suggestions", value: "28" },
    { label: "AR Previews", value: "15" },
    { label: "Exports", value: "8" },
  ];

  return (
    <Box sx={{ minHeight: "100vh", background: "#f0f4f8" }}>
      <Box ref={pageRef} sx={{ maxWidth: 1400, margin: "0 auto", px: { xs: 2, md: 4 }, py: 4 }}>
        {/* Welcome Section */}
        <Box
          ref={welcomeRef}
          sx={{
            background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
            borderRadius: 3,
            p: { xs: 3, md: 4 },
            mb: 5,
            position: "relative",
            overflow: "hidden",
            opacity: 0,
            boxShadow: "0 4px 24px rgba(15, 32, 39, 0.25)",
          }}
        >
          {/* Corner accents */}
          <Box sx={{ position: "absolute", top: 0, left: 0, width: 24, height: 24, borderTop: "1px solid rgba(0, 242, 254, 0.4)", borderLeft: "1px solid rgba(0, 242, 254, 0.4)", borderRadius: "12px 0 0 0" }} />
          <Box sx={{ position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderBottom: "1px solid rgba(0, 242, 254, 0.4)", borderRight: "1px solid rgba(0, 242, 254, 0.4)", borderRadius: "0 0 12px 0" }} />

          <h1 style={{
            fontSize: 24, fontWeight: 900,
            fontFamily: "'Orbitron', sans-serif",
            letterSpacing: "0.08em", textTransform: "uppercase",
            color: "#e8eaf6", marginBottom: 6,
          }}>
            WELCOME BACK,{" "}
            <span style={{
              background: "linear-gradient(135deg, #00f2fe, #00ffcc)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              fontWeight: 900,
            }}>
              {userName}
            </span>
          </h1>
          <p style={{
            fontSize: 14, color: "rgba(232, 234, 246, 0.6)",
            fontFamily: "'Outfit', sans-serif", letterSpacing: "0.03em",
          }}>
            Continue your automotive design work or start a new project
          </p>
        </Box>

        {/* Quick Actions */}
        <Box ref={quickActionsRef} sx={{ mb: 6 }}>
          <h2 style={{
            fontSize: 11, fontWeight: 700,
            fontFamily: "'Orbitron', sans-serif",
            letterSpacing: "0.2em", textTransform: "uppercase",
            color: "#2c5364", marginBottom: 20,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ width: 18, height: 1, background: "#2c5364", display: "inline-block" }} />
            Quick Actions
          </h2>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 3 }}>
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href} style={{ textDecoration: "none" }}>
                <Box
                  className="quick-action-card"
                  sx={{
                    background: "#ffffff",
                    borderRadius: 3,
                    border: "1px solid rgba(0, 0, 0, 0.06)",
                    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
                    p: 3,
                    transition: "all 0.3s ease",
                    position: "relative", overflow: "hidden",
                    opacity: 0,
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: "0 8px 32px rgba(44, 83, 100, 0.15)",
                      borderColor: "rgba(44, 83, 100, 0.2)",
                    },
                  }}
                >
                  <Box sx={{
                    position: "absolute", top: 0, left: "10%", right: "10%", height: "2px",
                    background: "linear-gradient(90deg, transparent, rgba(44, 83, 100, 0.25), transparent)",
                    borderRadius: "0 0 4px 4px",
                  }} />
                  <h3 style={{
                    fontFamily: "'Orbitron', sans-serif", fontSize: 14, fontWeight: 700,
                    color: "#2c5364", marginBottom: 6,
                    letterSpacing: "0.05em", textTransform: "uppercase",
                  }}>
                    {action.title}
                  </h3>
                  <p style={{
                    fontSize: 13, color: "#64748b",
                    fontFamily: "'Outfit', sans-serif", lineHeight: 1.5,
                  }}>
                    {action.desc}
                  </p>
                </Box>
              </Link>
            ))}
          </Box>
        </Box>

        {/* Tabs */}
        <Box
          ref={tabBarRef}
          sx={{
            display: "flex", gap: 0,
            borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
            mb: 4, opacity: 0,
          }}
        >
          {["designs", "activity"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "12px 24px", cursor: "pointer",
                background: "transparent", border: "none",
                fontFamily: "'Orbitron', sans-serif",
                fontSize: 11, fontWeight: 700,
                letterSpacing: "0.15em", textTransform: "uppercase",
                color: activeTab === tab ? "#2c5364" : "#94a3b8",
                borderBottom: activeTab === tab ? "2px solid #2c5364" : "2px solid transparent",
                transition: "all 0.3s ease",
              }}
            >
              {tab === "designs" ? "My Designs" : "Recent Activity"}
            </button>
          ))}
        </Box>

        {/* Content */}
        <Box ref={contentRef} sx={{ opacity: 0 }}>
          {activeTab === "designs" && (
            <Box>
              {fetchError ? (
                <Box sx={{
                  textAlign: "center", py: 10,
                  background: "#fff", borderRadius: 3,
                  border: "1px solid rgba(220, 38, 38, 0.2)",
                  boxShadow: "0 2px 12px rgba(220, 38, 38, 0.06)",
                }}>
                  <Typography sx={{ color: "#dc2626", mb: 2, fontFamily: "'Outfit', sans-serif" }}>{fetchError}</Typography>
                  <Button onClick={fetchDesigns} variant="contained" sx={{
                    background: "linear-gradient(135deg, #0f2027, #2c5364)",
                    borderRadius: 2,
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
                    "&:hover": { boxShadow: "0 4px 20px rgba(44, 83, 100, 0.3)" },
                  }}>
                    Retry
                  </Button>
                </Box>
              ) : designs.length > 0 ? (
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 3 }}>
                  {designs.map((design) => (
                    <DesignCard key={design._id} {...design} />
                  ))}
                </Box>
              ) : (
                <Box sx={{
                  textAlign: "center", py: 10,
                  background: "#ffffff",
                  border: "1px solid rgba(0, 0, 0, 0.06)",
                  borderRadius: 3,
                  boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
                }}>
                  <h3 style={{
                    fontSize: 18, fontWeight: 700,
                    fontFamily: "'Orbitron', sans-serif",
                    color: "#1a2a32", letterSpacing: "0.05em", marginBottom: 8,
                  }}>
                    No designs yet
                  </h3>
                  <p style={{
                    color: "#64748b",
                    fontFamily: "'Outfit', sans-serif", fontSize: 14, marginBottom: 24,
                  }}>
                    Start customizing your first vehicle design
                  </p>
                  <Link href="/configurator/customization" style={{
                    padding: "14px 36px",
                    background: "linear-gradient(135deg, #0f2027, #2c5364)",
                    color: "#ffffff", textDecoration: "none", fontWeight: 700,
                    fontFamily: "'Orbitron', sans-serif", fontSize: 11,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    borderRadius: 8,
                    display: "inline-block",
                  }}>
                    Create New Design
                  </Link>
                </Box>
              )}
            </Box>
          )}

          {activeTab === "activity" && (
            <Box sx={{
              background: "#ffffff",
              border: "1px solid rgba(0, 0, 0, 0.06)",
              borderRadius: 3,
              boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
              p: 4, textAlign: "center",
            }}>
              <p style={{ color: "#64748b", fontFamily: "'Outfit', sans-serif" }}>
                Recent activity will appear here as you work on your designs.
              </p>
            </Box>
          )}
        </Box>

        {/* Stats */}
        <Box
          ref={statsRef}
          sx={{
            mt: 6, p: 3,
            background: "#ffffff",
            borderRadius: 3,
            border: "1px solid rgba(0, 0, 0, 0.06)",
            boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
            position: "relative", opacity: 0,
          }}
        >
          <h3 style={{
            marginBottom: 24,
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 11, fontWeight: 700,
            letterSpacing: "0.2em", textTransform: "uppercase",
            color: "#2c5364",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ width: 18, height: 1, background: "#2c5364", display: "inline-block" }} />
            Design Statistics
          </h3>

          <Box sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(5, 1fr)" },
            gap: 2,
          }}>
            {stats.map((stat, i) => (
              <Box key={i} sx={{
                textAlign: "center", py: 2,
                borderRight: i < stats.length - 1 ? "1px solid rgba(0, 0, 0, 0.06)" : "none",
              }}>
                <div
                  className="stat-value"
                  data-target={stat.value}
                  data-decimal={stat.value.includes(".") ? "true" : "false"}
                  style={{
                    fontSize: 28, fontWeight: 800,
                    fontFamily: "'Orbitron', sans-serif",
                    color: "#2c5364", letterSpacing: "-0.01em",
                  }}
                >
                  0
                </div>
                <div style={{
                  fontSize: 9, letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: "#94a3b8",
                  fontFamily: "'Orbitron', sans-serif", marginTop: 4,
                }}>
                  {stat.label}
                </div>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
