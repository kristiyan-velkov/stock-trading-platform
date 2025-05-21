"use client";

import { Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChartControlsProps {
  onIntervalChange?: (interval: string) => void;
  currentInterval?: string;
}

export function ChartControls({
  onIntervalChange,
  currentInterval = "D",
}: Readonly<ChartControlsProps>) {
  const handleIntervalChange = (value: string) => {
    if (onIntervalChange) {
      onIntervalChange(value);
    }
  };

  const intervalMap: Record<string, string> = {
    "1": "1 Minute",
    "5": "5 Minutes",
    "15": "15 Minutes",
    "30": "30 Minutes",
    "60": "1 Hour",
    "240": "4 Hours",
    "1day": "1 Day",
    D: "1 Day",
    "1week": "1 Week",
    W: "1 Week",
    "1month": "1 Month",
    M: "1 Month",
  };

  return (
    <div className="flex flex-wrap justify-between mb-4 gap-2">
      <Select value={currentInterval} onValueChange={handleIntervalChange}>
        <SelectTrigger className="w-[150px] h-8" aria-label="Chart interval">
          <Clock className="h-4 w-4 mr-2" aria-hidden="true" />
          <SelectValue>
            {intervalMap[currentInterval] || currentInterval}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">1 Minute</SelectItem>
          <SelectItem value="5">5 Minutes</SelectItem>
          <SelectItem value="15">15 Minutes</SelectItem>
          <SelectItem value="30">30 Minutes</SelectItem>
          <SelectItem value="60">1 Hour</SelectItem>
          <SelectItem value="240">4 Hours</SelectItem>
          <SelectItem value="D">1 Day</SelectItem>
          <SelectItem value="W">1 Week</SelectItem>
          <SelectItem value="M">1 Month</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
