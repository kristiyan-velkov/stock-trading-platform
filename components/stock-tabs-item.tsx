"use client";

import { memo } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/clsx-utils";
import type { Stock } from "@/lib/types";
import { StockLogo } from "./ui/stock-logo";
import { Button } from "./ui/button";

interface StockTabItemProps {
  stock: Stock;
  isSelected: boolean;
  onSelect: (stock: Stock) => void;
  onRemove: (stock: Stock) => void;
}

export const StockTabItem = memo(function StockTabItem({
  stock,
  isSelected,
  onSelect,
  onRemove,
}: StockTabItemProps) {
  return (
    <div
      className={cn(
        "px-4 py-2 flex items-center gap-2 cursor-pointer rounded-md border transition-colors focus:outline-none",
        isSelected
          ? "border-blue-500 text-blue-500 bg-blue-50 dark:bg-blue-950"
          : "border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
      )}
      role="tab"
      id={`tab-${stock.symbol}`}
      aria-selected={isSelected}
      aria-controls={`panel-${stock.symbol}`}
      tabIndex={isSelected ? 0 : -1}
      onClick={() => onSelect(stock)}
    >
      <div className="w-6 h-6 relative flex items-center justify-center rounded overflow-hidden">
        <StockLogo name={stock.name} alt={`${stock.name} logo`} />
      </div>

      <span
        className={cn(
          "font-medium truncate max-w-[120px]",
          isSelected ? "text-blue-500" : "text-foreground"
        )}
        title={stock.name}
      >
        {stock.name}
      </span>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(
          "h-6 w-6",
          isSelected ? "text-blue-500" : "text-muted-foreground"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onRemove(stock);
        }}
        aria-label={`Remove ${stock.name}`}
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
});
