import { AppShell } from "@/components/app-shell"
import { LocationsView } from "@/components/locations-view"

export default function LocationsPage() {
  return (
    <AppShell activePage="locations">
      <LocationsView />
    </AppShell>
  )
}
