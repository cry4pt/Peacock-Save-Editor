# 🎯 Peacock Save Editor

A comprehensive web-based save editor for HITMAN World of Assassination using the Peacock server.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 📋 Table of Contents

- [Features](#-features)
- [Screenshots](#-screenshots)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🎮 Profile Management
- **Multi-Profile Support** - Manage multiple HITMAN profiles
- **Profile Overview** - View XP, level, mastery, and completion percentage
- **Real-time Stats** - Live updates of profile statistics
- **Profile Switching** - Easy switching between different profiles

### 🔓 Unlock System
- **Unlock All Content** - Instantly unlock all items, weapons, and gear
- **Complete Profile** - Max out level, mastery, and all unlockables
- **Granular Control** - Unlock specific categories:
  - Challenges
  - Mission Stories
  - Escalations
  - Location Mastery

### 📍 Location Management
- **20+ Locations** - Support for all HITMAN WoA locations
- **Mastery Tracking** - View and modify mastery levels per location
- **Quick Actions** - Max mastery with a single click
- **Location Stats** - Track progress across all maps

### 🎯 Challenge System
- **5500+ Challenges** - Full challenge database with localization
- **Search & Filter** - Find challenges by name or location
- **Bulk Operations** - Complete multiple challenges at once
- **Real Names** - No more cryptic IDs - human-readable names

### 📖 Mission Stories
- **240+ Stories** - All mission stories from the trilogy
- **Location Filtering** - Browse stories by map
- **Quick Search** - Find specific stories instantly
- **Completion Tracking** - See which stories you've completed

### 🎢 Escalations
- **173 Escalations** - Complete escalation database
- **Level Tracking** - Track progress through escalation levels
- **Location Groups** - Organized by map and DLC
- **Bulk Completion** - Complete escalations in batches

### 💾 Backup & Restore
- **Automatic Backups** - Saves created before major changes
- **Manual Backups** - Create backups anytime
- **Restore Points** - Roll back to any previous state
- **Backup Management** - View and manage all backups

### 📊 Activity Logging
- **Real-time Feed** - Live activity log of all actions
- **Detailed Descriptions** - Know exactly what was unlocked
- **Clear History** - Clean up activity log when needed
- **Icon-based UI** - Visual indicators for different actions

### 🎨 Modern UI/UX
- **Dark Theme** - Eye-friendly dark interface
- **Responsive Design** - Works on desktop and tablets
- **Smooth Animations** - Polished hover effects and transitions
- **Quick Actions** - One-click access to common tasks

---

## 🖼️ Screenshots

> *Screenshots coming soon*

---

## 📦 Prerequisites

Before installing, ensure you have:

### Required Software
- **Node.js** (v18 or higher)
  - Download: [https://nodejs.org/](https://nodejs.org/)
  - Check version: `node --version`
  
- **pnpm** (v9 or higher)
  - Install: `npm install -g pnpm`
  - Check version: `pnpm --version`

### Required Files
- **Peacock Server** installed and configured
  - The webapp needs access to Peacock's profile files
  - Default location: `%LOCALAPPDATA%/IOI/Peacock/`

### Supported Games
- HITMAN 3 (Year 2 or later)
- HITMAN World of Assassination
- Works with Peacock v7.0.0+

---

## 🚀 Installation

### Method 1: Automated Installation (Recommended)

1. **Download or clone this repository**
   ```bash
   git clone https://github.com/cry4pt/Peacock-Save-Editor.git
   cd Peacock-Save-Editor/webapp
   ```

2. **Run the installer**
   ```bash
   install.bat
   ```

   The installer will:
   - ✅ Check for Node.js and pnpm
   - ✅ Install all dependencies
   - ✅ Extract localization data from Peacock
   - ✅ Create helper scripts
   - ✅ Build and start the webapp
   - ✅ Open your browser automatically

3. **Access the webapp**
   - Automatically opens at: `http://localhost:3000`

---

### Method 2: Manual Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/cry4pt/Peacock-Save-Editor.git
   cd Peacock-Save-Editor/webapp
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Extract localization data**
   ```bash
   pnpm run extract-localization
   ```
   
   This searches for your Peacock installation and extracts challenge/story names.

4. **Build for production**
   ```bash
   pnpm run build
   ```

5. **Start the server**
   ```bash
   pnpm run start
   ```
   
   Or for development mode with hot reload:
   ```bash
   pnpm run dev
   ```

6. **Open your browser**
   - Navigate to: `http://localhost:3000`

---

## 🎮 Usage

### First Launch

1. **Select a Profile**
   - The dashboard shows all detected Peacock profiles
   - Click on a profile to select it
   - Profile stats appear in the sidebar

2. **Understand the Interface**
   - **Dashboard**: Overview and quick actions
   - **Profile**: Detailed profile editor (XP, level, etc.)
   - **Locations**: Manage location mastery
   - **Challenges**: Complete challenges
   - **Stories**: Complete mission stories
   - **Escalations**: Complete escalations
   - **Settings**: Configure Peacock path

### Quick Actions

#### Unlock Everything
```
Dashboard → "Unlock All Content" button
```
- Unlocks all items, weapons, suits, and gear
- Does NOT affect level, XP, or mastery

#### Complete Profile
```
Dashboard → "Complete Profile" button
```
- Sets level to 7000
- Maxes all location mastery
- Unlocks all content
- Completes all challenges, stories, and escalations

#### Max Mastery for One Location
```
Locations → Select location → "Max" button
```
- Sets that location's mastery to max level
- Unlocks location-specific items

#### Complete All Challenges
```
Challenges → "Complete All" button
```
- Marks all challenges as completed
- Unlocks challenge-specific rewards

### Advanced Usage

#### Create Backup
```
Settings → Backup & Restore → "Create Backup"
```
- Creates a timestamped backup
- Backup includes all profile data
- Stored in Peacock's backup folder

#### Restore Backup
```
Settings → Backup & Restore → Select backup → "Restore"
```
- Reverts profile to backup state
- Cannot be undone (create new backup first!)

#### Search Challenges/Stories
```
Challenges/Stories → Search bar → Type name
```
- Searches by challenge/story name
- Filters results in real-time
- Case-insensitive

#### Filter by Location
```
Challenges/Stories/Escalations → Location tabs
```
- Click location name to filter
- "All" shows everything
- Results update instantly

---

## 📡 API Documentation

Full API documentation available at: [`docs/API.md`](https://github.com/cry4pt/Peacock-Save-Editor/blob/main/webapp/docs/API.md)

### Quick Reference

#### Get Profile
```http
GET /api/profile/:id
```

#### Update Profile
```http
POST /api/profile/:id/update
Body: { level: 7000, xp: 123456, ... }
```

#### Unlock All Content
```http
POST /api/unlock/all
Body: { profileId: "xxx" }
```

#### Complete Profile
```http
POST /api/unlock/content
Body: { profileId: "xxx" }
```

#### Get Challenges
```http
GET /api/challenges?profileId=xxx
```

#### Get Locations
```http
GET /api/locations?profileId=xxx
```

#### Create Backup
```http
POST /api/backup/create
Body: { profileId: "xxx", name: "My Backup" }
```

See [`docs/API.md`](https://github.com/cry4pt/Peacock-Save-Editor/blob/main/webapp/docs/API.md) for complete documentation.

---

## 📁 Project Structure

```
webapp/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── activity/             # Activity logging
│   │   ├── backup/               # Backup & restore
│   │   ├── profile/              # Profile management
│   │   ├── unlock/               # Unlock operations
│   │   ├── challenges/           # Challenge data
│   │   ├── escalations/          # Escalation data
│   │   ├── locations/            # Location data
│   │   ├── stories/              # Story data
│   │   └── settings/             # Settings management
│   ├── challenges/page.tsx       # Challenges page
│   ├── escalations/page.tsx      # Escalations page
│   ├── locations/page.tsx        # Locations page
│   ├── profile/page.tsx          # Profile editor page
│   ├── settings/page.tsx         # Settings page
│   ├── stories/page.tsx          # Stories page
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Dashboard
├── components/                   # React Components
│   ├── ui/                       # shadcn/ui components
│   ├── challenges.tsx            # Challenge list component
│   ├── dashboard.tsx             # Dashboard component
│   ├── escalations.tsx           # Escalations component
│   ├── locations.tsx             # Locations component
│   ├── profile.tsx               # Profile editor component
│   ├── settings.tsx              # Settings component
│   ├── sidebar.tsx               # Navigation sidebar
│   └── stories.tsx               # Stories component
├── lib/                          # Utility functions
│   ├── constants.ts              # Game constants
│   └── utils.ts                  # Helper functions
├── public/                       # Static files
│   └── localization.json         # Challenge/story names
├── scripts/                      # Batch helper scripts
│   ├── dev.bat                   # Start dev server
│   ├── build.bat                 # Build for production
│   ├── start.bat                 # Start production server
│   ├── check.bat                 # Type check
│   ├── update-localization.bat   # Update localization
│   └── clean.bat                 # Clean build files
├── styles/                       # Global styles
│   └── globals.css               # Tailwind CSS
├── install.bat                   # Automated installer
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── next.config.mjs               # Next.js config
├── tailwind.config.ts            # Tailwind config
└── README.md                     # This file
```

---

## 🛠️ Development

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.9
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **Data Fetching**: SWR
- **Forms**: React Hook Form + Zod

### Development Commands

```bash
# Start development server (hot reload)
pnpm run dev

# Type check
pnpm run check

# Build for production
pnpm run build

# Start production server
pnpm run start

# Update localization data
pnpm run extract-localization
```

### Using Helper Scripts (Windows)

```bash
# Development mode
scripts\dev.bat

# Build and start production
scripts\build.bat
scripts\start.bat

# Type checking
scripts\check.bat

# Update challenge names
scripts\update-localization.bat

# Clean build artifacts
scripts\clean.bat
```

### Adding New Features

1. **Create API route** in `app/api/`
2. **Create component** in `components/`
3. **Add page** in `app/` (if needed)
4. **Update types** in component files
5. **Test locally** with `pnpm run dev`

### Code Style

- Use TypeScript strict mode
- Follow React best practices
- Use Tailwind for styling
- Keep components modular
- Add JSDoc comments for complex functions

---

## 🐛 Troubleshooting

### Webapp won't start

**Problem**: `Error: Could not find Peacock installation`

**Solution**:
1. Go to Settings page
2. Enter your Peacock path manually
3. Click "Save Settings"
4. Restart the webapp

---

**Problem**: `Error: Could not find a production build`

**Solution**:
```bash
pnpm run build
pnpm run start
```

Or use development mode:
```bash
pnpm run dev
```

---

### Localization not working

**Problem**: Challenges/stories show as IDs (e.g., `UI_CHALLENGES_...`)

**Solution**:
```bash
pnpm run extract-localization
```

This extracts names from your Peacock installation.

---

### Changes not saving

**Problem**: Profile changes don't persist

**Solution**:
1. Check that Peacock server is NOT running
2. Verify Peacock path in Settings
3. Check file permissions for Peacock folder
4. Try creating a backup first

---

### Port already in use

**Problem**: `Error: Port 3000 is already in use`

**Solution**:
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

Or change the port in `package.json`:
```json
"dev": "next dev -p 3001"
```

---

### Dependencies won't install

**Problem**: `pnpm install` fails

**Solution**:
```bash
# Clear pnpm cache
pnpm store prune

# Delete node_modules and lockfile
rm -rf node_modules pnpm-lock.yaml

# Reinstall
pnpm install
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Reporting Bugs
1. Check existing issues first
2. Create a new issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

### Suggesting Features
1. Open an issue with `[Feature Request]` prefix
2. Describe the feature and use case
3. Explain why it would be useful

### Pull Requests
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Add comments for complex logic
- Update documentation
- Test on Windows (primary platform)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Peacock Team** - For the amazing HITMAN server
- **IOI Interactive** - For HITMAN World of Assassination
- **shadcn/ui** - For the beautiful component library
- **Vercel** - For Next.js framework

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/cry4pt/Peacock-Save-Editor/issues)
- **Discussions**: [GitHub Discussions](https://github.com/cry4pt/Peacock-Save-Editor/discussions)
- **Peacock Discord**: [Join here](https://thepeacockproject.org/discord)

---

## 🗺️ Roadmap

### Planned Features
- [ ] Import/Export profiles
- [ ] Challenge statistics dashboard
- [ ] Custom challenge presets
- [ ] Leaderboard integration
- [ ] Mobile-responsive design improvements
- [ ] Multi-language support
- [ ] Dark/Light theme toggle
- [ ] Advanced search filters
- [ ] Batch operations UI
- [ ] Profile comparison tool

### Under Consideration
- [ ] Cloud backup sync
- [ ] Profile sharing
- [ ] Achievement tracker
- [ ] Custom loadout presets
- [ ] Mission planner

---

<div align="center">

**Made with ❤️ for the HITMAN community**

⭐ Star this repo if you find it useful!

[Report Bug](https://github.com/cry4pt/Peacock-Save-Editor/issues) • [Request Feature](https://github.com/cry4pt/Peacock-Save-Editor/issues)

</div>
