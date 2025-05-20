import type { Stock } from "@/lib/types";
import {
  generateMockChartData,
  getStockName,
  safeParseFloat,
} from "../utils/stock";

const TWELVE_DATA_API_KEY = process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY ?? "";

if (!TWELVE_DATA_API_KEY) {
  console.warn("Missing Twelve Data API Key");
}

const BASE_URL = "https://api.twelvedata.com";

/**
 * Fetch stock price, quote, and chart data from Twelve Data
 */
export async function fetchStockData(symbols: string[]): Promise<Stock[]> {
  try {
    const [prices, quotes, series] = await Promise.all([
      fetchBatch(symbols, "price"),
      fetchBatch(symbols, "quote"),
      fetchBatch(symbols, "time_series", {
        interval: "1day",
        outputsize: "30",
      }),
    ]);

    return symbols.map((symbol, i) => {
      const price = safeParseFloat(prices[i]?.price, 100);
      const priceChange = safeParseFloat(quotes[i]?.change);
      const priceChangePercent = safeParseFloat(quotes[i]?.percent_change);
      const rawSeries = series[i];

      const chartData =
        rawSeries?.values?.length > 0
          ? rawSeries.values
              .slice(0, 30)
              .map((v: any) => safeParseFloat(v.close, price))
              .reverse()
          : generateMockChartData(30, price, priceChange >= 0);

      const shares =
        i < 2 ? safeParseFloat((Math.random() * 20).toFixed(6)) : 0;
      const averagePrice = i < 2 ? price * (0.8 + Math.random() * 0.4) : 0;

      return {
        symbol,
        name: getStockName(symbol),
        price,
        priceChange,
        priceChangePercent,
        chartData,
        shares,
        averagePrice,
      };
    });
  } catch (err) {
    console.error("fetchStockData failed:", err);
    return [];
  }
}

/**
 * Generic batch fetcher for multiple symbols
 */
async function fetchBatch(
  symbols: string[],
  endpoint: "price" | "quote" | "time_series",
  extraParams: Record<string, string> = {}
) {
  return Promise.all(
    symbols.map(async (symbol) => {
      const url = new URL(`${BASE_URL}/${endpoint}`);
      url.searchParams.set("symbol", symbol);
      url.searchParams.set("apikey", TWELVE_DATA_API_KEY);

      Object.entries(extraParams).forEach(([key, value]) =>
        url.searchParams.set(key, value)
      );

      const res = await fetch(url.toString());
      return await res.json();
    })
  );
}
