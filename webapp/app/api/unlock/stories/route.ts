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

async function getStoryNames(peacockPath: string, ids: string[]): Promise<Record<string, string>> {
  const names: Record<string, string> = {}
  const storiesPath = path.join(peacockPath, PEACOCK_PATHS.STATIC_DIR, PEACOCK_PATHS.MISSION_STORIES)
  const storiesData = await readJsonFile<any>(storiesPath)

  if (storiesData) {
    for (const [storyId, storyInfo] of Object.entries(storiesData)) {
      if (ids.includes(storyId)) {
        const info = storyInfo as any
        names[storyId] = info.name || info.Name || storyId
      }
    }
  }

  return names
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
      if (!profile.Extensions.opportunityprogression) {
        profile.Extensions.opportunityprogression = {}
      }
      for (const id of ids) {
        profile.Extensions.opportunityprogression[id] = true
      }
    } else {
      const stories = await getAllMissionStoryIds(peacockPath)
      profile.Extensions.opportunityprogression = stories
    }

    await writeJsonFile(profileFile, profile)

    let activityDescription = ""
    if (ids && Array.isArray(ids)) {
      if (ids.length === 1) {
        const names = await getStoryNames(peacockPath, ids)
        const name = names[ids[0]] || ids[0]
        activityDescription = `Unlocked story: ${name}`
      } else {
        activityDescription = `Unlocked ${ids.length} mission stories`
      }
    } else {
      activityDescription = "Unlocked all mission stories"
    }

    const count = ids ? ids.length : "all"
    await logActivity(peacockPath, activityDescription, "unlock")
    return NextResponse.json({ success: true, message: `Unlocked ${count} stories` })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
