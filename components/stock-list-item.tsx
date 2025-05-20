"use client"

import Image from "next/image"
import type { Stock } from "@/lib/types"
import { cn, formatCurrency, formatPercentage } from "@/lib/utils"
import { MiniChart } from "@/components/mini-chart"
import { RealTimePriceIndicator } from "@/components/real-time-price-indicator"

interface StockListItemProps {
  stock: Stock
  isSelected: boolean
  onClick: () => void
}

export function StockListItem({ stock, isSelected, onClick }: StockListItemProps) {
  const priceChangeColor = stock.priceChange >= 0 ? "text-green-500" : "text-red-500"

  return (
    <div
      className={cn(
        "p-4 flex flex-col gap-2 cursor-pointer hover:bg-muted/50 transition-colors",
        isSelected && "bg-muted",
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 relative">
          <Image
            src={`/abstract-geometric-shapes.png?height=32&width=32&query=${stock.name} logo`}
            alt={stock.name}
            width={32}
            height={32}
            className="rounded-full"
          />
        </div>
        <div className="flex-1">
          <div className="font-medium">{stock.name}</div>
          <div className="text-xs text-muted-foreground">{stock.symbol}</div>
        </div>
        <div className="text-right">
          <div className="font-semibold">
            <RealTimePriceIndicator price={stock.price} priceChange={stock.priceChange} />
          </div>
          <div className={cn("text-xs flex items-center justify-end", priceChangeColor)}>
            <span>
              {stock.priceChange >= 0 ? "+" : ""}
              {formatCurrency(stock.priceChange)}
            </span>
            <span className="ml-1">({formatPercentage(stock.priceChangePercent)})</span>
          </div>
        </div>
      </div>
      <MiniChart data={stock.chartData} color={stock.priceChange >= 0 ? "#22c55e" : "#ef4444"} />
    </div>
  )
}
