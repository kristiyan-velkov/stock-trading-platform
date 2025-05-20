import { fetchStockData } from "@/lib/server/api";
import { sanitizeNumber } from "@/lib/utils/stock";
import type { Stock } from "@/lib/types";
import { getInitialStocks } from "@/lib/server/fetch-initial-stocks";

jest.mock("@/lib/server/api", () => ({
  fetchStockData: jest.fn(),
}));

jest.mock("@/lib/utils/stock", () => ({
  ...jest.requireActual("@/lib/utils/stock"),
  sanitizeNumber: jest.fn((n) => (isNaN(n) ? 0 : n)),
}));

describe("getInitialStocks", () => {
  const mockRawData: Stock[] = [
    {
      symbol: "AAPL",
      name: "Apple",
      price: 150.45,
      priceChange: NaN,
      priceChangePercent: -1.23,
      shares: 10,
      averagePrice: NaN,
      chartData: [150, 151],
    },
  ];

  beforeEach(() => {
    (fetchStockData as jest.Mock).mockResolvedValue(mockRawData);
    (sanitizeNumber as jest.Mock).mockImplementation((n) =>
      isNaN(n) ? 0 : Number(n)
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetches and sanitizes stock data", async () => {
    const result = await getInitialStocks(["AAPL"]);

    expect(fetchStockData).toHaveBeenCalledWith(["AAPL"]);
    expect(sanitizeNumber).toHaveBeenCalledTimes(5);
    expect(result[0]).toEqual({
      ...mockRawData[0],
      price: 150.45,
      priceChange: 0,
      priceChangePercent: -1.23,
      shares: 10,
      averagePrice: 0,
    });
  });
});
