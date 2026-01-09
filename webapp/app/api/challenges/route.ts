import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import { findPeacockPath, getProfiles, readJsonFile } from "@/lib/peacock"
import { formatLocalizationKey } from "@/lib/localization"

// Cache challenges to avoid re-reading files
let challengesCache: { challenges: any[], timestamp: number } | null = null
const CACHE_TTL = 60000 // 1 minute

interface ChallengeDetail {
  id: string
  name: string
  description: string
  location: string
  completed: boolean
}

async function getAllChallenges(peacockPath: string, completedSet: Set<string>) {
  // Return cached data if still valid
  if (challengesCache && Date.now() - challengesCache.timestamp < CACHE_TTL) {
    return challengesCache.challenges.map(c => ({
      ...c,
      completed: completedSet.has(c.id)
    }))
  }

  const challengesMap = new Map<string, Omit<ChallengeDetail, 'completed'>>()
  const contractdataPath = path.join(peacockPath, "contractdata")

  // Load global challenges
  const globalPath = path.join(peacockPath, "static", "GlobalChallenges.json")
  const globalChallenges = await readJsonFile<any[]>(globalPath)
  
  if (globalChallenges) {
    for (const challenge of globalChallenges) {
      if (challenge.Id) {
        challengesMap.set(challenge.Id, {
          id: challenge.Id,
          name: formatLocalizationKey(challenge.Name) || challenge.Id,
          description: challenge.Description || "",
          location: "Global"
        })
      }
    }
  }

  // Find all challenge files
  const findChallengeFiles = async (dir: string): Promise<string[]> => {
    const files: string[] = []
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          files.push(...await findChallengeFiles(fullPath))
        } else if (entry.name.includes("CHALLENGE") && entry.name.endsWith(".json")) {
          files.push(fullPath)
        }
      }
    } catch {
      // Ignore errors
    }

    return files
  }

  const challengeFiles = await findChallengeFiles(contractdataPath)

  // Load location challenges (deduplicate by ID)
  for (const file of challengeFiles) {
    try {
      const data = await readJsonFile<any>(file)
      if (!data) continue

      const location = path.basename(file).replace("_CHALLENGES.json", "").replace("_CHALLENGE.json", "")

      if (data.groups) {
        for (const group of data.groups) {
          if (group.Challenges) {
            for (const challenge of group.Challenges) {
              if (challenge.Id && !challengesMap.has(challenge.Id)) {
                challengesMap.set(challenge.Id, {
                  id: challenge.Id,
                  name: formatLocalizationKey(challenge.Name) || challenge.Id,
                  description: challenge.Description || "",
                  location: location
                })
              }
            }
          }
        }
      }
    } catch {
      // Skip invalid files
    }
  }

  const challenges = Array.from(challengesMap.values())

  // Update cache
  challengesCache = {
    challenges,
    timestamp: Date.now()
  }

  return challenges.map(c => ({
    ...c,
    completed: completedSet.has(c.id)
  }))
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "0")
    const limit = parseInt(searchParams.get("limit") || "0")
    const search = searchParams.get("search") || ""
    const location = searchParams.get("location") || ""
    const completedOnly = searchParams.get("completed") === "true"
    const uncompletedOnly = searchParams.get("uncompleted") === "true"

    const peacockPath = await findPeacockPath()
    if (!peacockPath) {
      return NextResponse.json({ error: "Peacock not found" }, { status: 404 })
    }

    const profiles = await getProfiles(peacockPath)
    const completedSet = new Set<string>()

    if (profiles.length > 0) {
      const profileData = await readJsonFile<any>(profiles[0])
      if (profileData?.Extensions?.ChallengeProgression) {
        Object.keys(profileData.Extensions.ChallengeProgression).forEach(id => completedSet.add(id))
      }
    }

    let challenges = await getAllChallenges(peacockPath, completedSet)

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase()
      challenges = challenges.filter(c => 
        c.name.toLowerCase().includes(searchLower) ||
        c.description.toLowerCase().includes(searchLower) ||
        c.id.toLowerCase().includes(searchLower)
      )
    }

    if (location) {
      challenges = challenges.filter(c => c.location === location)
    }

    if (completedOnly) {
      challenges = challenges.filter(c => c.completed)
    } else if (uncompletedOnly) {
      challenges = challenges.filter(c => !c.completed)
    }

    // If pagination params provided, return paginated response
    if (page > 0 || limit > 0) {
      const actualLimit = limit || 50
      const total = challenges.length
      const start = (page - 1) * actualLimit
      const end = start + actualLimit
      const paginatedChallenges = challenges.slice(start, end)

      return NextResponse.json({
        challenges: paginatedChallenges,
        pagination: {
          page,
          limit: actualLimit,
          total,
          pages: Math.ceil(total / actualLimit)
        }
      })
    }

    // Otherwise return simple array (for dashboard compatibility)
    return NextResponse.json(challenges)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
