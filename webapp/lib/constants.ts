// Game-specific constants for Hitman World of Assassination
export const GAME_CONSTANTS = {
  // Freelancer mode UUID (official Hitman game constant)
  FREELANCER_ID: "f8ec92c2-4fa2-471e-ae08-545480c746ee",
  
  // Maximum values
  MAX_LEVEL: 7500,
  MAX_XP: 45000000,
  MAX_MERCES: 99999999,
  MAX_PRESTIGE: 100,
} as const;

// Peacock file structure paths
export const PEACOCK_PATHS = {
  // User data
  ACTIVITY_LOG: "activity_log.json",
  OPTIONS_FILE: "options.ini",
  USERDATA_DIR: "userdata",
  USERS_DIR: "users",
  
  // Game data
  CONTRACTDATA_DIR: "contractdata",
  STATIC_DIR: "static",
  
  // Static data files
  GLOBAL_CHALLENGES: "GlobalChallenges.json",
  MISSION_STORIES: "MissionStories.json",
  ESCALATION_CODENAMES: "EscalationCodenames.json",
} as const;

// UI/UX constants
export const UI_CONSTANTS = {
  // Activity tracking
  MAX_ACTIVITIES: 50,
  
  // Refresh intervals (milliseconds)
  STATUS_REFRESH_INTERVAL: 10000,
  ACTIVITY_REFRESH_INTERVAL: 5000,
} as const;

// Backup file naming
export const BACKUP_PATTERN = {
  PREFIX: ".backup_",
  EXTENSION: ".json",
} as const;
