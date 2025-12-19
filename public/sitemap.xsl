<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns="http://www.w3.org/1999/xhtml">

  <xsl:output method="html" indent="yes"/>

  <xsl:template match="/">
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>RepoInfo — Sitemap</title>
        <style>
          body { font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background: #fff; color: #111; padding: 24px; }
          h1 { font-size: 20px; margin-bottom: 8px; }
          .container { max-width: 920px; margin: 0 auto; }
          .list { margin-top: 12px; padding: 0; list-style: none; }
          .item { padding: 12px 0; border-bottom: 1px solid #eee; }
          .loc { font-weight: 600; color: #0b57d0; text-decoration: none; }
          .meta { font-size: 13px; color: #555; margin-top: 6px; }
          .meta span { margin-right: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>RepoInfo Sitemap</h1>
          <p>This is a styled view of the XML sitemap. Search engines ignore this stylesheet, but browsers will render a readable version.</p>
          <ul class="list">
            <xsl:for-each select="//url">
              <li class="item">
                <div>
                  <a class="loc" href="{loc}">
                    <xsl:value-of select="loc"/>
                  </a>
                </div>
                <div class="meta">
                  <xsl:if test="lastmod"><span>Last modified: <xsl:value-of select="lastmod"/></span></xsl:if>
                  <xsl:if test="changefreq"><span>Change freq: <xsl:value-of select="changefreq"/></span></xsl:if>
                  <xsl:if test="priority"><span>Priority: <xsl:value-of select="priority"/></span></xsl:if>
                </div>
              </li>
            </xsl:for-each>
          </ul>
        </div>
      </body>
    </html>
  </xsl:template>

</xsl:stylesheet>
