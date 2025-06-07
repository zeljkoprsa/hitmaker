import React, { ReactNode } from 'react';
import AppLayout from '../layout/AppLayout';
import BlogHeader from './BlogHeader';
import ReadingProgressBar from './ReadingProgressBar';

interface BlogLayoutProps {
  children: ReactNode;
  title: string;
  date: string;
  description?: string;
  showReadingProgress?: boolean;
  backLink?: string;
  image?: string;
}

const BlogLayout: React.FC<BlogLayoutProps> = ({
  children,
  title,
  date,
  description,
  showReadingProgress = true,
  backLink = '/journal',
  image,
}) => {
  // Generate the canonical URL for the current page
  const canonicalUrl = typeof window !== 'undefined' 
    ? window.location.href 
    : `https://tryuseless.com/journal/${backLink}`;

  // Estimate reading time - default to 3 mins when we can't calculate
  const readingTime = 3;

  return (
    <AppLayout showBackLink minimal={true} seo={{
      title,
      description: description || `Read ${title} on tryuseless`,
      url: canonicalUrl,
      type: 'article',
      image: image || '/images/og-image.jpg',
    }}>
      {showReadingProgress && <ReadingProgressBar />}
      
      <article className="prose prose-2xl mx-auto px-4 py-12">
        <BlogHeader 
          title={title}
          date={date}
          readingTime={readingTime}
          description={description}
        />
        {children}
      </article>
    </AppLayout>
  );
};

export default BlogLayout;
