// Small input validators for callable payloads. They throw HttpsError
// 'invalid-argument' so the client gets a clean, typed failure. Never trust
// client input — especially anything money-related.
import { HttpsError } from 'firebase-functions/v2/https'

export function reqString(
  value: unknown,
  field: string,
  opts: { min?: number; max?: number } = {},
): string {
  if (typeof value !== 'string') {
    throw new HttpsError('invalid-argument', `${field} must be a string.`)
  }
  const v = value.trim()
  const min = opts.min ?? 1
  const max = opts.max ?? 5000
  if (v.length < min) {
    throw new HttpsError('invalid-argument', `${field} is required.`)
  }
  if (v.length > max) {
    throw new HttpsError('invalid-argument', `${field} is too long (max ${max}).`)
  }
  return v
}

/** Non-negative integer. Rejects floats, NaN, Infinity — critical for cents. */
export function reqInt(
  value: unknown,
  field: string,
  opts: { min?: number; max?: number } = {},
): number {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw new HttpsError('invalid-argument', `${field} must be an integer.`)
  }
  const min = opts.min ?? 0
  if (value < min) {
    throw new HttpsError('invalid-argument', `${field} must be >= ${min}.`)
  }
  if (opts.max !== undefined && value > opts.max) {
    throw new HttpsError('invalid-argument', `${field} must be <= ${opts.max}.`)
  }
  return value
}

export function reqBool(value: unknown, field: string): boolean {
  if (typeof value !== 'boolean') {
    throw new HttpsError('invalid-argument', `${field} must be true or false.`)
  }
  return value
}

/** Array of trimmed, non-empty strings (e.g. image URLs). */
export function stringArray(
  value: unknown,
  field: string,
  opts: { maxItems?: number } = {},
): string[] {
  if (value === undefined || value === null) return []
  if (!Array.isArray(value)) {
    throw new HttpsError('invalid-argument', `${field} must be an array.`)
  }
  const max = opts.maxItems ?? 20
  if (value.length > max) {
    throw new HttpsError('invalid-argument', `${field} has too many items (max ${max}).`)
  }
  return value.map((item, i) => {
    if (typeof item !== 'string' || item.trim().length === 0) {
      throw new HttpsError('invalid-argument', `${field}[${i}] must be a non-empty string.`)
    }
    return item.trim()
  })
}
