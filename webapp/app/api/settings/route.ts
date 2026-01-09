import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import { findPeacockPath } from "@/lib/peacock"
import { PEACOCK_PATHS } from "@/lib/constants"

async function logActivity(peacockPath: string, description: string, type: string = "settings") {
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

interface SettingsData {
  gameplayUnlockAllShortcuts: boolean
  gameplayUnlockAllFreelancerMasteries: boolean
  mapDiscoveryState: string
  enableMasteryProgression: boolean
  elusivesAreShown: boolean
  getDefaultSuits: boolean
}

const defaultSettings: SettingsData = {
  gameplayUnlockAllShortcuts: true,
  gameplayUnlockAllFreelancerMasteries: true,
  mapDiscoveryState: "REVEALED",
  enableMasteryProgression: false,
  elusivesAreShown: true,
  getDefaultSuits: true,
}

export async function GET() {
  try {
    const peacockPath = await findPeacockPath()
    if (!peacockPath) {
      return NextResponse.json({ error: "Peacock not found" }, { status: 404 })
    }

    const optionsFile = path.join(peacockPath, PEACOCK_PATHS.OPTIONS_FILE)

    try {
      await fs.access(optionsFile)
    } catch {
      return NextResponse.json(defaultSettings)
    }

    const content = await fs.readFile(optionsFile, "utf-8")
    const settings: Record<string, any> = {}

    for (const line of content.split("\n")) {
      if (line.includes("=") && !line.trim().startsWith(";")) {
        const [key, value] = line.split("=", 2)
        const trimmedKey = key.trim()
        const trimmedValue = value.trim()

        if (trimmedValue.toLowerCase() === "true") {
          settings[trimmedKey] = true
        } else if (trimmedValue.toLowerCase() === "false") {
          settings[trimmedKey] = false
        } else {
          settings[trimmedKey] = trimmedValue
        }
      }
    }

    return NextResponse.json({
      gameplayUnlockAllShortcuts: settings.gameplayUnlockAllShortcuts ?? true,
      gameplayUnlockAllFreelancerMasteries: settings.gameplayUnlockAllFreelancerMasteries ?? true,
      mapDiscoveryState: settings.mapDiscoveryState ?? "REVEALED",
      enableMasteryProgression: settings.enableMasteryProgression ?? false,
      elusivesAreShown: settings.elusivesAreShown ?? true,
      getDefaultSuits: settings.getDefaultSuits ?? true,
    })
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

    const peacockPath = await findPeacockPath()
    if (!peacockPath) {
      return NextResponse.json({ error: "Peacock not found" }, { status: 404 })
    }

    const optionsFile = path.join(peacockPath, PEACOCK_PATHS.OPTIONS_FILE)
    let content = ""

    try {
      content = await fs.readFile(optionsFile, "utf-8")
    } catch {
      content = `; Peacock Options (Configured by Save Editor)\n[peacock]\n`
    }

    const settingsDict: Record<string, string> = {
      gameplayUnlockAllShortcuts: body.gameplayUnlockAllShortcuts ? "true" : "false",
      gameplayUnlockAllFreelancerMasteries: body.gameplayUnlockAllFreelancerMasteries ? "true" : "false",
      mapDiscoveryState: body.mapDiscoveryState,
      enableMasteryProgression: body.enableMasteryProgression ? "true" : "false",
      elusivesAreShown: body.elusivesAreShown ? "true" : "false",
      getDefaultSuits: body.getDefaultSuits ? "true" : "false",
    }

    for (const [key, value] of Object.entries(settingsDict)) {
      const pattern = new RegExp(`^(${key}=).*$`, "m")
      const replacement = `$1${value}`
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement)
      } else {
        content += `\n${key}=${value}`
      }
    }

    await fs.writeFile(optionsFile, content, "utf-8")

    await logActivity(peacockPath, "Updated Peacock settings", "settings")

    return NextResponse.json({ success: true, message: "Settings saved successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
