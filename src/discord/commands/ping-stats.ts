import { SlashCommandBuilder, ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { GuildSettingsModel } from '../../database/guildSettings.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping-stats')
    .setDescription('Send a pong message to the configured stats channel'),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) {
      await interaction.reply({
        content: 'This command can only be used in a server!',
        ephemeral: true,
      });
      return;
    }

    const settings = GuildSettingsModel.get(interaction.guild.id);

    if (!settings?.stats_channel_id) {
      await interaction.reply({
        content:
          '⚠️ No stats channel has been configured! Use `/bind stats_channel #channel` to set one up.',
        ephemeral: true,
      });
      return;
    }

    let channel: TextChannel | null = null;
    try {
      const fetchedChannel = await interaction.guild.channels.fetch(settings.stats_channel_id);
      if (fetchedChannel && fetchedChannel.isTextBased()) {
        channel = fetchedChannel as TextChannel;
      }
    } catch (error) {
      console.warn(
        `Stats channel ${settings.stats_channel_id} not found for guild ${interaction.guild.id}`
      );
    }

    if (!channel) {
      await interaction.reply({
        content: `⚠️ The configured stats channel (ID: ${settings.stats_channel_id}) no longer exists or is not accessible. Please reconfigure it using \`/bind\`.`,
        ephemeral: true,
      });
      return;
    }

    try {
      await channel.send('🏓 Pong! Bot is alive and responding!');
      await interaction.reply({
        content: `✅ Pong sent to <#${settings.stats_channel_id}>!`,
        ephemeral: true,
      });
    } catch (error) {
      console.error('Error sending pong to stats channel:', error);
      await interaction.reply({
        content: '❌ Failed to send message to stats channel. Please check bot permissions.',
        ephemeral: true,
      });
    }
  },
};
