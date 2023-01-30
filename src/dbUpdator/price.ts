import prisma from "../prisma/client";

export interface AssetEntityPrice {
    id: number; // asset entity id
    price: number;
}

export async function updatePrice(prices: AssetEntityPrice[]) {
    for (const price of prices) {
        const { id: assetId, price: assetPrice } = price;

        // rounded to 2 digits
        const priceRounded = Math.round(assetPrice * 100) / 100;

        await prisma.assetEntity.update({
            where: {
                id: assetId,
            },
            data: {
                price: priceRounded,
            },
        });
    }
}
