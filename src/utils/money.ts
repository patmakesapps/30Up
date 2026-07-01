// Money helpers. Storage + transport is ALWAYS integer cents; dollars exist only
// as display strings and form input. Keep conversions in one place so rounding
// is consistent.

/** 3499 -> "$34.99" */
export function formatCents(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(
    cents / 100,
  )
}

/** Parse a dollars string ("34.99") into integer cents, or null if invalid. */
export function dollarsToCents(input: string): number | null {
  const trimmed = input.trim()
  if (trimmed === '') return null
  const n = Number(trimmed)
  if (!Number.isFinite(n) || n < 0) return null
  return Math.round(n * 100)
}

/** 3499 -> "34.99" for populating a dollars input when editing. */
export function centsToDollarsInput(cents: number): string {
  return (cents / 100).toFixed(2)
}
