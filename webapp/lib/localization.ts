/**
 * Utility functions for converting localization keys to human-readable names
 */

// Localization map will be loaded from the extracted file
let localizationMap: Record<string, string> | null = null

// Load localization data (client-side)
async function loadLocalization(): Promise<Record<string, string>> {
  if (localizationMap) return localizationMap
  
  try {
    const response = await fetch('/localization.json')
    localizationMap = await response.json()
    return localizationMap!
  } catch (error) {
    console.error('Failed to load localization:', error)
    return {}
  }
}

/**
 * Converts a UI localization key to a human-readable name
 * Example: "UI_CHALLENGES_GLOBAL_CROWDCHOICE_DROWN_NAME" -> "Crowd Choice: Drown"
 */
export function formatLocalizationKey(key: string): string {
  if (!key) return "Unknown"
  
  // If it's not a localization key, return as-is
  if (!key.startsWith("UI_")) {
    return key
  }
  
  // If we have the localization loaded, use it
  if (localizationMap && localizationMap[key]) {
    return localizationMap[key]
  }
  
  // Fallback: format the key manually
  let formatted = key
    .replace(/^UI_/, "")
    .replace(/_CHALLENGES_/, "")
    .replace(/_GLOBAL_/, "")
    .replace(/_NAME$/, "")
    .replace(/_DESCRIPTION$/, "")
    .replace(/_TITLE$/, "")
  
  // Split by underscores and capitalize each word
  const words = formatted.split("_").map((word) => {
    // Handle special acronyms
    if (word === "ICA") return "ICA"
    if (word === "XP") return "XP"
    if (word === "VIP") return "VIP"
    
    // Capitalize first letter, lowercase rest
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  })
  
  return words.join(" ")
}

/**
 * Converts a mission story ID to a human-readable name
 * Example: "op3007_kruger_001" -> "Kruger 001"
 */
export function formatStoryId(id: string): string {
  if (!id) return "Unknown"
  
  // Check if we have it in the localization map
  if (localizationMap && localizationMap[id]) {
    return localizationMap[id]
  }
  
  // Remove common prefixes like "op3007_"
  let formatted = id.replace(/^op\d+_/, "")
  
  // Split by underscores and capitalize
  const words = formatted.split("_").map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  })
  
  return words.join(" ")
}

/**
 * Formats a challenge/story for display
 */
export function formatDisplayName(name: string, type: "challenge" | "story" = "challenge"): string {
  if (!name) return "Unknown"
  
  if (type === "story") {
    return formatStoryId(name)
  }
  
  return formatLocalizationKey(name)
}

// Initialize localization on module load (client-side only)
if (typeof window !== 'undefined') {
  loadLocalization()
}
