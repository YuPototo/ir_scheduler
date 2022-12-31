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
        // round price to 2 digits
        price: Math.round(price.price * 100) / 100,
    }));

    await prisma.price.createMany({ data: priceData });
}
