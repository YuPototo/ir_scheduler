import schedule from "node-schedule";
import getCryptoQuotes from "../api/coinmarketcap";
import {
    CryptoAsset,
    getCMCIds,
    parseCmcData,
    toAssetEntityPrice,
} from "../cryptoPrice";
import updatePriceAndRank from "../dbUpdator";

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

export default function updatePriceAndRoi() {
    console.log("start scheduling update price and roi job");

    // every 5 mins
    // const rule = "*/5 * * * *";
    const rule = "*/5 * * * * *"; // every 5 seconds for dev
    schedule.scheduleJob(rule, updatePriceJob);
}

async function updatePriceJob() {
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

    // update price and roi in the db
    const assetEntityPrices = toAssetEntityPrice(cryptoPrices, cryptoAssets);
    try {
        await updatePriceAndRank(assetEntityPrices);
    } catch (err) {
        console.log(err);
        return;
    }
}
