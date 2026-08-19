# Cloudflare in front of GitHub Pages

Record of why `soroush.tech` was moved behind Cloudflare and exactly what was configured.

## Why

Lighthouse flagged **"Use efficient cache lifetimes"** (~215 KiB). The cause: GitHub Pages
hard-codes `Cache-Control: max-age=600` (10 min) on every asset and gives **no way to
override it** - no `_headers` file, no config. On repeat visits the browser re-downloaded
content-hashed JS it could have reused.

The only fix is to put a CDN we _can_ configure in front. We chose Cloudflare (Free plan):
GitHub Pages stays the origin, the build is unchanged, and a Cloudflare Cache Rule overrides
the browser cache TTL for our `/assets/**` bundles. Those filenames are content-hashed
(the hash changes when content changes), so a 1-year `immutable`-style cache is safe.

We did **not** lazy-load routes for this - that shrinks the _first_ load and would not move
this particular audit, which is purely about the `Cache-Control` header value.

## What was changed

### 1. DNS moved to Cloudflare

Added `soroush.tech` as a zone in the Cloudflare dashboard and recreated every record, then
switched the nameservers at Namecheap.

**Namecheap → Domain → Nameservers → Custom DNS:**

- Removed: `dns1.registrar-servers.com`, `dns2.registrar-servers.com`
- Added: `piper.ns.cloudflare.com`, `simon.ns.cloudflare.com`

That nameserver swap is the _only_ change at Namecheap - the old "Host Records" there are
now dormant. All records now live in Cloudflare:

| Type  | Name                                   | Content                                                                | Proxy       | Priority |
| ----- | -------------------------------------- | ---------------------------------------------------------------------- | ----------- | -------- |
| A     | `@`                                    | `185.199.108.153` / `.109` / `.110` / `.111.153`                       | 🟠 Proxied  | -        |
| AAAA  | `@`                                    | `2606:50c0:8000`-`8003::153`                                           | 🟠 Proxied  | -        |
| CNAME | `www`                                  | `soroush-tech.github.io`                                               | 🟠 Proxied  | -        |
| MX    | `@`                                    | `smtp.google.com`                                                      | ⚪ DNS only | `1`      |
| TXT   | `@`                                    | `google-site-verification=KPPMmki16BF0v5Bfm9lRKzao19trdF1fT3OxkwsjjNM` | ⚪ DNS only | -        |
| TXT   | `_github-pages-challenge-soroush-tech` | `501e3fe73bce6b8b893020d1f607eb`                                       | ⚪ DNS only | -        |

Notes for the record:

- The web records (A/AAAA/CNAME) are **proxied** (orange) so the Cache Rule can apply.
- **MX + TXT must stay DNS-only** - they're live Google Workspace email + domain
  verification, and proxying them would break mail. The MX wasn't in Namecheap's "Host
  Records" table; it lived in the separate **Mail Settings** dropdown.

### 2. SSL/TLS

**SSL/TLS → Overview → `Full`**. GitHub Pages serves a valid cert, so Full works (Flexible
would cause a redirect loop with Pages' HTTPS enforcement). GitHub "Enforce HTTPS" stays on.

### 3. Cache Rule (the actual fix)

**Caching → Cache Rules → Create rule:**

- Name: `Long cache for hashed assets`
- **If** (expression editor):
  ```
  (starts_with(http.request.uri.path, "/assets/"))
  ```
- **Then:**
  - Cache eligibility: **Eligible for cache**
  - Edge TTL: **Ignore cache-control header and use this TTL** → **1 year** (`31536000`)
  - Browser TTL: **Ignore origin and use this TTL** → **1 year**

The "ignore origin" TTL is deliberately aggressive - safe **only** because everything under
`/assets/` is content-hashed. It is scoped to `/assets/` precisely so `index.html` keeps a
short TTL and deploys still propagate.

> In the current Cloudflare UI, "Override origin" is worded as **"Ignore cache-control
> header and use this TTL."** That's the option that ignores GitHub's `max-age=600`.

## Verify

```sh
curl -sI https://soroush.tech/assets/<a-chunk>.js | grep -i "cache-control\|cf-cache-status"
```

Expect `cache-control: max-age=31536000` and (after a warm-up request) `cf-cache-status: HIT`.

## Notes / reversibility

- The Cloudflare MCP token in Claude Code is Workers/observability-scoped: it can read the
  zone list but **cannot create zones, DNS records, or cache rules** - so all of the above
  was done in the dashboard, not via API.
- Reversible: delete the Cloudflare zone and point Namecheap nameservers back to
  `dns1/dns2.registrar-servers.com`.
