const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

/**
 * Verify a Cloudflare Turnstile token against the siteverify endpoint. Returns true only on an
 * explicit `success` and, when `allowedHostnames` is non-empty, only if the siteverify-attested
 * `hostname` (the domain the token was solved on - not client-supplied, so unspoofable) is in it.
 * `remoteip` is optional (the visitor's IP, when available).
 */
export const verifyTurnstile = async (
  secret: string,
  token: string,
  remoteip?: string,
  allowedHostnames: string[] = []
): Promise<boolean> => {
  const body = new FormData()
  body.append('secret', secret)
  body.append('response', token)
  if (remoteip) body.append('remoteip', remoteip)

  const res = await fetch(SITEVERIFY, { method: 'POST', body })
  const data = (await res.json()) as { success?: boolean; hostname?: string }
  if (data.success !== true) return false
  if (allowedHostnames.length > 0 && !allowedHostnames.includes(data.hostname ?? '')) return false
  return true
}
