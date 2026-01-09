import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import { findPeacockPath } from "@/lib/peacock"
import { PEACOCK_PATHS, UI_CONSTANTS } from "@/lib/constants"

const ACTIVITY_FILE = PEACOCK_PATHS.ACTIVITY_LOG
const MAX_ACTIVITIES = UI_CONSTANTS.MAX_ACTIVITIES

export interface Activity {
  id: string
  description: string
  timestamp: string
  type: "unlock" | "mastery" | "profile" | "settings"
}

async function getActivityLogPath(peacockPath: string): Promise<string> {
  const logDir = path.join(peacockPath, PEACOCK_PATHS.USERDATA_DIR)
  return path.join(logDir, ACTIVITY_FILE)
}

async function readActivities(peacockPath: string): Promise<Activity[]> {
  const logPath = await getActivityLogPath(peacockPath)
  try {
    const data = await fs.readFile(logPath, "utf-8")
    return JSON.parse(data)
  } catch {
    return []
  }
}

async function writeActivities(peacockPath: string, activities: Activity[]) {
  const logPath = await getActivityLogPath(peacockPath)
  await fs.writeFile(logPath, JSON.stringify(activities, null, 2))
}

export async function GET() {
  try {
    const peacockPath = await findPeacockPath()
    if (!peacockPath) {
      return NextResponse.json({ error: "Peacock not found" }, { status: 404 })
    }

    const activities = await readActivities(peacockPath)
    return NextResponse.json(activities.slice(0, MAX_ACTIVITIES))
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { description, type = "unlock", action } = body

    const peacockPath = await findPeacockPath()
    if (!peacockPath) {
      return NextResponse.json({ error: "Peacock not found" }, { status: 404 })
    }

    // Handle clear action
    if (action === "clear") {
      await writeActivities(peacockPath, [])
      return NextResponse.json({ success: true, message: "Activities cleared" })
    }

    if (!description) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 })
    }

    const activities = await readActivities(peacockPath)
    
    const newActivity: Activity = {
      id: Date.now().toString(),
      description,
      timestamp: new Date().toISOString(),
      type
    }

    activities.unshift(newActivity)
    
    // Keep only the latest MAX_ACTIVITIES
    const trimmedActivities = activities.slice(0, MAX_ACTIVITIES)
    
    await writeActivities(peacockPath, trimmedActivities)

    return NextResponse.json({ success: true, activity: newActivity })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
