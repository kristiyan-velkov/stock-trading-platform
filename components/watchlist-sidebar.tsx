"use client"

import type { Stock } from "@/lib/types"
import { WatchlistItem } from "@/components/watchlist-item"
import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface WatchlistSidebarProps {
  stocks: Stock[]
  selectedStock: Stock | null
  onSelectStock: (stock: Stock) => void
}

export function WatchlistSidebar({ stocks, selectedStock, onSelectStock }: WatchlistSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredStocks = stocks.filter(
    (stock) =>
      stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg" id="watchlist-heading">
          Watchlist
        </h2>
        <div className="mt-2 relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search stocks..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search stocks"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto" role="list" aria-labelledby="watchlist-heading">
        {filteredStocks.length === 0 ? (
          <p className="p-4 text-center text-muted-foreground">No stocks found</p>
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
    </div>
  )
}
