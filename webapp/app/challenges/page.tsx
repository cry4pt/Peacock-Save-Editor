import { AppShell } from "@/components/app-shell"
import { ChallengesView } from "@/components/challenges-view"

export default function ChallengesPage() {
  return (
    <AppShell activePage="challenges">
      <ChallengesView />
    </AppShell>
  )
}
