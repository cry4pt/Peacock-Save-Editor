import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import { findPeacockPath, getProfiles, readJsonFile, writeJsonFile } from "@/lib/peacock"
import { PEACOCK_PATHS } from "@/lib/constants"

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

async function getChallengeNames(peacockPath: string, ids: string[]): Promise<Record<string, string>> {
  const names: Record<string, string> = {}
  const contractdataPath = path.join(peacockPath, PEACOCK_PATHS.CONTRACTDATA_DIR)

  // Check global challenges
  const globalPath = path.join(peacockPath, PEACOCK_PATHS.STATIC_DIR, PEACOCK_PATHS.GLOBAL_CHALLENGES)
  const globalChallenges = await readJsonFile<any[]>(globalPath)
  
  if (globalChallenges) {
    for (const challenge of globalChallenges) {
      if (challenge.Id && ids.includes(challenge.Id)) {
        names[challenge.Id] = challenge.Name || challenge.Id
      }
    }
  }

  // Find challenge files
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
              if (challenge.Id && ids.includes(challenge.Id)) {
                names[challenge.Id] = challenge.Name || challenge.Id
              }
            }
          }
        }
      }
    } catch {}
  }

  return names
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const profileId = body.profile_id
    const ids = body.ids

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

    const profile = await readJsonFile<any>(profileFile)
    if (!profile) {
      return NextResponse.json({ error: "Failed to read profile" }, { status: 500 })
    }

    if (!profile.Extensions) profile.Extensions = {}

    if (ids && Array.isArray(ids)) {
      if (!profile.Extensions.ChallengeProgression) {
        profile.Extensions.ChallengeProgression = {}
      }
      for (const id of ids) {
        profile.Extensions.ChallengeProgression[id] = {
          Completed: true,
          State: { CurrentState: "Success" }
        }
      }
    } else {
      const challenges = await getAllChallengeIds(peacockPath)
      profile.Extensions.ChallengeProgression = challenges
    }

    await writeJsonFile(profileFile, profile)

    let activityDescription = ""
    if (ids && Array.isArray(ids)) {
      if (ids.length === 1) {
        const names = await getChallengeNames(peacockPath, ids)
        const name = names[ids[0]] || ids[0]
        activityDescription = `Unlocked challenge: ${name}`
      } else {
        activityDescription = `Unlocked ${ids.length} challenges`
      }
    } else {
      activityDescription = "Unlocked all challenges"
    }

    const count = ids ? ids.length : "all"
    await logActivity(peacockPath, activityDescription, "unlock")
    return NextResponse.json({ success: true, message: `Unlocked ${count} challenges` })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
