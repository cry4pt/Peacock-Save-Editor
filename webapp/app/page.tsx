// Main landing page component - shows the dashboard view
import { AppShell } from "@/components/app-shell"
import { Dashboard } from "@/components/dashboard"

// Home page - entry point for the application
export default function Home() {
  return (
    // Wrap dashboard in the app shell layout with sidebar navigation
    <AppShell activePage="dashboard">
      <Dashboard />
    </AppShell>
  )
}
