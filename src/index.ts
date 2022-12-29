import deleteAccountsJob from "./jobs/deleteAccounts";
import updatePrice from "./jobs/updatePrice";

async function main() {
    deleteAccountsJob();
    updatePrice();
}

main();
