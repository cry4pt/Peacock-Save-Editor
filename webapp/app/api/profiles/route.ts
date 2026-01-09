import { NextResponse } from "next/server"
import { findPeacockPath, getProfiles, readJsonFile } from "@/lib/peacock"

export async function GET() {
  try {
    const peacockPath = await findPeacockPath()
    if (!peacockPath) {
      return NextResponse.json({ error: "Peacock not found" }, { status: 404 })
    }

    const profileFiles = await getProfiles(peacockPath)
    const profiles = []

    for (const profileFile of profileFiles) {
      try {
        const profile = await readJsonFile<any>(profileFile)
        if (!profile) continue

        const extensions = profile.Extensions || {}
        const progression = extensions.progression || {}

        const playerXp = progression.PlayerProfileXP || {}
        const level = playerXp.ProfileLevel || progression.ProfileLevel || 1
        const xp = playerXp.Total || progression.XP || 0

        const mercesData = progression.Merces || {}
        const merces = mercesData.Total || 0

        let prestige = 0
        const cpd = extensions.CPD || {}
        const freelancerKey = "f8ec92c2-4fa2-471e-ae08-545480c746ee"
        if (cpd[freelancerKey]) {
          prestige = cpd[freelancerKey].EvergreenLevel || 0
        }

        const id = profileFile.split(/[\\/]/).pop()?.replace(".json", "") || ""

        profiles.push({
          id,
          level,
          xp,
          merces,
          prestige,
          challenges_completed: Object.keys(extensions.ChallengeProgression || {}).length,
          locations_count: Object.keys(progression.Locations || {}).length,
          escalations_completed: (extensions.PeacockCompletedEscalations || []).length,
          stories_completed: Object.keys(extensions.opportunityprogression || {}).length
        })
      } catch {
        continue
      }
    }

    return NextResponse.json(profiles)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
