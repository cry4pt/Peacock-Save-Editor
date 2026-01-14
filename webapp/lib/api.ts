// API client for Next.js API routes
// This module provides type-safe functions to interact with backend API endpoints

// API routes are served from the same origin as the frontend (relative URLs)
const API_BASE = ""

// Response from checking Peacock server connection status
export interface StatusResponse {
  connected: boolean          // Whether Peacock is accessible
  peacock_path: string | null // Path to Peacock installation directory
  profiles_count: number      // Number of save profiles found
  message: string            // Status message
}

// User profile data from Peacock save file
export interface ProfileResponse {
  id: string                      // Unique profile identifier (UUID)
  level: number                   // Player level (1-7000+)
  xp: number                      // Total experience points
  merces: number                  // In-game currency (Merces)
  prestige: number               // Freelancer prestige level
  challenges_completed: number   // Number of completed challenges
  locations_count: number        // Number of locations with mastery
  escalations_completed: number  // Number of completed escalations
  stories_completed: number      // Number of completed mission stories
}

// Location mastery data for a single location
export interface LocationData {
  id: string          // Location identifier (e.g., LOCATION_PARENT_PARIS)
  name: string        // Human-readable location name
  max_level: number   // Maximum mastery level for this location
  current_level: number // Current mastery level
  xp: number          // Current XP for this location
  game: string        // Which Hitman game this location is from
}

// Challenge/achievement data
export interface ChallengeData {
  id: string          // Unique challenge identifier
  name: string        // Challenge name
  description: string // Challenge description/objective
  location: string    // Location where challenge takes place
  completed: boolean  // Whether player has completed this challenge
}

// Escalation contract data
export interface EscalationData {
  id: string          // Unique escalation identifier
  name: string        // Escalation name
  codename: string    // Internal codename
  location: string    // Location where escalation takes place
  max_level: number   // Total number of levels/stages
  current_level: number // Player's current progress level
  completed: boolean  // Whether all levels are completed
}

// Mission story (opportunity) data
export interface StoryData {
  id: string          // Unique story identifier
  name: string        // Story name
  location: string    // Location where story takes place
  briefing: string    // Story briefing/description
  completed: boolean  // Whether player has completed this story
}

// Peacock settings configuration
export interface SettingsData {
  gameplayUnlockAllShortcuts: boolean         // Unlock all starting locations
  gameplayUnlockAllFreelancerMasteries: boolean // Unlock Freelancer mode items
  mapDiscoveryState: string                   // Map discovery setting
  enableMasteryProgression: boolean           // Enable/disable mastery system
  elusivesAreShown: boolean                  // Show elusive targets
  getDefaultSuits: boolean                   // Grant default suits
}

// Activity log entry for tracking profile changes
export interface Activity {
  id: string                                  // Unique activity ID
  description: string                         // Human-readable description
  timestamp: string                           // ISO timestamp of activity
  type: "unlock" | "mastery" | "profile" | "settings" // Activity category
}

// Generic fetch wrapper with error handling and JSON parsing
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  // Make API request with JSON headers
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })

  // Handle HTTP errors
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Unknown error" }))
    throw new Error(error.detail || `API error: ${res.status}`)
  }

  // Parse and return JSON response
  return res.json()
}

// ===== Status Endpoints =====
// Check Peacock server connection and installation path
export const getStatus = () => fetchAPI<StatusResponse>("/api/status")

// ===== Profile Endpoints =====
// Get all user profiles
export const getProfiles = () => fetchAPI<ProfileResponse[]>("/api/profiles")
// Get a specific profile by ID
export const getProfile = (id: string) => fetchAPI<ProfileResponse>(`/api/profile/${id}`)

// ===== Data Fetching Endpoints =====
// Get all location mastery data
export const getLocations = () => fetchAPI<LocationData[]>("/api/locations")
// Get all challenges/achievements
export const getChallenges = () => fetchAPI<ChallengeData[]>("/api/challenges")
// Get all escalation contracts
export const getEscalations = () => fetchAPI<EscalationData[]>("/api/escalations")
// Get all mission stories/opportunities
export const getStories = () => fetchAPI<StoryData[]>("/api/stories")

// ===== Unlock Operations =====
// Unlock everything: max level, XP, mastery, challenges, escalations, stories
export const unlockAll = (profileId?: string) =>
  fetchAPI<{ success: boolean; message: string }>("/api/unlock/all", {
    method: "POST",
    body: JSON.stringify({ profile_id: profileId }),
  })

// Unlock specific challenges or all challenges if no IDs provided
export const unlockChallenges = (ids?: string[], profileId?: string) =>
  fetchAPI<{ success: boolean; message: string }>("/api/unlock/challenges", {
    method: "POST",
    body: JSON.stringify({ ids, profile_id: profileId }),
  })

