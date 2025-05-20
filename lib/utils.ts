import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names with Tailwind's merge utility
 * @param inputs Class names to combine
 * @returns Combined class name string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as currency
 * @param value Number to format
 * @returns Formatted currency string
 */
export function formatCurrency(value: number): string {
  return isNaN(value) ? "0.00" : value.toFixed(2)
}

/**
 * Format a number as percentage
 * @param value Number to format
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number): string {
  return `${isNaN(value) ? 0 : Math.abs(value).toFixed(2)}%`
}
