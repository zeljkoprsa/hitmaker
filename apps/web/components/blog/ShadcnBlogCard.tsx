import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface Post {
  slug: string;
  title: string;
  date?: string;
  description: string;
}

interface BlogCardProps {
  post: Post;
  featured?: boolean;
}

const ShadcnBlogCard = ({ post, featured = false }: BlogCardProps) => {
  // Handle the case where post is undefined
  if (!post) {
    console.warn('BlogCard received undefined post object');
    return (
      <Card className="opacity-50">
        <CardContent>
          <p className="text-gray-400">Post data unavailable</p>
        </CardContent>
      </Card>
    );
  }
  
  // More robust date handling with try-catch to handle potential invalid dates
  let formattedDate = '';
  
  if (post.date === undefined) {
    console.warn(`BlogCard post (${post.title}) has undefined date`);
  } else if (post.date === '') {
    console.warn(`BlogCard post (${post.title}) has empty string date`);
  } else {
    try {
      const dateObj = new Date(post.date);
      formattedDate = format(dateObj, 'MMMM d, yyyy');
    } catch (error) {
      console.error(`Error formatting date for post "${post.title}":`, error);
      // Leave formattedDate as empty string
    }
  }

  return (
    <Link 
      href={`/journal/${post.slug || 'missing-slug'}`}
      className="block group"
    >
      <Card className={cn(
        "relative overflow-hidden",
        featured ? "" : ""
      )}>

        <CardHeader className="pb-2">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            {formattedDate}
          </span>
          <CardTitle className={cn(
            "font-display",
            featured ? "text-3xl" : "text-xl"
          )}>
            {post.title || 'Untitled Post'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className={cn(
            "font-text text-card-foreground/80",
            featured ? "text-base" : "text-sm"
          )}>
            {post.description || 'No description available'}
          </CardDescription>
        </CardContent>
        <CardFooter>
          <span className={cn(
            "text-primary",
            featured ? "text-sm" : "text-xs"
          )}>
            Read more →
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ShadcnBlogCard;
