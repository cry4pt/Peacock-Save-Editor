// Core Peacock utilities for server-side operations
// Handles finding Peacock installation, reading/writing profile data, and game constants
import fs from "fs/promises";
import path from "path";
import os from "os";

// Mapping of internal location IDs to human-readable names for all Hitman WoA locations
export const LOCATION_NAMES: Record<string, string> = {
  LOCATION_PARENT_PARIS: "Paris - The Showstopper",
  LOCATION_PARENT_COASTALTOWN: "Sapienza - World of Tomorrow",
  LOCATION_PARENT_MARRAKECH: "Marrakesh - A Gilded Cage",
  LOCATION_PARENT_BANGKOK: "Bangkok - Club 27",
  LOCATION_PARENT_COLORADO: "Colorado - Freedom Fighters",
  LOCATION_PARENT_HOKKAIDO: "Hokkaido - Situs Inversus",
  LOCATION_PARENT_NEWZEALAND: "Hawke's Bay - Nightcall",
  LOCATION_PARENT_MIAMI: "Miami - The Finish Line",
  LOCATION_PARENT_COLOMBIA: "Santa Fortuna - Three-Headed Serpent",
  LOCATION_PARENT_MUMBAI: "Mumbai - Chasing a Ghost",
  LOCATION_PARENT_NORTHAMERICA: "Whittleton Creek - Another Life",
  LOCATION_PARENT_NORTHSEA: "Isle of Sgail - The Ark Society",
  LOCATION_PARENT_GREEDY: "New York - Golden Handshake",
  LOCATION_PARENT_OPULENT: "Haven Island - The Last Resort",
  LOCATION_PARENT_ELEGANT: "Mendoza - The Farewell",
  LOCATION_PARENT_ANCESTRAL: "Dartmoor - Death in the Family",
  LOCATION_PARENT_EDGY: "Berlin - Apex Predator",
  LOCATION_PARENT_WET: "Chongqing - End of an Era",
  LOCATION_PARENT_SALTY:
    "Singapore - Hantu Port - The Pen and the Sword (Sniper)",
  LOCATION_PARENT_TRAPPED: "Carpathian Mountains - Untouchable",
  LOCATION_PARENT_ICA_FACILITY: "ICA Facility",
  LOCATION_PARENT_ROCKY: "Ambrose Island",
  LOCATION_PARENT_SNUG: "Snug (Freelancer Safehouse)",
  LOCATION_PARENT_AUSTRIA: "Austria - Himmelstein - The Last Yardbird (Sniper)",
  LOCATION_PARENT_CAGED: "Russia - Siberia - Crime and Punishment (Sniper)",
};

// Mapping of location IDs to which Hitman game they belong to (1, 2, or 3)
export const LOCATION_GAMES: Record<string, string> = {
  LOCATION_PARENT_PARIS: "Hitman 1",
  LOCATION_PARENT_COASTALTOWN: "Hitman 1",
  LOCATION_PARENT_MARRAKECH: "Hitman 1",
  LOCATION_PARENT_BANGKOK: "Hitman 1",
  LOCATION_PARENT_COLORADO: "Hitman 1",
  LOCATION_PARENT_HOKKAIDO: "Hitman 1",
  LOCATION_PARENT_ICA_FACILITY: "Hitman 1",
  LOCATION_PARENT_NEWZEALAND: "Hitman 2",
  LOCATION_PARENT_MIAMI: "Hitman 2",
  LOCATION_PARENT_COLOMBIA: "Hitman 2",
  LOCATION_PARENT_MUMBAI: "Hitman 2",
  LOCATION_PARENT_NORTHAMERICA: "Hitman 2",
  LOCATION_PARENT_NORTHSEA: "Hitman 2",
  LOCATION_PARENT_GREEDY: "Hitman 2",
  LOCATION_PARENT_OPULENT: "Hitman 2",
  LOCATION_PARENT_GOLDEN: "Hitman 2",
  LOCATION_PARENT_ELEGANT: "Hitman 3",
  LOCATION_PARENT_ANCESTRAL: "Hitman 3",
  LOCATION_PARENT_DARTMOOR: "Hitman 3",
  LOCATION_PARENT_EDGY: "Hitman 3",
  LOCATION_PARENT_WET: "Hitman 3",
  LOCATION_PARENT_SALTY: "Hitman 2",
  LOCATION_PARENT_TRAPPED: "Hitman 3",
  LOCATION_PARENT_ROCKY: "Hitman 3",
  LOCATION_PARENT_SNUG: "Hitman 3",
  LOCATION_PARENT_AUSTRIA: "Hitman 2",
  LOCATION_PARENT_CAGED: "Hitman 2",
};

