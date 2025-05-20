import { Suspense } from "react"
import StockDashboard from "@/components/stock-dashboard"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading stock dashboard...</p>
            </div>
          </div>
        }
      >
        <StockDashboard />
      </Suspense>
    </main>
  )
}
