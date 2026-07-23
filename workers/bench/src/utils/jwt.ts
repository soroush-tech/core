/** Base64url-encode a string or byte array (no padding). */
export const base64UrlEncode = (data: Uint8Array | string): string => {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data
  let binary = ''
  for (const byte of bytes) binary += String.fromCodePoint(byte)
  // btoa only emits '=' as trailing padding, so stripping all of them is safe and linear.
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

/** Decode a base64url string (with or without padding) to bytes. */
export const base64UrlDecode = (encoded: string): Uint8Array => {
  const binary = atob(encoded.replaceAll('-', '+').replaceAll('_', '/'))
  // atob output is latin1, so every char is a single BMP code point — never undefined.
  return Uint8Array.from(binary, (char) => char.codePointAt(0) as number)
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

/** DER length octets for a content length: short form under 0x80, long form above. */
const encodeDerLength = (length: number): number[] => {
  if (length < 0x80) return [length]
  const bytes: number[] = []
  for (let value = length; value > 0; value >>= 8) bytes.unshift(value & 0xff)
  return [0x80 | bytes.length, ...bytes]
}

/** DER `AlgorithmIdentifier` for rsaEncryption (OID 1.2.840.113549.1.1.1, NULL params). */
const RSA_ALGORITHM_IDENTIFIER = [
  0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00,
]

/** Wrap a PKCS#1 `RSAPrivateKey` DER in a PKCS#8 `PrivateKeyInfo` (version 0, rsaEncryption). */
const wrapPkcs1InPkcs8 = (pkcs1: Uint8Array): Uint8Array => {
  const content = [
    0x02,
    0x01,
    0x00,
    ...RSA_ALGORITHM_IDENTIFIER,
    0x04,
    ...encodeDerLength(pkcs1.length),
    ...pkcs1,
  ]
  return Uint8Array.from([0x30, ...encodeDerLength(content.length), ...content])
}

/**
 * Strip a private-key PEM's armor and decode to PKCS#8 DER for WebCrypto import. Accepts both
 * PKCS#8 (`BEGIN PRIVATE KEY`) and PKCS#1 (`BEGIN RSA PRIVATE KEY`) — the format GitHub App
 * key downloads use — wrapping the latter in a PKCS#8 `PrivateKeyInfo`.
 */
export const pemToPkcs8Der = (pem: string): Uint8Array => {
  const isPkcs1 = pem.includes('-----BEGIN RSA PRIVATE KEY-----')
  const body = pem
    .replaceAll(/-----(?:BEGIN|END) (?:RSA )?PRIVATE KEY-----/g, '')
    .replaceAll(/\s/g, '')
  if (body === '') throw new Error('jwt: empty private key PEM')
  const der = Uint8Array.from(atob(body), (char) => char.codePointAt(0) as number)
  return isPkcs1 ? wrapPkcs1InPkcs8(der) : der
}
