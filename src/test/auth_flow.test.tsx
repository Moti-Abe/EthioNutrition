import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import AuthPage from '../pages/AuthPage';

function renderAuthPage(initialRoute = '/auth') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={[initialRoute]}>
          <AuthPage />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

describe('Direct Authentication Flow (No Email Confirmation Required)', () => {
  it('renders Registration form when mode is signup', () => {
    renderAuthPage('/auth?mode=signup');

    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Confirm Password/i)).toBeInTheDocument();
  });

  it('renders Login form by default and allows immediate sign in', () => {
    renderAuthPage('/auth');

    // Tab and submit buttons both exist for Sign In
    const signInButtons = screen.getAllByRole('button', { name: 'Sign In' });
    expect(signInButtons.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
  });

  it('allows seamless switching between Sign In and Register', () => {
    renderAuthPage('/auth');

    // Click Register tab
    const registerTab = screen.getByRole('button', { name: 'Register' });
    fireEvent.click(registerTab);

    // Now in Register mode
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
    expect(screen.getByText(/Confirm Password/i)).toBeInTheDocument();

    // Click Sign In tab
    const signInTab = screen.getAllByRole('button', { name: 'Sign In' })[0];
    fireEvent.click(signInTab);

    // Back to Sign In
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    expect(screen.queryByText(/Confirm Password/i)).not.toBeInTheDocument();
  });
});
