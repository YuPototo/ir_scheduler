import deleteAccountsJob from "./jobs/deleteAccounts";
import updatePriceAndRoi from "./jobs/updatePrice";

async function main() {
    deleteAccountsJob();
    updatePriceAndRoi();
}

main();
