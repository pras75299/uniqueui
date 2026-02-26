// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ScrollReveal } from '../components/ui/scroll-reveal';
import React from 'react';

// Mock IntersectionObserver for useInView
class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver
});

describe('UI Components', () => {
  it('renders ScrollReveal without crashing', () => {
    const { getByText } = render(
      <ScrollReveal>
        <div>Test Content</div>
      </ScrollReveal>
    );
    expect(getByText('Test Content')).toBeInTheDocument();
  });
});
