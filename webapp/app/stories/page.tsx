import { AppShell } from "@/components/app-shell"
import { StoriesView } from "@/components/stories-view"

export default function StoriesPage() {
  return (
    <AppShell activePage="stories">
      <StoriesView />
    </AppShell>
  )
}
