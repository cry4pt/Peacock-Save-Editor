import fs from "fs/promises"
import path from "path"
import os from "os"

// Location name mapping
export const LOCATION_NAMES: Record<string, string> = {
  "LOCATION_PARENT_PARIS": "Paris - The Showstopper",
  "LOCATION_PARENT_COASTALTOWN": "Sapienza - World of Tomorrow",
  "LOCATION_PARENT_MARRAKECH": "Marrakesh - A Gilded Cage",
  "LOCATION_PARENT_BANGKOK": "Bangkok - Club 27",
  "LOCATION_PARENT_COLORADO": "Colorado - Freedom Fighters",
  "LOCATION_PARENT_HOKKAIDO": "Hokkaido - Situs Inversus",
  "LOCATION_PARENT_NEWZEALAND": "Hawke's Bay - Nightcall",
  "LOCATION_PARENT_MIAMI": "Miami - The Finish Line",
  "LOCATION_PARENT_COLOMBIA": "Santa Fortuna - Three-Headed Serpent",
  "LOCATION_PARENT_MUMBAI": "Mumbai - Chasing a Ghost",
  "LOCATION_PARENT_NORTHAMERICA": "Whittleton Creek - Another Life",
  "LOCATION_PARENT_NORTHSEA": "Isle of Sgail - The Ark Society",
  "LOCATION_PARENT_GREEDY": "New York - Golden Handshake",
  "LOCATION_PARENT_OPULENT": "Haven Island - The Last Resort",
  "LOCATION_PARENT_GOLDEN": "Haven Island - The Last Resort",
  "LOCATION_PARENT_ELEGANT": "Dubai - On Top of the World",
  "LOCATION_PARENT_ANCESTRAL": "Dartmoor - Death in the Family",
  "LOCATION_PARENT_EDGY": "Berlin - Apex Predator",
  "LOCATION_PARENT_WET": "Chongqing - End of an Era",
  "LOCATION_PARENT_DARTMOOR": "Dartmoor - Death in the Family",
  "LOCATION_PARENT_SALTY": "Mendoza - The Farewell",
  "LOCATION_PARENT_TRAPPED": "Carpathian Mountains - Untouchable",
  "LOCATION_PARENT_ICA_FACILITY": "ICA Facility",
  "LOCATION_PARENT_ROCKY": "Ambrose Island",
  "LOCATION_PARENT_SNUG": "Snug (Freelancer Safehouse)",
  "LOCATION_PARENT_AUSTRIA": "Austria - Hantu Port (Sniper)",
  "LOCATION_PARENT_CAGED": "Siberia - The Last Yardbird (Sniper)",
}

export const LOCATION_GAMES: Record<string, string> = {
  "LOCATION_PARENT_PARIS": "Hitman 1",
  "LOCATION_PARENT_COASTALTOWN": "Hitman 1",
  "LOCATION_PARENT_MARRAKECH": "Hitman 1",
  "LOCATION_PARENT_BANGKOK": "Hitman 1",
  "LOCATION_PARENT_COLORADO": "Hitman 1",
  "LOCATION_PARENT_HOKKAIDO": "Hitman 1",
  "LOCATION_PARENT_ICA_FACILITY": "Hitman 1",
  "LOCATION_PARENT_NEWZEALAND": "Hitman 2",
  "LOCATION_PARENT_MIAMI": "Hitman 2",
  "LOCATION_PARENT_COLOMBIA": "Hitman 2",
  "LOCATION_PARENT_MUMBAI": "Hitman 2",
  "LOCATION_PARENT_NORTHAMERICA": "Hitman 2",
  "LOCATION_PARENT_NORTHSEA": "Hitman 2",
  "LOCATION_PARENT_GREEDY": "Hitman 2",
  "LOCATION_PARENT_OPULENT": "Hitman 2",
  "LOCATION_PARENT_GOLDEN": "Hitman 2",
  "LOCATION_PARENT_ELEGANT": "Hitman 3",
  "LOCATION_PARENT_ANCESTRAL": "Hitman 3",
  "LOCATION_PARENT_DARTMOOR": "Hitman 3",
  "LOCATION_PARENT_EDGY": "Hitman 3",
  "LOCATION_PARENT_WET": "Hitman 3",
  "LOCATION_PARENT_SALTY": "Hitman 3",
  "LOCATION_PARENT_TRAPPED": "Hitman 3",
  "LOCATION_PARENT_ROCKY": "Hitman 3",
  "LOCATION_PARENT_SNUG": "Hitman 3",
}

