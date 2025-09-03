import { Client, Events } from 'discord.js';

export default {
  name: Events.ClientReady,
  once: true,
  execute(client: Client) {
    console.warn(`Ready! Logged in as ${client.user?.tag}`);
  },
};
