const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv/config');

interface Command {
  data: {
    toJSON: () => object;
  };
}

const commands: object[] = [];
const commandsPath = path.join(__dirname, 'src', 'discord', 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file: string) => file.endsWith('.ts'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath).default as Command;

  if (command && 'data' in command) {
    commands.push(command.data.toJSON());
    console.warn(`Found command: ${file}`);
  } else {
    console.warn(`[WARNING] The command at ${filePath} is missing a required "data" property.`);
  }
}

if (!process.env.DISCORD_TOKEN || !process.env.DISCORD_CLIENT_ID) {
  console.error('Missing required environment variables: DISCORD_TOKEN and DISCORD_CLIENT_ID');
  process.exit(1);
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.warn(`Started refreshing ${commands.length} application (/) commands.`);

    let data: unknown[];
    if (process.env.GUILD_ID) {
      data = (await rest.put(
        Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.GUILD_ID),
        { body: commands }
      )) as unknown[];
      console.warn(`Successfully reloaded ${data.length} guild application (/) commands.`);
    } else {
      data = (await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), {
        body: commands,
      })) as unknown[];
      console.warn(`Successfully reloaded ${data.length} global application (/) commands.`);
    }
  } catch (error) {
    console.error(error);
  }
})();