/**
 * Attempts to locate the Peacock installation directory using multiple strategies:
 * 1. Check PEACOCK_PATH environment variable
 * 2. Check cached path from previous successful finds
 * 3. Search for PeacockPatcher.exe in common locations
 * 4. Check hardcoded common installation paths
 * 
 * @returns Path to Peacock directory or null if not found
 */
export async function findPeacockPath(): Promise<string | null> {
  // 1. Check environment variable first (highest priority)
  const envPath = process.env.PEACOCK_PATH;
  if (envPath && (await fileExists(envPath))) {
    if (await isPeacockDirectory(envPath)) {
      return envPath;
    }
  }

  // 2. Check cached path from config file
  const cachedPath = await getCachedPeacockPath();
  if (cachedPath && (await isPeacockDirectory(cachedPath))) {
    return cachedPath;
  }

  // 3. Search for PeacockPatcher.exe (most reliable method)
  const peacockPath = await findPeacockPatcherExe();
  if (peacockPath) {
    await cachePeacockPath(peacockPath);
    return peacockPath;
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
  ];

  for (const p of commonPaths) {
    if (await isPeacockDirectory(p)) {
      await cachePeacockPath(p);
      return p;
    }
  }

  return null;
}

/**
 * Searches for PeacockPatcher.exe executable to locate installation
 * First checks user directories (Desktop, Documents, Downloads)
 * Then searches all available drive letters on Windows
 * 
 * @returns Path to Peacock directory containing the patcher, or null if not found
 */
async function findPeacockPatcherExe(): Promise<string | null> {
  // Search common user directories for Peacock folder structure
  const searchRoots = [
    path.join(os.homedir(), "Desktop"),
    path.join(os.homedir(), "Documents"),
    path.join(os.homedir(), "Downloads"),
  ];

  // Deep search in user directories (max 5 levels to be thorough)
  for (const root of searchRoots) {
    const found = await findPeacockFolder(root, 5);
    if (found) {
      await cachePeacockPath(found);
      return found;
    }
  }

  // Search all drives (Windows only) - more thorough
  if (process.platform === "win32") {
    const drives = ["C", "D", "E", "F", "G", "H"];

    for (const drive of drives) {
      const drivePath = `${drive}:\\`;
      if (!(await fileExists(drivePath))) continue;

      // Check common game/app locations on each drive
      const commonLocations = [
        path.join(drivePath, "Peacock"),
        path.join(drivePath, "Games"),
        path.join(drivePath, "Program Files"),
        path.join(drivePath, "Program Files (x86)"),
        drivePath, // Root of drive
      ];

      for (const location of commonLocations) {
        const found = await findPeacockFolder(location, 3);
        if (found) {
          return found;
        }
      }
    }
  }

  return null;
}

/**
 * Recursively searches for Peacock folder starting from rootDir
 * Skips system directories and hidden folders for performance
 * 
 * @param rootDir Directory to start searching from
 * @param maxDepth Maximum recursion depth to prevent infinite loops
 * @returns Path to Peacock directory or null if not found
 */
async function findPeacockFolder(
  rootDir: string,
  maxDepth: number,
): Promise<string | null> {
  if (maxDepth <= 0) return null;
  if (!(await fileExists(rootDir))) return null;

  try {
    const entries = await fs.readdir(rootDir, { withFileTypes: true });

    // Check if current directory is Peacock
    if (await isPeacockDirectory(rootDir)) {
      return rootDir;
    }

    // Then search subdirectories
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      // Skip system/hidden directories for performance
      const name = entry.name.toLowerCase();
      if (
        name.startsWith(".") ||
        name.startsWith("$") ||
        name === "node_modules" ||
        name === "windows" ||
        name === "appdata" ||
        name === "programdata" ||
        name === "system32" ||
        name === "syswow64"
      ) {
        continue;
      }

      const fullPath = path.join(rootDir, entry.name);

      // Recursively search deeper
      const found = await findPeacockFolder(fullPath, maxDepth - 1);
      if (found) return found;
    }
  } catch {
    // Permission denied or other error, skip this directory
  }

  return null;
}

