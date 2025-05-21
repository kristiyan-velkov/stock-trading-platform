"use server";

import { getInitialStocks } from "@/lib/server/fetch-initial-stocks";
import StockDashboard from "./stock-dashboard";

export default async function StockDashboardWrapper() {
  const symbols = ["NVDA", "AAPL", "TSLA", "MSFT", "AMZN"];
  const initialStocks = await getInitialStocks(symbols);

  return <StockDashboard initialStocks={initialStocks} />;
}
