"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useStockStore } from "@/store";
import type { Stock } from "@/lib/types";
import { webSocketService } from "@/lib/websocket/websocket-service";
import { fetchStockData } from "@/lib/server/api";
import { sanitizeStock } from "@/lib/utils/stock";
import { StockHeader } from "@/components/stock-header";
import { WatchlistSidebar } from "@/components/watchlist-sidebar";
import { PortfolioTable } from "@/components/portfolio-table";
import { StockTabs } from "@/components/stock-tabs";
import { ChartControls } from "@/components/chart-controls";
import { TradingViewChart } from "@/components/trading-view-chart";
import { LoadingFallback } from "@/components/ui/loading-fallback";

interface StockDashboardProps {
  initialStocks: Stock[];
}

type Interval = "1m" | "5m" | "15m" | "1h" | "4h" | "D" | "W" | "M";

export default function StockDashboard({
  initialStocks,
}: Readonly<StockDashboardProps>) {
  const { setStocks, setSelectedStock, stocks, selectedStock } =
    useStockStore();
  const [tabStocks, setTabStocks] = useState<Stock[]>([]);
  const [chartInterval, setChartInterval] = useState<Interval>("D");
  const symbolsRef = useRef<string[]>([]);

  const stockSymbols = useMemo(
    () => stocks.map((stock) => stock.symbol),
    [stocks]
  );

  const initializeDashboard = useCallback(
    (stocks: Stock[]) => {
      setStocks(stocks);
      setSelectedStock(stocks[0]);
      setTabStocks([stocks[0]]);

      const symbols = stocks.map((s) => s.symbol);
      symbolsRef.current = symbols;
      webSocketService.initialize(symbols);
    },
    [setStocks, setSelectedStock]
  );

  useEffect(() => {
    if (initialStocks.length > 0) {
      initializeDashboard(initialStocks);
    }
    return () => {
      webSocketService.close();
    };
  }, [initialStocks, initializeDashboard]);

  useEffect(() => {
    symbolsRef.current = stockSymbols;
    webSocketService.updateSymbols(stockSymbols);
  }, [stockSymbols]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const symbols = symbolsRef.current;
      if (!symbols.length) return;

      try {
        const updatedData = await fetchStockData(symbols);
        if (updatedData.length > 0) {
          const validated = updatedData.map(sanitizeStock);
          setStocks(validated);

          setTabStocks((prev) =>
            prev.map(
              (tabStock) =>
                validated.find((s) => s.symbol === tabStock.symbol) || tabStock
            )
          );
        }
      } catch (e) {
        console.error("Polling error:", e);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [setStocks]);

  const handleSelectStock = useCallback(
    (stock: Stock) => {
      setSelectedStock(stock);

      if (!tabStocks.some((s) => s.symbol === stock.symbol)) {
        setTabStocks((prev) =>
          prev.length >= 5 ? [...prev.slice(1), stock] : [...prev, stock]
        );
      }
    },
    [tabStocks, setSelectedStock]
  );

  const handleRemoveStock = useCallback(
    (stockToRemove: Stock) => {
      if (tabStocks.length <= 1) return;

      const filtered = tabStocks.filter(
        (s) => s.symbol !== stockToRemove.symbol
      );
      setTabStocks(filtered);

      if (
        selectedStock?.symbol === stockToRemove.symbol &&
        filtered.length > 0
      ) {
        setSelectedStock(filtered[filtered.length - 1]);
      }
    },
    [tabStocks, selectedStock, setSelectedStock]
  );

  const handleIntervalChange = useCallback((interval: Interval) => {
    setChartInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <StockHeader />
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        <aside className="w-full md:w-80 flex-shrink-0 border-b md:border-b-0 md:border-r">
          <WatchlistSidebar
            stocks={stocks}
            selectedStock={selectedStock}
            onSelectStock={handleSelectStock}
          />
        </aside>
        <section className="flex-1 flex flex-col overflow-hidden">
          <nav aria-label="Stock tabs">
            <StockTabs
              selectedStock={selectedStock}
              onSelectStock={handleSelectStock}
              onRemoveStock={handleRemoveStock}
              tabStocks={tabStocks}
            />
          </nav>
          <section className="flex-1 p-4 overflow-hidden">
            <div className="h-full flex flex-col">
              <ChartControls
                onIntervalChange={handleIntervalChange}
                currentInterval={chartInterval}
              />
              <div className="flex-1 overflow-hidden" aria-live="polite">
                {selectedStock ? (
                  <TradingViewChart
                    symbol={selectedStock.symbol}
                    interval={chartInterval}
                    aria-label={`${selectedStock.name} stock chart with ${chartInterval} interval`}
                  />
                ) : (
                  <LoadingFallback
                    message="Loading stock dashboard..."
                    fullScreen
                  />
                )}
              </div>
            </div>
          </section>
          <section aria-label="Portfolio holdings" className="mx-4 mb-5">
            <PortfolioTable stocks={stocks} />
          </section>
        </section>
      </div>
    </div>
  );
}
