"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StockLogo } from "./ui/stock-logo";
import { RealTimePriceIndicator } from "@/components/real-time-price-indicator";
import { useStockStore } from "@/store";
import { formatCurrency } from "@/lib/utils/stock";
import type { Stock } from "@/lib/types";

interface PortfolioTableProps {
  stocks: Stock[];
}

export function PortfolioTable({ stocks }: Readonly<PortfolioTableProps>) {
  const { currency } = useStockStore();
  const portfolioStocks = stocks.filter((s) => (s.shares || 0) > 0);

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
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead className="text-right">Shares</TableHead>
            <TableHead className="text-right">Avg. Price</TableHead>
            <TableHead className="text-right">Current Price</TableHead>
            <TableHead className="text-right">Market Value</TableHead>
            <TableHead className="text-right">Result</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {portfolioStocks.map((stock) => {
            const shares = Number(stock.shares) || 0;
            const avgPrice = Number(stock.averagePrice) || 0;
            const price = Number(stock.price) || 0;

            const marketValue = shares * price;
            const result = marketValue - shares * avgPrice;
            const isProfit = result >= 0;

            return (
              <TableRow key={stock.symbol}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="relative w-5 h-5 flex items-center justify-center bg-black text-white rounded">
                      <StockLogo name={stock.name} alt={`${stock.name} logo`} />
                    </div>
                    {stock.name}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {shares.toFixed(6)}
                </TableCell>
                <TableCell className="text-right">
                  {currency} {formatCurrency(avgPrice)}
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
