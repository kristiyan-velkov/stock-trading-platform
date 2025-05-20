"use client";

import { memo } from "react";
import type { Stock } from "@/lib/types";
import { cn } from "@/lib/utils/clsx-utils";
import { StockTabItem } from "./stock-tabs-item";

interface StockTabsProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedStock: Stock | null;
  onSelectStock: (stock: Stock) => void;
  onRemoveStock: (stock: Stock) => void;
  tabStocks: Stock[];
}

function EmptyState() {
  return (
    <div className="text-muted-foreground italic px-4 py-2">
      No stocks selected.
    </div>
  );
}

export const StockTabs = memo(function StockTabs({
  selectedStock,
  onSelectStock,
  onRemoveStock,
  tabStocks,
  className,
  ...props
}: Readonly<StockTabsProps>) {
  return (
    <div
      {...props}
      className={cn(
        "flex border-b overflow-x-auto p-2 gap-2 bg-gray-50 dark:bg-gray-900",
        className
      )}
      role="tablist"
      aria-label="Stock tabs"
    >
      {tabStocks.length === 0 ? (
        <EmptyState />
      ) : (
        tabStocks.map((stock) => (
          <StockTabItem
            key={stock.symbol}
            stock={stock}
            isSelected={selectedStock?.symbol === stock.symbol}
            onSelect={onSelectStock}
            onRemove={onRemoveStock}
          />
        ))
      )}
    </div>
  );
});
