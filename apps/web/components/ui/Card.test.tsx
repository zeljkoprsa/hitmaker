import React from 'react';
import { render, screen } from '@testing-library/react';
import Card from './Card';

describe('Card Component', () => {
  // Test basic rendering
  it('renders correctly with children', () => {
    render(<Card>Test Card</Card>);
    
    // Check if the card content is in the document
    expect(screen.getByText('Test Card')).toBeInTheDocument();
  });

  // Test that children are rendered when props are provided
  it('renders children with various props', () => {
    render(
      <Card 
        hoverEffect={true}
        aspectRatio="aspect-video"
        className="test-combo-class"
      >
        Card With Props
      </Card>
    );
    
    // Content should be in the document regardless of props
    expect(screen.getByText('Card With Props')).toBeInTheDocument();
  });
});

