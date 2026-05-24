import { ProtectedPage } from "@/components/protected-page";
import { ExercisesClient } from "./ui";

export default function ExercisesPage() {
  return (
    <ProtectedPage>
      <ExercisesClient />
    </ProtectedPage>
  );
}
