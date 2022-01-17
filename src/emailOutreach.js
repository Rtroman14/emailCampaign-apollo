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

            const contactsInList = createdContactResults.map((res) => res.contact);
            const arrayOfIDs = createdContactResults.map((res) => res.contact.id);

            // res = contacts: [{..},{..}]
            // send all contacts to sequence
            const contactsInSequence = await Apollo.addContactsToSequence(
                account["Campaign ID"],
                arrayOfIDs,
                account["Account ID"]
            );

            // update contacts on if they were added in sequence or not
            const updateContacts = contacts.map((contact) => {
                let contactInSequence = contactsInSequence.contacts.find(
                    (sequenceContact) => sequenceContact.email === contact.Email
                );

                if (contactInSequence) {
                    return {
                        recordID: contact.recordID,
                        id: contactInSequence.id,
                        Campaign: account.Campaign,
                        "In Campaign": true,
                    };
                }

                let contactInList = contactsInList.find(
                    (listContact) => listContact.email === contact.Email
                );

                if (contactInList) {
                    return {
                        recordID: contact.recordID,
                        id: contactInList.id,
                        Status: "Error",
                    };
                }

                return {
                    recordID: contact.recordID,
                    Status: "Error",
                };
            });

            const airtableFormatedRecords = await Airtable.formatAirtableContacts(updateContacts);

            // batch update contacts in AT with apollo id as id
            let batches = Math.ceil(airtableFormatedRecords.length / 10);
            for (let batch = 1; batch <= batches; batch++) {
                await Airtable.updateContacts(account["Base ID"], airtableFormatedRecords);
            }

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
