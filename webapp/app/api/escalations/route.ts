import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import { findPeacockPath, getProfiles, readJsonFile } from "@/lib/peacock"

let escalationsCache: { escalations: any[], timestamp: number } | null = null
const CACHE_TTL = 60000

async function getAllEscalations(peacockPath: string, completedSet: Set<string>, progressMap: Record<string, number>) {
  if (escalationsCache && Date.now() - escalationsCache.timestamp < CACHE_TTL) {
    return escalationsCache.escalations.map(e => ({
      ...e,
      completed: completedSet.has(e.id),
      current_level: progressMap[e.id] || 0
    }))
  }

  const escalationsMap = new Map<string, any>()
  const escalationsPath = path.join(peacockPath, "static", "EscalationCodenames.json")
  const escalationsData = await readJsonFile<any>(escalationsPath)

  if (escalationsData) {
    for (const [location, escList] of Object.entries(escalationsData)) {
      if (Array.isArray(escList)) {
        for (const esc of escList) {
          if (esc.id && !escalationsMap.has(esc.id)) {
            escalationsMap.set(esc.id, {
              id: esc.id,
              name: esc.name || esc.id,
              codename: esc.codename || "",
              location,
              max_level: esc.levels || 3
            })
          }
        }
      }
    }
  }

  const escalations = Array.from(escalationsMap.values())
  escalationsCache = { escalations, timestamp: Date.now() }

  return escalations.map(e => ({
    ...e,
    completed: completedSet.has(e.id),
    current_level: progressMap[e.id] || 0
  }))
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "0")
    const limit = parseInt(searchParams.get("limit") || "0")
    const search = searchParams.get("search") || ""

    const peacockPath = await findPeacockPath()
    if (!peacockPath) {
      return NextResponse.json({ error: "Peacock not found" }, { status: 404 })
    }

    const profileFiles = await getProfiles(peacockPath)
    const completedSet = new Set<string>()
    const progressMap: Record<string, number> = {}

    if (profileFiles.length > 0) {
      const profile = await readJsonFile<any>(profileFiles[0])
      if (profile?.Extensions) {
        const completed = profile.Extensions.PeacockCompletedEscalations || []
        completed.forEach((id: string) => completedSet.add(id))

        const progress = profile.Extensions.PeacockEscalations || {}
        Object.assign(progressMap, progress)
      }
    }

    let escalations = await getAllEscalations(peacockPath, completedSet, progressMap)

    if (search) {
      const searchLower = search.toLowerCase()
      escalations = escalations.filter((e: any) =>
        e.name.toLowerCase().includes(searchLower) ||
        e.codename.toLowerCase().includes(searchLower)
      )
    }

    // If pagination params provided, return paginated response
    if (page > 0 || limit > 0) {
      const actualLimit = limit || 50
      const total = escalations.length
      const start = (page - 1) * actualLimit
      const paginatedEscalations = escalations.slice(start, start + actualLimit)

      return NextResponse.json({
        escalations: paginatedEscalations,
        pagination: {
          page,
          limit: actualLimit,
          total,
          pages: Math.ceil(total / actualLimit)
        }
      })
    }

    // Otherwise return simple array (for dashboard compatibility)
    return NextResponse.json(escalations)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
