"use client"

import { useRef, useEffect } from "react"

interface MiniChartProps {
  data: number[]
  color: string
  height?: number
  "aria-hidden"?: boolean
}

export function MiniChart({ data, color, height = 30, "aria-hidden": ariaHidden = false }: MiniChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !data.length) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const chartHeight = height

    ctx.clearRect(0, 0, width, chartHeight)

    // Find min and max values for scaling
    const minValue = Math.min(...data.filter((val) => !isNaN(val)))
    const maxValue = Math.max(...data.filter((val) => !isNaN(val)))
    const valueRange = maxValue - minValue

    // If all values are the same or invalid, draw a flat line
    if (valueRange === 0 || !isFinite(valueRange)) {
      const y = chartHeight / 2
      ctx.beginPath()
      ctx.strokeStyle = color
      ctx.lineWidth = 1.5
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()

      // Fill area under the line
      ctx.lineTo(width, chartHeight)
      ctx.lineTo(0, chartHeight)
      ctx.closePath()
      ctx.fillStyle = `${color}20` // Add transparency to the fill color
      ctx.fill()
      return
    }

    // Draw the line
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = 1.5

    const stepX = width / (data.length - 1)

    data.forEach((value, index) => {
      // Skip NaN values
      if (isNaN(value)) return

      // Scale the y value to fit in our canvas
      const scaledY = chartHeight - ((value - minValue) / valueRange) * chartHeight

      if (index === 0 || isNaN(data[index - 1])) {
        ctx.moveTo(index * stepX, scaledY)
      } else {
        ctx.lineTo(index * stepX, scaledY)
      }
    })

    ctx.stroke()

    ctx.lineTo(width, chartHeight)
    ctx.lineTo(0, chartHeight)
    ctx.closePath()
    ctx.fillStyle = `${color}20` // Add transparency to the fill color
    ctx.fill()
  }, [data, color, height])

  return <canvas ref={canvasRef} width={200} height={height} className="w-full" aria-hidden={ariaHidden} />
}
