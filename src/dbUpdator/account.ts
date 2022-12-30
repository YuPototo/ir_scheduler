import prisma from "../prisma/client";

export default async function deleteUnnamedAccounts(daysSinceCreation: number) {
    const sevenDaysAgo = new Date(
        new Date().getTime() - 1000 * 60 * 60 * 24 * daysSinceCreation
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
}
