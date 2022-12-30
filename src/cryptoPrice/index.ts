import { AssetEntityPrice } from "../dbUpdator";

/**
 * get comma separated list of crypto ids, e.g. "1,1027" from cryptoAssets
 */
export function getCMCIds(cryptoAssets: CryptoAsset[]) {
    return cryptoAssets.map((asset) => asset.cmcId).join(",");
}

/**
 * Parses the data from coinmarketcap API
 */
export function parseCmcData(
    resData: CmcLatestQuoteResponse
): ParseCmcDataSuccessRes | ParseCmcDataFailureRes {
    const { data, status } = resData;

    // check status
    if (status.error_code !== 0) {
        return {
            isSuccess: false,
            message: status.error_message,
        };
    }

    // parse data
    const cryptoQuotes: CmcQuote[] = Object.values(data);
    const cryptoPrices: { [key: string]: number } = {};

    cryptoQuotes.forEach((quote) => {
        cryptoPrices[quote.id] = quote.quote.USD.price;
    });

    return {
        isSuccess: true,
        cryptoPrices,
    };
}

/**
 * Transform cryptoPrices to AssetEntityPrice for db consumption
 */
export function toAssetEntityPrice(
    cryptoPrices: {
        [key: CmcCryptoId]: number;
    },
    cryptoAssets: CryptoAsset[]
): AssetEntityPrice[] {
    return cryptoAssets.map((asset) => {
        const price = cryptoPrices[asset.cmcId];
        return {
            id: asset.id,
            price,
        };
    });
}

export type CryptoAsset = {
    id: number; // asset's number in my database
    symbol: string; // asset's symbol in my database
    cmcId: number; // asset's number in coinmarketcap
};

// interface for coinmarketcap API latest quote response
interface CmcLatestQuoteResponse {
    data: {
        [key: string]: CmcQuote;
    };
    status: {
        error_code: number;
        error_message: string;
    };
}

interface CmcQuote {
    id: number;
    name: string;
    symbol: string;
    quote: {
        USD: {
            price: number;
        };
    };
}

type CmcCryptoId = number;

interface ParseCmcDataSuccessRes {
    isSuccess: true;
    cryptoPrices: {
        [key: CmcCryptoId]: number;
    };
}

interface ParseCmcDataFailureRes {
    isSuccess: false;
    message: string;
}
