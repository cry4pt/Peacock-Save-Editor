import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import { findPeacockPath, getProfiles, getMasteryMaxLevels, calculateXpForLevel, readJsonFile, writeJsonFile, LOCATION_NAMES } from "@/lib/peacock"
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
    const locationId = body.location_id
    const level = body.level

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

    const masteryLevels = await getMasteryMaxLevels(peacockPath)

    if (!profile.Extensions) profile.Extensions = {}
    if (!profile.Extensions.progression) profile.Extensions.progression = {}
    const prog = profile.Extensions.progression

    // Sniper rifle mastery definitions
    const sniperRifles: Record<string, string[]> = {
      "LOCATION_PARENT_AUSTRIA": [
        "FIREARMS_SC_HERO_SNIPER_HM",
        "FIREARMS_SC_HERO_SNIPER_KNIGHT",
        "FIREARMS_SC_HERO_SNIPER_STONE"
      ],
      "LOCATION_PARENT_SALTY": [
        "FIREARMS_SC_SEAGULL_HM",
        "FIREARMS_SC_SEAGULL_KNIGHT",
        "FIREARMS_SC_SEAGULL_STONE"
      ],
      "LOCATION_PARENT_CAGED": [
        "FIREARMS_SC_FALCON_HM",
        "FIREARMS_SC_FALCON_KNIGHT",
        "FIREARMS_SC_FALCON_STONE"
      ]
    }

    if (locationId && level !== undefined) {
      // Set specific location
      const maxLevel = masteryLevels[locationId] || 20
      const targetLevel = Math.min(level, maxLevel)
      const targetXp = calculateXpForLevel(targetLevel)

      if (!prog.Locations) prog.Locations = {}
      if (!prog.Locations[locationId]) prog.Locations[locationId] = {}

      // Check if this is a sniper location
      if (sniperRifles[locationId]) {
        // Set mastery for each sniper rifle
        for (const rifleId of sniperRifles[locationId]) {
          if (!prog.Locations[locationId][rifleId]) {
            prog.Locations[locationId][rifleId] = {}
          }
          prog.Locations[locationId][rifleId].Xp = targetXp
          prog.Locations[locationId][rifleId].Level = targetLevel
          prog.Locations[locationId][rifleId].PreviouslySeenXp = targetXp
        }
      } else {
        // Regular location
        prog.Locations[locationId].Xp = targetXp
        prog.Locations[locationId].Level = targetLevel
        prog.Locations[locationId].PreviouslySeenXp = targetXp
      }

      await writeJsonFile(profileFile, profile)

      const locationName = LOCATION_NAMES[locationId] || locationId
      await logActivity(peacockPath, `Set ${locationName} mastery to level ${targetLevel}`, "mastery")

      return NextResponse.json({
        success: true,
        message: `Set mastery for ${locationId} to level ${targetLevel}`
      })
    } else {
      // Max all locations
      if (!prog.Locations) prog.Locations = {}

      for (const [locId, maxLevel] of Object.entries(masteryLevels)) {
        const maxXp = calculateXpForLevel(maxLevel)
        if (!prog.Locations[locId]) prog.Locations[locId] = {}
        
        // Check if this is a sniper location
        if (sniperRifles[locId]) {
          // Set mastery for each sniper rifle
          for (const rifleId of sniperRifles[locId]) {
            if (!prog.Locations[locId][rifleId]) {
              prog.Locations[locId][rifleId] = {}
            }
            prog.Locations[locId][rifleId].Xp = maxXp
            prog.Locations[locId][rifleId].Level = maxLevel
            prog.Locations[locId][rifleId].PreviouslySeenXp = maxXp
          }
        } else {
          // Regular location
          prog.Locations[locId].Xp = maxXp
          prog.Locations[locId].Level = maxLevel
          prog.Locations[locId].PreviouslySeenXp = maxXp
        }
      }

      await writeJsonFile(profileFile, profile)

      await logActivity(peacockPath, `Maxed all ${Object.keys(masteryLevels).length} location masteries`, "mastery")

      return NextResponse.json({
        success: true,
        message: `Maxed all ${Object.keys(masteryLevels).length} location masteries`
      })
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
