import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import Clip, { ClipDocument } from '../models/Clip.js';
import { ClipStatusEmoji, ClipQuery } from '../types/index.js';

const command = {
  data: new SlashCommandBuilder()
    .setName('find')
    .setDescription('Find a specific clip by ID or search by title/tags')
    .addStringOption(option =>
      option.setName('clip_id').setDescription('Specific clip ID to find').setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('search')
        .setDescription('Search in titles, descriptions, and tags')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('tag').setDescription('Search by specific tag').setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    try {
      const clipId = interaction.options.getString('clip_id');
      const searchTerm = interaction.options.getString('search');
      const tag = interaction.options.getString('tag');

      if (!clipId && !searchTerm && !tag) {
        await interaction.editReply({
          content: '❌ Please provide either a clip ID, search term, or tag.',
        });
        return;
      }

      let clips: ClipDocument[] = [];

      if (clipId) {
        const clip = await Clip.findOne({ id: clipId });
        if (clip) clips = [clip];
      } else {
        const query: ClipQuery = {};

        if (searchTerm) {
          query.$or = [
            { title: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } },
          ];
        }

        if (tag) {
          query.tags = { $in: [new RegExp(tag, 'i')] };
        }

        clips = await Clip.find(query).sort({ submittedAt: -1 }).limit(10);
      }

      if (clips.length === 0) {
        await interaction.editReply({
          content: '📝 No clips found matching your search criteria.',
        });
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(0x9932cc)
        .setTitle('🔍 Search Results')
        .setFooter({ text: `Found ${clips.length} clip(s)` })
        .setTimestamp();

      if (clipId) {
        embed.setDescription(`**Searching for:** Clip ID \`${clipId}\``);
      } else {
        let searchDesc = '';
        if (searchTerm) searchDesc += `**Search term:** "${searchTerm}"\n`;
        if (tag) searchDesc += `**Tag:** "${tag}"`;
        embed.setDescription(searchDesc);
      }

      clips.forEach(clip => {
        const submittedDate = new Date(clip.submittedAt).toLocaleDateString();
        let fieldValue = `**ID:** \`${clip.id}\`\n**Submitter:** ${clip.submitterName}\n**Status:** ${clip.status}\n**Submitted:** ${submittedDate}\n**URL:** ${clip.videoUrl}`;

        if (clip.description) {
          fieldValue += `\n**Description:** ${clip.description}`;
        }

        if (clip.tags && clip.tags.length > 0) {
          fieldValue += `\n**Tags:** ${clip.tags.join(', ')}`;
        }

        if (clip.reviewNotes && clip.reviewedAt) {
          fieldValue += `\n**Review Notes:** ${clip.reviewNotes}`;
        }

        embed.addFields({
          name: `${ClipStatusEmoji[clip.status]} ${clip.title}`,
          value: fieldValue,
          inline: false,
        });
      });

      if (clips.length === 10) {
        embed.addFields({
          name: '📋 Note',
          value: 'Search limited to 10 results. Use more specific terms if needed.',
          inline: false,
        });
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error searching clips:', error);
      await interaction.editReply({
        content: '❌ An error occurred while searching clips. Please try again.',
      });
    }
  },
};

export default command;
