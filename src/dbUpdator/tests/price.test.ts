import { AssetType, AssetEntity } from "@prisma/client";
import prisma from "../../prisma/client";
import { updatePrice } from "../price";

describe("updatePrice()", () => {
    let btcId = 1000;
    let ethId = 1001;

    beforeEach(async () => {
        // asset entities
        const assetEntities: AssetEntity[] = [
            {
                id: btcId,
                name: "Bitcoin",
                symbol: "BTC",
                assetType: AssetType.CRYPTO,
                buyable: true,
                price: 1,
            },
            {
                id: ethId,
                name: "Ethereum",
                symbol: "ETH",
                assetType: AssetType.CRYPTO,
                buyable: true,
                price: 2,
            },
        ];

        await prisma.assetEntity.createMany({ data: assetEntities });
    });

    afterEach(async () => {
        await prisma.assetEntity.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it("should update price", async () => {
        await updatePrice([
            { id: btcId, price: 10000 },
            { id: ethId, price: 1000 },
        ]);

        // check btc updated
        const btc = await prisma.assetEntity.findUnique({
            where: { id: btcId },
        });

        expect(btc?.price).toBe(10000);

        // check eth price updated'
        const eth = await prisma.assetEntity.findUnique({
            where: { id: ethId },
        });

        expect(eth?.price).toBe(1000);
    });

    it("price should round to 2 digits", async () => {
        await updatePrice([
            { id: btcId, price: 10000.123 },
            { id: ethId, price: 1000.125 },
        ]);

        // check btc updated
        const btc = await prisma.assetEntity.findUnique({
            where: { id: btcId },
        });

        expect(btc?.price).toBe(10000.12);

        // check eth price updated'
        const eth = await prisma.assetEntity.findUnique({
            where: { id: ethId },
        });

        expect(eth?.price).toBe(1000.13);
    });
});
