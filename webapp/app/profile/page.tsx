import { AppShell } from "@/components/app-shell"
import { ProfileEditor } from "@/components/profile-editor"

export default function ProfilePage() {
  return (
    <AppShell activePage="profile">
      <ProfileEditor />
    </AppShell>
  )
}
