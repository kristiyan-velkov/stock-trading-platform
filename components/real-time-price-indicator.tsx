"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils/clsx-utils";

interface RealTimePriceIndicatorProps {
  price: number;
  priceChange: number;
}

export function RealTimePriceIndicator({
  price,
  priceChange,
}: Readonly<RealTimePriceIndicatorProps>) {
  const [prevPrice, setPrevPrice] = useState(price);
  const [isAnimating, setIsAnimating] = useState(false);

  const validPrice = Number.isFinite(price) ? price : 0;
  const validPriceChange = Number.isFinite(priceChange) ? priceChange : 0;

  useEffect(() => {
    if (validPrice !== prevPrice) {
      setIsAnimating(true);
      const timeout = setTimeout(() => {
        setIsAnimating(false);
        setPrevPrice(validPrice);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [validPrice, prevPrice]);

  const priceChangeColor =
    validPriceChange > 0
      ? "text-green-500"
      : validPriceChange < 0
      ? "text-red-500"
      : "text-muted-foreground";

  const flashBackground =
    validPrice > prevPrice
      ? "bg-green-100"
      : validPrice < prevPrice
      ? "bg-red-100"
      : "";

  return (
    <div
      className={cn(
        "transition-colors duration-1000 rounded-sm px-1",
        isAnimating && flashBackground
      )}
      aria-live="polite"
    >
      <span className={priceChangeColor}>${validPrice.toFixed(2)}</span>
    </div>
  );
}
