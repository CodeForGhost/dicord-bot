import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  TextChannel,
} from 'discord.js';
import { GuildSettingsModel } from '../../database/guildSettings';

export default {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Post a leaderboard to the configured leaderboard channel'),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) {
      await interaction.reply({
        content: 'This command can only be used in a server!',
        ephemeral: true,
      });
      return;
    }

    const settings = GuildSettingsModel.get(interaction.guild.id);

    if (!settings?.leaderboard_channel_id) {
      await interaction.reply({
        content:
          '❌ No leaderboard channel has been configured! Use `/bind leaderboard_channel #channel` to set one up.',
        ephemeral: true,
      });
      return;
    }

    let channel: TextChannel | null = null;
    try {
      const fetchedChannel = await interaction.guild.channels.fetch(
        settings.leaderboard_channel_id
      );
      if (fetchedChannel && fetchedChannel.isTextBased()) {
        channel = fetchedChannel as TextChannel;
      }
    } catch (error) {
      console.warn(
        `Leaderboard channel ${settings.leaderboard_channel_id} not found for guild ${interaction.guild.id}`
      );
    }

    if (!channel) {
      await interaction.reply({
        content: `⚠️ The configured leaderboard channel (ID: ${settings.leaderboard_channel_id}) no longer exists or is not accessible. Please reconfigure it using \`/bind\`.`,
        ephemeral: true,
      });
      return;
    }

    // Generate fake leaderboard data
    const fakeData = [
      { username: 'PlayerOne', points: 100 },
      { username: 'GamerPro', points: 80 },
      { username: 'NinjaWarrior', points: 75 },
      { username: 'DragonSlayer', points: 60 },
      { username: 'SpeedRunner', points: 50 },
    ];

    const embed = new EmbedBuilder()
      .setTitle('🏆 Weekly Leaderboard')
      .setColor(0xffd700)
      .setDescription('Top players of the week!')
      .setTimestamp()
      .setFooter({ text: 'Updates every Monday' });

    const leaderboardText = fakeData
      .map((player, index) => {
        const medal =
          index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `**${index + 1}.**`;
        return `${medal} **${player.username}** - ${player.points} pts`;
      })
      .join('\n');

    embed.addFields({
      name: 'Rankings',
      value: leaderboardText || 'No data available',
      inline: false,
    });

    try {
      await channel.send({ embeds: [embed] });
      await interaction.reply({
        content: `✅ Leaderboard posted to <#${settings.leaderboard_channel_id}>!`,
        ephemeral: true,
      });
    } catch (error) {
      console.error('Error posting leaderboard:', error);
      await interaction.reply({
        content: '❌ Failed to post the leaderboard. Please check bot permissions.',
        ephemeral: true,
      });
    }
  },
};
