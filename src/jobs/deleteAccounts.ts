import schedule from "node-schedule";
import deleteUnnamedAccounts from "../dbUpdator/account";

export default function deleteAccountsJob() {
    console.log("start running delete accounts job");

    // 3 a.m. every day
    const rule = "3 * * *";

    schedule.scheduleJob(rule, async function () {
        console.log(
            "Start scheduling delete accounts job at " +
                new Date().toISOString()
        );

        await deleteUnnamedAccounts(7);
    });
}
