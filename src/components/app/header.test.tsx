import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from './header';

// Mock the useSidebar hook
jest.mock('@/components/ui/sidebar', () => ({
  ...jest.requireActual('@/components/ui/sidebar'),
  useSidebar: () => ({
    toggleSidebar: jest.fn(),
  }),
  SidebarTrigger: (props) => <button {...props} data-testid="sidebar-trigger" />,
}));


describe('Header', () => {
  it('renders the application title', () => {
    render(<Header />);
    const titleElement = screen.getByText(/TrueWater Algae Insights/i);
    expect(titleElement).toBeInTheDocument();
  });

  it('renders the Droplets icon', () => {
    render(<Header />);
    // Since lucide-react icons are SVGs, we can look for the title or a specific element.
    // A more robust way is to check for the SVG's presence.
    const icon = document.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('renders the sidebar trigger on smaller screens', () => {
    render(<Header />);
    const trigger = screen.getByTestId('sidebar-trigger');
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveClass('md:hidden');
  });
});
