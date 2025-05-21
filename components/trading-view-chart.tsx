"use client";

import { useEffect, useRef, useState, useId, MutableRefObject } from "react";
import { LoadingFallback } from "./ui/loading-fallback";

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

function destroyWidget(ref: MutableRefObject<any>) {
  if (ref.current?.remove) {
    try {
      ref.current.remove();
    } catch (e) {
      console.warn("Error destroying TradingView widget:", e);
    }
  }
  ref.current = null;
}

function ChartLoader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
      <div className="flex flex-col items-center gap-2">
        <LoadingFallback message="Loading chart..." />
      </div>
    </div>
  );
}

function ChartError({ message }: { message: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
      <div className="bg-destructive/10 text-destructive p-4 rounded-md">
        {message}
      </div>
    </div>
  );
}

export function TradingViewChart({
  symbol,
  interval = "D",
  "aria-label": ariaLabel,
}: Readonly<TradingViewChartProps>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const containerId = useId();

  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.TradingView?.widget) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      setError("Failed to load chart script.");
      setIsLoading(false);
    };

    document.head.appendChild(script);
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current || !scriptLoaded || !window.TradingView?.widget)
      return;

    containerRef.current.id = containerId;

    destroyWidget(widgetRef);
    setIsLoading(true);
    setError(null);

    try {
      widgetRef.current = new window.TradingView.widget({
        autosize: true,
        symbol,
        interval,
        timezone: "Etc/UTC",
        theme: "light",
        style: "1",
        locale: "en",
        toolbar_bg: "#f8f9fa",
        enable_publishing: false,
        withdateranges: true,
        hide_side_toolbar: false,
        allow_symbol_change: true,
        details: true,
        hotlist: true,
        calendar: true,
        container_id: containerId,
        show_popup_button: true,
        popup_width: "1000",
        popup_height: "650",
        loading_screen: {
          backgroundColor: "#ffffff",
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
      });

      const timeout = setTimeout(() => setIsLoading(false), 2000);
      return () => clearTimeout(timeout);
    } catch (err) {
      console.error("Widget init error:", err);
      setError("Chart failed to load.");
      setIsLoading(false);
    }
  }, [symbol, interval, scriptLoaded, containerId]);

  return (
    <section
      className="relative w-full h-full"
      aria-labelledby={`chart-title-${containerId}`}
    >
      <h2 id={`chart-title-${containerId}`} className="sr-only">
        {ariaLabel ?? `${symbol} stock chart`}
      </h2>

      {isLoading && <ChartLoader />}
      {error && <ChartError message={error} />}
      <div ref={containerRef} className="w-full h-full" />
    </section>
  );
}
