import {
  getStockName,
  generateMockChartData,
  getRandomChange,
  getRandomShares,
  getAveragePrice,
  formatCurrency,
  formatPercentage,
  sanitizeStock,
  safeParseFloat,
} from "@/lib/utils/stock";
import type { Stock } from "@/lib/types";

describe("getStockName", () => {
  it("returns mapped stock name", () => {
    expect(getStockName("AAPL")).toBe("Apple");
  });

  it("returns symbol if name not mapped", () => {
    expect(getStockName("XYZ")).toBe("XYZ");
  });
});

describe("generateMockChartData", () => {
  it("generates an array of correct length", () => {
    const data = generateMockChartData(30, 100, true);
    expect(data).toHaveLength(30);
  });

  it("sets the last point to the current price", () => {
    const data = generateMockChartData(10, 99.99, false);
    expect(data[data.length - 1]).toBe(99.99);
  });
});

describe("getRandomChange", () => {
  it("returns a number within plausible ±5% range", () => {
    const price = 200;
    const change = getRandomChange(price);
    expect(change).toBeGreaterThanOrEqual(-10);
    expect(change).toBeLessThanOrEqual(10);
  });
});

describe("getRandomShares", () => {
  it("returns a number between 0 and 20", () => {
    const shares = getRandomShares();
    expect(shares).toBeGreaterThanOrEqual(0);
    expect(shares).toBeLessThanOrEqual(20);
  });
});

describe("getAveragePrice", () => {
  it("returns a number 80%-120% of price", () => {
    const price = 100;
    const avg = getAveragePrice(price);
    expect(avg).toBeGreaterThanOrEqual(80);
    expect(avg).toBeLessThanOrEqual(120);
  });
});

describe("formatCurrency", () => {
  it("formats a valid number to 2 decimal places", () => {
    expect(formatCurrency(123.456)).toBe("123.46");
  });

  it("returns '0.00' for NaN", () => {
    expect(formatCurrency(NaN)).toBe("0.00");
  });
});

describe("formatPercentage", () => {
  it("formats percentage to positive string", () => {
    expect(formatPercentage(-5.432)).toBe("5.43%");
  });

  it("returns '0%' for NaN", () => {
    expect(formatPercentage(NaN)).toBe("0%");
  });
});

describe("sanitizeStock", () => {
  it("replaces NaN values with defaults", () => {
    const badStock = {
      symbol: "AAPL",
      name: "Apple",
      price: NaN,
      priceChange: NaN,
      priceChangePercent: NaN,
      chartData: [],
      shares: NaN,
      averagePrice: NaN,
    } as Stock;

    const sanitized = sanitizeStock(badStock);
    expect(sanitized.price).toBe(0);
    expect(sanitized.priceChange).toBe(0);
    expect(sanitized.priceChangePercent).toBe(0);
    expect(sanitized.shares).toBe(0);
    expect(sanitized.averagePrice).toBe(0);
  });

  it("retains valid values", () => {
    const validStock = {
      symbol: "TSLA",
      name: "Tesla",
      price: 250,
      priceChange: 5,
      priceChangePercent: 2,
      chartData: [],
      shares: 1.234,
      averagePrice: 240,
    } as Stock;

    const sanitized = sanitizeStock(validStock);
    expect(sanitized).toEqual(validStock);
  });
});

describe("safeParseFloat", () => {
  it("returns parsed float for valid input", () => {
    expect(safeParseFloat("123.45")).toBe(123.45);
  });

  it("returns fallback for invalid input", () => {
    expect(safeParseFloat("not-a-number", 42)).toBe(42);
  });

  it("returns 0 fallback by default", () => {
    expect(safeParseFloat(undefined)).toBe(0);
  });
});
