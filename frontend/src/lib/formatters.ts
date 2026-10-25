import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'

/**
 * Formats a number as Indian Rupee currency (₹)
 * Handles thousands (k), Lakhs (L), and Crores (Cr) when requested or full number
 */
export function formatINR(amount: number, compact: boolean = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0'

  if (compact) {
    if (Math.abs(amount) >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`
    }
    if (Math.abs(amount) >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`
    }
    if (Math.abs(amount) >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}k`
    }
    return `₹${amount.toLocaleString('en-IN')}`
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format ISO date string or Date object
 */
export function formatDate(dateString: string | Date | undefined, pattern: string = 'dd MMM yyyy'): string {
  if (!dateString) return 'N/A'
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString
    if (!isValid(date)) return 'Invalid Date'
    return format(date, pattern)
  } catch {
    return 'Invalid Date'
  }
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(dateString: string | undefined): string {
  if (!dateString) return 'N/A'
  try {
    const date = parseISO(dateString)
    if (!isValid(date)) return dateString
    return formatDistanceToNow(date, { addSuffix: true })
  } catch {
    return dateString
  }
}

/**
 * Formats confidence score as percentage
 */
export function formatConfidence(score: number): string {
  const percentage = Math.round(score * 100)
  return `${percentage}%`
}
