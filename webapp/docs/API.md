# Peacock Save Editor - API Documentation

**Base URL:** `http://localhost:3000/api`

---

## Table of Contents

- [Status & Health](#status--health)
- [Profile Management](#profile-management)
- [Content Unlocking](#content-unlocking)
- [Mastery System](#mastery-system)
- [Settings Management](#settings-management)
- [Backup & Restore](#backup--restore)
- [Activity Tracking](#activity-tracking)
- [Data Retrieval](#data-retrieval)

---

## Status & Health

### Get Server Status
**Endpoint:** `GET /api/status`

Check if Peacock is connected and the server is operational.

**Response:**
```json
{
  "connected": true,
  "peacock_path": "C:\\Path\\To\\Peacock",
  "message": "Peacock server is connected"
}
```

**Error Response:**
```json
{
  "connected": false,
  "peacock_path": null,
  "message": "Peacock installation not found. Please set PEACOCK_PATH environment variable."
}
```

---

## Profile Management

### Get All Profiles
**Endpoint:** `GET /api/profiles`

Retrieve all available Peacock profiles.

**Response:**
```json
[
  {
    "id": "12345678-1234-1234-1234-123456789abc",
    "level": 500,
    "xp": 3000000,
    "merces": 5000000,
    "prestige": 50,
    "challenges_completed": 847,
    "locations_count": 28,
    "escalations_completed": 95,
    "stories_completed": 142
  }
]
```

---

### Get Profile by ID
**Endpoint:** `GET /api/profile/{id}`

Get detailed information for a specific profile.

**Parameters:**
- `id` (path) - Profile UUID

**Response:**
```json
{
  "id": "12345678-1234-1234-1234-123456789abc",
  "level": 500,
  "xp": 3000000,
  "merces": 5000000,
  "prestige": 50,
  "challenges_completed": 847,
  "locations_count": 28,
  "escalations_completed": 95,
  "stories_completed": 142
}
```

---

### Update Profile
**Endpoint:** `POST /api/profile/{id}/update`

Update profile statistics (level, XP, merces, prestige).

**Parameters:**
- `id` (path) - Profile UUID

**Request Body:**
```json
{
  "level": 7500,
  "xp": 45000000,
  "merces": 99999999,
  "prestige": 100
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "backup": "12345678-1234-1234-1234-123456789abc.backup_2026-01-09T13-30-00.json"
}
```

**Validation:**
- `level`: 1 - 7500
- `xp`: 0 - unlimited
- `merces`: 0 - unlimited
- `prestige`: 0 - 100

**Notes:**
- Automatically creates a backup before updating
- Logs activity to activity tracker

---

## Content Unlocking

### Unlock All Content
**Endpoint:** `POST /api/unlock/all`

Unlock everything: challenges, escalations, stories, mastery, and max out profile.

**Request Body:**
```json
{
  "profile_id": "12345678-1234-1234-1234-123456789abc"
}
```

**Response:**
```json
{
  "success": true,
  "message": "All content unlocked successfully",
  "backup": "profile.backup_2026-01-09T13-30-00.json"
}
```

**What it unlocks:**
- All challenges (global + location-specific)
- All escalations (all levels completed)
- All mission stories
- All location mastery (max levels)
- Profile level: 7500
- XP: 45,000,000
- Merces: 99,999,999
- Freelancer Prestige: 100

---

### Unlock Challenges
**Endpoint:** `POST /api/unlock/challenges`

Unlock specific challenges or all challenges.

**Request Body:**
```json
{
  "profile_id": "12345678-1234-1234-1234-123456789abc",
  "ids": ["challenge-id-1", "challenge-id-2"]
}
```

**Request Body (All Challenges):**
```json
{
  "profile_id": "12345678-1234-1234-1234-123456789abc"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Unlocked 2 challenges"
}
```

**Activity Log:**
- Single: `"Unlocked challenge: Piano Man"`
- Multiple: `"Unlocked 5 challenges"`
- All: `"Unlocked all challenges"`

---

### Unlock Escalations
**Endpoint:** `POST /api/unlock/escalations`

Unlock specific escalations or all escalations.

**Request Body:**
```json
{
  "profile_id": "12345678-1234-1234-1234-123456789abc",
  "ids": ["escalation-id-1", "escalation-id-2"]
}
```

**Request Body (All Escalations):**
```json
{
  "profile_id": "12345678-1234-1234-1234-123456789abc"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Unlocked 2 escalations"
}
```

**Notes:**
- Completes all levels for each escalation
- Updates `PeacockEscalations` and `PeacockCompletedEscalations`

---

### Unlock Mission Stories
**Endpoint:** `POST /api/unlock/stories`

Unlock specific mission stories or all stories.

**Request Body:**
```json
{
  "profile_id": "12345678-1234-1234-1234-123456789abc",
  "ids": ["story-id-1", "story-id-2"]
}
```

**Request Body (All Stories):**
```json
{
  "profile_id": "12345678-1234-1234-1234-123456789abc"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Unlocked 2 stories"
}
```

---

## Mastery System

### Set Location Mastery
**Endpoint:** `POST /api/unlock/mastery`

Set mastery level for a specific location.

**Request Body:**
```json
{
  "profile_id": "12345678-1234-1234-1234-123456789abc",
  "location_id": "LOCATION_PARENT_PARIS",
  "level": 20
}
```

**Response:**
```json
{
  "success": true,
  "message": "Set mastery for LOCATION_PARENT_PARIS to level 20"
}
```

**Activity Log:**
- `"Set Paris - The Showstopper mastery to level 20"`

---

### Max All Mastery
**Endpoint:** `POST /api/unlock/mastery/all`

Set all locations to their maximum mastery level.

**Request Body:**
```json
{
  "profile_id": "12345678-1234-1234-1234-123456789abc"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Maxed all location mastery levels"
}
```

**Notes:**
- Automatically detects max level for each location from mastery files
- Calculates appropriate XP for each level

---

## Settings Management

### Get Peacock Settings
**Endpoint:** `GET /api/settings`

Retrieve current Peacock `options.ini` settings.

**Response:**
```json
{
  "gameplayUnlockAllShortcuts": true,
  "gameplayUnlockAllFreelancerMasteries": true,
  "mapDiscoveryState": "REVEALED",
  "enableMasteryProgression": false,
  "elusivesAreShown": true,
  "getDefaultSuits": true
}
```

---

### Update Peacock Settings
**Endpoint:** `POST /api/settings`

Update Peacock `options.ini` settings.

**Request Body:**
```json
{
  "gameplayUnlockAllShortcuts": true,
  "gameplayUnlockAllFreelancerMasteries": true,
  "mapDiscoveryState": "REVEALED",
  "enableMasteryProgression": false,
  "elusivesAreShown": true,
  "getDefaultSuits": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Settings saved successfully"
}
```

**Settings Options:**

| Setting | Type | Options | Description |
|---------|------|---------|-------------|
| `gameplayUnlockAllShortcuts` | boolean | `true`, `false` | Unlock all starting locations |
| `gameplayUnlockAllFreelancerMasteries` | boolean | `true`, `false` | Unlock all freelancer items |
| `mapDiscoveryState` | string | `REVEALED`, `CLOUDED` | Map discovery state |
| `enableMasteryProgression` | boolean | `true`, `false` | Enable mastery progression |
| `elusivesAreShown` | boolean | `true`, `false` | Show elusive targets |
| `getDefaultSuits` | boolean | `true`, `false` | Get default suits |

---

## Backup & Restore

### Create Backup
**Endpoint:** `POST /api/backup/create`

Create a timestamped backup of the current profile.

**Request Body:**
```json
{
  "profile_id": "12345678-1234-1234-1234-123456789abc"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Backup created successfully",
  "backup": "profile.backup_2026-01-09T13-30-00.json"
}
```

**Backup Naming:**
- Format: `{profile_id}.backup_{timestamp}.json`
- Timestamp: `YYYY-MM-DDTHH-mm-ss`

---

### Restore Latest Backup
**Endpoint:** `POST /api/backup/restore`

Restore the most recent backup for a profile.

**Request Body:**
```json
{
  "profile_id": "12345678-1234-1234-1234-123456789abc"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Backup restored successfully",
  "restored_from": "profile.backup_2026-01-09T13-30-00.json"
}
```

**Notes:**
- Automatically finds the most recent backup (sorted by timestamp)
- Returns error if no backups exist

---

## Activity Tracking

### Get Recent Activities
**Endpoint:** `GET /api/activity`

Retrieve the recent activity log (max 50 entries).

**Response:**
```json
[
  {
    "id": "1736431200000",
    "description": "Unlocked challenge: Piano Man",
    "timestamp": "2026-01-09T13:30:00.000Z",
    "type": "unlock"
  },
  {
    "id": "1736431100000",
    "description": "Set Paris - The Showstopper mastery to level 20",
    "timestamp": "2026-01-09T13:28:20.000Z",
    "type": "mastery"
  },
  {
    "id": "1736431000000",
    "description": "Updated profile: level 500, XP 3,000,000",
    "timestamp": "2026-01-09T13:26:40.000Z",
    "type": "profile"
  }
]
```

**Activity Types:**
- `unlock` - Content unlocking (challenges, escalations, stories)
- `mastery` - Mastery level changes
- `profile` - Profile stat modifications
- `settings` - Settings changes

---

### Clear All Activities
**Endpoint:** `POST /api/activity`

Clear all activity logs.

**Request Body:**
```json
{
  "action": "clear"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Activities cleared"
}
```

---

## Data Retrieval

### Get All Challenges
**Endpoint:** `GET /api/challenges`

Retrieve all available challenges with completion status.

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Results per page (default: 100, max: 100)
- `search` (optional) - Search by name/description
- `location` (optional) - Filter by location

**Response:**
```json
{
  "challenges": [
    {
      "id": "challenge-id-123",
      "name": "Piano Man",
      "description": "Assassinate Viktor Novikov with the chandelier",
      "location": "Paris",
      "completed": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 1247,
    "pages": 13
  }
}
```

---

### Get All Escalations
**Endpoint:** `GET /api/escalations`

Retrieve all available escalations.

**Response:**
```json
[
  {
    "id": "escalation-id-123",
    "name": "The Kotti Paradigm",
    "codename": "GECKO",
    "location": "Paris",
    "levels": 5,
    "completed": true
  }
]
```

---

### Get All Mission Stories
**Endpoint:** `GET /api/stories`

Retrieve all available mission stories.

**Response:**
```json
[
  {
    "id": "story-id-123",
    "name": "The Detective",
    "briefing": "Meet the private detective",
    "location": "Paris",
    "completed": true
  }
]
```

---

### Get All Locations
**Endpoint:** `GET /api/locations`

Retrieve all locations with mastery information.

**Response:**
```json
[
  {
    "id": "LOCATION_PARENT_PARIS",
    "name": "Paris - The Showstopper",
    "max_level": 20,
    "current_level": 15,
    "xp": 90000,
    "game": "Hitman 1"
  }
]
```

---

## Constants Reference

### Game Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `MAX_LEVEL` | 7500 | Maximum player level |
| `MAX_XP` | 45000000 | XP for level 7500 |
| `MAX_MERCES` | 99999999 | Maximum merces currency |
| `MAX_PRESTIGE` | 100 | Maximum freelancer prestige |
| `FREELANCER_ID` | `f8ec92c2-4fa2-471e-ae08-545480c746ee` | Freelancer mode UUID |

### Peacock Paths

| Path | Description |
|------|-------------|
| `userdata/` | User profile data directory |
| `users/` | Profile JSON files |
| `contractdata/` | Challenge data files |
| `static/` | Static game data |
| `options.ini` | Peacock settings file |
| `activity_log.json` | Activity tracking log |

---

## Error Handling

All endpoints return standard HTTP status codes:

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (invalid parameters) |
| 404 | Not Found (profile/resource not found) |
| 500 | Internal Server Error |

**Error Response Format:**
```json
{
  "error": "Error message description"
}
```

---

## Rate Limiting

Currently, there are **no rate limits** on API endpoints. All requests are processed immediately.

---

## Notes

- All profile modifications automatically create backups
- Activity logging tracks all changes (max 50 entries kept)
- Profile IDs are UUIDs (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
- Peacock must be installed and `PEACOCK_PATH` environment variable must be set
- Auto-refresh intervals:
  - Status: 10 seconds
  - Activities: 5 seconds

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PEACOCK_PATH` | Yes | Absolute path to Peacock installation directory |

**Example:**
```bash
PEACOCK_PATH=C:\Peacock
```

---

**Last Updated:** January 9, 2026  
**API Version:** 1.0.0