export async function findPeacockPath(): Promise<string | null> {
  // 1. Check environment variable first (highest priority)
  const envPath = process.env.PEACOCK_PATH
  if (envPath && await fileExists(envPath)) {
    if (await isPeacockDirectory(envPath)) {
      return envPath
    }
  }

  // 2. Check cached path from config file
  const cachedPath = await getCachedPeacockPath()
  if (cachedPath && await isPeacockDirectory(cachedPath)) {
    return cachedPath
  }

  // 3. Search for PeacockPatcher.exe (most reliable method)
  const peacockPath = await findPeacockPatcherExe()
  if (peacockPath) {
    await cachePeacockPath(peacockPath)
    return peacockPath
  }

  // 4. Fallback: Search common locations
  const commonPaths = [
    process.cwd(),
    path.join(process.cwd(), ".."),
    path.join(os.homedir(), "Desktop", "Peacock"),
    path.join(os.homedir(), "Desktop", "Peacock-master", "Peacock-master"),
    path.join(os.homedir(), "Desktop", "Peacock-master"),
    path.join(os.homedir(), "Documents", "Peacock"),
    path.join(os.homedir(), "Downloads", "Peacock"),
  ]

  for (const p of commonPaths) {
    if (await isPeacockDirectory(p)) {
      await cachePeacockPath(p)
      return p
    }
  }

  return null
}

async function findPeacockPatcherExe(): Promise<string | null> {
  // Search common user directories for Peacock folder structure
  const searchRoots = [
    path.join(os.homedir(), "Desktop"),
    path.join(os.homedir(), "Documents"),
    path.join(os.homedir(), "Downloads"),
  ]

  // Deep search in user directories (max 5 levels to be thorough)
  for (const root of searchRoots) {
    const found = await findPeacockFolder(root, 5)
    if (found) {
      await cachePeacockPath(found)
      return found
    }
  }

  // Search all drives (Windows only) - more thorough
  if (process.platform === "win32") {
    const drives = ['C', 'D', 'E', 'F', 'G', 'H']
    
    for (const drive of drives) {
      const drivePath = `${drive}:\\`
      if (!await fileExists(drivePath)) continue

      // Check common game/app locations on each drive
      const commonLocations = [
        path.join(drivePath, 'Peacock'),
        path.join(drivePath, 'Games'),
        path.join(drivePath, 'Program Files'),
        path.join(drivePath, 'Program Files (x86)'),
        drivePath, // Root of drive
      ]

      for (const location of commonLocations) {
        const found = await findPeacockFolder(location, 3)
        if (found) {
          return found
        }
      }
    }
  }

  return null
}

async function findPeacockFolder(rootDir: string, maxDepth: number): Promise<string | null> {
  if (maxDepth <= 0) return null
  if (!await fileExists(rootDir)) return null

  try {
    const entries = await fs.readdir(rootDir, { withFileTypes: true })
    
    // Check if current directory is Peacock
    if (await isPeacockDirectory(rootDir)) {
      return rootDir
    }

    // Then search subdirectories
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      
      // Skip system/hidden directories for performance
      const name = entry.name.toLowerCase()
      if (name.startsWith('.') || name.startsWith('$') || 
          name === 'node_modules' || name === 'windows' || 
          name === 'appdata' || name === 'programdata' ||
          name === 'system32' || name === 'syswow64') {
        continue
      }

      const fullPath = path.join(rootDir, entry.name)
      
      // Recursively search deeper
      const found = await findPeacockFolder(fullPath, maxDepth - 1)
      if (found) return found
    }
  } catch {
    // Permission denied or other error, skip this directory
  }

  return null
}

async function isPeacockDirectory(dirPath: string): Promise<boolean> {
  if (!await fileExists(dirPath)) return false
  
  // Check for ALL critical Peacock folders
  const requiredFolders = [
    "contractdata",
    "contractSessions", 
    "userdata",
    "static",
  ]
  
  // Count how many required folders exist
  let foundCount = 0
  for (const folder of requiredFolders) {
    if (await fileExists(path.join(dirPath, folder))) {
      foundCount++
    }
  }
  
  // Must have at least 3 out of 4 required folders to be considered valid
  // (contractSessions might not exist in older versions)
  return foundCount >= 3
}

