"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    TradingView: any;
  }
}

interface TradingViewChartProps {
  symbol: string;
  interval?: string;
  "aria-label"?: string;
}

export function TradingViewChart({
  symbol,
  interval = "D",
  "aria-label": ariaLabel,
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const { theme } = useTheme();
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load TradingView widget script
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if script is already loaded
    if (window.TradingView) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      setError(
        "Failed to load TradingView chart. Please check your internet connection."
      );
      setIsLoading(false);
    };
    document.head.appendChild(script);

    return () => {
      // Only remove the script if we added it
      if (!window.TradingView) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Initialize or recreate widget when symbol, interval, or theme changes
  useEffect(() => {
    if (!containerRef.current || !scriptLoaded || !window.TradingView) return;

    setIsLoading(true);

    // Clean up previous widget if it exists
    if (widgetRef.current) {
      try {
        widgetRef.current.remove();
        widgetRef.current = null;
      } catch (error) {
        console.error("Error removing TradingView widget:", error);
      }
    }

    const isDarkTheme = theme === "dark";

    try {
      // Create a new widget with the updated symbol
      widgetRef.current = new window.TradingView.widget({
        autosize: true,
        symbol: symbol,
        interval: interval,
        timezone: "Etc/UTC",
        theme: isDarkTheme ? "dark" : "light",
        style: "1", // Candlestick chart
        locale: "en",
        toolbar_bg: isDarkTheme ? "#1e1e1e" : "#f8f9fa",
        enable_publishing: false,
        withdateranges: true,
        hide_side_toolbar: false,
        allow_symbol_change: true,
        details: true,
        hotlist: true,
        calendar: true,
        studies: [
          "RSI@tv-basicstudies",
          "MASimple@tv-basicstudies",
          "MACD@tv-basicstudies",
        ],
        container_id: containerRef.current.id,
        show_popup_button: true,
        popup_width: "1000",
        popup_height: "650",
        loading_screen: {
          backgroundColor: isDarkTheme ? "#1e1e1e" : "#ffffff",
        },
        disabled_features: ["use_localstorage_for_settings"],
        enabled_features: [
          "study_templates",
          "accessibility_cursor_arrows_shift_multiplier",
        ],
        overrides: {
          "mainSeriesProperties.candleStyle.upColor": "#22c55e",
          "mainSeriesProperties.candleStyle.downColor": "#ef4444",
          "mainSeriesProperties.candleStyle.wickUpColor": "#22c55e",
          "mainSeriesProperties.candleStyle.wickDownColor": "#ef4444",
        },
        // Add onReady callback to handle when chart is ready
        onReady: () => {
          setIsLoading(false);
          setError(null);
        },
      });
    } catch (err) {
      console.error("Error creating TradingView widget:", err);
      setError("Failed to initialize chart. Please try again later.");
      setIsLoading(false);
    }

    return () => {
      // Clean up widget on unmount or before recreating
      if (widgetRef.current) {
        try {
          widgetRef.current.remove();
          widgetRef.current = null;
        } catch (error) {
          console.error("Error removing TradingView widget:", error);
        }
      }
    };
  }, [symbol, interval, theme, scriptLoaded]);

  return (
    <div
      className="relative w-full h-full"
      role="region"
      aria-label={ariaLabel || `${symbol} stock chart`}
    >
      {isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-background/50 z-10"
          aria-live="polite"
        >
          <div className="flex flex-col items-center gap-2">
            <Loader2
              className="h-8 w-8 animate-spin text-primary"
              aria-hidden="true"
            />
            <p className="text-sm text-muted-foreground">Loading chart...</p>
          </div>
        </div>
      )}
      {error && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-background/50 z-10"
          role="alert"
        >
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            {error}
          </div>
        </div>
      )}
      <div
        id="tradingview-widget-container"
        ref={containerRef}
        className="w-full h-full"
      />
    </div>
  );
}
