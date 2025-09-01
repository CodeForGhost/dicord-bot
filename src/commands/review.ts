import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from 'discord.js';
import Clip from '../models/Clip.js';
import { ClipStatus, ClipStatusEmoji, ClipStatusColor } from '../types/index.js';

const command = {
  data: new SlashCommandBuilder()
    .setName('review')
    .setDescription('Review a submitted clip (moderators only)')
    .addStringOption(option =>
      option.setName('clip_id').setDescription('The ID of the clip to review').setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('action')
        .setDescription('Review action')
        .setRequired(true)
        .addChoices(
          { name: 'Approve', value: 'approved' },
          { name: 'Reject', value: 'rejected' },
          { name: 'Mark Under Review', value: 'under_review' }
        )
    )
    .addStringOption(option =>
      option.setName('notes').setDescription('Review notes/feedback').setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    try {
      const clipId = interaction.options.getString('clip_id', true);
      const action = interaction.options.getString('action', true) as ClipStatus;
      const notes = interaction.options.getString('notes') ?? '';

      if (!interaction.memberPermissions?.has(PermissionFlagsBits.ModerateMembers)) {
        await interaction.editReply({
          content: '❌ You do not have permission to review clips.',
        });
        return;
      }

      const clip = await Clip.findOne({ id: clipId });
      if (!clip) {
        await interaction.editReply({
          content: '❌ Clip not found. Please check the clip ID.',
        });
        return;
      }

      clip.status = action;
      clip.reviewerId = interaction.user.id;
      clip.reviewerName = interaction.user.username;
      clip.reviewNotes = notes;
      clip.reviewedAt = new Date();

      await clip.save();

      const embed = new EmbedBuilder()
        .setColor(ClipStatusColor[action])
        .setTitle(
          `${ClipStatusEmoji[action]} Clip ${action.charAt(0).toUpperCase() + action.slice(1)}`
        )
        .addFields(
          { name: 'Clip ID', value: `\`${clipId}\``, inline: true },
          { name: 'Title', value: clip.title, inline: true },
          { name: 'Status', value: action.charAt(0).toUpperCase() + action.slice(1), inline: true },
          { name: 'Submitter', value: clip.submitterName, inline: true },
          { name: 'Reviewer', value: interaction.user.username, inline: true },
          { name: 'Review Date', value: new Date().toLocaleDateString(), inline: true }
        )
        .setTimestamp();

      if (notes) {
        embed.addFields({ name: 'Review Notes', value: notes });
      }

      await interaction.editReply({ embeds: [embed] });

      try {
        const submitter = await interaction.client.users.fetch(clip.submitterId);
        const dmEmbed = new EmbedBuilder()
          .setColor(ClipStatusColor[action])
          .setTitle(`${ClipStatusEmoji[action]} Your Clip Has Been Reviewed`)
          .addFields(
            { name: 'Clip Title', value: clip.title },
            { name: 'Status', value: action.charAt(0).toUpperCase() + action.slice(1) },
            { name: 'Reviewer', value: interaction.user.username }
          )
          .setTimestamp();

        if (notes) {
          dmEmbed.addFields({ name: 'Review Notes', value: notes });
        }

        await submitter.send({ embeds: [dmEmbed] });
      } catch (error) {
        console.warn('Could not send DM to submitter:', error);
      }
    } catch (error) {
      console.error('Error reviewing clip:', error);
      await interaction.editReply({
        content: '❌ An error occurred while reviewing the clip. Please try again.',
      });
    }
  },
};

export default command;
