import React from 'react';
import { render, screen } from '@testing-library/react';
import Badge from './Badge';

describe('Badge Component', () => {
  // Test basic rendering
  it('renders correctly with children', () => {
    render(<Badge>Test Badge</Badge>);
    
    // Check if the badge content is in the document
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
    
    // The badge should be a span element
    const badgeElement = screen.getByText('Test Badge');
    expect(badgeElement.tagName).toBe('SPAN');
  });

  // Test default props
  it('applies default styling when no props are specified', () => {
    render(<Badge>Default Badge</Badge>);
    
    const badgeElement = screen.getByText('Default Badge');
    
    // Default variant should be 'light'
    expect(badgeElement).toHaveClass('bg-white');
    expect(badgeElement).toHaveClass('text-useless-dark');
    
    // Default size should be 'small'
    expect(badgeElement).toHaveClass('px-3');
    expect(badgeElement).toHaveClass('py-1');
    expect(badgeElement).toHaveClass('text-sm');
    
    // Should always have the rounded-full class
    expect(badgeElement).toHaveClass('rounded-full');
  });

  // Test variant prop
  describe('variant prop', () => {
    it('applies light variant styling', () => {
      render(<Badge variant="light">Light Badge</Badge>);
      
      const badgeElement = screen.getByText('Light Badge');
      expect(badgeElement).toHaveClass('bg-white');
      expect(badgeElement).toHaveClass('text-useless-dark');
    });

    it('applies dark variant styling', () => {
      render(<Badge variant="dark">Dark Badge</Badge>);
      
      const badgeElement = screen.getByText('Dark Badge');
      expect(badgeElement).toHaveClass('bg-useless-dark');
      expect(badgeElement).toHaveClass('text-white');
    });

    it('applies primary variant styling', () => {
      render(<Badge variant="primary">Primary Badge</Badge>);
      
      const badgeElement = screen.getByText('Primary Badge');
      expect(badgeElement).toHaveClass('bg-gray-800');
      expect(badgeElement).toHaveClass('text-white');
    });
  });

  // Test size prop
  describe('size prop', () => {
    it('applies small size styling', () => {
      render(<Badge size="small">Small Badge</Badge>);
      
      const badgeElement = screen.getByText('Small Badge');
      expect(badgeElement).toHaveClass('px-3');
      expect(badgeElement).toHaveClass('py-1');
      expect(badgeElement).toHaveClass('text-sm');
    });

    it('applies medium size styling', () => {
      render(<Badge size="medium">Medium Badge</Badge>);
      
      const badgeElement = screen.getByText('Medium Badge');
      expect(badgeElement).toHaveClass('px-4');
      expect(badgeElement).toHaveClass('py-2');
      expect(badgeElement).toHaveClass('text-base');
    });

    it('applies large size styling', () => {
      render(<Badge size="large">Large Badge</Badge>);
      
      const badgeElement = screen.getByText('Large Badge');
      expect(badgeElement).toHaveClass('px-5');
      expect(badgeElement).toHaveClass('py-2.5');
      expect(badgeElement).toHaveClass('text-lg');
    });
  });

  // Test className prop
  it('applies additional className when provided', () => {
    render(<Badge className="custom-class">Custom Badge</Badge>);
    
    const badgeElement = screen.getByText('Custom Badge');
    expect(badgeElement).toHaveClass('custom-class');
    
    // Should still have the default classes
    expect(badgeElement).toHaveClass('bg-white');
    expect(badgeElement).toHaveClass('text-useless-dark');
    expect(badgeElement).toHaveClass('rounded-full');
  });

  // Test combination of props
  it('applies the correct combination of classes when multiple props are set', () => {
    render(
      <Badge 
        variant="primary" 
        size="large" 
        className="test-class"
      >
        Combined Props Badge
      </Badge>
    );
    
    const badgeElement = screen.getByText('Combined Props Badge');
    
    // Variant classes
    expect(badgeElement).toHaveClass('bg-gray-800');
    expect(badgeElement).toHaveClass('text-white');
    
    // Size classes
    expect(badgeElement).toHaveClass('px-5');
    expect(badgeElement).toHaveClass('py-2.5');
    expect(badgeElement).toHaveClass('text-lg');
    
    // Custom class
    expect(badgeElement).toHaveClass('test-class');
    
    // Base class
    expect(badgeElement).toHaveClass('rounded-full');
  });
});

