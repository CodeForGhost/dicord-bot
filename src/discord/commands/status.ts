import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
} from 'discord.js';
import { GuildSettingsModel } from '../../database/guildSettings';

export default {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Show current resource bindings and their health status')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) {
      await interaction.reply({
        content: 'This command can only be used in a server!',
        ephemeral: true,
      });
      return;
    }

    const settings = GuildSettingsModel.get(interaction.guild.id);

    const embed = new EmbedBuilder()
      .setTitle('📊 Resource Bindings Status')
      .setColor(0x0099ff)
      .setTimestamp();

    // Check stats channel
    let statsStatus = '❌ Not bound';
    if (settings?.stats_channel_id) {
      try {
        const channel = await interaction.guild.channels.fetch(settings.stats_channel_id);
        if (channel) {
          statsStatus = `✅ Bound to <#${settings.stats_channel_id}>`;
        } else {
          statsStatus = `⚠️ Bound to deleted channel (${settings.stats_channel_id})`;
          console.warn(
            `Stats channel ${settings.stats_channel_id} is missing for guild ${interaction.guild.id}`
          );
        }
      } catch (error) {
        statsStatus = `⚠️ Bound to missing channel (${settings.stats_channel_id})`;
        console.warn(
          `Stats channel ${settings.stats_channel_id} is missing for guild ${interaction.guild.id}`
        );
      }
    }

    // Check leaderboard channel
    let leaderboardStatus = '❌ Not bound';
    if (settings?.leaderboard_channel_id) {
      try {
        const channel = await interaction.guild.channels.fetch(settings.leaderboard_channel_id);
        if (channel) {
          leaderboardStatus = `✅ Bound to <#${settings.leaderboard_channel_id}>`;
        } else {
          leaderboardStatus = `⚠️ Bound to deleted channel (${settings.leaderboard_channel_id})`;
          console.warn(
            `Leaderboard channel ${settings.leaderboard_channel_id} is missing for guild ${interaction.guild.id}`
          );
        }
      } catch (error) {
        leaderboardStatus = `⚠️ Bound to missing channel (${settings.leaderboard_channel_id})`;
        console.warn(
          `Leaderboard channel ${settings.leaderboard_channel_id} is missing for guild ${interaction.guild.id}`
        );
      }
    }

    // Check admin role
    let adminRoleStatus = '❌ Not bound';
    if (settings?.admin_role_id) {
      try {
        const role = await interaction.guild.roles.fetch(settings.admin_role_id);
        if (role) {
          adminRoleStatus = `✅ Bound to <@&${settings.admin_role_id}>`;
        } else {
          adminRoleStatus = `⚠️ Bound to deleted role (${settings.admin_role_id})`;
          console.warn(
            `Admin role ${settings.admin_role_id} is missing for guild ${interaction.guild.id}`
          );
        }
      } catch (error) {
        adminRoleStatus = `⚠️ Bound to missing role (${settings.admin_role_id})`;
        console.warn(
          `Admin role ${settings.admin_role_id} is missing for guild ${interaction.guild.id}`
        );
      }
    }

    embed.addFields(
      { name: '📈 Stats Channel', value: statsStatus, inline: false },
      { name: '🏆 Leaderboard Channel', value: leaderboardStatus, inline: false },
      { name: '👮 Admin Role', value: adminRoleStatus, inline: false }
    );

    if (settings?.updated_at) {
      const lastUpdated = new Date(settings.updated_at * 1000).toLocaleString();
      embed.setFooter({ text: `Last updated: ${lastUpdated}` });
    } else {
      embed.setFooter({ text: 'No bindings configured yet' });
    }

    await interaction.reply({ embeds: [embed], ephemeral: false });
  },
};
