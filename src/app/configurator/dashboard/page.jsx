import { Suspense } from "react";
import DashboardPage from "@/feature/dashboard/DashboardPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <DashboardPage />
    </Suspense>
  );
}