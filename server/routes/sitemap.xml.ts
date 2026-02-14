export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.url || 'http://localhost:3000'
  const now = new Date().toISOString()

  const pages = [
    { url: baseUrl, lastmod: now },
    { url: `${baseUrl}/pages/1`, lastmod: now },
    { url: `${baseUrl}/info`, lastmod: now },
    { url: `${baseUrl}/api-doc`, lastmod: now },
  ]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
  </url>`).join('\n')}
</urlset>`

  setResponseHeader(event, 'Content-Type', 'application/xml')
  return sitemap
})
