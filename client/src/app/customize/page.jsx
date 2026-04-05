// import CustomizePage from "@/feature/customize/components/CustomizePage";
// import AppLayout from "@/components/layout/AppLayout";

// export default function Page() {
//   return (
//     <AppLayout>
//       <CustomizePage />
//     </AppLayout>
//   );
// }

import CustomizePage from "@/feature/customize/components/CustomizePage";
import AppLayout from "@/components/layout/AppLayout";

export default function Page() {
  return (
    <AppLayout noPadding={true}>
      <CustomizePage />
    </AppLayout>
  );
}