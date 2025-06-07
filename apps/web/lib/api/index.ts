import { ContentProvider, Post } from './content';
import { prismicContentProvider } from './prismic';

/** Unified provider using Prismic exclusively */
export class UnifiedContentProvider implements ContentProvider {
  async getPostSlugs(): Promise<string[]> {
    return prismicContentProvider.getPostSlugs();
  }
  async getPostBySlug(slug: string): Promise<Post> {
    return prismicContentProvider.getPostBySlug(slug);
  }
  async getAllPosts(): Promise<Post[]> {
    return prismicContentProvider.getAllPosts();
  }
}

export const contentProvider = new UnifiedContentProvider();
