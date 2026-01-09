import { type NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { findPeacockPath, readJsonFile, writeJsonFile } from "@/lib/peacock";
import { GAME_CONSTANTS, PEACOCK_PATHS, BACKUP_PATTERN } from "@/lib/constants";

async function logActivity(peacockPath: string, description: string, type: string = "profile") {
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const peacockPath = await findPeacockPath();
    if (!peacockPath) {
      return NextResponse.json({ error: "Peacock not found" }, { status: 404 });
    }

    const profileFile = path.join(
      peacockPath,
      "userdata",
      "users",
      `${id}.json`,
    );
    const profile = await readJsonFile<Record<string, unknown>>(profileFile);

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const extensions = (profile.Extensions as Record<string, unknown>) || {};
    const progression =
      (extensions.progression as Record<string, unknown>) || {};

    const playerXp =
      (progression.PlayerProfileXP as Record<string, unknown>) || {};
    const level =
      (playerXp.ProfileLevel as number) ||
      (progression.ProfileLevel as number) ||
      1;
    const xp = (playerXp.Total as number) || (progression.XP as number) || 0;

    const mercesData = (progression.Merces as Record<string, unknown>) || {};
    const merces = (mercesData.Total as number) || 0;

    let prestige = 0;
    const cpd =
      (extensions.CPD as Record<string, Record<string, unknown>>) || {};
    if (cpd[GAME_CONSTANTS.FREELANCER_ID]) {
      prestige = (cpd[GAME_CONSTANTS.FREELANCER_ID].EvergreenLevel as number) || 0;
    }

    return NextResponse.json({
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
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { level, xp, merces, prestige } = body;

    const peacockPath = await findPeacockPath();
    if (!peacockPath) {
      return NextResponse.json({ error: "Peacock not found" }, { status: 404 });
    }

    const profileFile = path.join(
      peacockPath,
      PEACOCK_PATHS.USERDATA_DIR,
      PEACOCK_PATHS.USERS_DIR,
      `${id}.json`,
    );

    // Check if profile exists
    try {
      await fs.access(profileFile);
    } catch {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const profile = await readJsonFile<Record<string, unknown>>(profileFile);
    if (!profile) {
      return NextResponse.json(
        { error: "Failed to read profile" },
        { status: 500 },
      );
    }

    // Create backup before modifying
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 19);
    const backupPath = profileFile.replace(
      BACKUP_PATTERN.EXTENSION,
      `${BACKUP_PATTERN.PREFIX}${timestamp}${BACKUP_PATTERN.EXTENSION}`,
    );
    await fs.copyFile(profileFile, backupPath);

    // Update profile data
    if (!profile.Extensions) profile.Extensions = {};
    const extensions = profile.Extensions as Record<string, unknown>;
    if (!extensions.progression) extensions.progression = {};
    const prog = extensions.progression as Record<string, unknown>;

    // Update player level and XP
    if (level !== undefined) {
      prog.ProfileLevel = Math.max(1, Math.min(GAME_CONSTANTS.MAX_LEVEL, level));
      if (!prog.PlayerProfileXP) prog.PlayerProfileXP = {};
      const playerXp = prog.PlayerProfileXP as Record<string, unknown>;
      playerXp.ProfileLevel = prog.ProfileLevel;
    }

    if (xp !== undefined) {
      prog.XP = Math.max(0, xp);
      if (!prog.PlayerProfileXP) prog.PlayerProfileXP = {};
      const playerXp = prog.PlayerProfileXP as Record<string, unknown>;
      playerXp.Total = prog.XP;
    }

    // Update Merces
    if (merces !== undefined) {
      if (!prog.Merces) prog.Merces = {};
      const mercesData = prog.Merces as Record<string, unknown>;
      mercesData.Total = Math.max(0, merces);
    }

    // Update Freelancer prestige
    if (prestige !== undefined) {
      if (!extensions.CPD) extensions.CPD = {};
      const cpd = extensions.CPD as Record<string, Record<string, unknown>>;
      if (!cpd[GAME_CONSTANTS.FREELANCER_ID]) {
        cpd[GAME_CONSTANTS.FREELANCER_ID] = {};
      }
      cpd[GAME_CONSTANTS.FREELANCER_ID].EvergreenLevel = Math.max(0, Math.min(GAME_CONSTANTS.MAX_PRESTIGE, prestige));
    }

    await writeJsonFile(profileFile, profile);

    // Log the activity with details
    const changes = [];
    if (level !== undefined) changes.push(`level ${level}`);
    if (xp !== undefined) changes.push(`XP ${xp.toLocaleString()}`);
    if (merces !== undefined) changes.push(`merces ${merces.toLocaleString()}`);
    if (prestige !== undefined) changes.push(`prestige ${prestige}`);
    
    if (changes.length > 0) {
      await logActivity(peacockPath, `Updated profile: ${changes.join(', ')}`, "profile");
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      backup: path.basename(backupPath),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
