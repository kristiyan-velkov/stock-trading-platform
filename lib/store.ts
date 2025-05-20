"use client"

import { create } from "zustand"
import type { Stock } from "@/lib/types"

interface StockState {
  stocks: Stock[]
  selectedStock: Stock | null
  portfolioValue: number
  currency: string
  setStocks: (stocks: Stock[]) => void
  setSelectedStock: (stock: Stock | null) => void
  updateStock: (symbol: string, data: Partial<Stock>) => void
}

/**
 * Stock store for managing global state
 */
export const useStockStore = create<StockState>((set) => ({
  stocks: [],
  selectedStock: null,
  portfolioValue: 668.17,
  currency: "BGN",

  setStocks: (stocks) =>
    set({
      stocks,
      // Recalculate portfolio value when stocks are updated
      portfolioValue: calculatePortfolioValue(stocks),
    }),

  setSelectedStock: (selectedStock) => set({ selectedStock }),

  updateStock: (symbol, data) =>
    set((state) => {
      const updatedStocks = state.stocks.map((stock) => (stock.symbol === symbol ? { ...stock, ...data } : stock))

      // Update the selected stock if it's the one being updated
      const updatedSelectedStock =
        state.selectedStock?.symbol === symbol ? { ...state.selectedStock, ...data } : state.selectedStock

      return {
        stocks: updatedStocks,
        selectedStock: updatedSelectedStock,
        portfolioValue: calculatePortfolioValue(updatedStocks),
      }
    }),
}))

/**
 * Calculate total portfolio value from stocks
 * @param stocks Array of stocks
 * @returns Total portfolio value
 */
function calculatePortfolioValue(stocks: Stock[]): number {
  return stocks.reduce((total, stock) => {
    const shares = isNaN(stock.shares || 0) ? 0 : stock.shares || 0
    const price = isNaN(stock.price) ? 0 : stock.price
    return total + shares * price
  }, 0)
}
