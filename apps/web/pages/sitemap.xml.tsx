// pages/sitemap.xml.tsx
import { GetServerSideProps } from 'next';
import { contentProvider } from '../lib/api';
import { ServerResponse } from 'http';

const Sitemap = () => {
  return null;
};

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  if (!(res instanceof ServerResponse)) {
    return {
      props: {},
    };
  }

  const baseUrl = 'https://tryuseless.com';
  const slugs = await contentProvider.getPostSlugs();

  // Generate sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <!-- Home page -->
      <url>
        <loc>${baseUrl}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
      
      <!-- Journal index -->
      <url>
        <loc>${baseUrl}/journal</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
      </url>
      
      <!-- Individual posts -->
      ${slugs
        .map(
          (slug) => `
        <url>
          <loc>${baseUrl}/journal/${slug}</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.7</priority>
        </url>
      `
        )
        .join('')}
    </urlset>`;

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

export default Sitemap;