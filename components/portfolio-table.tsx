"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Stock } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useStockStore } from "@/lib/store";
import { RealTimePriceIndicator } from "@/components/real-time-price-indicator";
import Image from "next/image";
import { StockLogo } from "./ui/stock-logo";

interface PortfolioTableProps {
  stocks: Stock[];
}

export function PortfolioTable({ stocks }: PortfolioTableProps) {
  const { currency } = useStockStore();
  const portfolioStocks = stocks.filter((stock) => (stock.shares || 0) > 0);

  if (portfolioStocks.length === 0) {
    return (
      <div className="border-t p-8 text-center">
        <p className="text-muted-foreground">No stocks in your portfolio</p>
      </div>
    );
  }

  return (
    <div className="border-t overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">NAME</TableHead>
            <TableHead className="text-right">SHARES</TableHead>
            <TableHead className="text-right">AVERAGE PRICE</TableHead>
            <TableHead className="text-right">CURRENT PRICE</TableHead>
            <TableHead className="text-right">MARKET VALUE</TableHead>
            <TableHead className="text-right">RESULT</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {portfolioStocks.map((stock) => {
            // Ensure all values are valid numbers
            const shares = isNaN(stock.shares || 0) ? 0 : stock.shares || 0;
            const avgPrice = isNaN(stock.averagePrice || 0)
              ? 0
              : stock.averagePrice || 0;
            const price = isNaN(stock.price) ? 0 : stock.price;

            const marketValue = shares * price;
            const result = marketValue - shares * avgPrice;
            const isProfit = result >= 0;

            return (
              <TableRow key={stock.symbol}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 relative flex items-center justify-center bg-black text-white rounded">
                      <StockLogo name={stock.name} alt={`${stock.name} logo`} />
                    </div>
                    {stock.name}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {shares.toFixed(6)}
                </TableCell>
                <TableCell className="text-right">
                  ${formatCurrency(avgPrice)}
                </TableCell>
                <TableCell className="text-right">
                  <RealTimePriceIndicator
                    price={price}
                    priceChange={stock.priceChange}
                  />
                </TableCell>
                <TableCell className="text-right">
                  {currency} {formatCurrency(marketValue)}
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={isProfit ? "text-green-500" : "text-red-500"}
                  >
                    {isProfit ? "+" : ""}
                    {currency} {formatCurrency(result)}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
