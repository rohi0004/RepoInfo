import sitemap from '@/app/sitemap';

export async function GET() {
  try {
    const items = await sitemap();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const it of items) {
      xml += `  <url>\n`;
      xml += `    <loc>${it.url}</loc>\n`;
      if (it.lastModified) {
        const d = new Date(it.lastModified).toISOString();
        xml += `    <lastmod>${d}</lastmod>\n`;
      }
      if ((it as any).changeFrequency) {
        xml += `    <changefreq>${(it as any).changeFrequency}</changefreq>\n`;
      } else if ((it as any).changefreq) {
        xml += `    <changefreq>${(it as any).changefreq}</changefreq>\n`;
      }
      if ((it as any).priority !== undefined) {
        xml += `    <priority>${(it as any).priority}</priority>\n`;
      }
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    return new Response(xml, {
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
  } catch (e) {
    return new Response('Failed to generate sitemap', { status: 500 });
  }
}