// Unlock specific escalations or all escalations if no IDs provided
export const unlockEscalations = (ids?: string[], profileId?: string) =>
  fetchAPI<{ success: boolean; message: string }>("/api/unlock/escalations", {
    method: "POST",
    body: JSON.stringify({ ids, profile_id: profileId }),
  })

// Unlock specific mission stories or all stories if no IDs provided
export const unlockStories = (ids?: string[], profileId?: string) =>
  fetchAPI<{ success: boolean; message: string }>("/api/unlock/stories", {
    method: "POST",
    body: JSON.stringify({ ids, profile_id: profileId }),
  })

// Set mastery level for a specific location
export const setMastery = (locationId: string, level: number, profileId?: string) =>
  fetchAPI<{ success: boolean; message: string }>("/api/unlock/mastery", {
    method: "POST",
    body: JSON.stringify({
      location_id: locationId,
      level,
      profile_id: profileId,
    }),
  })

// Set all location mastery to maximum level
export const maxAllMastery = (profileId?: string) =>
  fetchAPI<{ success: boolean; message: string }>("/api/unlock/mastery/all", {
    method: "POST",
    body: JSON.stringify({ profile_id: profileId }),
  })

// Unlock all content (challenges, escalations, stories) without changing level/XP
export const unlockContent = (profileId?: string) =>
  fetchAPI<{ success: boolean; message: string }>("/api/unlock/content", {
    method: "POST",
    body: JSON.stringify({ profile_id: profileId }),
  })

// ===== Lock Operations =====
// Reset/lock everything: reset level, XP, mastery, challenges, escalations, stories
export const lockAll = (profileId?: string) =>
  fetchAPI<{ success: boolean; message: string }>("/api/lock/all", {
    method: "POST",
    body: JSON.stringify({ profile_id: profileId }),
  })

// Lock specific challenges or all challenges if no IDs provided
export const lockChallenges = (ids?: string[], profileId?: string) =>
  fetchAPI<{ success: boolean; message: string }>("/api/lock/challenges", {
    method: "POST",
    body: JSON.stringify({ ids, profile_id: profileId }),
  })

// Lock specific escalations or all escalations if no IDs provided
export const lockEscalations = (ids?: string[], profileId?: string) =>
  fetchAPI<{ success: boolean; message: string }>("/api/lock/escalations", {
    method: "POST",
    body: JSON.stringify({ ids, profile_id: profileId }),
  })

// Lock specific mission stories or all stories if no IDs provided
export const lockStories = (ids?: string[], profileId?: string) =>
  fetchAPI<{ success: boolean; message: string }>("/api/lock/stories", {
    method: "POST",
    body: JSON.stringify({ ids, profile_id: profileId }),
  })

// Reset all location mastery levels to 0
export const lockAllMastery = (profileId?: string) =>
  fetchAPI<{ success: boolean; message: string }>("/api/lock/mastery/all", {
    method: "POST",
    body: JSON.stringify({ profile_id: profileId }),
  })

// ===== Settings Endpoints =====
// Get current Peacock settings
export const getSettings = () => fetchAPI<SettingsData>("/api/settings")
// Update Peacock settings
export const saveSettings = (settings: SettingsData) =>
  fetchAPI<{ success: boolean; message: string }>("/api/settings", {
    method: "POST",
    body: JSON.stringify(settings),
  })

// ===== Backup/Restore Endpoints =====
// Create a backup of the current profile
export const createBackup = (profileId?: string) =>
  fetchAPI<{ success: boolean; message: string }>("/api/backup/create", {
    method: "POST",
    body: JSON.stringify({ profile_id: profileId }),
  })

// Restore profile from the most recent backup
export const restoreBackup = (profileId?: string) =>
  fetchAPI<{ success: boolean; message: string }>("/api/backup/restore", {
    method: "POST",
    body: JSON.stringify({ profile_id: profileId }),
  })

// ===== Activity Tracking Endpoints =====
// Get all recent activity log entries
export const getActivities = () => fetchAPI<Activity[]>("/api/activity")
// Log a new activity entry
export const logActivity = (description: string, type: Activity["type"] = "unlock") =>
  fetchAPI<{ success: boolean; activity: Activity }>("/api/activity", {
    method: "POST",
    body: JSON.stringify({ description, type }),
  })
// Clear all activity log entries
export const clearActivities = () =>
  fetchAPI<{ success: boolean; message: string }>("/api/activity", {
    method: "POST",
    body: JSON.stringify({ action: "clear" }),
  })

// Generic fetcher function for SWR data fetching library
export const fetcher = (url: string) => fetchAPI(url)
