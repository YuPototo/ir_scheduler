import { AssetType } from "@prisma/client";
import prisma from "../../prisma/client";
import { updatePrice } from "../price";

describe("updatePrice()", () => {
    const btcId = 2;
    const ethId = 3;

    beforeEach(async () => {
        // asset entities
        const assetEntities = [
            {
                id: btcId,
                name: "Bitcoin",
                symbol: "BTC",
                assetType: AssetType.CRYPTO,
            },
            {
                id: ethId,
                name: "Ethereum",
                symbol: "ETH",
                assetType: AssetType.CRYPTO,
            },
        ];

        await prisma.assetEntity.createMany({ data: assetEntities });
    });

    afterEach(async () => {
        await prisma.price.deleteMany();
        await prisma.assetEntity.deleteMany();
        await prisma.priceTime.deleteMany();
    });

    it("should update price", async () => {
        // t1: create price times
        await updatePrice([
            { id: btcId, price: 10000 },
            { id: ethId, price: 1000 },
        ]);

        // check if price is updated
        const priceTime_t1 = await prisma.priceTime.findFirst({
            orderBy: { id: "desc" },
        });
        expect(priceTime_t1).not.toBeNull();

        const price_btc_t1 = await prisma.price.findUnique({
            where: {
                assetEntityId_priceTimeId: {
                    assetEntityId: btcId,
                    priceTimeId: priceTime_t1!.id,
                },
            },
        });
        expect(price_btc_t1).not.toBeNull();
        expect(price_btc_t1!.price).toBe(10000);

        const price_eth_t1 = await prisma.price.findUnique({
            where: {
                assetEntityId_priceTimeId: {
                    assetEntityId: ethId,
                    priceTimeId: priceTime_t1!.id,
                },
            },
        });
        expect(price_eth_t1).not.toBeNull();
        expect(price_eth_t1!.price).toBe(1000);

        // t2 create price times
        await updatePrice([
            { id: btcId, price: 20000 },
            { id: ethId, price: 3000 },
        ]);

        // check if price is updated
        const priceTime_t2 = await prisma.priceTime.findFirst({
            orderBy: { id: "desc" },
        });
        expect(priceTime_t2).not.toBeNull();
        expect(priceTime_t2!.id).not.toBe(priceTime_t1!.id);

        const price_btc_t2 = await prisma.price.findUnique({
            where: {
                assetEntityId_priceTimeId: {
                    assetEntityId: btcId,
                    priceTimeId: priceTime_t2!.id,
                },
            },
        });
        expect(price_btc_t2).not.toBeNull();
        expect(price_btc_t2!.price).toBe(20000);

        const price_eth_t2 = await prisma.price.findUnique({
            where: {
                assetEntityId_priceTimeId: {
                    assetEntityId: ethId,
                    priceTimeId: priceTime_t2!.id,
                },
            },
        });
        expect(price_eth_t2).not.toBeNull();
        expect(price_eth_t2!.price).toBe(3000);
    });
});
