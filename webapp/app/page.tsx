import { AppShell } from "@/components/app-shell"
import { Dashboard } from "@/components/dashboard"

export default function Home() {
  return (
    <AppShell activePage="dashboard">
      <Dashboard />
    </AppShell>
  )
}
