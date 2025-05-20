export interface Stock {
  symbol: string;
  name: string;
  price: number;
  priceChange: number;
  priceChangePercent: number;
  chartData: number[];
  shares?: number;
  averagePrice?: number;
}

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface StockHistoricalData {
  symbol: string;
  data: {
    date: string;
    close: number;
  }[];
}

export interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TwelveDataWebSocketMessage {
  event: string;
  symbol: string;
  price?: number;
  timestamp?: number;
  status?: string;
  message?: string;
}
