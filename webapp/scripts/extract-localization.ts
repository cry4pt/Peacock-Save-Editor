/**
 * Peacock Localization Extractor
 * 
 * This script extracts challenge and story names from Peacock's challenge files
 * and creates a localization mapping file for the webapp to use.
 */

import fs from 'fs/promises'
import path from 'path'

interface LocalizationMap {
  [key: string]: string
}

const PEACOCK_PATH = 'C:\\Users\\ghostsec\\Desktop\\Peacock-master\\Peacock-master'
const OUTPUT_FILE = path.join(process.cwd(), 'public', 'localization.json')

async function extractFromGlobalChallenges(): Promise<LocalizationMap> {
  const localization: LocalizationMap = {}
  const globalPath = path.join(PEACOCK_PATH, 'static', 'GlobalChallenges.json')
  
  try {
    const data = await fs.readFile(globalPath, 'utf-8')
    const challenges = JSON.parse(data)
    
    for (const challenge of challenges) {
      if (challenge.Name && challenge.Name.startsWith('UI_')) {
        const readableName = challenge.DisplayName || challenge.Title || extractReadableName(challenge.Name)
        localization[challenge.Name] = readableName
      }
      
      if (challenge.Description && challenge.Description.startsWith('UI_')) {
        const readableDesc = challenge.DescriptionText || extractReadableName(challenge.Description)
        localization[challenge.Description] = readableDesc
      }
    }
  } catch (error) {
    console.error('Error reading GlobalChallenges.json:', error)
  }
  
  return localization
}

async function extractFromLocationChallenges(): Promise<LocalizationMap> {
  const localization: LocalizationMap = {}
  const contractdataPath = path.join(PEACOCK_PATH, 'contractdata')
  
  async function processDirectory(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      
      if (entry.isDirectory()) {
        await processDirectory(fullPath)
      } else if (entry.name.includes('CHALLENGE') && entry.name.endsWith('.json')) {
        try {
          const data = await fs.readFile(fullPath, 'utf-8')
          const challengeData = JSON.parse(data)
          
          if (challengeData.groups) {
            for (const group of challengeData.groups) {
              if (group.Challenges) {
                for (const challenge of group.Challenges) {
                  if (challenge.Name && challenge.Name.startsWith('UI_')) {
                    const readableName = challenge.DisplayName || challenge.Title || extractReadableName(challenge.Name)
                    localization[challenge.Name] = readableName
                  }
                  
                  if (challenge.Description && challenge.Description.startsWith('UI_')) {
                    const readableDesc = challenge.DescriptionText || extractReadableName(challenge.Description)
                    localization[challenge.Description] = readableDesc
                  }
                }
              }
            }
          }
        } catch (error) {
          // Skip files that can't be parsed
        }
      }
    }
  }
  
  await processDirectory(contractdataPath)
  return localization
}

async function extractFromMissionStories(): Promise<LocalizationMap> {
  const localization: LocalizationMap = {}
  const storiesPath = path.join(PEACOCK_PATH, 'static', 'MissionStories.json')
  
  try {
    const data = await fs.readFile(storiesPath, 'utf-8')
    const stories = JSON.parse(data)
    
    for (const [storyId, storyData] of Object.entries(stories)) {
      const story = storyData as any
      
      if (story.Title) {
        localization[story.Title] = story.DisplayName || story.Title
      }
      
      if (story.Briefing) {
        localization[story.Briefing] = story.Briefing
      }
    }
  } catch (error) {
    console.error('Error reading MissionStories.json:', error)
  }
  
  return localization
}

function extractReadableName(key: string): string {
  return key
    .replace(/^UI_/, '')
    .replace(/_CHALLENGES_/, ' ')
    .replace(/_GLOBAL_/, ' ')
    .replace(/_NAME$/, '')
    .replace(/_DESCRIPTION$/, '')
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim()
}

async function main() {
  console.log('🔍 Extracting localization from Peacock files...\n')
  
  const localization: LocalizationMap = {}
  
  console.log('📝 Processing Global Challenges...')
  const globalLoc = await extractFromGlobalChallenges()
  Object.assign(localization, globalLoc)
  console.log(`   Found ${Object.keys(globalLoc).length} entries`)
  
  console.log('📝 Processing Location Challenges...')
  const locationLoc = await extractFromLocationChallenges()
  Object.assign(localization, locationLoc)
  console.log(`   Found ${Object.keys(locationLoc).length} entries`)
  
  console.log('📝 Processing Mission Stories...')
  const storiesLoc = await extractFromMissionStories()
  Object.assign(localization, storiesLoc)
  console.log(`   Found ${Object.keys(storiesLoc).length} entries`)
  
  console.log(`\n✅ Total localization entries: ${Object.keys(localization).length}`)
  
  const publicDir = path.join(process.cwd(), 'public')
  await fs.mkdir(publicDir, { recursive: true })
  
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(localization, null, 2), 'utf-8')
  console.log(`\n💾 Saved to: ${OUTPUT_FILE}`)
  
  console.log('\n🎉 Localization extraction complete!')
}

main().catch(console.error)
