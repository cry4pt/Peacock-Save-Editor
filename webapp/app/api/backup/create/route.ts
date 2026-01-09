import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import { findPeacockPath, getProfiles } from "@/lib/peacock"
import { PEACOCK_PATHS, BACKUP_PATTERN } from "@/lib/constants"

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

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)
    const backupPath = profileFile.replace(BACKUP_PATTERN.EXTENSION, `${BACKUP_PATTERN.PREFIX}${timestamp}${BACKUP_PATTERN.EXTENSION}`)
    
    await fs.copyFile(profileFile, backupPath)

    return NextResponse.json({
      success: true,
      message: `Backup created: ${path.basename(backupPath)}`
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create backup" },
      { status: 500 }
    )
  }
}
