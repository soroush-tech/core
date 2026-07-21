/** Base64url-encode a string or byte array (no padding). */
export const base64UrlEncode = (data: Uint8Array | string): string => {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

/** Decode a base64url string (with or without padding) to bytes. */
export const base64UrlDecode = (encoded: string): Uint8Array => {
  const binary = atob(encoded.replaceAll('-', '+').replaceAll('_', '/'))
  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

export interface DecodedJwt {
  header: Record<string, unknown>
  payload: Record<string, unknown>
  /** The `header.payload` part the signature covers. */
  signedInput: string
  signature: Uint8Array
}

/** Split and decode a compact JWT without verifying it. Throws on a malformed token. */
export const decodeJwt = (token: string): DecodedJwt => {
  const parts = token.split('.')
  if (parts.length !== 3) throw new Error('jwt: malformed token')
  const decodePart = (part: string): Record<string, unknown> => {
    const parsed: unknown = JSON.parse(new TextDecoder().decode(base64UrlDecode(part)))
    if (parsed === null || typeof parsed !== 'object') throw new Error('jwt: malformed token')
    return parsed as Record<string, unknown>
  }
  return {
    header: decodePart(parts[0]),
    payload: decodePart(parts[1]),
    signedInput: `${parts[0]}.${parts[1]}`,
    signature: base64UrlDecode(parts[2]),
  }
}

/** Strip a PKCS#8 PEM's armor and decode its base64 body to DER bytes. */
export const pemToPkcs8Der = (pem: string): Uint8Array => {
  const body = pem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replaceAll(/\s/g, '')
  if (body === '') throw new Error('jwt: empty private key PEM')
  return Uint8Array.from(atob(body), (char) => char.charCodeAt(0))
}
