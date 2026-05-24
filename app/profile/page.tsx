import { ProtectedPage } from "@/components/protected-page";
import { ProfileClient } from "./ui";

export default function ProfilePage() {
  return (
    <ProtectedPage>
      <ProfileClient />
    </ProtectedPage>
  );
}
