import axios from "axios";
const CMC_API_KEY = process.env.CMC_API_KEY;

if (!CMC_API_KEY) {
    throw Error("No CMC_API_KEY in env");
}

/**
 * Fetches the latest quotes for the given cryptoIds
 * @param cryptoIds comma separated list of crypto ids, e.g. "1,1027"
 */
export default async function getCryptoQuotes(cryptoIds: string) {
    const baseURL = "https://pro-api.coinmarketcap.com";

    let response;
    try {
        response = await axios.get(
            `${baseURL}/v2/cryptocurrency/quotes/latest?id=${cryptoIds}`,
            {
                headers: {
                    "X-CMC_PRO_API_KEY": CMC_API_KEY,
                },
            }
        );
    } catch (err) {
        console.log("Error when fetching coinMarketCap API");
        console.log(err);
        return;
    }

    return response.data;
}
