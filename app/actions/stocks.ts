"use server";

import { fetchStockData } from "@/lib/server/api";
import { sanitizeStock } from "@/lib/utils/stock";
import type { Stock } from "@/lib/types";

export async function fetchSanitizedStocks(
  symbols: string[]
): Promise<Stock[]> {
  const data = await fetchStockData(symbols);
  return data.map(sanitizeStock);
}
