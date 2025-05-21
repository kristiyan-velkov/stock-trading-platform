"use client";

import { Loader } from "lucide-react";

interface LoadingFallbackProps {
  message: string;
  fullScreen?: boolean;
}

export const LoadingFallback = ({
  message = "Loading...",
  fullScreen = false,
}: LoadingFallbackProps) => {
  return (
    <div
      className={`flex items-center justify-center ${
        fullScreen ? "h-screen" : "h-full"
      }`}
    >
      <div className="flex flex-col items-center gap-2">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};
