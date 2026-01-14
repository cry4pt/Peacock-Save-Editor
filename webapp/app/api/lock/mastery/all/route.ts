import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import { findPeacockPath, getProfiles, readJsonFile, writeJsonFile } from "@/lib/peacock"
import { PEACOCK_PATHS } from "@/lib/constants"

async function logActivity(peacockPath: string, description: string, type: string = "mastery") {
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

    const profile = await readJsonFile<any>(profileFile)
    if (!profile) {
      return NextResponse.json({ error: "Failed to read profile" }, { status: 500 })
    }

    if (!profile.Extensions) profile.Extensions = {}
    if (!profile.Extensions.progression) profile.Extensions.progression = {}
    const prog = profile.Extensions.progression

    // Reset all location mastery
    let locationsCount = 0
    if (prog.Locations) {
      locationsCount = Object.keys(prog.Locations).length
      for (const locId of Object.keys(prog.Locations)) {
        delete prog.Locations[locId]
      }
    }

    await writeJsonFile(profileFile, profile)

    await logActivity(peacockPath, `Reset all ${locationsCount} location masteries`, "mastery")

    return NextResponse.json({
      success: true,
      message: `Reset all ${locationsCount} location masteries`
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