/**
 * Validates if a directory is a valid Peacock installation
 * Checks for presence of required folders: contractdata, contractSessions, userdata, static
 * 
 * @param dirPath Path to directory to validate
 * @returns True if directory contains required Peacock folders
 */
async function isPeacockDirectory(dirPath: string): Promise<boolean> {
  if (!(await fileExists(dirPath))) return false;

  // Check for ALL critical Peacock folders
  const requiredFolders = [
    "contractdata",
    "contractSessions",
    "userdata",
    "static",
  ];

  // Count how many required folders exist
  let foundCount = 0;
  for (const folder of requiredFolders) {
    if (await fileExists(path.join(dirPath, folder))) {
      foundCount++;
    }
  }

  // Must have at least 3 out of 4 required folders to be considered valid
  // (contractSessions might not exist in older versions)
  return foundCount >= 3;
}

/**
 * Performs a deep recursive search for Peacock directory
 * Similar to findPeacockFolder but with different directory skip logic
 * 
 * @param rootDir Directory to start searching from
 * @param maxDepth Maximum recursion depth
 * @returns Path to Peacock directory or null if not found
 */
async function deepSearchPeacock(
  rootDir: string,
  maxDepth: number,
): Promise<string | null> {
  if (maxDepth <= 0) return null;
  if (!(await fileExists(rootDir))) return null;

  try {
    const entries = await fs.readdir(rootDir, { withFileTypes: true });

    // First check current directory
    if (await isPeacockDirectory(rootDir)) {
      return rootDir;
    }

    // Then search subdirectories
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      // Skip system/hidden directories
      const name = entry.name.toLowerCase();
      if (
        name.startsWith(".") ||
        name === "node_modules" ||
        name === "$recycle.bin" ||
        name === "windows" ||
        name === "program files" ||
        name === "programdata"
      ) {
        continue;
      }

      const fullPath = path.join(rootDir, entry.name);

      // Check if this directory is Peacock
      if (await isPeacockDirectory(fullPath)) {
        return fullPath;
      }

      // Recursively search deeper
      const found = await deepSearchPeacock(fullPath, maxDepth - 1);
      if (found) return found;
    }
  } catch {
    // Permission denied or other error, skip this directory
  }

  return null;
}

/**
 * Searches all available drive letters (C: through G:) on Windows
 * Checks common installation locations on each drive
 * 
 * @returns Path to Peacock directory or null if not found
 */
async function searchAllDrives(): Promise<string | null> {
  try {
    // Get all drive letters (C:, D:, E:, etc.)
    const drives = ["C", "D", "E", "F", "G"];

    for (const drive of drives) {
      const drivePath = `${drive}:\\`;
      if (!(await fileExists(drivePath))) continue;

      // Check common locations on each drive
      const commonLocations = [
        path.join(drivePath, "Peacock"),
        path.join(drivePath, "Games", "Peacock"),
        path.join(drivePath, "Hitman", "Peacock"),
      ];

      for (const location of commonLocations) {
        if (await isPeacockDirectory(location)) {
          return location;
        }
      }

      // Search root of drive (max depth 2)
      const found = await deepSearchPeacock(drivePath, 2);
      if (found) return found;
    }
  } catch {
    // Error searching drives
  }

  return null;
}

// Cache file location in user's home directory to persist Peacock path across restarts
const CACHE_FILE = path.join(os.homedir(), ".peacock-webapp-cache.json");

/**
 * Reads the cached Peacock path from previous successful detections
 * @returns Cached path or null if cache doesn't exist or is invalid
 */
async function getCachedPeacockPath(): Promise<string | null> {
  try {
    const data = await fs.readFile(CACHE_FILE, "utf-8");
    const cache = JSON.parse(data);
    return cache.peacockPath || null;
  } catch {
    return null;
  }
}

