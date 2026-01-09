import useSWR from "swr"
import { getActivities, type Activity } from "@/lib/api"

export function useActivities() {
  const { data, error, isLoading, mutate } = useSWR<Activity[]>(
    "/api/activity",
    getActivities,
    { refreshInterval: 5000 }
  )

  return {
    activities: data,
    error,
    isLoading,
    mutate,
  }
}
