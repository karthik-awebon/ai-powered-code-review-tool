import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SkeletonComment } from './SkeletonComment';

describe('SkeletonComment Component', () => {
  it('renders correctly', () => {
    const { container } = render(<SkeletonComment />);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toMatch(/container/);
  });

  it('contains skeleton lines', () => {
    const { container } = render(<SkeletonComment />);
    // Look for elements with class containing 'line'
    const lines = container.querySelectorAll('[class*="line"]');
    expect(lines.length).toBeGreaterThan(0);
  });
});
