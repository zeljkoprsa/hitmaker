# Architecture Diagram (2025-05-04)

## Overview
This diagram reflects the current architecture of tryuseless.com after migration to Prismic and refactoring for modularity and maintainability.

---

```mermaid
graph TD
  subgraph Next.js Pages
    A[pages/index.tsx]
    B[pages/journal/index.tsx]
    C[pages/journal/[uid].tsx]
    D[pages/slice-simulator.tsx]
  end

  subgraph Layout
    E[AppLayout]
    F[Header]
    G[Footer]
    H[SEOMeta]
  end

  subgraph UI & Feature Components
    I[Section]
    J[BlogCard]
    K[Badge]
    L[PageTransitionWrapper]
  end

  subgraph Prismic Slices
    M[Heading]
    N[Image]
    O[List]
    P[Quote]
    Q[Text]
  end

  subgraph Styling
    R[Tailwind CSS]
    S[theme config]
    T[globals.css]
  end

  %% Routing
  A --> E
  B --> E
  C --> E
  D --> E

  %% Layout
  E --> F
  E --> G
  E --> H
  E --> I

  %% Components
  I --> J
  I --> K
  E --> L

  %% Prismic Slices
  J --> M
  J --> N
  J --> O
  J --> P
  J --> Q

  %% Styling
  E --> R
  F --> R
  G --> R
  I --> R
  J --> R
  K --> R
  M --> R
  N --> R
  O --> R
  P --> R
  Q --> R
  R --> S
  R --> T
```

---

## Explanation
- **Routing:** Next.js file-based pages route to AppLayout.
- **Layout:** AppLayout wraps all pages, providing Header, Footer, and SEO meta tags.
- **UI/Feature Components:** Section, BlogCard, Badge, and PageTransitionWrapper compose the main UI.
- **Prismic Slices:** Content components (Heading, Image, List, Quote, Text) are rendered via BlogCard and Section.
- **Styling:** All components use Tailwind CSS with custom theme config and global styles.

_Last updated: 2025-05-04_

```
+---------------------------------------------------+
|                      PAGES                        |
|  +-------------+  +-------------+  +-------------+|
|  | index.tsx   |  | journal/*.tsx|  | other pages ||
|  +-------------+  +-------------+  +-------------+|
+---------------------------------------------------+
                |             |
                v             v
+---------------------------------------------------+
|                    LAYOUTS                        |
|  +-------------+  +-------------+                 |
|  | AppLayout   |  | BlogLayout  |                 |
|  +------+------+  +------+------+                 |
+---------|---------------|-------------------------+
          |               |
     +----+----+     +----+----+
     | Header  |     | BlogHeader|
     +---------+     +-----------+
     | Footer  |     | BlogContent|
     +---------+     +-----------+

+---------------------------------------------------+
|                 UI COMPONENTS                     |
|  +-------------+  +-------------+  +-------------+|
|  +-------------+  +-------------+  +-------------+|
|  +-------------+  +-------------+  +-------------+|
|  +-------------+  +-------------+  +-------------++

+---------------------------------------------------+
|                   DATA LAYER                      |
|  +---------------------------------------------+  |
|  |          ContentProvider Interface          |  |
|  +---------------------+---------------------+  |
|                        |                        |
|  +---------------------+  +--------------------+|
|  |    MDX Provider     |  | Prismic Provider   ||
|  +---------------------+  +--------------------+|
+---------------------------------------------------+

+---------------------------------------------------+
|                HOOKS & UTILITIES        |                HOOKS & UTILITI+-------------+  +-------------+|
|  | u|  | u|  | u|  | u|  | u|  | u|  | u|  | u|  | u|  +-------------+  +-------------+  +-------------+|
+---------------------------------------------------+

+----+----+----+----+----+----+----+----+----+----+----    +----+----+----+----+----+----+----+----+----+----+ +-+----+----+----+----+----+----+----+----+----+----  |  +----+----+----+----+----+----+----+----+---- |
|  | (|  | (|  | (|  | (|  | (|  | (|  | (|  | (|  | (|  +--|  | (|  | (|  | (|  | (|  | (|  | (|  | (|  | (|  ---|  | (|  | (|  | (|  | (|  | (|  | (|  | (|  | (|  

##################################################ntProvider through custom hooks
2. Data is processed an2. Data is processed an2. Data is processed an2. s c2. Data is processed an2. Data is processed an2. ponents use values from the centralized theme
5. Utility functions handle common operations like formatting

This architecture creates a clear separation of concerns, with each layer having a specific responsibility:

- **Pages**: Routing and data fetching
- **Layouts**: - **Layouts**: - **Layouts**: - **Layouts**: - **Layouts**: - **Layouts**: - **Layouts**: - **Layouts**:etrieval and processing
- **Hooks & Utilities**: Shared logic and state management
- **Theme**: Styling constants and design system
