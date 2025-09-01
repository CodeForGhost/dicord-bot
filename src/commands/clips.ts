import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, User } from 'discord.js';
import Clip from '../models/Clip.js';
import { ClipStatus, ClipStatusEmoji, ClipQuery } from '../types/index.js';

const command = {
  data: new SlashCommandBuilder()
    .setName('clips')
    .setDescription('View clips with optional filters')
    .addStringOption(option =>
      option
        .setName('status')
        .setDescription('Filter by status')
        .setRequired(false)
        .addChoices(
          { name: 'Pending', value: 'pending' },
          { name: 'Approved', value: 'approved' },
          { name: 'Rejected', value: 'rejected' },
          { name: 'Under Review', value: 'under_review' }
        )
    )
    .addUserOption(option =>
      option.setName('submitter').setDescription('Filter by submitter').setRequired(false)
    )
    .addIntegerOption(option =>
      option
        .setName('page')
        .setDescription('Page number (default: 1)')
        .setRequired(false)
        .setMinValue(1)
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    try {
      const status = interaction.options.getString('status') as ClipStatus | null;
      const submitter = interaction.options.getUser('submitter') as User | null;
      const page = interaction.options.getInteger('page') ?? 1;
      const limit = 5;
      const skip = (page - 1) * limit;

      const query: ClipQuery = {};
      if (status) query.status = status;
      if (submitter) query.submitterId = submitter.id;

      const totalClips = await Clip.countDocuments(query);
      const totalPages = Math.ceil(totalClips / limit);

      if (totalClips === 0) {
        await interaction.editReply({
          content: '📝 No clips found matching your criteria.',
        });
        return;
      }

      if (page > totalPages) {
        await interaction.editReply({
          content: `❌ Page ${page} doesn't exist. Total pages: ${totalPages}`,
        });
        return;
      }

      const clips = await Clip.find(query).sort({ submittedAt: -1 }).skip(skip).limit(limit);

      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle('📹 Clip Management System')
        .setFooter({ text: `Page ${page} of ${totalPages} • ${totalClips} total clips` })
        .setTimestamp();

      let description = '';
      if (status)
        description += `**Status:** ${status.charAt(0).toUpperCase() + status.slice(1)}\n`;
      if (submitter) description += `**Submitter:** ${submitter.username}\n`;
      if (description) embed.setDescription(description);

      clips.forEach(clip => {
        const submittedDate = new Date(clip.submittedAt).toLocaleDateString();
        const reviewInfo =
          clip.reviewedAt && clip.reviewerName
            ? `Reviewed by ${clip.reviewerName} on ${new Date(clip.reviewedAt).toLocaleDateString()}`
            : 'Not reviewed yet';

        embed.addFields({
          name: `${ClipStatusEmoji[clip.status]} ${clip.title}`,
          value: `**ID:** \`${clip.id}\`\n**Submitter:** ${clip.submitterName}\n**Status:** ${clip.status}\n**Submitted:** ${submittedDate}\n**Review:** ${reviewInfo}\n**URL:** ${clip.videoUrl}`,
          inline: false,
        });
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error fetching clips:', error);
      await interaction.editReply({
        content: '❌ An error occurred while fetching clips. Please try again.',
      });
    }
  },
};

export default command;
