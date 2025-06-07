import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { contentProvider } from '../../lib/api';
import { Post } from '../../lib/api/content';
import AppLayout from '../../components/layout/AppLayout';
import Section from '../../components/ui/Section';
import ShadcnBlogCard from '../../components/blog/ShadcnBlogCard';

// Helper function to validate if a post is valid for rendering
function isValidPost(post: Post): post is Post {
  // Check if post exists and has the minimum required properties
  if (!post?.metadata?.slug) {
    console.warn('Invalid post object detected', post);
    return false;
  }
  return true;
}

export default function JournalPage({ 
  posts 
}: InferGetStaticPropsType<typeof getStaticProps>) {
  // Filter out any invalid posts
  const validPosts = Array.isArray(posts) ? posts.filter(isValidPost) : [];
  
  // Log if we filtered out any posts
  if (posts.length !== validPosts.length) {
    console.warn(`Filtered out ${posts.length - validPosts.length} invalid posts`);
  }
  return (
    <AppLayout
      seo={{ 
        title: "Journal | Try Useless", 
        description: "Thoughts, reflections, and musings on being less useful." 
      }}
    >
      <Section 
        title="Journal" 
        subtitle="Thoughts, reflections, and musings on being less useful."
        spacing="medium"
      >

        {validPosts.length > 0 ? (
          <div className="space-y-6">
            {validPosts.map((post, index) => (
              <ShadcnBlogCard
                key={post.metadata.slug}
                post={{
                  slug: post.metadata.slug,
                  title: post.metadata.title,
                  date: post.metadata.date,
                  description: post.metadata.description || '',
                }}
                featured={index === 0}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400">No posts found.</p>
        )}
      </Section>
    </AppLayout>
  );
}

export const getStaticProps: GetStaticProps<{ posts: Post[] }> = async () => {
  try {
    const posts = await contentProvider.getAllPosts();
    return {
      props: { 
        posts,
      },
      // Revalidate every hour
      revalidate: 3600,
    };
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return {
      props: { 
        posts: [],
      },
      revalidate: 60, // Try again sooner if there was an error
    };
  }
};
