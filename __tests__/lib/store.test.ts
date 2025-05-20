import { useStockStore } from "@/store";
import type { Stock } from "@/lib/types";

const mockStocks: Stock[] = [
  {
    symbol: "AAPL",
    name: "Apple",
    price: 150,
    priceChange: 5,
    priceChangePercent: 3.33,
    chartData: [145, 147, 149, 150],
    shares: 10,
    averagePrice: 140,
  },
  {
    symbol: "MSFT",
    name: "Microsoft",
    price: 300,
    priceChange: -2,
    priceChangePercent: -0.67,
    chartData: [302, 301, 299, 300],
    shares: 5,
    averagePrice: 290,
  },
];

describe("Stock Store", () => {
  beforeEach(() => {
    useStockStore.setState({
      stocks: [],
      selectedStock: null,
      portfolioValue: 0,
      currency: "USD",
    });
  });

  it("should set stocks and calculate portfolio value", () => {
    useStockStore.getState().setStocks(mockStocks);

    const state = useStockStore.getState();
    expect(state.stocks).toEqual(mockStocks);

    expect(state.portfolioValue).toBeCloseTo(3000);
  });

  it("should set selected stock", () => {
    const stock = mockStocks[0];

    useStockStore.getState().setSelectedStock(stock);

    expect(useStockStore.getState().selectedStock).toEqual(stock);
  });

  it("should update a stock", () => {
    useStockStore.getState().setStocks(mockStocks);

    useStockStore.getState().updateStock("AAPL", {
      price: 160,
      priceChange: 10,
      priceChangePercent: 6.67,
    });

    const state = useStockStore.getState();
    const updatedStock = state.stocks.find((s) => s.symbol === "AAPL");

    expect(updatedStock?.price).toBe(160);
    expect(updatedStock?.priceChange).toBe(10);
    expect(updatedStock?.priceChangePercent).toBe(6.67);

    expect(state.portfolioValue).toBeCloseTo(3100);
  });

  it("should update selected stock when it matches the updated stock", () => {
    useStockStore.getState().setStocks(mockStocks);
    useStockStore.getState().setSelectedStock(mockStocks[0]);

    useStockStore.getState().updateStock("AAPL", { price: 160 });

    const state = useStockStore.getState();
    expect(state.selectedStock?.price).toBe(160);
  });

  it("should not update selected stock when it does not match the updated stock", () => {
    useStockStore.getState().setStocks(mockStocks);
    useStockStore.getState().setSelectedStock(mockStocks[1]);

    useStockStore.getState().updateStock("AAPL", { price: 160 });

    const state = useStockStore.getState();
    expect(state.selectedStock?.price).toBe(300); // MSFT price unchanged
  });

  it("should handle NaN values when calculating portfolio value", () => {
    const stocksWithNaN: Stock[] = [
      {
        ...mockStocks[0],
        price: Number.NaN,
      },
      mockStocks[1],
    ];

    useStockStore.getState().setStocks(stocksWithNaN);

    expect(useStockStore.getState().portfolioValue).toBeCloseTo(1500);
  });
});
