import { NextRequest, NextResponse } from "next/server"
import path from "path"
import { findPeacockPath, getProfiles, readJsonFile } from "@/lib/peacock"
import { formatStoryId } from "@/lib/localization"

let storiesCache: { stories: any[], timestamp: number } | null = null
const CACHE_TTL = 60000

async function getAllStories(peacockPath: string, completedSet: Set<string>) {
  if (storiesCache && Date.now() - storiesCache.timestamp < CACHE_TTL) {
    return storiesCache.stories.map(s => ({
      ...s,
      completed: completedSet.has(s.id)
    }))
  }

  const stories: any[] = []
  const storiesPath = path.join(peacockPath, "static", "MissionStories.json")
  const storiesData = await readJsonFile<any>(storiesPath)

  if (storiesData) {
    for (const [storyId, storyData] of Object.entries(storiesData)) {
      const data = storyData as any
      stories.push({
        id: storyId,
        name: formatStoryId(data.Title || storyId),
        location: data.Location || "Unknown",
        briefing: data.Briefing || ""
      })
    }
  }

  storiesCache = { stories, timestamp: Date.now() }

  return stories.map(s => ({
    ...s,
    completed: completedSet.has(s.id)
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

    if (profileFiles.length > 0) {
      const profile = await readJsonFile<any>(profileFiles[0])
      if (profile?.Extensions?.opportunityprogression) {
        Object.keys(profile.Extensions.opportunityprogression).forEach(id => completedSet.add(id))
      }
    }

    let stories = await getAllStories(peacockPath, completedSet)

    if (search) {
      const searchLower = search.toLowerCase()
      stories = stories.filter((s: any) =>
        s.name.toLowerCase().includes(searchLower) ||
        s.briefing.toLowerCase().includes(searchLower)
      )
    }

    // If pagination params provided, return paginated response
    if (page > 0 || limit > 0) {
      const actualLimit = limit || 50
      const total = stories.length
      const start = (page - 1) * actualLimit
      const paginatedStories = stories.slice(start, start + actualLimit)

      return NextResponse.json({
        stories: paginatedStories,
        pagination: {
          page,
          limit: actualLimit,
          total,
          pages: Math.ceil(total / actualLimit)
        }
      })
    }

    // Otherwise return simple array (for dashboard compatibility)
    return NextResponse.json(stories)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
