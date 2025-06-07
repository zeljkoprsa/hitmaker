import { GetStaticPropsContext, InferGetStaticPropsType } from "next";
import { createClient } from "../../prismicio";
import { SliceZone } from "@prismicio/react";
import { components } from "../../slices";
import BlogLayout from "../../components/blog/BlogLayout";
import { format } from "date-fns";
import { asText } from "@prismicio/helpers";

export default function BlogPost({ 
  post 
}: InferGetStaticPropsType<typeof getStaticProps>) {
  if (!post) {
    return <div>Loading...</div>; // Or a better loading state/404
  } 
  
  // Format the date for display
  const formattedDate = post.data.publication_date 
    ? format(new Date(post.data.publication_date), 'MMMM d, yyyy')
    : '';
  // Extract title and description text from RichTextField
  const titleText = post.data.title || '';
  const descriptionText = asText(post.data.description) || '';

  return (
    <BlogLayout 
      title={titleText}
      date={formattedDate}
      description={descriptionText}
      showReadingProgress={true}
    >
      <article className="prose lg:prose-xl dark:prose-invert mx-auto">
        <SliceZone slices={post.data.slices} components={components} />
      </article>
    </BlogLayout>
  );
}

export async function getStaticProps({ 
  params, 
  previewData 
}: GetStaticPropsContext) {
  console.log("getStaticProps called with params:", JSON.stringify(params));
  
  if (!params?.uid) {
    console.log("No UID found in params, returning 404");
    return {
      notFound: true,
    };
  }

  console.log(`Attempting to fetch post with UID: "${params.uid}"`);
  const client = createClient({ previewData });
  
  try {
    console.log(`Making Prismic client.getByUID call for type 'blog_post' with UID: "${params.uid}"`);
    const post = await client.getByUID('blog_post', params.uid as string);
    
    // Check if the post is empty or invalid
    if (!post) {
      console.log("Prismic returned empty post data");
      return { notFound: true };
    }
    
    // Debug logging for Prismic data format
    console.log(`Successfully retrieved post with UID: "${params.uid}"`);
    console.log("Post data structure:", {
      id: post.id,
      uid: post.uid,
      type: post.type,
      hasData: !!post.data,
      sliceTypes: post.data?.slices?.map(slice => slice.slice_type) || []
    });
    console.log("Publication date from Prismic:", post.data.publication_date);
    
    if (post.data.publication_date) {
      try {
        const parsedDate = new Date(post.data.publication_date);
        console.log("Parsed date object:", parsedDate);
        console.log("Formatted date:", format(parsedDate, 'MMMM d, yyyy'));
      } catch (dateError) {
        console.error("Error parsing date:", dateError);
      }
    } else {
      console.log("No publication date found for this post");
    }
    
    return {
      props: { 
        post,
      },
      // Optional: Revalidate every hour
      revalidate: 3600,
    };
  } catch (error) {
    console.error(`Failed to fetch post with UID "${params.uid}":`, error);
    console.error("Error details:", {
      name: (error as Error).name,
      message: (error as Error).message,
      stack: (error as Error).stack
    });
    return {
      notFound: true,
    };
  }
}

export async function getStaticPaths() {
  console.log("getStaticPaths called for journal/[uid]");
  const client = createClient();
  
  try {
    console.log("Fetching all blog_post documents from Prismic");
    const posts = await client.getAllByType('blog_post');
    
    console.log(`Found ${posts.length} blog posts in Prismic`);
    
    // Log all post UIDs for debugging
    const postUids = posts.map(post => post.uid);
    console.log("Available post UIDs:", postUids);
    
    // Just to be extra safe, remove any undefined UIDs
    const validPaths = posts
      .filter(post => !!post.uid)
      .map(post => ({
        params: { uid: post.uid },
      }));
    
    console.log(`Generated ${validPaths.length} valid paths for getStaticPaths`);
    
    return {
      paths: validPaths,
      fallback: 'blocking', // Show a loading state while generating new pages
    };
  } catch (error) {
    console.error("Failed to fetch paths:", error);
    console.error("Error details:", {
      name: (error as Error).name,
      message: (error as Error).message,
      stack: (error as Error).stack
    });
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
}
