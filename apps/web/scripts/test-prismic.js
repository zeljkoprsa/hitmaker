/**
 * Test script for Prismic API connection
 * 
 * Run with: node scripts/test-prismic.js
 */

const { createClient } = require('@prismicio/client');
const config = require('../slicemachine.config.json');

async function main() {
  console.log('Testing Prismic API connection...');
  
  try {
    // Create the Prismic client
    const repositoryName = process.env.NEXT_PUBLIC_PRISMIC_ENVIRONMENT || config.repositoryName;
    console.log(`Using repository: ${repositoryName}`);
    
    const client = createClient(repositoryName);
    
    // Attempt to fetch blog posts
    console.log('Fetching blog posts...');
    const posts = await client.getAllByType('blog_post');
    
    // Display the results
    console.log(`Successfully fetched ${posts.length} blog posts:`);
    
    posts.forEach((post, index) => {
      console.log(`\n--- Post ${index + 1} ---`);
      console.log(`UID: ${post.uid}`);
      console.log(`Title: ${post.data.title || 'No title'}`);
      console.log(`Date: ${post.data.publication_date || 'No date'}`);
      console.log(`Description: ${post.data.description || 'No description'}`);
      console.log(`Number of slices: ${post.data.slices?.length || 0}`);
      
      // Show first few slices
      if (post.data.slices && post.data.slices.length > 0) {
        console.log('\nSlices:');
        post.data.slices.slice(0, 3).forEach((slice, i) => {
          console.log(`  ${i + 1}. Type: ${slice.slice_type}, Variation: ${slice.variation}`);
        });
        
        if (post.data.slices.length > 3) {
          console.log(`  ... and ${post.data.slices.length - 3} more slices`);
        }
      }
    });
    
    console.log('\nPrismic API connection test completed successfully!');
  } catch (error) {
    console.error('Error connecting to Prismic API:');
    console.error(error);
    process.exit(1);
  }
}

main();

/**
 * INSTRUCTIONS:
 * 
 * 1. Make sure your Prismic repository is properly set up in slicemachine.config.json
 * 2. Run the script with: node scripts/test-prismic.js
 * 
 * If successful, you should see information about your blog posts from Prismic.
 * If there's an error, check your Prismic configuration and API access.
 */

