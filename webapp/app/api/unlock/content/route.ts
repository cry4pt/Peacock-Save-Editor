import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import { findPeacockPath, getProfiles, getMasteryMaxLevels, calculateXpForLevel, readJsonFile, writeJsonFile } from "@/lib/peacock"
import { GAME_CONSTANTS, PEACOCK_PATHS, BACKUP_PATTERN } from "@/lib/constants"

async function logActivity(peacockPath: string, description: string, type: string = "unlock") {
  try {
    const logPath = path.join(peacockPath, PEACOCK_PATHS.USERDATA_DIR, PEACOCK_PATHS.ACTIVITY_LOG)
    let activities = []
    try {
      const data = await fs.readFile(logPath, "utf-8")
      activities = JSON.parse(data)
    } catch {}
    
    activities.unshift({
      id: Date.now().toString(),
      description,
      timestamp: new Date().toISOString(),
      type
    })
    
    await fs.writeFile(logPath, JSON.stringify(activities.slice(0, 50), null, 2))
  } catch {}
}

async function getAllChallengeIds(peacockPath: string) {
  const challenges: Record<string, any> = {}
  const contractdataPath = path.join(peacockPath, PEACOCK_PATHS.CONTRACTDATA_DIR)

  const globalPath = path.join(peacockPath, PEACOCK_PATHS.STATIC_DIR, PEACOCK_PATHS.GLOBAL_CHALLENGES)
  const globalChallenges = await readJsonFile<any[]>(globalPath)

  if (globalChallenges) {
    for (const challenge of globalChallenges) {
      if (challenge.Id) {
        challenges[challenge.Id] = {
          Completed: true,
          State: { CurrentState: "Success" }
        }
      }
    }
  }

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
    } catch {}
    return files
  }

  const challengeFiles = await findChallengeFiles(contractdataPath)

  for (const file of challengeFiles) {
    try {
      const data = await readJsonFile<any>(file)
      if (data?.groups) {
        for (const group of data.groups) {
          if (group.Challenges) {
            for (const challenge of group.Challenges) {
              if (challenge.Id) {
                challenges[challenge.Id] = {
                  Completed: true,
                  State: { CurrentState: "Success" }
                }
              }
            }
          }
        }
      }
    } catch {}
  }

  return challenges
}

async function getAllMissionStoryIds(peacockPath: string) {
  const stories: Record<string, boolean> = {}
  const storiesPath = path.join(peacockPath, PEACOCK_PATHS.STATIC_DIR, PEACOCK_PATHS.MISSION_STORIES)
  const storiesData = await readJsonFile<any>(storiesPath)

  if (storiesData) {
    for (const storyId of Object.keys(storiesData)) {
      stories[storyId] = true
    }
  }

  return stories
}

async function getAllEscalationIds(peacockPath: string) {
  const progress: Record<string, number> = {}
  const completedSet = new Set<string>()

  const escalationsPath = path.join(peacockPath, PEACOCK_PATHS.STATIC_DIR, PEACOCK_PATHS.ESCALATION_CODENAMES)
  const escalationsData = await readJsonFile<any>(escalationsPath)

  if (escalationsData) {
    for (const [location, escList] of Object.entries(escalationsData)) {
      if (Array.isArray(escList)) {
        for (const esc of escList) {
          if (esc.id && typeof esc.maxLevel === "number") {
            progress[esc.id] = esc.maxLevel
            completedSet.add(esc.id)
          }
        }
      }
    }
  }

  return { 
    progress, 
    completed: Array.from(completedSet) 
  }
}

async function backupProfile(profilePath: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)
  const backupPath = profilePath.replace(BACKUP_PATTERN.EXTENSION, `${BACKUP_PATTERN.PREFIX}${timestamp}${BACKUP_PATTERN.EXTENSION}`)
  try {
    await fs.copyFile(profilePath, backupPath)
    return backupPath
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const profileId = body.profile_id

    const peacockPath = await findPeacockPath()
    if (!peacockPath) {
      return NextResponse.json({ error: "Peacock not found" }, { status: 404 })
    }

    const profileFiles = await getProfiles(peacockPath)
    if (profileFiles.length === 0) {
      return NextResponse.json({ error: "No profiles found" }, { status: 404 })
    }

    let profileFile = profileFiles[0]
    if (profileId) {
      const customPath = path.join(peacockPath, PEACOCK_PATHS.USERDATA_DIR, PEACOCK_PATHS.USERS_DIR, `${profileId}.json`)
      const exists = await fs.access(customPath).then(() => true).catch(() => false)
      if (exists) {
        profileFile = customPath
      }
    }

    await backupProfile(profileFile)

    const profile = await readJsonFile<any>(profileFile)
    if (!profile) {
      return NextResponse.json({ error: "Failed to read profile" }, { status: 500 })
    }

    if (!profile.Extensions) profile.Extensions = {}
    if (!profile.Extensions.progression) profile.Extensions.progression = {}

    const prog = profile.Extensions.progression

    // Max all location mastery
    const masteryLevels = await getMasteryMaxLevels(peacockPath)
    if (!prog.Locations) prog.Locations = {}

    for (const [locId, maxLevel] of Object.entries(masteryLevels)) {
      const maxXp = calculateXpForLevel(maxLevel)
      if (!prog.Locations[locId]) prog.Locations[locId] = {}
      prog.Locations[locId].Xp = maxXp
      prog.Locations[locId].Level = maxLevel
      prog.Locations[locId].PreviouslySeenXp = maxXp
    }

    // Complete all challenges (merge with existing to preserve custom progress)
    const challenges = await getAllChallengeIds(peacockPath)
    const existingChallenges = profile.Extensions.ChallengeProgression || {}
    profile.Extensions.ChallengeProgression = { ...existingChallenges, ...challenges }

    // Complete all mission stories (merge with existing)
    const stories = await getAllMissionStoryIds(peacockPath)
    const existingStories = profile.Extensions.opportunityprogression || {}
    profile.Extensions.opportunityprogression = { ...existingStories, ...stories }

    // Complete all escalations (merge with existing to preserve any custom progress)
    const { progress: escProgress, completed: escCompleted } = await getAllEscalationIds(peacockPath)
    
    // Preserve existing escalation progress
    const existingProgress = profile.Extensions.PeacockEscalations || {}
    const existingCompleted = profile.Extensions.PeacockCompletedEscalations || []
    
    // Merge: new escalations + keep existing ones
    profile.Extensions.PeacockEscalations = { ...existingProgress, ...escProgress }
    
    // Merge completed list (remove duplicates)
    const mergedCompleted = new Set([...existingCompleted, ...escCompleted])
    profile.Extensions.PeacockCompletedEscalations = Array.from(mergedCompleted)

    // Initialize Freelancer if it doesn't exist (required for escalations to show correctly)
    if (!profile.Extensions.CPD) profile.Extensions.CPD = {}
    if (!profile.Extensions.CPD[GAME_CONSTANTS.FREELANCER_ID]) {
      profile.Extensions.CPD[GAME_CONSTANTS.FREELANCER_ID] = {
        MyMoney: 0,
        EvergreenLevel: 0
      }
    }

    await writeJsonFile(profileFile, profile)

    await logActivity(peacockPath, "Unlocked all challenges, escalations, stories, and max mastery", "unlock")

    return NextResponse.json({ success: true, message: "Unlocked all content successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
