import Head from 'next/head';

interface SEOMetaProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
}

const defaultMeta = {
  siteName: 'tryuseless',
  description: 'A collection of carefully crafted spaces for the moments between moments.',
  image: '/images/og-image.jpg', 
  url: 'https://tryuseless.com',
};

export const SEOMeta: React.FC<SEOMetaProps> = ({
  title,
  description = defaultMeta.description,
  image = defaultMeta.image,
  url = defaultMeta.url,
  type = 'website',
  siteName = defaultMeta.siteName,
}) => {
  const fullTitle = title ? `${title} | ${siteName}` : siteName;

  return (
    <Head>
      {/* Basic Meta */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@try_useless" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional Meta */}
      <link rel="canonical" href={url} />
    </Head>
  );
};

export default SEOMeta;

