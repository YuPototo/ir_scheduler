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
];

export default function updatePriceAndRank() {
    console.log("start scheduling update price and roi job");

    // every 5 mins
    const rule = "*/5 * * * *";
    // const rule = "*/5 * * * * *"; // every 5 seconds for dev

    schedule.scheduleJob(rule, async function () {
        console.log("run updatePriceAndRank job");

        await getAndUpdatePrice();
        await updateRank();
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
