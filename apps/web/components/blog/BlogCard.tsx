import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

interface Post {
  slug: string;
  title: string;
  date?: string; // Made optional to handle cases where date might be undefined
  description: string;
}

interface BlogCardProps {
  post: Post;
  featured?: boolean;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, featured = false }) => {
  // Handle the case where post is undefined
  if (!post) {
    console.warn('BlogCard received undefined post object');
    return (
      <div className="relative overflow-hidden rounded-lg p-6 opacity-50">
        <p className="text-gray-400">Post data unavailable</p>
      </div>
    );
  }

  // Debug post object
  console.log('BlogCard received post:', {
    slug: post.slug,
    title: post.title,
    date: post.date, 
    descriptionLength: post.description?.length
  });
  
  // More robust date handling with try-catch to handle potential invalid dates
  let formattedDate = '';
  
  if (post.date === undefined) {
    console.warn(`BlogCard post (${post.title}) has undefined date`);
  } else if (post.date === '') {
    console.warn(`BlogCard post (${post.title}) has empty string date`);
  } else {
    console.log(`Attempting to format date "${post.date}" for post "${post.title}"`);
    try {
      const dateObj = new Date(post.date);
      formattedDate = format(dateObj, 'MMMM d, yyyy');
      console.log(`Successfully formatted date to: "${formattedDate}"`);
    } catch (error) {
      console.error(`Error formatting date for post "${post.title}":`, error);
      // Leave formattedDate as empty string
    }
  }

  // Render a horizontal card if featured, or a regular card if not
  if (featured) {
    return (
      <Link 
        href={`/journal/${post.slug || 'missing-slug'}`}
        className="block group"
      >
        <article className="relative overflow-hidden rounded-lg p-6">
          <span className="absolute left-0 top-0 h-full w-[2px] bg-gradient-to-b from-transparent via-[#333333] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
          <span className="text-xs uppercase tracking-widest text-gray-400">
            {formattedDate}
          </span>
          <h2 className="mt-2 mb-3 text-3xl font-bold text-white">{post.title || 'Untitled Post'}</h2>
          <p className="mb-4 text-gray-300">{post.description || 'No description available'}</p>
          <span className="text-sm text-useless-purple">Read more →</span>
        </article>
      </Link>
    );
  }

  return (
    <Link 
      href={`/journal/${post.slug || 'missing-slug'}`}
      className="block group"
    >
      <article className="relative overflow-hidden rounded-lg p-6">
        <span className="absolute left-0 top-0 h-full w-[2px] bg-gradient-to-b from-transparent via-[#333333] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
        <span className="text-xs uppercase tracking-widest text-gray-400">
          {formattedDate}
        </span>
        <h2 className="mt-2 mb-3 text-xl font-bold text-white">{post.title || 'Untitled Post'}</h2>
        <p className="mb-4 text-sm text-gray-300">{post.description || 'No description available'}</p>
        <span className="text-xs text-useless-purple">Read more →</span>
      </article>
    </Link>
  );
};

export default BlogCard;

