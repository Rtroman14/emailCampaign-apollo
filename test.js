require("dotenv").config();

const moment = require("moment");
const today = moment(new Date()).format("MM/DD/YYYY");

const AirtableApi = require("./src/Airtable");
const HighlevelApi = require("./src/Highlevel");
const ApolloApi = require("./src/Apollo");

const Airtable = new AirtableApi(process.env.AIRTABLE_API_KEY);

const HelperApi = require("./src/Helpers");
const _ = new HelperApi();

const emailOutreach = require("./src/emailOutreach");

(async () => {
    try {
        const Apollo = new ApolloApi(process.env.APOLLO_API_KEY);

        const res = await Apollo.rateLimits();
        console.log(res);
    } catch (error) {
        console.log(error);
    }
})();
