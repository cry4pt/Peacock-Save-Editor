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

async function getEscalationNames(peacockPath: string, ids: string[]): Promise<Record<string, string>> {
  const names: Record<string, string> = {}
  const escalationsPath = path.join(peacockPath, PEACOCK_PATHS.STATIC_DIR, PEACOCK_PATHS.ESCALATION_CODENAMES)
  const escalationsData = await readJsonFile<any>(escalationsPath)

  if (escalationsData) {
    for (const [location, escList] of Object.entries(escalationsData)) {
      if (Array.isArray(escList)) {
        for (const esc of escList) {
          if (esc.id && ids.includes(esc.id)) {
            names[esc.id] = esc.name || esc.codename || esc.id
          }
        }
      }
    }
  }

  return names
}

async function getAllEscalationIds(peacockPath: string) {
  const progress: Record<string, number> = {}
  const completedSet = new Set<string>()
  const details: Record<string, any> = {}

  const escalationsPath = path.join(peacockPath, PEACOCK_PATHS.STATIC_DIR, PEACOCK_PATHS.ESCALATION_CODENAMES)
  const escalationsData = await readJsonFile<any>(escalationsPath)

  if (escalationsData) {
    for (const [location, escList] of Object.entries(escalationsData)) {
      if (Array.isArray(escList)) {
        for (const esc of escList) {
          if (esc.id) {
            const maxLevel = esc.levels || 3
            progress[esc.id] = maxLevel
            completedSet.add(esc.id)
            details[esc.id] = { max_level: maxLevel }
          }
        }
      }
    }
  }

  return { progress, completed: Array.from(completedSet), details }
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

    const { progress: allProgress, completed: allCompleted, details } = await getAllEscalationIds(peacockPath)

    if (ids && Array.isArray(ids)) {
      if (!profile.Extensions.PeacockEscalations) {
        profile.Extensions.PeacockEscalations = {}
      }
      if (!profile.Extensions.PeacockCompletedEscalations) {
        profile.Extensions.PeacockCompletedEscalations = []
      }

      for (const id of ids) {
        const maxLevel = details[id]?.max_level || 3
        profile.Extensions.PeacockEscalations[id] = maxLevel
        if (!profile.Extensions.PeacockCompletedEscalations.includes(id)) {
          profile.Extensions.PeacockCompletedEscalations.push(id)
        }
      }
    } else {
      profile.Extensions.PeacockEscalations = allProgress
      profile.Extensions.PeacockCompletedEscalations = allCompleted
    }

    await writeJsonFile(profileFile, profile)

    let activityDescription = ""
    if (ids && Array.isArray(ids)) {
      if (ids.length === 1) {
        const names = await getEscalationNames(peacockPath, ids)
        const name = names[ids[0]] || ids[0]
        activityDescription = `Unlocked escalation: ${name}`
      } else {
        activityDescription = `Unlocked ${ids.length} escalations`
      }
    } else {
      activityDescription = "Unlocked all escalations"
    }

    const count = ids ? ids.length : "all"
    await logActivity(peacockPath, activityDescription, "unlock")
    return NextResponse.json({ success: true, message: `Unlocked ${count} escalations` })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
