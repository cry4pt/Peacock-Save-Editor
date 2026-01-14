# Peacock Save Editor

A comprehensive web-based save editor for HITMAN World of Assassination using the Peacock server.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)
![Bun](https://img.shields.io/badge/Bun-1.x-f9f1e1?style=flat-square&logo=bun)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## Features

### Profile Management
- **Multi-Profile Support** - Manage multiple HITMAN profiles
- **Profile Overview** - View XP, level, mastery, and completion percentage
- **Real-time Stats** - Live updates of profile statistics

### Unlock System
- **Unlock All Content** - Instantly unlock all items, weapons, and gear
- **Complete Profile** - Max out level, mastery, and all unlockables
- **Granular Control** - Unlock specific categories (Challenges, Stories, Escalations, Mastery)

### Location Management
- **20+ Locations** - Support for all HITMAN WoA locations
- **Mastery Tracking** - View and modify mastery levels per location
- **Quick Actions** - Max mastery with a single click

### Challenge System
- **5500+ Challenges** - Full challenge database with localization
- **Search & Filter** - Find challenges by name or location
- **Bulk Operations** - Complete multiple challenges at once

### Mission Stories & Escalations
- **240+ Stories** - All mission stories from the trilogy
- **173 Escalations** - Complete escalation database
- **Location Filtering** - Browse by map

### Backup & Restore
- **Automatic Backups** - Saves created before major changes
- **Manual Backups** - Create backups anytime
- **Restore Points** - Roll back to any previous state

### Modern UI/UX
- **Dark Theme** - Eye-friendly dark interface
- **Responsive Design** - Works on desktop and tablets
- **Activity Logging** - Real-time feed of all actions

---

## Prerequisites

### Required Software
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Bun** (v1.0 or higher) - [Download](https://bun.sh/)
  ```bash
  # Install Bun (Windows PowerShell)
  powershell -c "irm bun.sh/install.ps1 | iex"

  # Or via npm
  npm install -g bun
  ```

### Required Files
- **Peacock Server** installed and configured
- Default profile location: `%LOCALAPPDATA%/IOI/Peacock/`

### Supported Games
- HITMAN 3 / HITMAN World of Assassination
- Works with Peacock v7.0.0+

---

## Installation

### Method 1: Automated (Recommended)

```bash
git clone https://github.com/cry4pt/Peacock-Save-Editor.git
cd Peacock-Save-Editor/webapp
install.bat
```

The installer will:
- Check for Node.js and Bun
- Install all dependencies
- Extract localization data from Peacock
- Build and start the webapp
- Open your browser at `http://localhost:3000`

### Method 2: Manual

```bash
git clone https://github.com/cry4pt/Peacock-Save-Editor.git
cd Peacock-Save-Editor/webapp

# Install dependencies
bun install

# Extract challenge/story names from Peacock
bun run extract-localization

# Build for production
bun run build

# Start the server
bun run start
```

For development with hot reload:
```bash
bun run dev
```

---

## Usage

### Quick Start
1. Open `http://localhost:3000`
2. Select a profile from the dashboard
3. Use quick action buttons to unlock content

### Quick Actions

| Action | Description |
|--------|-------------|
| **Unlock All Content** | Unlocks all items, weapons, suits, gear |
| **Complete Profile** | Max level (7000), max mastery, all unlocks |
| **Max Location** | Set specific location mastery to max |
| **Complete Challenges** | Mark all challenges complete |

### Navigation
- **Dashboard** - Overview and quick actions
- **Profile** - Edit XP, level, and stats
- **Locations** - Manage location mastery
- **Challenges** - Complete challenges
- **Stories** - Complete mission stories
- **Escalations** - Complete escalations
- **Settings** - Configure paths and backups

---

## API Reference

### Endpoints

```http
GET  /api/profile/:id              # Get profile data
POST /api/profile/:id/update       # Update profile
POST /api/unlock/all               # Unlock all content
POST /api/unlock/content           # Complete profile
GET  /api/challenges               # Get challenges
GET  /api/locations                # Get locations
GET  /api/stories                  # Get mission stories
GET  /api/escalations              # Get escalations
POST /api/backup/create            # Create backup
POST /api/backup/restore           # Restore backup
```

---

## Project Structure

```
webapp/
├── app/                    # Next.js App Router
│   ├── api/                # API routes
│   ├── challenges/         # Challenges page
│   ├── escalations/        # Escalations page
│   ├── locations/          # Locations page
│   ├── profile/            # Profile editor
│   ├── settings/           # Settings page
│   ├── stories/            # Stories page
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Dashboard
├── components/             # React components
│   ├── ui/                 # shadcn/ui components
│   └── *.tsx               # Feature components
├── lib/                    # Utilities
├── public/                 # Static files
│   └── localization.json   # Challenge/story names
├── scripts/                # Helper scripts
└── install.bat             # Automated installer
```

---

## Development

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Runtime**: Bun
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React

### Commands

```bash
bun run dev                 # Development server
bun run build               # Production build
bun run start               # Start production
bun run check               # TypeScript check
bun run extract-localization # Update challenge names
```

### Windows Scripts

```bash
scripts\dev.bat             # Start dev server
scripts\build.bat           # Build production
scripts\start.bat           # Start production
scripts\check.bat           # Type check
scripts\clean.bat           # Clean build files
```

---

## Troubleshooting

### "Could not find Peacock installation"
1. Go to Settings page
2. Enter Peacock path manually
3. Save and restart

### "Could not find a production build"
```bash
bun run build
bun run start
```

### Challenges show as IDs
```bash
bun run extract-localization
```

### Port 3000 in use
```bash
# Find process
netstat -ano | findstr :3000

# Kill process
taskkill /PID <PID> /F
```

### Dependencies won't install
```bash
rm -rf node_modules bun.lockb
bun install
```

---

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open Pull Request

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Acknowledgments

- **Peacock Team** - For the HITMAN server
- **IOI Interactive** - For HITMAN World of Assassination
- **shadcn/ui** - Component library
- **Vercel** - Next.js framework

---

## Support

- [GitHub Issues](https://github.com/cry4pt/Peacock-Save-Editor/issues)
- [Peacock Discord](https://thepeacockproject.org/discord)

---

<div align="center">

**Made for the HITMAN community**

[Report Bug](https://github.com/cry4pt/Peacock-Save-Editor/issues) | [Request Feature](https://github.com/cry4pt/Peacock-Save-Editor/issues)

</div>
