// API client for Next.js API routes

// API routes are served from the same origin as the frontend
const API_BASE = ""

export interface StatusResponse {
  connected: boolean
  peacock_path: string | null
  profiles_count: number
  message: string
}

export interface ProfileResponse {
  id: string
  level: number
  xp: number
  merces: number
  prestige: number
  challenges_completed: number
  locations_count: number
  escalations_completed: number
  stories_completed: number
}

export interface LocationData {
  id: string
  name: string
  max_level: number
  current_level: number
  xp: number
  game: string
}

export interface ChallengeData {
  id: string
  name: string
  description: string
  location: string
  completed: boolean
}

export interface EscalationData {
  id: string
  name: string
  codename: string
  location: string
  max_level: number
  current_level: number
  completed: boolean
}

export interface StoryData {
  id: string
  name: string
  location: string
  briefing: string
  completed: boolean
}

export interface SettingsData {
  gameplayUnlockAllShortcuts: boolean
  gameplayUnlockAllFreelancerMasteries: boolean
  mapDiscoveryState: string
  enableMasteryProgression: boolean
  elusivesAreShown: boolean
  getDefaultSuits: boolean
}

export interface Activity {
  id: string
  description: string
  timestamp: string
  type: "unlock" | "mastery" | "profile" | "settings"
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Unknown error" }))
    throw new Error(error.detail || `API error: ${res.status}`)
  }

  return res.json()
}

// Status
export const getStatus = () => fetchAPI<StatusResponse>("/api/status")

// Profiles
export const getProfiles = () => fetchAPI<ProfileResponse[]>("/api/profiles")
export const getProfile = (id: string) => fetchAPI<ProfileResponse>(`/api/profile/${id}`)

// Data fetching
export const getLocations = () => fetchAPI<LocationData[]>("/api/locations")
export const getChallenges = () => fetchAPI<ChallengeData[]>("/api/challenges")
export const getEscalations = () => fetchAPI<EscalationData[]>("/api/escalations")
export const getStories = () => fetchAPI<StoryData[]>("/api/stories")

// Unlock operations
export const unlockAll = (profileId?: string) =>
  fetchAPI<{ success: boolean; message: string }>("/api/unlock/all", {
    method: "POST",
    body: JSON.stringify({ profile_id: profileId }),
  })

export const unlockChallenges = (ids?: string[], profileId?: string) =>
  fetchAPI<{ success: boolean; message: string }>("/api/unlock/challenges", {
    method: "POST",
    body: JSON.stringify({ ids, profile_id: profileId }),
  })

export const unlockEscalations = (ids?: string[], profileId?: string) =>
  fetchAPI<{ success: boolean; message: string }>("/api/unlock/escalations", {
    method: "POST",
    body: JSON.stringify({ ids, profile_id: profileId }),
  })

export const unlockStories = (ids?: string[], profileId?: string) =>
  fetchAPI<{ success: boolean; message: string }>("/api/unlock/stories", {
    method: "POST",
    body: JSON.stringify({ ids, profile_id: profileId }),
  })

export const setMastery = (locationId: string, level: number, profileId?: string) =>
  fetchAPI<{ success: boolean; message: string }>("/api/unlock/mastery", {
    method: "POST",
    body: JSON.stringify({
      location_id: locationId,
      level,
      profile_id: profileId,
    }),
  })

export const maxAllMastery = (profileId?: string) =>
  fetchAPI<{ success: boolean; message: string }>("/api/unlock/mastery/all", {
    method: "POST",
    body: JSON.stringify({ profile_id: profileId }),
  })

export const unlockContent = (profileId?: string) =>
  fetchAPI<{ success: boolean; message: string }>("/api/unlock/content", {
    method: "POST",
    body: JSON.stringify({ profile_id: profileId }),
  })

// Settings
export const getSettings = () => fetchAPI<SettingsData>("/api/settings")
export const saveSettings = (settings: SettingsData) =>
  fetchAPI<{ success: boolean; message: string }>("/api/settings", {
    method: "POST",
    body: JSON.stringify(settings),
  })

// Backups
export const createBackup = (profileId?: string) =>
  fetchAPI<{ success: boolean; message: string }>("/api/backup/create", {
    method: "POST",
    body: JSON.stringify({ profile_id: profileId }),
  })

export const restoreBackup = (profileId?: string) =>
  fetchAPI<{ success: boolean; message: string }>("/api/backup/restore", {
    method: "POST",
    body: JSON.stringify({ profile_id: profileId }),
  })

// Activity tracking
export const getActivities = () => fetchAPI<Activity[]>("/api/activity")
export const logActivity = (description: string, type: Activity["type"] = "unlock") =>
  fetchAPI<{ success: boolean; activity: Activity }>("/api/activity", {
    method: "POST",
    body: JSON.stringify({ description, type }),
  })
export const clearActivities = () =>
  fetchAPI<{ success: boolean; message: string }>("/api/activity", {
    method: "POST",
    body: JSON.stringify({ action: "clear" }),
  })

// SWR fetcher
export const fetcher = (url: string) => fetchAPI(url)
