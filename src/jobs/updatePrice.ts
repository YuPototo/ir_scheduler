import schedule from "node-schedule";
import { PrismaClient } from "@prisma/client";

export default function updatePrice() {
    console.log("start running update price and roi job");

    // every 5 mins
    const rule = "*/5 * * * *";

    schedule.scheduleJob(rule, async function () {
        // crypto quotes
        try {
        } catch (err) {
            console.log(err);
        }
    });
}
