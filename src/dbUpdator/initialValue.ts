import prisma from "../prisma/client";

/**
 * Get initial dollar amount
 */
export default async function getInitialDollar() {
    const initialDollarParam = await prisma.parameter.findFirst({
        where: {
            key: "initialDollar",
        },
    });

    if (!initialDollarParam) {
        throw new Error("initialDollar not found");
    }

    return Number(initialDollarParam.value);
}
