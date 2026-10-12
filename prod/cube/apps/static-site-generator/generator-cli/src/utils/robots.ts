export function generateRobotsTxt(siteUrl: string): string {
  return `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Sitemap: ${siteUrl}/sitemap.xml
`
}
