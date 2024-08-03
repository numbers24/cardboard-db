const { SlashCommandBuilder } = require("discord.js");

/**
 * Tests the Bot's connection from discord
 */
module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Replies with list of commands for help'),
	async execute(interaction) {
        let help = "##########\n"
        help+="Commands:\n"
        help+="- collections\n"
        help+="--- list: lists your collections\n"
        help+="--- create: creates new collections\n"
        help+="--- delete: deletes a collection\n"
        help+="--- view: views a collection and allows to modify\n"
        help+="- lookup\n"
        help+="--- pokemon: search for pokemon cards\n"
        help+="------ name: name of the card\n"
        help+="------ set: tcg set\n"
        help+="------ series: tcg series\n"

		await interaction.reply(help);
	},
};
