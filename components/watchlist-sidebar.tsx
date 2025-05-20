"use client";

import { useState, useMemo } from "react";
import type { Stock } from "@/lib/types";
import { WatchlistItem } from "@/components/watchlist-item";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/clsx-utils";

interface WatchlistSidebarProps {
  stocks: Stock[];
  selectedStock: Stock | null;
  onSelectStock: (stock: Stock) => void;
}

export function WatchlistSidebar({
  stocks,
  selectedStock,
  onSelectStock,
}: Readonly<WatchlistSidebarProps>) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStocks = useMemo(
    () =>
      stocks.filter((stock) =>
        [stock.name, stock.symbol].some((field) =>
          field.toLowerCase().includes(searchQuery.toLowerCase())
        )
      ),
    [stocks, searchQuery]
  );

  return (
    <aside className="h-full flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
      <header className="p-4 border-b">
        <h2 className="font-semibold text-lg" id="watchlist-heading">
          Watchlist
        </h2>
        <div className="mt-2 relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search stocks..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search stocks"
          />
        </div>
      </header>

      <div
        className={cn(
          "flex-1 overflow-y-auto",
          filteredStocks.length === 0 && "flex items-center justify-center"
        )}
        role="list"
        aria-labelledby="watchlist-heading"
      >
        {filteredStocks.length === 0 ? (
          <p className="p-4 text-center text-muted-foreground">
            No stocks found
          </p>
        ) : (
          filteredStocks.map((stock) => (
            <WatchlistItem
              key={stock.symbol}
              stock={stock}
              isSelected={selectedStock?.symbol === stock.symbol}
              onClick={() => onSelectStock(stock)}
            />
          ))
        )}
      </div>
    </aside>
  );
}
