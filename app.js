const { emailCampaignApollo } = require("./index");

(async () => {
    try {
        await emailCampaignApollo();
    } catch (error) {
        console.log(error);
    }
})();
