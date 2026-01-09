"use client"

import { useState } from "react"
import { Search, Unlock, Check, BookOpen, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import useSWR from "swr"
import { getStories, unlockStories, type StoryData } from "@/lib/api"
import { toast } from "sonner"
import { useActivities } from "@/hooks/use-activities"

export function StoriesView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("All")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [unlocking, setUnlocking] = useState(false)

  const { data: stories, error, isLoading, mutate } = useSWR<StoryData[]>("/api/stories", getStories)
  const { mutate: mutateActivities } = useActivities()

  // Get unique locations
  const locations = ["All", ...new Set(stories?.map((s) => s.location) ?? [])].slice(0, 8)

  const filteredStories =
    stories?.filter((story) => {
      const matchesSearch =
        story.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.briefing.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesLocation = selectedLocation === "All" || story.location === selectedLocation
      return matchesSearch && matchesLocation
    }) ?? []

  const toggleSelect = (id: string) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const handleUnlockSelected = async () => {
    if (selectedItems.length === 0) return
    setUnlocking(true)
    try {
      const result = await unlockStories(selectedItems)
      toast.success(result.message)
      setSelectedItems([])
      mutate()
      mutateActivities()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to unlock stories")
    } finally {
      setUnlocking(false)
    }
  }

  const handleUnlockAll = async () => {
    setUnlocking(true)
    try {
      const result = await unlockStories()
      toast.success(result.message)
      mutate()
      mutateActivities()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to unlock all stories")
    } finally {
      setUnlocking(false)
    }
  }

  const handleUnlockSingle = async (id: string) => {
    try {
      const result = await unlockStories([id])
      toast.success(result.message)
      mutate()
      mutateActivities()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to unlock story")
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-destructive">Failed to load stories. Is the API server running?</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Mission Stories</h1>
          <p className="mt-1 text-muted-foreground">Browse and unlock mission stories</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="px-3 py-1">
            {stories?.length ?? "..."} Available
          </Badge>
          <Button className="gap-2" onClick={handleUnlockAll} disabled={unlocking}>
            {unlocking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlock className="h-4 w-4" />}
            Unlock All
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search mission stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {locations.map((loc) => (
                <Button
                  key={loc}
                  variant={selectedLocation === loc ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLocation(loc)}
                  className={`text-xs ${selectedLocation === loc ? "" : "transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 hover:text-foreground"}`}
                >
                  {loc}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selection Bar */}
      {selectedItems.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              <span>{selectedItems.length} story(ies) selected</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 hover:text-foreground" onClick={() => setSelectedItems([])}>
                Clear
              </Button>
              <Button size="sm" className="gap-2" onClick={handleUnlockSelected} disabled={unlocking}>
                {unlocking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlock className="h-4 w-4" />}
                Unlock Selected
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stories Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-full mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStories.map((story) => (
            <Card
              key={story.id}
              className={`group cursor-pointer transition-all duration-200 hover:border-primary/50 ${
                selectedItems.includes(story.id) ? "border-primary bg-primary/5" : ""
              } ${story.completed ? "opacity-60" : ""}`}
              onClick={() => toggleSelect(story.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedItems.includes(story.id)}
                      onCheckedChange={() => toggleSelect(story.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1"
                    />
                    <div className="space-y-1">
                      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {story.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{story.briefing || "No description"}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-xs">
                    {story.location}
                  </Badge>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <BookOpen className="h-3.5 w-3.5 text-chart-4" />
                    {story.completed ? "Completed" : "Mission Story"}
                  </div>
                  {!story.completed && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1.5 text-xs text-primary hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleUnlockSingle(story.id)
                      }}
                    >
                      <Unlock className="h-3.5 w-3.5" />
                      Unlock
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredStories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No mission stories found</h3>
          <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Results count */}
      {!isLoading && filteredStories.length > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Showing {filteredStories.length} of {stories?.length ?? 0} mission stories
        </p>
      )}
    </div>
  )
}
