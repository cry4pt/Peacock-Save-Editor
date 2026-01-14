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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ids, profile_id } = body

    const peacockPath = await findPeacockPath()
    if (!peacockPath) {
      return NextResponse.json({ error: "Peacock not found" }, { status: 404 })
    }

    const profileFiles = await getProfiles(peacockPath)
    if (profileFiles.length === 0) {
      return NextResponse.json({ error: "No profiles found" }, { status: 404 })
    }

    let profileFile = profileFiles[0]
    if (profile_id) {
      const customPath = path.join(peacockPath, PEACOCK_PATHS.USERDATA_DIR, PEACOCK_PATHS.USERS_DIR, `${profile_id}.json`)
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
    if (!profile.Extensions.opportunityprogression) profile.Extensions.opportunityprogression = {}

    const prog = profile.Extensions.opportunityprogression

    if (ids && Array.isArray(ids) && ids.length > 0) {
      // Lock specific stories
      let lockedCount = 0
      for (const id of ids) {
        if (prog[id]) {
          delete prog[id]
          lockedCount++
        }
      }

      await writeJsonFile(profileFile, profile)
      await logActivity(peacockPath, `Locked ${lockedCount} mission stor${lockedCount !== 1 ? 'ies' : 'y'}`, "unlock")

      return NextResponse.json({
        success: true,
        message: `Successfully locked ${lockedCount} mission stor${lockedCount !== 1 ? 'ies' : 'y'}`
      })
    } else {
      // Lock all stories
      const totalCount = Object.keys(prog).length
      profile.Extensions.opportunityprogression = {}

      await writeJsonFile(profileFile, profile)
      await logActivity(peacockPath, `Locked all ${totalCount} mission stories`, "unlock")

      return NextResponse.json({
        success: true,
        message: `Successfully locked all ${totalCount} mission stories`
      })
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
