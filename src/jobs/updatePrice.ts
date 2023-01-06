import schedule from "node-schedule";
import getCryptoQuotes from "../api/coinmarketcap";
import {
    CryptoAsset,
    getCMCIds,
    parseCmcData,
    toAssetEntityPrice,
} from "../cryptoPrice";
import { updatePrice } from "../dbUpdator/price";
import { updateRank } from "../dbUpdator/rank";

const cryptoAssets: CryptoAsset[] = [
    {
        id: 2,
        symbol: "BTC",
        cmcId: 1,
    },
    {
        id: 3,
        symbol: "ETH",
        cmcId: 1027,
    },
    {
        id: 4,
        symbol: "BNB",
        cmcId: 1839,
    },
    {
        id: 5,
        symbol: "XRP",
        cmcId: 52,
    },
    {
        id: 6,
        symbol: "DOGE",
        cmcId: 74,
    },
    {
        id: 7,
        symbol: "ADA",
        cmcId: 2010,
    },
    {
        id: 8,
        symbol: "MATIC",
        cmcId: 3890,
    },
    {
        id: 9,
        symbol: "LTC",
        cmcId: 2,
    },
    {
        id: 10,
        symbol: "DOT",
        cmcId: 6636,
    },
    {
        id: 11,
        symbol: "SOL",
        cmcId: 5426,
    },
];

export default function updatePriceAndRank() {
    console.log("start scheduling update price and roi job");

    // every 5 mins
    const rule = "*/5 * * * *";
    // const rule = "*/30 * * * * *"; // every 30 seconds for dev purpose

    schedule.scheduleJob(rule, async function () {
        console.log("run updatePriceAndRank job");

        try {
            await getAndUpdatePrice();
        } catch (err) {
            console.log("failed to update price", err);
        }

        try {
            await updateRank();
        } catch (err) {
            console.log("failed to update rank", err);
        }
    });
}

async function getAndUpdatePrice() {
    console.log("get and update price: start -----");

    // get crypto quotes
    const cryptoIds = getCMCIds(cryptoAssets);
    const quoteRes = await getCryptoQuotes(cryptoIds);

    // parse the data
    const parsedResult = parseCmcData(quoteRes);

    if (!parsedResult.isSuccess) {
        console.log("failed to parse cmc data", parsedResult.message);
        return;
    }

    const cryptoPrices = parsedResult.cryptoPrices;

    // update price in the db
    const assetEntityPrices = toAssetEntityPrice(cryptoPrices, cryptoAssets);
    try {
        await updatePrice(assetEntityPrices);
    } catch (err) {
        console.log(err);
        return;
    }
    console.log(" ----- get and update price: end");
}
