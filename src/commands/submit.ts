import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { v4 as uuidv4 } from 'uuid';
import Clip from '../models/Clip.js';

const command = {
  data: new SlashCommandBuilder()
    .setName('submit')
    .setDescription('Submit a video clip for review')
    .addStringOption(option =>
      option.setName('title').setDescription('Title of the clip').setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('url')
        .setDescription('Video URL (YouTube, Twitch, direct link)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('description').setDescription('Description of the clip').setRequired(false)
    )
    .addStringOption(option =>
      option.setName('tags').setDescription('Tags (comma-separated)').setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    try {
      const title = interaction.options.getString('title', true);
      const videoUrl = interaction.options.getString('url', true);
      const description = interaction.options.getString('description') ?? '';
      const tagsString = interaction.options.getString('tags') ?? '';
      const tags = tagsString ? tagsString.split(',').map(tag => tag.trim()) : [];

      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
      if (!urlPattern.test(videoUrl)) {
        await interaction.editReply({
          content: '❌ Please provide a valid URL.',
        });
        return;
      }

      const clipId = uuidv4();

      const newClip = new Clip({
        id: clipId,
        submitterId: interaction.user.id,
        submitterName: interaction.user.username,
        title,
        description,
        videoUrl,
        tags,
      });

      await newClip.save();

      const embed = new EmbedBuilder()
        .setColor(0x00ae86)
        .setTitle('✅ Clip Submitted Successfully!')
        .addFields(
          { name: 'Clip ID', value: `\`${clipId}\``, inline: true },
          { name: 'Title', value: title, inline: true },
          { name: 'Status', value: 'Pending Review', inline: true },
          { name: 'URL', value: videoUrl },
          { name: 'Description', value: description || 'No description provided' }
        )
        .setFooter({ text: `Submitted by ${interaction.user.username}` })
        .setTimestamp();

      if (tags.length > 0) {
        embed.addFields({ name: 'Tags', value: tags.join(', ') });
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error submitting clip:', error);
      await interaction.editReply({
        content: '❌ An error occurred while submitting your clip. Please try again.',
      });
    }
  },
};

export default command;
