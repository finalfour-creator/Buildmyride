"use client";
import dynamic from "next/dynamic";

const ArPreviewPage = dynamic(
  () => import("@/feature/ar/ArPreviewPage"),
  { ssr: false }
);

export default function Page() {
  return <ArPreviewPage />;
}
