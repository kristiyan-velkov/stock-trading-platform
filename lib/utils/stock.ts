import { Stock } from "../types";

export function getStockName(symbol: string): string {
  const stockNames: Record<string, string> = {
    NVDA: "Nvidia",
    AAPL: "Apple",
    TSLA: "Tesla",
    MSFT: "Microsoft",
    AMZN: "Amazon",
    GOOGL: "Google",
  };
  return stockNames[symbol] || symbol;
}

export function generateMockChartData(
  points: number,
  currentPrice: number,
  isPositive: boolean
): number[] {
  const data: number[] = [];
  let value = currentPrice * 0.9;
  const trendFactor = isPositive ? 1.01 : 0.99;

  for (let i = 0; i < points; i++) {
    const randomFactor = 0.98 + Math.random() * 0.04;
    value *= trendFactor * randomFactor;
    data.push(Number(value.toFixed(2)));
  }

  data[points - 1] = Number(currentPrice.toFixed(2));

  return data;
}

export function getRandomChange(price: number): number {
  const change = (Math.random() * 10 - 5) * (price / 100);
  return Number(change.toFixed(2));
}

export function getRandomShares(): number {
  return Number((Math.random() * 20).toFixed(6));
}

export function getAveragePrice(price: number): number {
  const factor = 0.8 + Math.random() * 0.4;
  return Number((price * factor).toFixed(2));
}

export function formatCurrency(value: number): string {
  return isNaN(value) ? "0.00" : value.toFixed(2);
}

export function formatPercentage(value: number): string {
  return `${isNaN(value) ? 0 : Math.abs(value).toFixed(2)}%`;
}

export function sanitizeStock(stock: Stock): Stock {
  return {
    ...stock,
    price: isNaN(stock.price) ? 0 : stock.price,
    priceChange: isNaN(stock.priceChange) ? 0 : stock.priceChange,
    priceChangePercent: isNaN(stock.priceChangePercent)
      ? 0
      : stock.priceChangePercent,
    shares: isNaN(stock.shares ?? 0) ? 0 : stock.shares ?? 0,
    averagePrice: isNaN(stock.averagePrice ?? 0) ? 0 : stock.averagePrice ?? 0,
  };
}

export const safeParseFloat = (value: any, fallback = 0): number => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
};

export const sanitizeNumber = (value: unknown, fallback = 0): number =>
  typeof value === "number" && !isNaN(value) ? value : fallback;
