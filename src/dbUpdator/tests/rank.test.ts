import { AssetType, ParameterType, User } from "@prisma/client";
import prisma from "../../prisma/client";
import { updateRank, getAssetPrices } from "../rank";
import { updatePrice } from "../price";

describe("updateRank()", () => {
    const user_1_email = "user_1@test.com";
    const user_2_email = "user_2@test.com";
    const user_3_email = "user_3@test.com";

    const assetEntityId = {
        USD: 1,
        BTC: 2,
        ETH: 3,
    };

    beforeAll(async () => {
        /**
         *  create 3 users
         *  1. user 1: 1000 USD, 1 BTC, 2 ETH
         *  2. user 2: 1000 USD, 2 BTC, 1 ETH
         *  3. user 3: 3 BTC
         */
        const users = [
            {
                email: user_1_email,
                firstName: "User",
                familyName: "One",
            },
            {
                email: user_2_email,
                firstName: "User",
                familyName: "Two",
            },
            {
                email: user_3_email,
                firstName: "User",
                familyName: "Three",
            },
        ];

        await prisma.user.createMany({ data: users });

        // add asset entities

        const assetEntities = [
            {
                id: assetEntityId.USD,
                name: "US Dollar",
                symbol: "USD",
                assetType: AssetType.CASH,
                buyable: false,
                price: 1,
            },
            {
                id: assetEntityId.BTC,
                name: "Bitcoin",
                symbol: "BTC",
                assetType: AssetType.CRYPTO,
                price: 20000,
            },
            {
                id: assetEntityId.ETH,
                name: "Ethereum",
                symbol: "ETH",
                assetType: AssetType.CRYPTO,
                price: 2000,
            },
        ];
        await prisma.assetEntity.createMany({ data: assetEntities });

        // add user assets
        const user_1 = (await prisma.user.findFirst({
            where: { email: user_1_email },
        })) as User;
        const user_2 = (await prisma.user.findFirst({
            where: { email: user_2_email },
        })) as User;
        const user_3 = (await prisma.user.findFirst({
            where: { email: user_3_email },
        })) as User;

        const userOneAssets = [
            {
                userId: user_1.id,
                assetEntityId: assetEntityId.USD,
                quantity: 1000,
            },
            {
                userId: user_1.id,
                assetEntityId: assetEntityId.BTC,
                quantity: 1,
            },
            {
                userId: user_1.id,
                assetEntityId: assetEntityId.ETH,
                quantity: 2,
            },
        ];

        const userTwoAssets = [
            {
                userId: user_2.id,
                assetEntityId: assetEntityId.USD,
                quantity: 1000,
            },
            {
                userId: user_2.id,
                assetEntityId: assetEntityId.BTC,
                quantity: 2,
            },
            {
                userId: user_2.id,
                assetEntityId: assetEntityId.ETH,
                quantity: 1,
            },
        ];

        const userThreeAssets = [
            {
                userId: user_3.id,
                assetEntityId: assetEntityId.BTC,
                quantity: 3,
            },
        ];

        await prisma.userAsset.createMany({
            data: [...userOneAssets, ...userTwoAssets, ...userThreeAssets],
        });

        // add param
        await prisma.parameter.create({
            data: {
                key: "initialDollar",
                value: "10000",
                type: ParameterType.NUMBER,
            },
        });
    });

    afterAll(async () => {
        await prisma.userAsset.deleteMany();
        await prisma.user.deleteMany();
        await prisma.assetEntity.deleteMany();
        await prisma.parameter.deleteMany();
        await prisma.rank.deleteMany();

        await prisma.$disconnect();
    });

    it("should update rank", async () => {
        await updateRank();

        const ranks = await prisma.rank.findMany();
        expect(ranks.length).toBe(3);

        /**
         * user_1's asset value:
         *  - 1000 usd * 1 = 1000
         *  - 1 btc * 20000 = 20000
         *  - 2 eth * 2000 = 4000
         *  all = 25000
         *
         *  roi = (25000 - 10000) / 10000 = 1.5
         */
        const user_1 = (await prisma.user.findFirst({
            where: { email: user_1_email },
        })) as User;
        const user_1_rank = ranks.find((rank) => rank.userId === user_1.id);
        expect(user_1_rank?.roi).toBe(1.5);

        /**
         * user_2's asset value:
         * - 1000 usd * 1 = 1000
         * - 2 btc * 20000 = 40000
         * - 1 eth * 2000 = 2000
         * all = 43000
         *
         * roi = (43000 - 10000) /10000 = 3.3
         */
        const user_2 = (await prisma.user.findFirst({
            where: { email: user_2_email },
        })) as User;
        const user_2_rank = ranks.find((rank) => rank.userId === user_2.id);
        expect(user_2_rank?.roi).toBe(3.3);

        /**
         * user_3's asset value:
         * - 3 btc * 20000 = 60000
         *
         * roi = (60000 - 10000) /10000 = 5
         */
        const user_3 = (await prisma.user.findFirst({
            where: { email: user_3_email },
        })) as User;
        const user_3_rank = ranks.find((rank) => rank.userId === user_3.id);
        expect(user_3_rank?.roi).toBe(5);

        /**
         * rank: user_3 > user_2 > user_1
         */
        expect(user_3_rank?.rank).toBe(1);
        expect(user_2_rank?.rank).toBe(2);
        expect(user_1_rank?.rank).toBe(3);
    });

    it("should update new rank when price is updated", async () => {
        await updatePrice([
            {
                id: assetEntityId.BTC,
                price: 10,
            },
            {
                id: assetEntityId.ETH,
                price: 20,
            },
        ]);

        await updateRank();

        const ranks = await prisma.rank.findMany();
        expect(ranks.length).toBe(3);

        /**
         * user_1's asset value:
         *  - 1000 usd * 1 = 1000
         *  - 1 btc * 10 = 10
         *  - 2 eth * 20 = 40
         *  all = 1050
         *
         *  roi = (1050 - 10000) / 10000 = -0.895
         */
        const user_1 = (await prisma.user.findFirst({
            where: { email: user_1_email },
        })) as User;
        const user_1_rank = ranks.find((rank) => rank.userId === user_1.id);
        expect(user_1_rank?.roi).toBe(-0.895);

        /**
         * user_2's asset value:
         * - 1000 usd * 1 = 1000
         * - 2 btc * 10 = 20
         * - 1 eth * 20 = 20
         * all = 1040
         *
         * roi = (1040 - 10000) /10000 = -0.896
         */
        const user_2 = (await prisma.user.findFirst({
            where: { email: user_2_email },
        })) as User;
        const user_2_rank = ranks.find((rank) => rank.userId === user_2.id);
        expect(user_2_rank?.roi).toBe(-0.896);

        /**
         * user_3's asset value:
         * - 3 btc * 10 = 30
         * all = 30
         *
         * roi = (30 - 10000) /10000 = -0.997
         */
        const user_3 = (await prisma.user.findFirst({
            where: { email: user_3_email },
        })) as User;
        const user_3_rank = ranks.find((rank) => rank.userId === user_3.id);
        expect(user_3_rank?.roi).toBe(-0.997);

        /**
         * rank: user_1 > user_2 > user_3
         */
        expect(user_1_rank?.rank).toBe(1);
        expect(user_2_rank?.rank).toBe(2);
        expect(user_3_rank?.rank).toBe(3);
    });
});

describe("getAssetPrices()", () => {
    const assetEntityId = {
        USD: 1,
        BTC: 2,
        ETH: 3,
    };

    beforeAll(async () => {
        const assetEntities = [
            {
                id: assetEntityId.USD,
                name: "US Dollar",
                symbol: "USD",
                assetType: AssetType.CASH,
                buyable: false,
                price: 1,
            },
            {
                id: assetEntityId.BTC,
                name: "Bitcoin",
                symbol: "BTC",
                assetType: AssetType.CRYPTO,
                price: 20000,
            },
            {
                id: assetEntityId.ETH,
                name: "Ethereum",
                symbol: "ETH",
                assetType: AssetType.CRYPTO,
                price: 2000,
            },
        ];
        await prisma.assetEntity.createMany({ data: assetEntities });
    });

    afterAll(async () => {
        await prisma.assetEntity.deleteMany();
    });

    it("should get prices", async () => {
        const prices = await getAssetPrices();

        expect(prices["1"]).toBe(1);
        expect(prices["2"]).toBe(20000);
        expect(prices["3"]).toBe(2000);
    });
});
