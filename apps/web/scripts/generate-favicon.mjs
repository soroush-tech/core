import { writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import pngToIco from 'png-to-ico'

// Google Search doesn't reliably rasterize SVG favicons, so we generate PNG/ICO
// fallbacks at build time from the Figma-exported source instead of hand-exporting them.
const dir = dirname(fileURLToPath(import.meta.url))
const source = resolve(dir, '../src/assets/soroush-icon.png')
const publicDir = resolve(dir, '../public')

const render = (size) => sharp(source).resize(size, size, { fit: 'cover' }).png().toBuffer()

const [icon16, icon32, icon48, icon192] = await Promise.all([16, 32, 48, 192].map(render))

await Promise.all([
  writeFile(resolve(publicDir, 'favicon-48x48.png'), icon48),
  writeFile(resolve(publicDir, 'favicon-192x192.png'), icon192),
  pngToIco([icon16, icon32, icon48]).then((ico) =>
    writeFile(resolve(publicDir, 'favicon.ico'), ico)
  ),
])

console.log('generate-favicon: wrote favicon.ico, favicon-48x48.png, favicon-192x192.png')
