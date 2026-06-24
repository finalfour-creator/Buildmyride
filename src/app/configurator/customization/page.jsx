import { Suspense } from "react";
import CustomizePage from "@/feature/customize/CustomizePage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CustomizePage />
    </Suspense>
  );
}