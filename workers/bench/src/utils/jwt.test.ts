import { describe, it, expect } from 'vitest'
import { base64UrlDecode, base64UrlEncode, decodeJwt, pemToPkcs8Der } from './jwt'

describe('base64url', () => {
  it('round-trips strings and bytes without padding or +/ characters', () => {
    const text = 'hello?>>world'
    const encoded = base64UrlEncode(text)
    expect(encoded).not.toMatch(/[+/=]/)
    expect(new TextDecoder().decode(base64UrlDecode(encoded))).toBe(text)

    const bytes = Uint8Array.from([0, 251, 255, 62, 63, 1])
    expect(base64UrlDecode(base64UrlEncode(bytes))).toEqual(bytes)
  })
})

describe('decodeJwt', () => {
  const part = (value: unknown) => base64UrlEncode(JSON.stringify(value))

  it('decodes header, payload, signed input, and signature', () => {
    const header = { alg: 'RS256', kid: 'k1' }
    const payload = { repository: 'o/r' }
    const signature = Uint8Array.from([1, 2, 3])
    const token = `${part(header)}.${part(payload)}.${base64UrlEncode(signature)}`

    const decoded = decodeJwt(token)
    expect(decoded.header).toEqual(header)
    expect(decoded.payload).toEqual(payload)
    expect(decoded.signedInput).toBe(`${part(header)}.${part(payload)}`)
    expect(decoded.signature).toEqual(signature)
  })

  it('throws on a token without three parts', () => {
    expect(() => decodeJwt('a.b')).toThrow('jwt: malformed token')
  })

  it('throws when a part is valid JSON but not an object', () => {
    const token = `${part({ alg: 'x' })}.${part(123)}.${base64UrlEncode('sig')}`
    expect(() => decodeJwt(token)).toThrow('jwt: malformed token')
    const nullToken = `${part(null)}.${part({})}.${base64UrlEncode('sig')}`
    expect(() => decodeJwt(nullToken)).toThrow('jwt: malformed token')
  })
})

describe('pemToPkcs8Der', () => {
  it('strips the armor and whitespace and decodes the base64 body', () => {
    const pem = `-----BEGIN PRIVATE KEY-----\n${btoa('abc')}\n-----END PRIVATE KEY-----\n`
    expect(pemToPkcs8Der(pem)).toEqual(new TextEncoder().encode('abc'))
  })

  it('throws on a PEM with an empty body', () => {
    expect(() => pemToPkcs8Der('-----BEGIN PRIVATE KEY-----\n-----END PRIVATE KEY-----')).toThrow(
      'jwt: empty private key PEM'
    )
  })

  it('wraps a small PKCS#1 body in a short-form PKCS#8 PrivateKeyInfo', () => {
    const pem = `-----BEGIN RSA PRIVATE KEY-----\n${btoa('abc')}\n-----END RSA PRIVATE KEY-----`
    expect(Array.from(pemToPkcs8Der(pem))).toEqual([
      ...[0x30, 0x17], // PrivateKeyInfo SEQUENCE, 23 bytes
      ...[0x02, 0x01, 0x00], // version 0
      ...[0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00],
      ...[0x04, 0x03, 0x61, 0x62, 0x63], // OCTET STRING "abc"
    ])
  })

  it('wraps a real PKCS#1 key into DER identical to the WebCrypto PKCS#8 export', async () => {
    const pair = await crypto.subtle.generateKey(
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
      },
      true,
      ['sign', 'verify']
    )
    const pkcs8 = new Uint8Array(await crypto.subtle.exportKey('pkcs8', pair.privateKey))

    // PrivateKeyInfo = 30 len · 02 01 00 · alg(15) · 04 len · <PKCS#1> — skip to the key bytes.
    const lengthOctets = (at: number) => (pkcs8[at] < 0x80 ? 1 : 1 + (pkcs8[at] & 0x7f))
    let offset = 1 + lengthOctets(1) + 3 + 15
    offset += 1 + lengthOctets(offset + 1)
    const pkcs1 = pkcs8.slice(offset)

    const body = btoa(String.fromCharCode(...pkcs1))
    const pem = `-----BEGIN RSA PRIVATE KEY-----\n${body}\n-----END RSA PRIVATE KEY-----`
    expect(pemToPkcs8Der(pem)).toEqual(pkcs8)
  })
})
