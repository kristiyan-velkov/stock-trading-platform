import { Suspense } from "react";
import StockDashboardWrapper from "@/components/stock-dashboard-wrapper";
import { LoadingFallback } from "@/components/ui/loading-fallback";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Suspense
        fallback={<LoadingFallback message="Loading stock dashboard..." />}
      >
        <StockDashboardWrapper />
      </Suspense>
    </main>
  );
}
