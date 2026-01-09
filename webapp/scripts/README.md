# Peacock Localization Extractor

This script extracts human-readable challenge and story names from Peacock's data files and creates a localization mapping file.

## What It Does

Extracts **5,500+ localization entries** from:
- ✅ Global Challenges
- ✅ Location-Specific Challenges  
- ✅ Mission Stories

## Usage

### Extract Localization (Run Once)

```bash
npm run extract-localization
```

This creates `/public/localization.json` with all challenge/story names.

### When to Re-Run

Run the extraction again when:
- Peacock is updated with new challenges
- New DLC or content is added
- Challenge names change

## How It Works

1. **Scans Peacock Files:**
   - `C:\Users\ghostsec\Desktop\Peacock-master\Peacock-master\static\GlobalChallenges.json`
   - `C:\Users\ghostsec\Desktop\Peacock-master\Peacock-master\contractdata\**\*_CHALLENGES.json`
   - `C:\Users\ghostsec\Desktop\Peacock-master\Peacock-master\static\MissionStories.json`

2. **Extracts Mappings:**
   ```json
   {
     "UI_CHALLENGES_GLOBAL_CROWDCHOICE_DROWN_NAME": "Crowd Choice Drown",
     "op3007_kruger_001": "Kruger 001"
   }
   ```

3. **Saves to `/public/localization.json`**

4. **Web App Automatically Loads It:**
   - The webapp's `lib/localization.ts` loads this file
   - Challenge/story names are automatically translated
   - Fallback formatting if entry not found

## Output

**Generated File:** `/public/localization.json`  
**Size:** ~5,500 entries  
**Format:** JSON key-value pairs

## Example Transformations

| Before (Raw Key) | After (Human-Readable) |
|------------------|------------------------|
| `UI_CHALLENGES_GLOBAL_CROWDCHOICE_DROWN_NAME` | `Crowd Choice Drown` |
| `UI_CHALLENGES_PARIS_VAMPIRE_NAME` | `Paris Vampire` |
| `op3007_kruger_001` | `Kruger 001` |

## Customization

Edit `/scripts/extract-localization.ts` to:
- Change the Peacock path
- Add custom name transformations
- Filter specific challenge types

## Notes

- The script uses Peacock's own data files, so names are accurate
- No need to extract from game files
- Safe to run multiple times (overwrites previous file)
- Webapp will use fallback formatting if localization.json is missing
