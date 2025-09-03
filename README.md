# Discord Bot - Resource Binding System

A Discord bot that demonstrates clean architecture with resource binding capabilities. The bot allows administrators to bind channels and roles to specific resources and provides graceful degradation when resources are deleted.

## Features

### Core Functionality
- **Command & Event Autoloading** - Commands and events are automatically loaded from their respective folders
- **Resource Binding** - Bind channels and roles to specific resources using channel/role IDs (not names)
- **Health Monitoring** - Check the status of bound resources and detect missing/deleted items
- **Graceful Degradation** - Bot continues operating even when bound resources are deleted
- **SQLite Database** - Lightweight local database for storing guild settings

### Commands

- **`/bind <resource> <#channel|@role>`** - Bind a resource to a channel or role (Admin only)
  - Resources: `stats_channel`, `leaderboard_channel`, `admin_role`
- **`/status`** - Display current bindings and their health status (Admin only)
- **`/leaderboard`** - Post a mock leaderboard to the bound leaderboard channel
- **`/ping-stats`** - Send a "pong" message to the bound stats channel

## Setup

### Prerequisites
- Node.js 16+ 
- Discord Bot Application (created via Discord Developer Portal)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd clipping-discord
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .example.env .env
```

Edit `.env` with your values:
```env
DISCORD_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
GUILD_ID=your_test_server_id_here  # Optional: for guild-specific commands
```

4. Deploy slash commands:
```bash
npm run deploy
```

5. Start the bot:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## Project Structure

```
src/
├── discord/
│   ├── commands/      # Slash commands (autoloaded)
│   │   ├── bind.ts
│   │   ├── status.ts
│   │   ├── leaderboard.ts
│   │   └── ping-stats.ts
│   └── events/        # Discord events (autoloaded)
│       ├── ready.ts
│       └── interactionCreate.ts
├── database/
│   ├── connection.ts  # SQLite connection management
│   ├── migrations.ts  # Database migrations
│   └── guildSettings.ts # Guild settings model
└── index.ts          # Main bot entry point
```

## Development

### Available Scripts

- **`npm run build`** - Compile TypeScript to JavaScript
- **`npm run dev`** - Start development server with hot reload
- **`npm run lint`** - Check code with ESLint
- **`npm run lint:fix`** - Auto-fix ESLint issues
- **`npm run format`** - Format code with Prettier
- **`npm run type-check`** - Check TypeScript types
- **`npm run deploy`** - Deploy slash commands to Discord

### Code Quality

The project includes:
- **TypeScript** with strict mode enabled
- **ESLint** for code linting
- **Prettier** for code formatting
- **GitHub Actions** for CI/CD (runs linting on PRs)

### Database

The bot uses SQLite with a single `guild_settings` table:
- `guild_id` (PRIMARY KEY)
- `stats_channel_id`
- `leaderboard_channel_id`
- `admin_role_id`
- `updated_at`

Database migrations are run automatically on startup and are idempotent (safe to run multiple times).

## Architecture Highlights

1. **Clean Folder Structure** - Commands and events are organized in separate folders
2. **ID-based Binding** - Resources are bound using Discord IDs, not names
3. **Graceful Degradation** - Missing resources are logged but don't crash the bot
4. **Environment Validation** - Required environment variables are validated on startup
5. **Type Safety** - Full TypeScript support with strict mode

## GitHub Actions

The project includes a GitHub Action that runs on pull requests:
- Installs dependencies
- Runs ESLint
- Checks TypeScript types

## License

ISC