async function deepSearchPeacock(rootDir: string, maxDepth: number): Promise<string | null> {
  if (maxDepth <= 0) return null
  if (!await fileExists(rootDir)) return null

  try {
    const entries = await fs.readdir(rootDir, { withFileTypes: true })
    
    // First check current directory
    if (await isPeacockDirectory(rootDir)) {
      return rootDir
    }

    // Then search subdirectories
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      
      // Skip system/hidden directories
      const name = entry.name.toLowerCase()
      if (name.startsWith('.') || name === 'node_modules' || name === '$recycle.bin' || 
          name === 'windows' || name === 'program files' || name === 'programdata') {
        continue
      }

      const fullPath = path.join(rootDir, entry.name)
      
      // Check if this directory is Peacock
      if (await isPeacockDirectory(fullPath)) {
        return fullPath
      }

      // Recursively search deeper
      const found = await deepSearchPeacock(fullPath, maxDepth - 1)
      if (found) return found
    }
  } catch {
    // Permission denied or other error, skip this directory
  }

  return null
}

async function searchAllDrives(): Promise<string | null> {
  try {
    // Get all drive letters (C:, D:, E:, etc.)
    const drives = ['C', 'D', 'E', 'F', 'G']
    
    for (const drive of drives) {
      const drivePath = `${drive}:\\`
      if (!await fileExists(drivePath)) continue

      // Check common locations on each drive
      const commonLocations = [
        path.join(drivePath, 'Peacock'),
        path.join(drivePath, 'Games', 'Peacock'),
        path.join(drivePath, 'Hitman', 'Peacock'),
      ]

      for (const location of commonLocations) {
        if (await isPeacockDirectory(location)) {
          return location
        }
      }

      // Search root of drive (max depth 2)
      const found = await deepSearchPeacock(drivePath, 2)
      if (found) return found
    }
  } catch {
    // Error searching drives
  }

  return null
}

const CACHE_FILE = path.join(os.homedir(), '.peacock-webapp-cache.json')

async function getCachedPeacockPath(): Promise<string | null> {
  try {
    const data = await fs.readFile(CACHE_FILE, 'utf-8')
    const cache = JSON.parse(data)
    return cache.peacockPath || null
  } catch {
    return null
  }
}

async function cachePeacockPath(peacockPath: string): Promise<void> {
  try {
    await fs.writeFile(CACHE_FILE, JSON.stringify({ 
      peacockPath,
      lastUpdated: new Date().toISOString()
    }, null, 2), 'utf-8')
  } catch {
    // Failed to cache, not critical
  }
}

export async function getProfiles(peacockPath: string) {
  const userdataPath = path.join(peacockPath, "userdata", "users")
  
  if (!await fileExists(userdataPath)) {
    return []
  }

  const files = await fs.readdir(userdataPath)
  const validProfiles = []

  for (const file of files) {
    if (!file.endsWith(".json")) continue
    
    const stem = file.replace(".json", "")
    if (["lop", "default", "example", "backup"].includes(stem)) continue
    if (stem.length === 36 && stem.split("-").length === 5) {
      validProfiles.push(path.join(userdataPath, file))
    }
  }

  return validProfiles
}

export function calculateXpForLevel(level: number): number {
  return 6000 * level
}

export async function getMasteryMaxLevels(peacockPath: string): Promise<Record<string, number>> {
  const masteryLevels: Record<string, number> = {}
  const contractdataPath = path.join(peacockPath, "contractdata")

  if (!await fileExists(contractdataPath)) {
    return masteryLevels
  }

  const findMasteryFiles = async (dir: string): Promise<string[]> => {
    const files: string[] = []
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        files.push(...await findMasteryFiles(fullPath))
      } else if (entry.name.includes("_MASTERY.json")) {
        files.push(fullPath)
      }
    }

    return files
  }

  const masteryFiles = await findMasteryFiles(contractdataPath)

  for (const file of masteryFiles) {
    try {
      const data = JSON.parse(await fs.readFile(file, "utf-8"))
      const maxLevel = data.MaxLevel || 20
      const locationId = data.LocationId || ""

      if (locationId) {
        if (!masteryLevels[locationId] || maxLevel > masteryLevels[locationId]) {
          masteryLevels[locationId] = maxLevel
        }
      }
    } catch {
      // Skip invalid files
    }
  }

  // Default sniper locations
  const sniperLocations = ["LOCATION_PARENT_AUSTRIA", "LOCATION_PARENT_SALTY", "LOCATION_PARENT_CAGED"]
  for (const loc of sniperLocations) {
    if (!masteryLevels[loc]) {
      masteryLevels[loc] = 20
    }
  }

  return masteryLevels
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await fs.access(path)
    return true
  } catch {
    return false
  }
}

export async function readJsonFile<T = any>(filePath: string): Promise<T | null> {
  try {
    const content = await fs.readFile(filePath, "utf-8")
    return JSON.parse(content)
  } catch {
    return null
  }
}

export async function writeJsonFile(filePath: string, data: any): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 4), "utf-8")
}
