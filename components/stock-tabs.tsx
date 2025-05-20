"use client";

import { X } from "lucide-react";
import type { Stock } from "@/lib/types";
import { cn } from "@/lib/utils";
import { StockLogo } from "./ui/stock-logo";

interface StockTabsProps {
  selectedStock: Stock | null;
  onSelectStock: (stock: Stock) => void;
  onRemoveStock: (stock: Stock) => void;
  tabStocks: Stock[];
}

export function StockTabs({
  selectedStock,
  onSelectStock,
  onRemoveStock,
  tabStocks,
}: StockTabsProps) {
  return (
    <div
      className="flex border-b overflow-x-auto p-2 gap-2 bg-gray-50 dark:bg-gray-900"
      role="tablist"
      aria-label="Stock tabs"
    >
      {tabStocks.map((stock) => {
        const isSelected = selectedStock?.symbol === stock.symbol;

        return (
          <div
            key={stock.symbol}
            className={cn(
              "px-4 py-2 flex items-center gap-2 cursor-pointer rounded-md border transition-colors",
              isSelected
                ? "border-blue-500 text-blue-500"
                : "border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
            onClick={() => onSelectStock(stock)}
            role="tab"
            id={`tab-${stock.symbol}`}
            aria-selected={isSelected}
            aria-controls={`panel-${stock.symbol}`}
            tabIndex={isSelected ? 0 : -1}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onSelectStock(stock);
                e.preventDefault();
              }
            }}
          >
            <div className="w-6 h-6 relative flex items-center justify-center rounded overflow-hidden">
              <StockLogo name={stock.name} alt={`${stock.name} logo`} />
            </div>
            <span
              className={cn(
                "font-medium",
                isSelected ? "text-blue-500" : "text-foreground"
              )}
            >
              {stock.name}
            </span>
            <button
              className={cn(
                "h-4 w-4 hover:text-foreground",
                isSelected ? "text-blue-500" : "text-muted-foreground"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onRemoveStock(stock);
              }}
              aria-label={`Remove ${stock.name}`}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
