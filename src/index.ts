import 'dotenv/config';
import { Client, Collection, GatewayIntentBits, ChatInputCommandInteraction } from 'discord.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDatabase } from './database/connection.js';
import { runMigrations } from './database/migrations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Command {
  data: {
    name: string;
    toJSON: () => object;
  };
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

interface ExtendedClient extends Client {
  commands: Collection<string, Command>;
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
}) as ExtendedClient;

client.commands = new Collection<string, Command>();

// Load commands from discord/commands folder
const commandsPath = path.join(__dirname, 'discord', 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));

const loadCommands = async (): Promise<void> => {
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const fileUrl = `file://${filePath.replace(/\\/g, '/')}`;
    const commandModule = await import(fileUrl);
    const command = commandModule.default as Command;

    if (command && 'data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      console.warn(`Loaded command: ${command.data.name}`);
    } else {
      console.warn(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
};

// Load events from discord/events folder
const eventsPath = path.join(__dirname, 'discord', 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));

const loadEvents = async (): Promise<void> => {
  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const fileUrl = `file://${filePath.replace(/\\/g, '/')}`;
    const eventModule = await import(fileUrl);
    const event = eventModule.default as {
      name: string;
      once?: boolean;
      execute: (...args: unknown[]) => void | Promise<void>;
    };

    if (event && 'name' in event && 'execute' in event) {
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
      } else {
        client.on(event.name, (...args) => event.execute(...args));
      }
      console.warn(`Loaded event: ${event.name}`);
    } else {
      console.warn(
        `[WARNING] The event at ${filePath} is missing a required "name" or "execute" property.`
      );
    }
  }
};

// Validate environment variables
if (!process.env.DISCORD_TOKEN) {
  console.error('ERROR: DISCORD_TOKEN is not set in environment variables!');
  process.exit(1);
}

if (!process.env.DISCORD_CLIENT_ID) {
  console.error('ERROR: DISCORD_CLIENT_ID is not set in environment variables!');
  process.exit(1);
}

// Initialize database and run migrations on startup
(async (): Promise<void> => {
  try {
    await loadCommands();
    await loadEvents();
    await initDatabase();
    await runMigrations();
    await client.login(process.env.DISCORD_TOKEN);
  } catch (error) {
    console.error('Failed to start bot:', error);
    process.exit(1);
  }
})();
