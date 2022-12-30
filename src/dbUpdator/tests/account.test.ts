import prisma from "../../prisma/client";
import deleteUnnamedAccounts from "../account";

describe("deleteUnnamedAccounts()", () => {
    afterEach(async () => {
        await prisma.user.deleteMany();
    });

    it("should delete unnamed account", async () => {
        // create users
        // 1 user with name
        // 1 user without name, created 7 days ago
        // 1 user without name, created 6 days ago

        await prisma.user.createMany({
            data: [
                {
                    email: "user_1@test.com",
                    firstName: "User",
                    familyName: "One",
                },
                {
                    email: "user_2@test.com",
                    createdAt: new Date(
                        new Date().getTime() - 1000 * 60 * 60 * 24 * 7 - 1
                    ),
                },
                {
                    email: "user_3@test.com",
                    createdAt: new Date(
                        new Date().getTime() - 1000 * 60 * 60 * 24 * 6 - 1
                    ),
                },
            ],
        });

        const users_t0 = await prisma.user.findMany();
        expect(users_t0.length).toBe(3);

        // delete unnamed accounts that is 7 days old
        await deleteUnnamedAccounts(7);

        // check if unnamed account is deleted
        const users_t1 = await prisma.user.findMany();
        expect(users_t1.length).toBe(2);
        const user2 = await prisma.user.findUnique({
            where: { email: "user_2@test.com" },
        });
        expect(user2).toBeNull();

        // delete unnamed accounts that is 6 days old
        await deleteUnnamedAccounts(6);

        // check if unnamed account is deleted
        const users_t3 = await prisma.user.findMany();
        expect(users_t3.length).toBe(1);
        const user3 = await prisma.user.findUnique({
            where: { email: "user_3@test.com" },
        });
        expect(user3).toBeNull();
    });
});
