"use client";

import { cn } from "@/lib/utils/clsx-utils";
import type { Stock } from "@/lib/types";
import { MiniChart } from "@/components/mini-chart";
import { StockLogo } from "./ui/stock-logo";

interface WatchlistItemProps {
  stock: Stock;
  isSelected: boolean;
  onClick: () => void;
}

export function WatchlistItem({
  stock,
  isSelected,
  onClick,
}: Readonly<WatchlistItemProps>) {
  const isPositive = stock.priceChange >= 0;
  const priceColor = isPositive ? "text-green-500" : "text-red-500";

  const formattedPrice = isNaN(stock.price) ? "0.00" : stock.price.toFixed(2);
  const formattedChange = isNaN(stock.priceChange)
    ? "0.00"
    : stock.priceChange.toFixed(2);
  const formattedPercent = isNaN(stock.priceChangePercent)
    ? "0.00"
    : stock.priceChangePercent.toFixed(2);

  return (
    <div
      className={cn(
        "p-4 border-b cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
        isSelected && "bg-gray-50 dark:bg-gray-800"
      )}
      onClick={onClick}
      role="listitem"
      aria-selected={isSelected}
      tabIndex={0}
    >
      <div className="flex items-start gap-3 mb-2">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
          <StockLogo name={stock.name} alt={`${stock.name} logo`} />
        </div>

        <div className="flex-1">
          <div className="flex justify-between">
            <div>
              <h3 className="font-bold text-lg">{stock.name}</h3>
              <p className="text-gray-500 text-sm">{stock.symbol}</p>
            </div>

            <div className="text-right">
              <p className="font-medium" aria-live="polite">
                ${formattedPrice}
              </p>
              <p className={cn("text-sm", priceColor)} aria-live="polite">
                {isPositive ? "+" : ""}
                {formattedChange} ({isPositive ? "+" : ""}
                {formattedPercent}%)
              </p>
            </div>
          </div>
        </div>
      </div>

      <MiniChart
        data={stock.chartData}
        color={isPositive ? "#22c55e" : "#ef4444"}
        height={30}
      />
    </div>
  );
}
