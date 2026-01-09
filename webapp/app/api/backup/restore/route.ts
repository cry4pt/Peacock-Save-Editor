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

    // Find the most recent backup
    const profileDir = path.dirname(profileFile)
    const profileBaseName = path.basename(profileFile, BACKUP_PATTERN.EXTENSION)
    const files = await fs.readdir(profileDir)
    
    const backupFiles = files
      .filter(f => f.startsWith(`${profileBaseName}${BACKUP_PATTERN.PREFIX}`) && f.endsWith(BACKUP_PATTERN.EXTENSION))
      .sort()
      .reverse()

    if (backupFiles.length === 0) {
      return NextResponse.json({ error: "No backups found" }, { status: 404 })
    }

    const latestBackup = path.join(profileDir, backupFiles[0])
    await fs.copyFile(latestBackup, profileFile)

    return NextResponse.json({
      success: true,
      message: `Restored from backup: ${backupFiles[0]}`
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to restore backup" },
      { status: 500 }
    )
  }
}
