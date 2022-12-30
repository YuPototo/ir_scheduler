import prisma from "../prisma/client";

export interface AssetEntityPrice {
    id: number; // asset entity id
    price: number;
}

export async function updatePrice(prices: AssetEntityPrice[]) {
    // add a new priceTime
    const priceTime = await prisma.priceTime.create({ data: {} });

    // insert price in the db
    const priceData = prices.map((price) => ({
        assetEntityId: price.id,
        priceTimeId: priceTime.id,
        price: price.price,
    }));

    await prisma.price.createMany({ data: priceData });
}

export async function updateRank() {
    const users = await prisma.user.findMany({});

    // get all asset entities' latest prices

    const result = [];
    // calculate the roi for each user

    // update the rank
}

export default async function updatePriceAndRank(prices: AssetEntityPrice[]) {
    await updatePrice(prices);
    await updateRank();
}