/**
 * Saves the Peacock installation path to cache for faster future lookups
 * @param peacockPath Path to Peacock directory to cache
 */
async function cachePeacockPath(peacockPath: string): Promise<void> {
  try {
    await fs.writeFile(
      CACHE_FILE,
      JSON.stringify(
        {
          peacockPath,
          lastUpdated: new Date().toISOString(),
        },
        null,
        2,
      ),
      "utf-8",
    );
  } catch {
    // Failed to cache, not critical
  }
}

/**
 * Gets all valid user profile files from Peacock's userdata/users directory
 * Filters out system files (lop, default, example, backup)
 * Only returns files with valid UUID format (36 chars with 5 dash-separated segments)
 * 
 * @param peacockPath Path to Peacock installation
 * @returns Array of paths to valid profile JSON files
 */
export async function getProfiles(peacockPath: string) {
  const userdataPath = path.join(peacockPath, "userdata", "users");

  if (!(await fileExists(userdataPath))) {
    return [];
  }

  const files = await fs.readdir(userdataPath);
  const validProfiles = [];

  for (const file of files) {
    if (!file.endsWith(".json")) continue;

    const stem = file.replace(".json", "");
    if (["lop", "default", "example", "backup"].includes(stem)) continue;
    if (stem.length === 36 && stem.split("-").length === 5) {
      validProfiles.push(path.join(userdataPath, file));
    }
  }

  return validProfiles;
}

/**
 * Calculates the XP required to reach a specific level
 * Hitman uses 6000 XP per level formula
 * 
 * @param level Target level (1-7500)
 * @returns Total XP required for that level
 */
export function calculateXpForLevel(level: number): number {
  return 6000 * level;
}

/**
 * Reads all mastery definition files from Peacock's contractdata directory
 * Extracts maximum mastery level for each location from *_MASTERY.json files
 * 
 * @param peacockPath Path to Peacock installation
 * @returns Map of location IDs to their maximum mastery levels
 */
export async function getMasteryMaxLevels(
  peacockPath: string,
): Promise<Record<string, number>> {
  const masteryLevels: Record<string, number> = {};
  const contractdataPath = path.join(peacockPath, "contractdata");

  if (!(await fileExists(contractdataPath))) {
    return masteryLevels;
  }

  // Recursively finds all *_MASTERY.json files in contractdata directory
  const findMasteryFiles = async (dir: string): Promise<string[]> => {
    const files: string[] = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await findMasteryFiles(fullPath)));
      } else if (entry.name.includes("_MASTERY.json")) {
        files.push(fullPath);
      }
    }

    return files;
  };

  const masteryFiles = await findMasteryFiles(contractdataPath);

  // Parse each mastery file and extract max level and location ID
  for (const file of masteryFiles) {
    try {
      const data = JSON.parse(await fs.readFile(file, "utf-8"));
      const maxLevel = data.MaxLevel || 20;
      const locationId = data.LocationId || "";

      if (locationId) {
        if (
          !masteryLevels[locationId] ||
          maxLevel > masteryLevels[locationId]
        ) {
          masteryLevels[locationId] = maxLevel;
        }
      }
    } catch {
      // Skip invalid files
    }
  }

  // Default sniper locations
  const sniperLocations = [
    "LOCATION_PARENT_AUSTRIA",
    "LOCATION_PARENT_SALTY",
    "LOCATION_PARENT_CAGED",
  ];
  for (const loc of sniperLocations) {
    if (!masteryLevels[loc]) {
      masteryLevels[loc] = 20;
    }
  }

  return masteryLevels;
}

/**
 * Checks if a file or directory exists at the given path
 * @param path Path to check
 * @returns True if path exists and is accessible
 */
async function fileExists(path: string): Promise<boolean> {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely reads and parses a JSON file
 * @param filePath Path to JSON file
 * @returns Parsed JSON data or null if file doesn't exist or is invalid
 */
export async function readJsonFile<T = any>(
  filePath: string,
): Promise<T | null> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Writes data to a JSON file with pretty formatting (4-space indentation)
 * @param filePath Path to write JSON file to
 * @param data Data to serialize as JSON
 */
export async function writeJsonFile(
  filePath: string,
  data: any,
): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 4), "utf-8");
}
