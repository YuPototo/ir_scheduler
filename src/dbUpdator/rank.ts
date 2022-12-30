import prisma from "../prisma/client";
import getInitialDollar from "./initialValue";

export async function updateRank() {
    console.log("updateRank: start -----");

    // get initial dollar value
    const initialCapital = await getInitialDollar();

    // get all asset entities' latest prices
    const prices = await getLatestPrices();

    // get all users
    const users = await prisma.user.findMany({});

    // todo: make result a sorted array
    const result = [];
    // calculate the roi for each user
    for (const user of users) {
        const userAssets = await prisma.userAsset.findMany({
            where: { userId: user.id },
        });
        let assetValue = 0;
        for (const userAsset of userAssets) {
            const price = prices[userAsset.assetEntityId];
            assetValue += userAsset.quantity * price;
        }
        const roi = (assetValue - initialCapital) / initialCapital;

        // todo: use bineary search to insert the user?
        result.push({ userId: user.id, roi });
    }

    // sort result
    result.sort((a, b) => b.roi - a.roi);

    // add rank and timestamp
    const date = new Date();
    const data = result.map((item, index) => ({
        ...item,
        rank: index + 1,
        timestamp: date,
    }));

    // add rank
    await prisma.$transaction([
        prisma.rank.deleteMany(),
        prisma.rank.createMany({
            data,
        }),
    ]);

    console.log("----- updateRank: end");
}

// get latest prices for every assets
export async function getLatestPrices(): Promise<{ [key: number]: number }> {
    const assetEntities = await prisma.assetEntity.findMany();

    const prices = {} as { [key: number]: number };

    for (const assetEntity of assetEntities) {
        const price = await prisma.price.findFirst({
            where: { assetEntityId: assetEntity.id },
            orderBy: { priceTimeId: "desc" },
        });

        if (price) {
            prices[assetEntity.id] = price.price;
        } else {
            // this is a critical error
            throw new Error(`No latest price found for ${assetEntity.id}`);
        }
    }
    return prices;
}
