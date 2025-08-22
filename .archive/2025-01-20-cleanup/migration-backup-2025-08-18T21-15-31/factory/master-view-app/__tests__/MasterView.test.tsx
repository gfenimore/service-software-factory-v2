import { render, screen } from '@testing-library/react';
import { MasterView } from '../app/components/MasterView';

describe('MasterView', () => {
  it('renders without crashing', () => {
    render(<MasterView />);
    expect(screen.getByText(/Accounts/i)).toBeInTheDocument();
  });
});
