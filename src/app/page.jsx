import dynamic from "next/dynamic";

const LandingPage = dynamic(
  () => import("@/feature/landing/components/LandingPage"),
  { ssr: false }
);

export default function Home() {
  return <LandingPage />;
}
