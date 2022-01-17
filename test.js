require("dotenv").config();

const moment = require("moment");
const today = moment(new Date()).format("MM/DD/YYYY");

const AirtableApi = require("./src/Airtable");
const HighlevelApi = require("./src/Highlevel");

const Airtable = new AirtableApi(process.env.AIRTABLE_API_KEY);

const HelperApi = require("./src/Helpers");
const _ = new HelperApi();

const emailOutreach = require("./src/emailOutreach");

(async () => {
    try {
        const getCampaigns = await Airtable.getCampaigns("Email - Apollo");
        let accounts = _.accountsToRun(getCampaigns);

        console.log(accounts);
    } catch (error) {
        console.log(error);
    }
})();
