import prisma from "../prisma/client";
import getInitialDollar from "./initialValue";

export async function updateRank() {
    console.log("updateRank: start -----");

    // get initial dollar value
    const initialCapital = await getInitialDollar();

    // get all users
    const users = await prisma.user.findMany({});

    // get all asset prices
    const prices: AssetPrices = await getAssetPrices();

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

type AssetPrices = {
    [assetId: string]: number;
};

/**
 * Get all asset prices
 */
export async function getAssetPrices(): Promise<AssetPrices> {
    const assets = await prisma.assetEntity.findMany();

    let output = {} as AssetPrices;
    for (const asset of assets) {
        Object.assign(output, { [asset.id]: asset.price });
    }
    return output;
}
