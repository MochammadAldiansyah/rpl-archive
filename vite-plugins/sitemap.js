import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Emit sitemap.xml into the build output.
 *
 * Generated at build time from SITE_URL + ROUTES so it can never drift
 * out of sync with the router. Add new routes to ROUTES below.
 *
 * @param {{ siteUrl: string, routes?: string[] }} options
 */
export function sitemap({ siteUrl, routes = ['/'] }) {
  const base = siteUrl.replace(/\/$/, '')

  return {
    name: 'generate-sitemap',
    apply: 'build',
    generateBundle() {
      const lastmod = new Date().toISOString().split('T')[0]

      const urls = routes
        .map(
          (route) => `  <url>
    <loc>${base}${route}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`,
        )
        .join('\n')

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`

      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: xml,
      })
    },
  }
}
