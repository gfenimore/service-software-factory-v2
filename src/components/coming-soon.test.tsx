import { render, screen } from '@testing-library/react';
import ComingSoon from './coming-soon';

describe('ComingSoon Component', () => {
  it('renders Coming Soon heading', () => {
    render(<ComingSoon module="Test Module" focusArea="Test Focus Area" />);
    
    expect(screen.getByRole('heading', { name: /coming soon!/i })).toBeInTheDocument();
  });

  it('displays module and focus area correctly', () => {
    render(<ComingSoon module="Accounts" focusArea="Reports" />);
    
    expect(screen.getByText('Accounts Reports')).toBeInTheDocument();
  });

  it('displays Operations module context correctly', () => {
    render(<ComingSoon module="Operations" focusArea="Work Orders" />);
    
    expect(screen.getByText('Operations Work Orders')).toBeInTheDocument();
  });

  it('displays Administration module context correctly', () => {
    render(<ComingSoon module="Administration" focusArea="User Management" />);
    
    expect(screen.getByText('Administration User Management')).toBeInTheDocument();
  });

  it('includes standard development message', () => {
    render(<ComingSoon module="Test Module" focusArea="Test Focus Area" />);
    
    expect(screen.getByText(/this feature is under development and will be available soon/i)).toBeInTheDocument();
  });

  it('has proper semantic structure', () => {
    render(<ComingSoon module="Test Module" focusArea="Test Focus Area" />);
    
    // Check for heading hierarchy
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    
    // Check for proper text content structure
    expect(screen.getByText('Test Module Test Focus Area')).toBeInTheDocument();
  });

  it('maintains consistent styling classes', () => {
    const { container } = render(<ComingSoon module="Test Module" focusArea="Test Focus Area" />);
    
    // Check for centered layout
    expect(container.firstChild).toHaveClass('flex', 'items-center', 'justify-center', 'min-h-[400px]');
    
    // Check for text center styling
    const textContainer = container.querySelector('.text-center');
    expect(textContainer).toBeInTheDocument();
  });
});