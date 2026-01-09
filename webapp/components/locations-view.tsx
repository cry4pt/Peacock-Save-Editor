"use client"

import { useState } from "react"
import { Search, MapPin, Star, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Skeleton } from "@/components/ui/skeleton"
import useSWR from "swr"
import { getLocations, setMastery, maxAllMastery, type LocationData } from "@/lib/api"
import { toast } from "sonner"
import { useActivities } from "@/hooks/use-activities"

export function LocationsView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [unlocking, setUnlocking] = useState(false)
  const [updatingLocation, setUpdatingLocation] = useState<string | null>(null)

  const { data: locations, error, isLoading, mutate } = useSWR<LocationData[]>("/api/locations", getLocations)
  const { mutate: mutateActivities } = useActivities()

  // Local state for slider values (optimistic UI)
  const [levels, setLevels] = useState<Record<string, number>>({})

  // Initialize levels from API data
  const getLevel = (loc: LocationData) => {
    return levels[loc.id] ?? loc.current_level
  }

  const filteredLocations =
    locations?.filter((location) => location.name.toLowerCase().includes(searchQuery.toLowerCase())) ?? []

  const handleLevelChange = (id: string, value: number[]) => {
    setLevels((prev) => ({ ...prev, [id]: value[0] }))
  }

  const handleSetMastery = async (locationId: string, level: number) => {
    setUpdatingLocation(locationId)
    try {
      const result = await setMastery(locationId, level)
      toast.success(result.message)
      mutate()
      mutateActivities()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to set mastery")
    } finally {
      setUpdatingLocation(null)
    }
  }

  const handleMaxAll = async () => {
    setUnlocking(true)
    try {
      const result = await maxAllMastery()
      toast.success(result.message)
      // Reset local levels
      setLevels({})
      mutate()
      mutateActivities()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to max all mastery")
    } finally {
      setUnlocking(false)
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-destructive">Failed to load locations. Is the API server running?</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Locations</h1>
          <p className="mt-1 text-muted-foreground">Manage mastery levels for each location</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="px-3 py-1">
            {locations?.length ?? "..."} Locations
          </Badge>
          <Button className="gap-2" onClick={handleMaxAll} disabled={unlocking}>
            {unlocking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}
            Max All Mastery
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Locations Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-2 w-full mt-5" />
                <Skeleton className="h-8 w-full mt-3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredLocations.map((location) => {
            const currentLevel = getLevel(location)
            return (
              <Card key={location.id} className="transition-all duration-200 hover:border-primary/50">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-chart-2/10 p-2.5">
                        <MapPin className="h-5 w-5 text-chart-2" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{location.name}</h3>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {location.game}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-primary">{currentLevel}</span>
                      <span className="text-muted-foreground">/{location.max_level}</span>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <Progress value={(currentLevel / location.max_level) * 100} className="h-2" />
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[currentLevel]}
                        onValueChange={(value) => handleLevelChange(location.id, value)}
                        onValueCommit={(value) => handleSetMastery(location.id, value[0])}
                        max={location.max_level}
                        min={0}
                        step={1}
                        className="flex-1"
                        disabled={updatingLocation === location.id}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetMastery(location.id, location.max_level)}
                        disabled={updatingLocation === location.id}
                        className="shrink-0 transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 hover:text-foreground"
                      >
                        {updatingLocation === location.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Max"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredLocations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No locations found</h3>
          <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search</p>
        </div>
      )}
    </div>
  )
}
