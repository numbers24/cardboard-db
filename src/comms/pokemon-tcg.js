const configuration = require("./framework/configure");
const querybuilder = require("./framework/querybuilder");

configuration.host='https://api.pokemontcg.io/v2';

/**
 * exports apikey to configuration file
 * @param {*} param0 
 */
const configure = ({apiKey}) => {
    configuration.apiKey = apiKey;
};

/**
 * exports the tables defined by the api
 */
module.exports = {
    configure,
    card: querybuilder('cards'),
    set: querybuilder('sets'),
    type: querybuilder('types'),
    subtype: querybuilder('subtypes'),
    rarity: querybuilder('rarities'),
    supertype: querybuilder('supertypes')
}