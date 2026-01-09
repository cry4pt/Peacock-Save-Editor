import { AppShell } from "@/components/app-shell"
import { EscalationsView } from "@/components/escalations-view"

export default function EscalationsPage() {
  return (
    <AppShell activePage="escalations">
      <EscalationsView />
    </AppShell>
  )
}
