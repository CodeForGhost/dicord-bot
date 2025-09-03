import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  ChannelType,
} from 'discord.js';
import { GuildSettingsModel } from '../../database/guildSettings.js';

const VALID_RESOURCES = ['stats_channel', 'leaderboard_channel', 'admin_role'] as const;
type Resource = (typeof VALID_RESOURCES)[number];

export default {
  data: new SlashCommandBuilder()
    .setName('bind')
    .setDescription('Bind a resource to a channel or role')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option
        .setName('resource')
        .setDescription('The resource to bind')
        .setRequired(true)
        .addChoices(
          { name: 'Stats Channel', value: 'stats_channel' },
          { name: 'Leaderboard Channel', value: 'leaderboard_channel' },
          { name: 'Admin Role', value: 'admin_role' }
        )
    )
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('The channel to bind (for channel resources)')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    )
    .addRoleOption(option =>
      option
        .setName('role')
        .setDescription('The role to bind (for role resources)')
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) {
      await interaction.reply({
        content: 'This command can only be used in a server!',
        ephemeral: true,
      });
      return;
    }

    const resource = interaction.options.getString('resource', true) as Resource;
    const channel = interaction.options.getChannel('channel');
    const role = interaction.options.getRole('role');

    // Validate input
    if (resource === 'admin_role') {
      if (!role) {
        await interaction.reply({
          content: 'You must specify a role for the admin_role resource!',
          ephemeral: true,
        });
        return;
      }
      if (channel) {
        await interaction.reply({
          content: 'You cannot bind a channel to the admin_role resource!',
          ephemeral: true,
        });
        return;
      }
    } else {
      if (!channel) {
        await interaction.reply({
          content: `You must specify a channel for the ${resource} resource!`,
          ephemeral: true,
        });
        return;
      }
      if (role) {
        await interaction.reply({
          content: `You cannot bind a role to the ${resource} resource!`,
          ephemeral: true,
        });
        return;
      }
    }

    // Save the binding
    const settings: any = {};
    if (resource === 'stats_channel') {
      settings.stats_channel_id = channel?.id;
    } else if (resource === 'leaderboard_channel') {
      settings.leaderboard_channel_id = channel?.id;
    } else if (resource === 'admin_role') {
      settings.admin_role_id = role?.id;
    }

    try {
      GuildSettingsModel.upsert(interaction.guild.id, settings);

      const target = channel || role;
      await interaction.reply({
        content: `✅ Successfully bound **${resource.replace('_', ' ')}** to ${target}`,
        ephemeral: false,
      });
    } catch (error) {
      console.error('Error binding resource:', error);
      await interaction.reply({
        content: 'An error occurred while binding the resource.',
        ephemeral: true,
      });
    }
  },
};
