# Prismic Usage Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Content Types](#content-types)
4. [Slice Components](#slice-components)
5. [Creating and Editing Content](#creating-and-editing-content)
6. [Previewing Content](#previewing-content)
7. [Creating New Slice Types](#creating-new-slice-types)
8. [Deployment and Publishing](#deployment-and-publishing)
9. [Troubleshooting](#troubleshooting)

## Introduction

This website uses [Prismic](https://prismic.io) as its headless CMS. Prismic allows content editors to create and manage content while developers maintain control over the presentation layer. This guide explains how to use Prismic with the website.

## Getting Started

### Prismic Dashboard Access

1. Visit [prismic.io](https://prismic.io) and log in with your credentials
2. Select the "tryuseless" repository

### Key Terminology

- **Custom Type**: A content model that defines the structure of a document (e.g., Blog Post)
- **Slice**: A modular content block (e.g., Text, Image, Quote)
- **Slice Zone**: A flexible area where editors can add multiple slices in any order
- **Document**: An instance of a Custom Type containing actual content

### Testing the Connection

Run the test script to verify your Prismic connection:

```bash
node scripts/test-prismic.js
```

## Content Types

### Blog Post

The `blog_post` content type is used for journal articles and has the following fields:

- **UID**: A unique identifier that becomes part of the URL (e.g., `/journal/being-useless`)
- **Title**: The title of the post
- **Publication Date**: When the post was published
- **Description**: A brief summary or excerpt
- **Featured Image** (optional): Used for social sharing
- **Slice Zone**: The main content area containing various slice types

## Slice Components

The following slice types are available for use in the blog post Slice Zone:

### Text Slice

Use for paragraphs of text with formatting options (bold, italic, etc.).

### Heading Slice

Use for section headings within the post. Options:
- Heading text
- Heading level (h2, h3, h4)

### Quote Slice

Use for blockquotes or highlighted text. Options:
- Quote text
- Attribution (optional)

### List Slice

Use for bulleted or numbered lists. Options:
- List type (bullet or number)
- List items (repeatable)

### Image Slice

Use for images within the post. Options:
- Image
- Caption (optional)
- Size (small, medium, large, full)

## Creating and Editing Content

### Creating a New Blog Post

1. In the Prismic dashboard, click "Create new" and select "Blog post"
2. Fill in the required fields (Title, Publication Date, Description)
3. Add slices to the Slice Zone by clicking the "+" button
4. Choose the appropriate slice type for your content
5. Fill in the slice fields and continue adding slices as needed
6. Save your draft or publish immediately

### Editing an Existing Blog Post

1. Find the post in the Prismic dashboard
2. Click on the post to open it
3. Make your changes
4. Save as a draft or publish the changes

### Best Practices

- Use headings (H2, H3) to organize content hierarchically
- Keep paragraphs relatively short for better readability
- Use quotes for important statements or testimonials
- Include images to break up text and enhance visual appeal
- Use consistent formatting throughout posts

## Previewing Content

Before publishing, you can preview how your content will look on the website:

1. Save your document as a draft
2. Click the "Preview" button in the top-right corner
3. Select the appropriate preview format
4. Your content will open in a new tab showing how it will appear when published

## Creating New Slice Types

If you need a new type of content block, you can create a new slice type:

1. Launch Slice Machine with `npm run slicemachine`
2. Click "Create Slice" in the Slices Library
3. Name your slice and define its fields
4. Create a React component for the slice in `slices/[SliceName]/index.tsx`
5. Add your new slice to the components object in `slices/index.ts`
6. Add the slice to the allowed slices in the Blog Post custom type

## Deployment and Publishing

When you publish content in Prismic:

1. The changes are immediately available via the Prismic API
2. The website will rebuild to include your changes:
   - In development, use `npm run dev` to see changes locally
   - In production, the site automatically updates (may take a few minutes)

## Troubleshooting

### Common Issues

#### Content not appearing on the website
- Check if the content is published (not just saved as a draft)
- Verify the UID is correctly formatted (no spaces or special characters)
- Check the console for any API errors

#### Slices not rendering correctly
- Ensure the slice type matches exactly what's expected in the code
- Check that all required fields are filled in
- Verify that the slice is registered in `slices/index.ts`

#### Preview not working
- Make sure the preview token is valid
- Check that preview routes are properly configured

### Getting Help

If you encounter issues not covered here:

1. Check the [Prismic documentation](https://prismic.io/docs)
2. Contact the development team for website-specific questions
3. Reach out to Prismic support for CMS-related issues

---

This guide should help you get started with using Prismic for the tryuseless.com website. As the site evolves, this documentation will be updated accordingly.

