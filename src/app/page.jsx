"use client";

export default function Home() {
  return (
    <iframe
      src="/landing.html"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        border: "none",
        display: "block",
      }}
      title="BuildMyRide 3D Showroom"
    />
  );
}