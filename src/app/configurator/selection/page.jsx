"use client";
import { useEffect, useState, useRef } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import Link from "next/link";
import apiClient from "@/lib/axios";
import gsap from "gsap";

export default function CarSelectionPage() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);
  const router = useRouter();
  const pageRef = useRef(null);
  const headerRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    apiClient
      .get("/models")
      .then((res) => setModels(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Failed to fetch models", err))
      .finally(() => setLoading(false));
  }, []);

  // Animate header immediately
  useEffect(() => {
    if (!headerRef.current) return;
    gsap.fromTo(headerRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power4.out" });
  }, []);

  // Animate cards after models load
  useEffect(() => {
    if (loading || !gridRef.current) return;
    gsap.fromTo(
      gridRef.current.querySelectorAll(".model-card"),
      { scale: 0.88, y: 24, opacity: 0 },
      { scale: 1, y: 0, opacity: 1, duration: 0.55, stagger: 0.08, ease: "back.out(1.4)", delay: 0.1 }
    );
  }, [loading]);

  const handleSelect = (carId) => {
    router.push(`/configurator/customization?carId=${carId}`);
  };

  return (
    <Box ref={pageRef} sx={{ minHeight: "100vh", background: "#f0f4f8" }}>
      <Box sx={{ maxWidth: 1400, margin: "0 auto", px: { xs: 2, md: 4 }, py: 4 }}>

        {/* ── Header Banner ── */}
        <Box
          ref={headerRef}
          sx={{
            opacity: 0,
            background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
            borderRadius: 3,
            p: { xs: 3, md: 4 },
            mb: 5,
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 4px 24px rgba(15, 32, 39, 0.25)",
          }}
        >
          {/* Corner accents */}
          <Box sx={{ position: "absolute", top: 0, left: 0, width: 24, height: 24, borderTop: "1px solid rgba(0,242,254,0.4)", borderLeft: "1px solid rgba(0,242,254,0.4)", borderRadius: "12px 0 0 0" }} />
          <Box sx={{ position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderBottom: "1px solid rgba(0,242,254,0.4)", borderRight: "1px solid rgba(0,242,254,0.4)", borderRadius: "0 0 12px 0" }} />

          {/* Breadcrumb */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, position: "relative", zIndex: 1 }}>
            <Link href="/configurator/dashboard" style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "'Outfit', sans-serif", textDecoration: "none" }}>
              Dashboard
            </Link>
            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>/</span>
            <span style={{ color: "rgba(0,242,254,0.7)", fontSize: 12, fontFamily: "'Outfit', sans-serif" }}>Select Model</span>
          </Box>

          <Typography variant="h4" sx={{ color: "#ffffff", fontWeight: 700, fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.05em", mb: 1, position: "relative", zIndex: 1 }}>
            Choose Your Chassis
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.6)", fontFamily: "'Outfit', sans-serif", fontSize: 14, position: "relative", zIndex: 1 }}>
            Select a base model to start your custom build
          </Typography>
        </Box>

        {/* ── Section Label ── */}
        <h2 style={{
          fontSize: 11, fontWeight: 700,
          fontFamily: "'Orbitron', sans-serif",
          letterSpacing: "0.2em", textTransform: "uppercase",
          color: "#2c5364", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ width: 18, height: 1, background: "#2c5364", display: "inline-block" }} />
          Available Models
        </h2>

        {/* ── Loading ── */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 16 }}>
            <CircularProgress sx={{ color: "#2c5364" }} />
          </Box>
        ) : models.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 12, background: "white", border: "1px dashed #cbd5e1", borderRadius: 3 }}>
            <h3 style={{ fontFamily: "'Orbitron', sans-serif", color: "#2c5364", fontWeight: 700, marginBottom: 8, fontSize: 16 }}>
              No Models Available
            </h3>
            <p style={{ color: "#64748b", fontFamily: "'Outfit', sans-serif", fontSize: 14 }}>
              Check back soon for available vehicle models.
            </p>
          </Box>
        ) : (
          /* ── Model Grid ── */
          <Box ref={gridRef} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 3 }}>
            {models.map((car) => {
              const isHovered = hoveredId === car._id;
              return (
                <Box
                  key={car._id}
                  className="model-card"
                  onClick={() => handleSelect(car._id)}
                  onMouseEnter={() => setHoveredId(car._id)}
                  onMouseLeave={() => setHoveredId(null)}
                  sx={{
                    background: "#ffffff",
                    borderRadius: 3,
                    border: isHovered ? "1px solid rgba(44,83,100,0.25)" : "1px solid rgba(0,0,0,0.06)",
                    boxShadow: isHovered ? "0 8px 32px rgba(44,83,100,0.18)" : "0 2px 12px rgba(0,0,0,0.06)",
                    cursor: "pointer",
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    position: "relative",
                    transform: isHovered ? "translateY(-4px)" : "translateY(0)",
                  }}
                >
                  {/* Top accent line */}
                  <Box sx={{
                    position: "absolute", top: 0, left: "10%", right: "10%", height: "2px",
                    background: isHovered
                      ? "linear-gradient(90deg, transparent, rgba(0,242,254,0.5), transparent)"
                      : "linear-gradient(90deg, transparent, rgba(44,83,100,0.25), transparent)",
                    borderRadius: "0 0 4px 4px",
                    transition: "all 0.3s ease",
                  }} />

                  {/* Car preview area */}
                  <Box sx={{
                    height: 180,
                    background: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                  }}>
                    {/* Grid pattern */}
                    <Box sx={{
                      position: "absolute", inset: 0,
                      backgroundImage: "linear-gradient(rgba(0,242,254,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,242,254,0.03) 1px, transparent 1px)",
                      backgroundSize: "24px 24px",
                    }} />
                    <Typography sx={{
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: 28, fontWeight: 800,
                      color: "rgba(255,255,255,0.1)",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      userSelect: "none",
                      position: "relative", zIndex: 1,
                    }}>
                      {car.brand}
                    </Typography>
                    {/* 3D Ready badge */}
                    <Box sx={{
                      position: "absolute", top: 12, right: 12,
                      background: "rgba(0,242,254,0.08)",
                      border: "1px solid rgba(0,242,254,0.2)",
                      borderRadius: 1, px: 1, py: 0.25,
                    }}>
                      <Typography sx={{ fontSize: 9, fontFamily: "'Orbitron', sans-serif", color: "#00f2fe", letterSpacing: "0.1em" }}>
                        3D READY
                      </Typography>
                    </Box>
                  </Box>

                  {/* Card body */}
                  <Box sx={{ p: 3 }}>
                    <h3 style={{
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: 13, fontWeight: 700,
                      color: "#2c5364", marginBottom: 6,
                      letterSpacing: "0.05em", textTransform: "uppercase",
                    }}>
                      {car.brand} {car.name}
                    </h3>
                    <p style={{
                      fontSize: 13, color: "#64748b",
                      fontFamily: "'Outfit', sans-serif",
                      lineHeight: 1.5, marginBottom: 16,
                    }}>
                      {car.description || "Full customization available — body, wheels, paint, and more."}
                    </p>

                    <Box sx={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      pt: 2, borderTop: "1px solid rgba(0,0,0,0.06)",
                    }}>
                      <Typography sx={{
                        fontSize: 10, fontFamily: "'Orbitron', sans-serif",
                        letterSpacing: "0.1em", textTransform: "uppercase",
                        color: isHovered ? "#2c5364" : "#94a3b8",
                        fontWeight: 700,
                        transition: "color 0.3s",
                      }}>
                        Configure →
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
}
