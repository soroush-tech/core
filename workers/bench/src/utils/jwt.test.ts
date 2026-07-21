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
})
