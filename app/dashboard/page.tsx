import { ProtectedPage } from "@/components/protected-page";
import { DashboardClient } from "./ui";

export default function DashboardPage() {
  return (
    <ProtectedPage>
      <DashboardClient />
    </ProtectedPage>
  );
}
