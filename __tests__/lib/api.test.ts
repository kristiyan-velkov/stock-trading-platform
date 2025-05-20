import { fetchStockData } from "@/lib/server/api";
import * as stockUtils from "@/lib/utils/stock";

const mockPrices = [{ price: "150" }, { price: "250" }, { price: "350" }];
const mockQuotes = [
  { change: "2.5", percent_change: "1.5" },
  { change: "-1.5", percent_change: "-0.5" },
  { change: "0.0", percent_change: "0.0" },
];
const mockSeries = [
  {
    values: Array.from({ length: 30 }, (_, i) => ({
      close: `${150 + i}`,
    })),
  },
  {
    values: Array.from({ length: 30 }, (_, i) => ({
      close: `${250 - i}`,
    })),
  },
  {
    values: [],
  },
];

jest.mock("@/lib/utils/stock", () => ({
  ...jest.requireActual("@/lib/utils/stock"),
  safeParseFloat: jest.fn((value: any, fallback: number = 0) =>
    isNaN(parseFloat(value)) ? fallback : parseFloat(value)
  ),
  generateMockChartData: jest.fn(() => Array(30).fill(100)),
  getStockName: jest.fn((symbol: string) => `Mocked ${symbol}`),
}));

describe("fetchStockData", () => {
  beforeEach(() => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockPrices[0]),
      })
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockPrices[1]),
      })
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockPrices[2]),
      })
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockQuotes[0]),
      })
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockQuotes[1]),
      })
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockQuotes[2]),
      })
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockSeries[0]),
      })
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockSeries[1]),
      })
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockSeries[2]),
      });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetches and returns formatted stock data", async () => {
    const symbols = ["AAPL", "GOOG", "TSLA"];
    const result = await fetchStockData(symbols);

    expect(global.fetch).toHaveBeenCalledTimes(9);
    expect(result).toHaveLength(3);

    expect(result[0]).toEqual(
      expect.objectContaining({
        symbol: "AAPL",
        name: "Mocked AAPL",
        price: 150,
        priceChange: 2.5,
        priceChangePercent: 1.5,
        chartData: expect.any(Array),
        shares: expect.any(Number),
        averagePrice: expect.any(Number),
      })
    );

    expect(result[2].shares).toBe(0);
    expect(result[2].averagePrice).toBe(0);
    expect(stockUtils.generateMockChartData).toHaveBeenCalled();
  });
});
