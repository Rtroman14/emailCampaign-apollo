const axios = require("axios");

module.exports = class ApolloApi {
    constructor(apiKey) {
        if (!apiKey) {
            throw new Error("Using Apollo requires an API key.");
        }

        this.apiKey = apiKey;
    }

    createContact = async (contact, account) => {
        contact = this.makeContact(contact, account);

        try {
            const { data } = await axios.post("https://api.apollo.io/v1/contacts", contact);

            return data;
        } catch (error) {
            console.log(error);
            return false;
        }
    };

    searchUsers = async () => {
        try {
            const { data } = await axios.get(
                `https://api.apollo.io/v1/email_accounts?api_key=${this.apiKey}`
            );

            return data;
        } catch (error) {
            console.log(error);
            return false;
        }
    };

    addContactsToSequence = async (campaignID, contact_ids, accountID) => {
        try {
            const { data } = await axios.post(
                `https://api.apollo.io/v1/emailer_campaigns/${campaignID}/add_contact_ids`,
                {
                    api_key: this.apiKey,
                    contact_ids,
                    emailer_campaign_id: campaignID,
                    send_email_from_email_account_id: accountID,
                }
            );

            return data;
        } catch (error) {
            console.log(error);
            return false;
        }
    };

    makeContact = (contact, account) => ({
        api_key: this.apiKey,
        label_names: contact.Source ? [`${account} - ${contact.Source}`] : [`${account} - Reonomy`],
        first_name: contact["First Name"] || "",
        last_name: contact["Last Name"] || "",
        organization_name: contact["Company Name"] || "",
        title: contact.Title || "",
        email: contact.Email,
        present_raw_address: contact.Address || "",
    });
};
