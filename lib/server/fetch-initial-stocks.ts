import { fetchStockData } from "./api";
import type { Stock } from "../types";
import { sanitizeNumber } from "../utils/stock";

export async function getInitialStocks(symbols: string[]): Promise<Stock[]> {
  const rawData = await fetchStockData(symbols);

  return rawData.map((stock) => ({
    ...stock,
    price: sanitizeNumber(stock.price),
    priceChange: sanitizeNumber(stock.priceChange),
    priceChangePercent: sanitizeNumber(stock.priceChangePercent),
    shares: sanitizeNumber(stock.shares),
    averagePrice: sanitizeNumber(stock.averagePrice),
  }));
}
