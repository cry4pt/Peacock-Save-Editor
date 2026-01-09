import { NextResponse } from "next/server"
import { findPeacockPath, getProfiles, getMasteryMaxLevels, calculateXpForLevel, readJsonFile, LOCATION_NAMES, LOCATION_GAMES } from "@/lib/peacock"

export async function GET() {
  try {
    const peacockPath = await findPeacockPath()
    if (!peacockPath) {
      return NextResponse.json({ error: "Peacock not found" }, { status: 404 })
    }

    const masteryLevels = await getMasteryMaxLevels(peacockPath)
    const profileFiles = await getProfiles(peacockPath)

    const currentLevels: Record<string, number> = {}

    if (profileFiles.length > 0) {
      const profile = await readJsonFile<any>(profileFiles[0])
      if (profile?.Extensions?.progression?.Locations) {
        const locations = profile.Extensions.progression.Locations
        for (const [locId, locData] of Object.entries(locations)) {
          if (typeof locData === "object" && locData !== null) {
            currentLevels[locId] = (locData as any).Level || 1
          }
        }
      }
    }

    const result = []
    for (const [locId, maxLevel] of Object.entries(masteryLevels)) {
      const current = currentLevels[locId] || 1
      result.push({
        id: locId,
        name: LOCATION_NAMES[locId] || locId,
        max_level: maxLevel,
        current_level: current,
        xp: calculateXpForLevel(current),
        game: LOCATION_GAMES[locId] || "Unknown"
      })
    }

    return NextResponse.json(result.sort((a, b) => a.name.localeCompare(b.name)))
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
