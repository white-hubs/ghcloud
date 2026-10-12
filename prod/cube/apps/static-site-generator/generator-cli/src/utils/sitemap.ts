export function generateSitemap(pages: Array<{ path: string; isSystem: boolean }>, baseUrl: string): string {
  const urls = pages.map(page => ({
    loc: `${baseUrl}${page.path}`,
    changefreq: page.isSystem ? 'weekly' : 'monthly',
    priority: page.isSystem ? 0.9 : 0.7,
  }))

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`
}
