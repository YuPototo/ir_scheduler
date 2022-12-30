import schedule from "node-schedule";
import prisma from "../prisma/client";

export default function deleteAccounts() {
    console.log("start running delete accounts job");

    // 3 a.m. every day
    const rule = "3 * * *";

    schedule.scheduleJob(rule, async function () {
        console.log(
            "Start scheduling delete accounts job at " +
                new Date().toISOString()
        );

        // 7 days ago
        const sevenDaysAgo = new Date(
            new Date().getTime() - 1000 * 60 * 60 * 24 * 7
        );

        const users = await prisma.user.findMany({
            where: {
                firstName: null,
                familyName: null,
                createdAt: {
                    lt: sevenDaysAgo,
                },
            },
        });

        console.log("Found " + users.length + " users to be deleted");

        for (const user of users) {
            console.log(`Delete user ${user.id} (${user.email})`);
            await prisma.user.delete({
                where: {
                    id: user.id,
                },
            });
        }
    });
}
