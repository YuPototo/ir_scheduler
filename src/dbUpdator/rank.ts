import prisma from "../prisma/client";

export async function updateRank() {
    const users = await prisma.user.findMany({});

    // get all asset entities' latest prices

    const result = [];
    // calculate the roi for each user

    // update the rank
}
