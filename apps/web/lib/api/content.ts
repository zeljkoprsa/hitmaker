// Removed MDX type; content is Prismic slices array

export interface PostMetadata {
  title: string;
  date: string;
  slug: string;
  excerpt?: string;
  description?: string;
  image?: string;
  [key: string]: any;
}

export interface Post {
  metadata: PostMetadata;
  content: any[];
}

export interface ContentProvider {
  getPostBySlug(slug: string): Promise<Post>;
  getAllPosts(): Promise<Post[]>;
  getPostSlugs(): Promise<string[]>;
}

export const createContentProvider = (provider: ContentProvider): ContentProvider => {
  return provider;
};
