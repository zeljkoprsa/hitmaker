# tryuseless.com - Refactored Architecture

This repository contains the source code for [tryuseless.com](https://tryuseless.com), a website focused on the concept of uselessness and the value of moments that serve no practical purpose.

## Architecture Overview

The codebase has been refactored to follow principles of separation of concerns, modularity, and extensibility:

### Folder Structure

- **components/**
  - **ui/** - Basic UI components (Button, Card, Badge, etc.)
  - **layout/** - Layout components (Header, Footer, AppLayout)
  - **blog/** - Blog-specific components (BlogLayout, BlogHeader, BlogContent)
  - **shared/** - Shared utility components (SEOMeta, PageTransition)
- **lib/**
  - **api/** - Data access layer for content (MDX, Prismic)
  - **hooks/** - Custom React hooks
  - **utils/** - Utility functions
- **pages/** - Next.js pages (routes)
- **styles/** - Global CSS and theme configuration
  - **theme/** - Centralized theme values
- **content/** - MDX content files
- **public/** - Static a- **public/** - Static a- **public/** -tion of Concerns

- **Presentation Logic**: UI components focus purely on rendering and interactivity
- **Data Access Logic**: Abstracted into the `lib/api` layer
- **Business Logic**: Implemented in hooks and utility functions
- **Layout Logic**: Encapsulated in layout components

#### 2. Modularity

- **Component Library**: Reusable UI components following atomic design principles
- **Layout System**: Composable layout components
- **Content Providers**: Pluggable content sources (MDX, Prismic)

#### 3. Extensibility

- **Theme Configuration**: Centralized theme values for consistent styling
- **Content API**: Abstract interface for content retrieval, supporting multiple sources
- **Hooks API**: Encapsulated data fetching and state management

## Development Workflow

### Adding New Pages

1. Create a new file in the `pages` directory
2. Use the `AppLayout` component as2. Use the `AppLayout` componenusing the appropriate content provider or hook2. Use the `AppLayout` component as2. Use the `AppLayout` componenusing the aort Section from '../components/ui/Section';

const MyPage = () => {
  return (
    <AppLayout
      seo={{
        title: 'My Page',
        descrip        descrip        descrip        descrip        descrip  tit        descrip        descrip        descrip           </Section>
    </Ap    </Ap    </Ap    </Ap    </Ap    </Ap    </Ap    </Ap    </Ap    </Ap    </Ap ne    </Ap    </Ap    </Ap    </Ap    </Ap    </matter with metadata
3. Write your content using MDX

Example:
```mdx
---
title: My Blog Post
title: My Blog Post
t using MDX
    </Ap    </Ap    </Ap    </Ap    </Ap-

# My First Heading

This is a paragraph of text.
```

### Adding New Components

1. Creat1. Creat1. Creat1. Creat1. Creat1. Creat1. Creat1. Creat1. Crestablished patterns for props and styling
3. Export the component for use in other files

Example:
```tsx
import React from 'react';

interface MyComponentProps {
  title: string;
  // Additional props...
}

const MyComponent: React.FC<MyComponentProps> = ({ title }) => {
  return <div>{title}</div>;
};

export default MyComponent;
```

## Content Management

### MDX Content

- MDX files are stored in `content/posts`
- Each file includes frontmatter for metadata
- Content is rendered using the MDX components

### Prismic CMS

- Prismic integration is available - Prismic integration is available - Prismic integration is available - Prismic integration is available - Prismic integration is available - Prismic integements

1. Add comprehensive testing with Jest and React Testing Library
2. Implement state management for c2. Implement state management for c2. Ition support
4. Enhance accessibility features
5. Implement performance monitoring and optimization
