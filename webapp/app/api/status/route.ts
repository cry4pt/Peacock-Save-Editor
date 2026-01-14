import { NextResponse } from "next/server"
import { findPeacockPath, getProfiles } from "@/lib/peacock"

export async function GET() {
  try {
    const peacockPath = await findPeacockPath()
    
    if (!peacockPath) {
      return NextResponse.json({
        connected: false,
        peacock_path: null,
        profiles_count: 0,
        message: "Peacock installation not found. Please set PEACOCK_PATH environment variable."
      })
    }
    
    const profiles = await getProfiles(peacockPath)
    
    return NextResponse.json({
      connected: true,
      peacock_path: peacockPath,
      profiles_count: profiles.length,
      message: `Connected to Peacock at ${peacockPath}`
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10',
      },
    })
  } catch (error) {
    return NextResponse.json({
      connected: false,
      peacock_path: null,
      profiles_count: 0,
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
