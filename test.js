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
        let contacts = await Airtable.getContacts("appsqByR9Lsaylcd3", "Email");

        const airtableFormatedRecords = await Airtable.formatAirtableContacts(contacts);

        console.log(airtableFormatedRecords.length);

        let maxBatch = 10;

        // batch update contacts in AT with apollo id as id
        let batches = Math.ceil(airtableFormatedRecords.length / maxBatch);
        for (let batch = 1; batch <= batches; batch++) {
            let test = airtableFormatedRecords.splice(0, maxBatch);

            console.log(test.length);
        }
    } catch (error) {
        console.log(error);
    }
})();
