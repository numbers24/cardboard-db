
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, ComponentType } = require('discord.js');
const { collections, cards } = require('../../comms/database');

/**
 * processes all collection commands
 * TODO Clean up Code
 */
module.exports = {
	data: new SlashCommandBuilder()
		.setName('collection')
		.setDescription('collection commands')
		.addSubcommand(subcommand => 
			subcommand.setName('list')
			.setDescription('lists all collections in the database under user')
		)
		.addSubcommand(subcommand => 
			subcommand.setName('create')
			.setDescription('creates a collection in the database')
			.addStringOption(subcommand =>
				subcommand.setName('name')
				.setDescription('name of your collection')
				.setRequired(true),
			)
			.addStringOption(option =>
				option.setName('type')
				.setDescription('type of collection')
				.setRequired(true),
			)
		)
		.addSubcommand(subcommand => 
			subcommand.setName('delete')
			.setDescription('deletes a collection in the database')
			.addStringOption(option =>
				option.setName('name')
				.setDescription('name of your collection')
				.setRequired(true),
			),
		)
		.addSubcommand(subcommand => 
			subcommand.setName('view')
			.setDescription('views a collection in the database')
			.addStringOption(option =>
				option.setName('name')
				.setDescription('name of your collection')
				.setRequired(true),
			),
		),
	async execute(interaction) {
		
		let user = interaction.user.username;
		let name = interaction.options.getString('name');
		let type = interaction.options.getString('type');
		
		switch (interaction.options.getSubcommand()) {
			case 'list' :
				collections.where(`user`, user).all(async (rows) => {
					list = `${user}'s Collections\n`
					rows.forEach(row => {
						list += `-${row.name} : ${row.type}\n`
					});
					await interaction.reply(list);
				});
				break;

			case 'create' :
				collections.insert(user, name, type);
				await interaction.reply(`Done`);
				break;

			case 'delete' :
				collections.where(`user`, user).and(`name`, name, async (row) => {
					//Delete all associated collections
					collections.delete(row.user, row.name, row.type);
					//Delete All Associated Cards
					cards.where(`user`, user).and(`collection_name`, name, async (row) => {
						cards.delete(row.id, row.picture, row.user, row.collection_name);
					});
				});
				await interaction.reply(`Done`);
				break;

			case 'view' :

				let pictures = [];
				let ids = [];
				let i = 0;
		
				const prev = new ButtonBuilder()
							.setCustomId('prev')
							.setLabel('<--')
							.setStyle(ButtonStyle.Secondary)
							.setDisabled(true);
				
				const next = new ButtonBuilder()
					.setCustomId('next')
					.setLabel('-->')
					.setStyle(ButtonStyle.Secondary)
		
				const deleteCard = new ButtonBuilder()
					.setCustomId('delete')
					.setLabel('Delete')
					.setStyle(ButtonStyle.Danger)
					.setDisabled(false);
		
		
				let actions = [
					new ActionRowBuilder()
					.addComponents(prev, deleteCard, next)
				];
		
				cards.where('collection_name', name).all(async (rows) => {
					
					rows.forEach(row => {
						pictures.push(row.picture);
						ids.push(row.id);
					});
					
					console.log(pictures[0]);
		
					prev.setDisabled(i<=0);
					next.setDisabled(i>=pictures.length-1);
			
					const response = await interaction.reply({
						content: `${pictures[i]}`,
						components: actions
					});
			
					const collector = response.createMessageComponentCollector({ componentType: ComponentType.ButtonBuilder, time: 3_600_000 });
			
					collector.on('collect', async buttonInteraction => {
						switch(buttonInteraction.customId) {
							case 'next':
								i++;
								prev.setDisabled(i<=0);
								next.setDisabled(i>=pictures.length-1);
								await buttonInteraction.update({
									content: `${pictures[i]}`,
									components: actions
								});
								break;
							case 'prev':
								i--;
								prev.setDisabled(i<=0);
								next.setDisabled(i>=pictures.length-1);
								await buttonInteraction.update({
									content: `${pictures[i]}`,
									components: actions 
								});
								break;
							case 'delete': {
								cards.delete(ids[i], pictures[i], user, name);
								ids.splice(i, 1);
								pictures.splice(i, 1);
								i=0;
								prev.setDisabled(i<=0);
								next.setDisabled(i>=pictures.length-1);
								await buttonInteraction.update({
									content: `${pictures[i]}`,
									components: actions 
								});
								break;
							}
						}
					});
		
				});

				break;

			default:
				console.log('Subcommand Undefined');
		}
	}
};
