import { ProtectedPage } from "@/components/protected-page";
import { WorkoutsClient } from "./ui";

export default function WorkoutsPage() {
  return (
    <ProtectedPage>
      <WorkoutsClient />
    </ProtectedPage>
  );
}
