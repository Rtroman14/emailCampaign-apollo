require("dotenv").config();

const slackNotification = require("./slackNotification");

const AirtableApi = require("./Airtable");
const ApolloApi = require("./Apollo");

const Airtable = new AirtableApi(process.env.AIRTABLE_API_KEY);

module.exports = async (account) => {
    let view = "Email";

    if ("Tag" in account) {
        view = `Email - ${account.Tag}`;
    }

    try {
        let contacts = await Airtable.getContacts(account["Base ID"], view);

        if (contacts) {
            const Apollo = new ApolloApi(account["API Token"]);

            const arrayOfContactRequests = contacts.map((contact) =>
                Apollo.createContact(contact, account.Account)
            );

            // results === [ {contact:{}} ,{contact:{}}, {contact:{}} ]
            const createdContactResults = await Promise.all(arrayOfContactRequests);

            const arrayOfContacts = createdContactResults.map((res) => res.contact);
            const arrayOfIDs = arrayOfContacts.map((contact) => contact.id);

            // map id from apollo to airtable contacts
            const airtableContactsWithID = contacts.map((contact) => {
                let foundContact = arrayOfContacts.find(
                    (apolloContact) => apolloContact.email === contact.Email
                );

                return {
                    recordID: contact.recordID,
                    id: foundContact.id,
                };
            });

            const airtableFormatedRecords = await Airtable.formatAirtableContacts(
                airtableContactsWithID
            );

            // batch update contacts in AT with apollo id as id
            let batches = Math.ceil(airtableFormatedRecords.length / 10);
            for (let batch = 1; batch <= batches; batch++) {
                await Airtable.updateContacts(account["Base ID"], airtableFormatedRecords);
            }

            // res = contacts: [{..},{..}]
            // send all contacts to sequence
            // const res = await Apollo.addContactsToSequence(
            //     account["Campaign ID"],
            //     arrayOfIDs,
            //     account["Account ID"]
            // );

            // TODO: cross reference res with arrayOfIDS and update AT accordingly
            const contactsAfterAddedToApollo = airtableContactsWithID.map((airtableContact) => {
                const foundContact = res.filter((contact) => contact.id === airtableContact.id);

                if (foundContact.length) {
                    return {
                        ...airtableContact,
                        "In Campaign": true,
                        Campagin: account.Campagin,
                    };
                }

                return {
                    ...airtableContact,
                    Status: "Error",
                };
            });

            // TODO: if succesfful
            return {
                ...account,
                status: "Live",
            };
        } else {
            return {
                ...account,
                status: "Need More Contacts",
            };
        }
    } catch (error) {
        await slackNotification(
            process.env.SLACK_TWO_PERCENT,
            `Account: ${account.Account} threw an error: ${error.message}`
        );

        console.log(`Account: ${account.Account} | Campaign: ${account.Campaign} - ERROR`);

        console.log("emailOutreach ---", error);

        return {
            ...account,
            status: "Error",
        };
    }
};

// https://apolloio.github.io/apollo-api-docs/#searching-for-sequences
