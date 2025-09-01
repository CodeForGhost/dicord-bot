# Discord Clip Management Bot 🎬

A TypeScript Discord bot that enables content creators to submit video clips for centralized review and management, streamlining the content curation process for communities, agencies, and content teams.

## ✨ Features Overview

- **Type-Safe Development** - Built with TypeScript 5.9+ for robust, maintainable code
- **Modern Code Quality** - ESLint + Prettier for consistent formatting and best practices
- **Production Ready** - ES Modules, proper error handling, and comprehensive logging

## Features

### Core Commands

- **`/submit`** - Submit video clips with title, URL, description, and tags
- **`/review`** - Review submitted clips (approve/reject/mark under review) - Moderator only
- **`/clips`** - Browse clips with filtering by status, submitter, and pagination
- **`/find`** - Search clips by ID, title/description text, or tags

### Key Features

- **Role-based Access Control** - Review commands require moderation permissions
- **MongoDB Integration** - Persistent clip storage with indexing
- **Status Tracking** - Pending → Under Review → Approved/Rejected workflow
- **Direct Messaging** - Automatic notifications to submitters when reviewed
- **Rich Embeds** - Beautiful Discord embeds with proper formatting
- **Search & Filter** - Comprehensive search capabilities
- **Pagination** - Handle large amounts of clips efficiently

## Setup Instructions

### 1. Prerequisites

- Node.js 16+ installed
- MongoDB database (local or cloud)
- Discord Bot Application

### 2. Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section and create a bot
4. Copy the bot token
5. Go to "OAuth2" → "URL Generator"
6. Select "bot" and "applications.commands" scopes
7. Select necessary permissions (Send Messages, Use Slash Commands, Moderate Members)
8. Invite the bot to your server using the generated URL

### 3. Environment Configuration

1. Copy `.example.env` to `.env`:
   ```bash
   cp .example.env .env
   ```

2. Fill in your environment variables:
   ```env
   DISCORD_TOKEN=your_bot_token_here
   MONGODB_URI=mongodb://localhost:27017/clipmanager
   CLIENT_ID=your_client_id
   GUILD_ID=your_test_server_id  # Optional: for guild-specific commands
   PORT=3000
   ```

### 4. Installation & Deployment

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the TypeScript project:
   ```bash
   npm run build
   ```

3. Deploy slash commands:
   ```bash
   npm run deploy
   ```

4. Start the bot:
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

### Development Commands

- **`npm run build`** - Compile TypeScript to JavaScript
- **`npm run dev`** - Start development server with hot reload
- **`npm run lint`** - Check code with ESLint
- **`npm run lint:fix`** - Auto-fix ESLint issues
- **`npm run format`** - Format code with Prettier
- **`npm run type-check`** - Check TypeScript types without building

## Usage Examples

### Submit a Clip
```
/submit title:"Epic Gaming Moment" url:"https://youtube.com/watch?v=example" description:"Amazing clutch play" tags:"gaming, clutch, highlight"
```

### Review a Clip (Moderators)
```
/review clip_id:"abc123-def456" action:"approved" notes:"Great content, well edited"
```

### Browse Clips
```
/clips status:"pending" page:1
/clips submitter:@username
```

### Search Clips
```
/find clip_id:"abc123-def456"
/find search:"gaming"
/find tag:"highlight"
```

## Database Schema

The bot uses MongoDB with the following clip schema:

- **id**: Unique identifier (UUID)
- **submitterId/Name**: Discord user info
- **title/description**: Clip metadata
- **videoUrl**: Link to the video
- **status**: pending/approved/rejected/under_review
- **reviewerId/Name**: Reviewer info
- **reviewNotes**: Feedback from reviewer
- **tags**: Array of searchable tags
- **timestamps**: Submission and review dates

## Project Structure

```
src/
├── commands/
│   ├── submit.ts     # Submit clips
│   ├── review.ts     # Review clips (moderator)
│   ├── clips.ts      # Browse clips
│   └── find.ts       # Search clips
├── config/
│   └── database.ts   # MongoDB connection
├── models/
│   └── Clip.ts       # Clip data model
├── types/
│   └── index.ts      # TypeScript type definitions
└── index.ts          # Main bot file
```

## Permissions

- **All Users**: Can submit clips and view/search clips
- **Moderators**: Can review clips (requires "Moderate Members" permission)

## Development

The bot is built with:
- **TypeScript 5.9+** - Type-safe JavaScript with modern features
- **Discord.js v14** - Discord API wrapper with full type support
- **Mongoose 8+** - MongoDB ODM with TypeScript integration
- **UUID** - Unique ID generation
- **ESLint + Prettier** - Code linting and formatting
- **ES Modules** - Modern module system

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

ISC License