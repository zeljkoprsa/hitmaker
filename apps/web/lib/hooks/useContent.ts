import { useState, useEffect } from 'react';
import { Post } from '../api/content';
import { contentProvider } from '../api';

interface UsePostsOptions {
  limit?: number;
  contentType?: string;
}

export function usePosts(options: UsePostsOptions = {}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPosts = async () => {
      try {
        setLoading(true);
        const allPosts = await contentProvider.getAllPosts();
        
        if (isMounted) {
          setPosts(options.limit ? allPosts.slice(0, options.limit) : allPosts);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch posts'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPosts();

    return () => {
      isMounted = false;
    };
  }, [options.limit]);

  return { posts, loading, error };
}

export function usePost(slug: string, contentType?: string) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPost = async () => {
      try {
        setLoading(true);
        const fetchedPost = await contentProvider.getPostBySlug(slug);
        
        if (isMounted) {
          setPost(fetchedPost);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(`Failed to fetch post: ${slug}`));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (slug) {
      fetchPost();
    }

    return () => {
      isMounted = false;
    };
  }, [slug]);

  return { post, loading, error };
}
