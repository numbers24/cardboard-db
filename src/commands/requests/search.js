const { collections, cards } = require('../../comms/database');
const PokemonTCGClient = require('../../comms/pokemon-tcg');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, ComponentType, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');


/**
 * TODO Clean up Code
 */
module.exports = {
	data: new SlashCommandBuilder()
		.setName('search_pokemon_tcg')
		.setDescription('Returns an Image of the Pokemon Card you are looking for')
		.addStringOption(option =>
			option.setName('name')
			.setDescription('name of the pokemon')
			.setRequired(true),
		)
		.addStringOption(option =>
			option.setName('set')
			.setDescription('set of the pokemon card')
			.setRequired(false),
		)
		.addStringOption(option =>
			option.setName('series')
			.setDescription('series of the pokemon card')
			.setRequired(false),
		),
	async execute(interaction) {
		let user = interaction.user.username;
		let name = interaction.options.getString('name');
		let set = interaction.options.getString('set');
		let series = interaction.options.getString('series');

		let query = `name:"${name}"`
		if(!(set === null)) query += ` set.name:"${set}"`;
		if(!(series === null)) query += ` set.series:"${series}"`;

		const add = new StringSelectMenuBuilder()
		.setCustomId('add')
		.setPlaceholder('Add to your Collection!')
		.addOptions(
			new StringSelectMenuOptionBuilder()
			.setLabel("NEW")
			.setDescription('create a new collection - doesnt do anything right now')
			.setValue("NEW")
		);

		let k = 1;
		collections.where('user', user).each(async (row) => {
			if(k<25)
				{
					add.addOptions(
						new StringSelectMenuOptionBuilder()
							.setLabel(row.name)
							.setValue(`${row.name}`)
					);
				}
			k++;
		});


		await PokemonTCGClient.card.where({ q: `${query}`})
		.then(async result => {
			
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
				.setDisabled(i>=result.data.length-1);


			let rows = [
				new ActionRowBuilder()
				.addComponents(prev,next),
				new ActionRowBuilder()
				.addComponents(add)
			];

			const response = await interaction.reply({
				content: `${result.data[i].images.small}`,
				components: rows
			});

			const collector = response.createMessageComponentCollector({ componentType: ComponentType.ButtonBuilder, time: 3_600_000 });

			collector.on('collect', async buttonInteraction => {
				switch(buttonInteraction.customId) {
					case 'next':
						i++;
						prev.setDisabled(i<=0);
						next.setDisabled(i>=result.data.length-1);
						await buttonInteraction.update({
							content: `${result.data[i].images.small}`,
							components: rows
						});
						break;
					case 'prev':
						i--;
						prev.setDisabled(i<=0);
						next.setDisabled(i>=result.data.length-1);
						await buttonInteraction.update({
							content: `${result.data[i].images.small}`,
							components: rows 
						});
						break;
				}
			});

			const collector2 = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 3_600_000 });

			collector2.on('collect', async stringSelectInteraction  => {
				switch(stringSelectInteraction.customId) {
					case 'add': {
						console.log(`${stringSelectInteraction.values[0]}`);
						if (!("NEW" === `${stringSelectInteraction.values[0]}`)) {
							cards.insert(`${result.data[i].id}`,`${result.data[i].images.small}`, user,`${stringSelectInteraction.values[0]}`);
						}

						prev.setDisabled(i<=0);
						next.setDisabled(i>=result.data.length-1);
						await stringSelectInteraction.update({
							content: `${result.data[i].images.small}`,
							components: rows 
						});
						break;
					}
				}
			});

		});
	},
};
