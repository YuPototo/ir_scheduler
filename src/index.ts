import deleteAccountsJob from "./jobs/deleteAccounts";
import updatePriceAndRank from "./jobs/updatePrice";

async function main() {
    deleteAccountsJob();
    updatePriceAndRank();
}

main();
