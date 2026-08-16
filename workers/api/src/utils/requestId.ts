/**
 * Display reference returned to the client for a stored submission: `REQ-YYMM-XXXXXXXX` - the last
 * two digits of the UTC year, the UTC month, and the first 8 hex chars of the UUID (uppercased),
 * e.g. `REQ-2606-F47AC10B`. The YYMM points at the month partition (contacts_YYYY_MM); the owner
 * looks the row up with `WHERE id LIKE 'f47ac10b%'`.
 */
export const formatRequestId = (id: string, when: Date): string => {
  const yy = String(when.getUTCFullYear()).slice(-2)
  const mm = String(when.getUTCMonth() + 1).padStart(2, '0')
  return `REQ-${yy}${mm}-${id.slice(0, 8).toUpperCase()}`
}
