"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface RealTimePriceIndicatorProps {
  price: number
  priceChange: number
}

export function RealTimePriceIndicator({ price, priceChange }: RealTimePriceIndicatorProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [prevPrice, setPrevPrice] = useState(price)

  // Ensure price and priceChange are valid numbers
  const validPrice = isNaN(price) ? 0 : price
  const validPriceChange = isNaN(priceChange) ? 0 : priceChange

  useEffect(() => {
    // If price has changed, show the update animation
    if (validPrice !== prevPrice) {
      setIsUpdating(true)

      // Reset the animation after a short delay
      const timer = setTimeout(() => {
        setIsUpdating(false)
        setPrevPrice(validPrice)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [validPrice, prevPrice])

  const priceChangeColor = validPriceChange >= 0 ? "text-green-500" : "text-red-500"
  const updateColor = validPrice > prevPrice ? "bg-green-100" : validPrice < prevPrice ? "bg-red-100" : ""

  return (
    <div className={cn("transition-colors duration-1000", isUpdating && updateColor)} aria-live="polite">
      <span className={priceChangeColor}>${validPrice.toFixed(2)}</span>
    </div>
  )
}
