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
        const contacts = await Airtable.getContacts("appsqByR9Lsaylcd3", "Text");

        const airtableRecords = await Airtable.formatAirtableContacts(contacts);
        // console.log(airtableRecords);

        let length = 18;
        console.log(Math.round(airtableRecords.length / 10));
    } catch (error) {
        console.log(error);
    }
})();
