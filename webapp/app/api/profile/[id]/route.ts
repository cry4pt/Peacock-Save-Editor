import { NextResponse } from "next/server";
import { findPeacockPath, getProfiles, readJsonFile } from "@/lib/peacock";

export async function GET() {
  try {
    const peacockPath = await findPeacockPath();
    if (!peacockPath) {
      return NextResponse.json({ error: "Peacock not found" }, { status: 404 });
    }

    const profileFiles = await getProfiles(peacockPath);
    const profiles = [];

    for (const profileFile of profileFiles) {
      try {
        const profile =
          await readJsonFile<Record<string, unknown>>(profileFile);
        if (!profile) continue;

        const extensions =
          (profile.Extensions as Record<string, unknown>) || {};
        const progression =
          (extensions.progression as Record<string, unknown>) || {};

        const playerXp =
          (progression.PlayerProfileXP as Record<string, unknown>) || {};
        const level =
          (playerXp.ProfileLevel as number) ||
          (progression.ProfileLevel as number) ||
          1;
        const xp =
          (playerXp.Total as number) || (progression.XP as number) || 0;

        const mercesData =
          (progression.Merces as Record<string, unknown>) || {};
        const merces = (mercesData.Total as number) || 0;

        let prestige = 0;
        const cpd =
          (extensions.CPD as Record<string, Record<string, unknown>>) || {};
        const freelancerKey = "f8ec92c2-4fa2-471e-ae08-545480c746ee";
        if (cpd[freelancerKey]) {
          prestige = (cpd[freelancerKey].EvergreenLevel as number) || 0;
        }

        const id = profileFile.split(/[\\/]/).pop()?.replace(".json", "") || "";

        profiles.push({
          id,
          level,
          xp,
          merces,
          prestige,
          challenges_completed: Object.keys(
            (extensions.ChallengeProgression as object) || {},
          ).length,
          locations_count: Object.keys((progression.Locations as object) || {})
            .length,
          escalations_completed: (
            (extensions.PeacockCompletedEscalations as unknown[]) || []
          ).length,
          stories_completed: Object.keys(
            (extensions.opportunityprogression as object) || {},
          ).length,
        });
      } catch {
        continue;
      }
    }

    return NextResponse.json(profiles);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
