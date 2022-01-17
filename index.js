require("dotenv").config();

const moment = require("moment");
const today = moment(new Date()).format("MM/DD/YYYY");

const AirtableApi = require("./src/Airtable");
const HelperApi = require("./src/Helpers");

const Airtable = new AirtableApi(process.env.AIRTABLE_API_KEY);
const _ = new HelperApi();

const emailOutreach = require("./src/emailOutreach");

exports.emailCampaignApollo = async (req, res) => {
    try {
        const getCampaigns = await Airtable.getCampaigns("Email - Apollo");
        let accounts = _.accountsToRun(getCampaigns);

        const arrayEmailOutreach = accounts.map((account) => emailOutreach(account));

        const results = await Promise.all(arrayEmailOutreach);

        // console.log(results);

        // for (let result of results) {
        //     await Airtable.updateCampaign(result.recordID, {
        //         "Campaign Status": result.status,
        //         "Last Updated": today,
        //     });
        // }

        // res.status(200).send(results);
    } catch (error) {
        console.log("emailCampaignApollo ---", error);
        // res.status(500).send(error);
    }
};

// get # contacts
// upload contacts to apollo
// map over res to collect contact's id
// upload contacts to sequence
