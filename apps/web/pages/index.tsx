import React from 'react';
import { GetStaticProps } from 'next';
import AppLayout from '../components/layout/AppLayout';
import Section from '../components/ui/Section';
import BlogCard from '../components/blog/BlogCard';
import Badge from '../components/ui/Badge';
import Image from 'next/image';
import { contentProvider } from '../lib/api';
import { Post } from '../lib/api/content';

interface HomePageProps {
  latestPosts: Post[];
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const posts = await contentProvider.getAllPosts();
    const latestPosts = posts.slice(0, 5); // Get the 5 most recent posts

    return {
      props: {
        latestPosts,
      },
      // Revalidate every hour
      revalidate: 3600
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: {
        latestPosts: [],
      },
      revalidate: 3600
    };
  }
};

const HomePage: React.FC<HomePageProps> = ({ latestPosts = [] }) => {
  return (
    <AppLayout
      seo={{
        title: 'Home',
        description: 'A collection of carefully crafted spaces for the moments between moments. Explore intentional tools and thoughts about finding value in uselessness.',
        url: 'https://tryuseless.com',
      }}
    >
      {/* Journal Section */}
      <Section 
        title="Journal" 
        subtitle="Thoughts on uselessness."
        spacing="medium"
      >
        {latestPosts.length > 0 ? (
          <div className="space-y-6">
            {latestPosts.map((post) => (
              <BlogCard
                key={post.metadata.slug}
                post={{
                  slug: post.metadata.slug,
                  title: post.metadata.title,
                  date: post.metadata.date,
                  description: post.metadata.description || '',
                }}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400">No posts available.</p>
        )}
      </Section>

      {/* Apps Section */}
      <Section spacing="medium" className="mt-12">
        <div className="relative aspect-video rounded-lg overflow-hidden">
          <Image
            src="/images/metrodome-preview.png"
            alt="Metronome - A minimal metronome app"
            fill
            sizes="(max-width: 768px) 100vw, 576px"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40">
            <div className="absolute inset-0 flex flex-col justify-between p-8">
              <Badge variant="light" size="small" className="self-start">
                Coming in 2025
              </Badge>
              <div className="text-center">
                <h3 className="text-2xl font-display text-white mb-2">Useless Metronome</h3>
                <p className="text-gray-400">It starts with a click.</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* About Section */}
      <Section spacing="medium">
        <div className="text-center">
          <p className="text-gray-400">
            Sometimes, the most valuable moments are the ones that serve no purpose at all.
          </p>
        </div>
      </Section>
    </AppLayout>
  );
};

export default HomePage;
