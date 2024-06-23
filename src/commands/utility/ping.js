const { SlashCommandBuilder } = require("discord.js");

/**
 * Tests the Bot's connection from discord
 */
module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};
