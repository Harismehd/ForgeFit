import { ProtectedPage } from "@/components/protected-page";
import { WorkoutLogger } from "./ui";

export default function TodayWorkoutPage() {
  return (
    <ProtectedPage>
      <WorkoutLogger />
    </ProtectedPage>
  );
}
