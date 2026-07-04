/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

// A `?raw` markdown import resolves to the file's contents as a string (used to render a
// package's README on its page). More specific than vite/client's generic `*?raw`.
declare module '*.md?raw' {
  const content: string
  export default content
}

// vite-imagetools: a single image import with query params resolves to a URL string.
declare module '*format=avif' {
  const src: string
  export default src
}

// vite-imagetools: an `as=picture` import resolves to a multi-format picture object —
// `sources` keyed by format (avif, webp, …) and an `img` fallback descriptor.
declare module '*as=picture' {
  const picture: {
    sources: Record<string, string>
    img: { src: string; w: number; h: number }
  }
  export default picture
}
