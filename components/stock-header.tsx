"use client"

import { useStockStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import Image from "next/image"

export function StockHeader() {
  const { portfolioValue, currency } = useStockStore()
  const formattedValue = isNaN(portfolioValue) ? "0.00" : formatCurrency(portfolioValue)

  return (
    <header className="border-b bg-background p-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="h-8">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-650FLyyKn8LrDzPCRyhn3SSQUEdujw.png"
            alt="Trading 212 Logo"
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
  )
}
