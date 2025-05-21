"use client";

import { useStockStore } from "@/store";
import { Home } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function StockHeader() {
  const { portfolioValue, currency } = useStockStore();
  const formattedValue = isNaN(portfolioValue)
    ? "0.00"
    : portfolioValue.toFixed(2);

  return (
    <header className="border-b bg-background p-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="h-8">
          <Image
            src="./logo.png"
            alt="App Logo"
            width={120}
            height={30}
            className="h-full w-auto"
          />
        </div>
        <div className="ml-4 flex items-center">
          <span className="text-sm font-medium">{currency}</span>
          <span className="ml-1 font-semibold">{formattedValue}</span>
        </div>
      </div>
      <Button variant="ghost" size="icon" aria-label="Home">
        <Home className="h-5 w-5" />
      </Button>
    </header>
  );
}
