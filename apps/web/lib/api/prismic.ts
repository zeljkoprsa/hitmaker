import * as prismic from '@prismicio/client';
import { createClient } from '../../prismicio';
import { ContentProvider, Post, PostMetadata } from './content';

export class PrismicContentProvider implements ContentProvider {
  private client: prismic.Client;

  constructor() {
    this.client = createClient();
  }

  async getPostSlugs(): Promise<string[]> {
    const posts = await this.client.getAllByType('blog_post');
    return posts.map((post) => post.uid || '').filter(Boolean);
  }

  async getPostBySlug(slug: string): Promise<Post> {
    const post = await this.client.getByUID('blog_post', slug);
    
    // Extract data from Prismic document
    const metadata: PostMetadata = {
      title: post.data.title || 'Untitled',
      date: post.first_publication_date || new Date().toISOString(),
      slug: post.uid || '',
      description: post.data.description?.[0]?.text || '',
      excerpt: post.data.excerpt?.[0]?.text || '',
      image: post.data.featured_image?.url || '',
    };

    // Return raw Prismic slices for rendering via SliceZone
    const content = post.data.content || [];

    return { metadata, content };
  }

  async getAllPosts(): Promise<Post[]> {
    try {
      const slugs = await this.getPostSlugs();
      const posts = await Promise.all(
        slugs.map(async (slug) => this.getPostBySlug(slug))
      );

      // Sort posts by date
      return posts.sort((a, b) => {
        const dateA = new Date(a.metadata.date);
        const dateB = new Date(b.metadata.date);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error('Error fetching posts from Prismic:', error);
      return [];
    }
  }
}

export const prismicContentProvider = new PrismicContentProvider();
