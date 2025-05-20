import { useRef, useEffect } from "react";

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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const chartHeight = height;
    ctx.clearRect(0, 0, width, chartHeight);

    const filteredData = data.filter((val) => !isNaN(val));
    const minValue = Math.min(...filteredData);
    const maxValue = Math.max(...filteredData);
    const valueRange = maxValue - minValue;

    const drawFlatLine = () => {
      const y = chartHeight / 2;
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      ctx.lineTo(width, chartHeight);
      ctx.lineTo(0, chartHeight);
      ctx.closePath();
      ctx.fillStyle = `${color}20`;
      ctx.fill();
    };

    if (valueRange === 0 || !isFinite(valueRange)) {
      drawFlatLine();
      return;
    }

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;

    const stepX = width / (data.length - 1);

    data.forEach((value, index) => {
      if (isNaN(value)) return;
      const y = chartHeight - ((value - minValue) / valueRange) * chartHeight;
      const x = index * stepX;

      if (index === 0 || isNaN(data[index - 1])) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
    ctx.lineTo(width, chartHeight);
    ctx.lineTo(0, chartHeight);
    ctx.closePath();
    ctx.fillStyle = `${color}20`;
    ctx.fill();
  }, [data, color, height]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={height}
      className="w-full"
      aria-hidden={ariaHidden}
    />
  );
}
