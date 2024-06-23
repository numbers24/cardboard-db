const { default: axios } = require("axios");
const querystring = require('node:querystring'); 
const configuration = require("./configure");

/**
 * applies the api key
 * @returns configured options
 */
const getOptions = () => {
    const options = {
        headers: {}
    };

    if (configuration.apiKey)
        options.headers['X-Api-Key'] = configuration.apiKey;

    return options;
}

/**
 * queries the rest call with passed in arguments
 * @param {*} type 
 * @param {*} args 
 * @returns the rest response
 */
const get = (type, args) => {
    console.log(`${configuration.host}/${type}${args && '?' + querystring.stringify(args)}`, getOptions());
    return axios.get(`${configuration.host}/${type}${args && '?' + querystring.stringify(args)}`, getOptions())
        .then(response => response.data);
}

/**
 * rest request object mapper
 * @param {*} type 
 * @returns 
 */
module.exports = (type) => ({
    /**
     * requests a singular result based off its identifier
     * @param {*} id 
     * @returns single result
     */
    find: id => {
        return axios(`${configuration.host}/${type}/${id}`, getOptions())
            .then(response => response.data.data);
    },
    /**
     * requests multiple results based off passed in arguments
     * @param {*} args 
     * @returns 
     */
    where: (args) => get(type, args),
    /**
     * requests all results available
     * @param {*} args 
     * @param {*} data 
     * @returns 
     */
    all: (args={}, data=[]) => {
        const getAll = (type, args) => {
            const page = args.page ? args.page + 1 : 1;

            return get(type, {...args, page})
                .then(response => {
                    data.push(...response.data);

                    if (!response.totalCount || (response.pageSize * response.page) >= response.totalCount) {
                        return data;
                    }

                    return getAll(type, {...args, page})
                })
                .catch(error => console.error(error));
        }
        return getAll(type, args);
    }
})