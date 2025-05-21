"use client";

import { Sparklines, SparklinesLine, SparklinesSpots } from "react-sparklines";

interface MiniChartProps {
  data: number[];
  color: string;
  height?: number;
  "aria-hidden"?: boolean;
}

export function MiniChart({
  data,
  color,
  height = 30,
  "aria-hidden": ariaHidden = false,
}: Readonly<MiniChartProps>) {
  return (
    <div className="w-full" style={{ height }} aria-hidden={ariaHidden}>
      <Sparklines data={data} height={height}>
        <SparklinesLine
          color={color}
          style={{ strokeWidth: 1.5, fill: `${color}20` }}
        />
        <SparklinesSpots size={2} />
      </Sparklines>
    </div>
  );
}
