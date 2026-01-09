========================================
  Peacock Webapp - Quick Reference
========================================

GETTING STARTED:
  1. Run 'install.bat' to install everything (already done)
  2. Run 'scripts\dev.bat' to start the webapp
  3. Open http://localhost:3000 in your browser

AVAILABLE COMMANDS:

  scripts\dev.bat                  - Start development server
                                     Hot reload, debugging enabled
                                     Use this for development

  scripts\build.bat                - Build for production
                                     Optimizes and compiles the app
                                     Run before using start.bat

  scripts\start.bat                - Start production server
                                     Faster than dev mode
                                     Must run build.bat first

  scripts\check.bat                - Check for TypeScript errors
                                     Validates code without running

  scripts\update-localization.bat  - Update challenge/story names
                                     Re-extracts from Peacock
                                     Run after Peacock updates

  scripts\clean.bat                - Clean all generated files
                                     Removes node_modules and builds
                                     Run install.bat after cleaning

USING PNPM DIRECTLY:
  pnpm run dev             - Same as dev.bat
  pnpm run build           - Same as build.bat
  pnpm run start           - Same as start.bat
  pnpm run check           - Same as check.bat
  pnpm run extract-localization - Same as update-localization.bat

TROUBLESHOOTING:
  - If webapp won't start: run clean.bat then install.bat
  - If port 3000 busy: close other apps or edit package.json
  - If pnpm errors: run 'npm install -g pnpm' to reinstall
  - If localization missing: run update-localization.bat

REQUIREMENTS:
  - Node.js 18.x or newer
  - pnpm (auto-installed by install.bat)
  - Windows 10/11

WEBAPP FEATURES:
  - Profile management and editing
  - Unlock all content
  - Location mastery management
  - Challenge completion
  - Mission story completion
  - Escalation management
  - Backup and restore profiles
  - Real-time activity logging
  - Auto-detects Peacock installation

For more help, check the documentation in the docs folder.
========================================
