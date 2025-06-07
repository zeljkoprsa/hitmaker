# Shared UI Components

This package contains shared UI components that can be used across multiple applications in the monorepo.

## Usage

Components from this package can be imported into any application in the monorepo:

```jsx
import { Button } from '@useless/ui';

function MyComponent() {
  return <Button>Click me</Button>;
}
```

## Development

To add a new component to this package:

1. Create a new component file in the `src` directory
2. Export the component from `src/index.ts`
3. Build the package with `npm run build`
