// Custom hook for fetching and managing activity log data
import useSWR from "swr"
import { getActivities, type Activity } from "@/lib/api"

// Hook that automatically fetches and refreshes activity data
export function useActivities() {
  // Use SWR for data fetching with automatic revalidation
  const { data, error, isLoading, mutate } = useSWR<Activity[]>(
    "/api/activity",
    getActivities,
    { refreshInterval: 5000 } // Auto-refresh every 5 seconds
  )

  return {
    activities: data,    // Activity log entries
    error,              // Any fetch errors
    isLoading,          // Loading state
    mutate,             // Function to manually refresh data
  }
}
