import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

interface Command {
  data: {
    toJSON: () => object;
  };
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands: object[] = [];
const commandsPath = path.join(__dirname, 'src', 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = await import(filePath) as { default: Command };
  
  if (command.default && 'data' in command.default) {
    commands.push(command.default.data.toJSON());
  } else {
    console.warn(`[WARNING] The command at ${filePath} is missing a required "data" property.`);
  }
}

if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) {
  console.error('Missing required environment variables: DISCORD_TOKEN and CLIENT_ID');
  process.exit(1);
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

try {
  console.log(`Started refreshing ${commands.length} application (/) commands.`);

  let data: unknown[];
  if (process.env.GUILD_ID) {
    data = await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands },
    ) as unknown[];
    console.log(`Successfully reloaded ${data.length} guild application (/) commands.`);
  } else {
    data = await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    ) as unknown[];
    console.log(`Successfully reloaded ${data.length} global application (/) commands.`);
  }
} catch (error) {
  console.error(error);
}