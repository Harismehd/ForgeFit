import { ProtectedPage } from "@/components/protected-page";
import { HistoryClient } from "./ui";

export default function HistoryPage() {
  return (
    <ProtectedPage>
      <HistoryClient />
    </ProtectedPage>
  );
}
