import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import { MealBuilderProvider } from '../context/MealBuilderContext';
import HomePage from '../pages/HomePage';
import FoodsPage from '../pages/FoodsPage';
import BuildMealPage from '../pages/BuildMealPage';
import YourMealPage from '../pages/YourMealPage';
import AuthPage from '../pages/AuthPage';
import OnboardingPage from '../pages/OnboardingPage';
import ProfilePage from '../pages/ProfilePage';

function renderWithProviders(ui: React.ReactElement, initialRoute = '/') {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MealBuilderProvider>
          <MemoryRouter initialEntries={[initialRoute]}>{ui}</MemoryRouter>
        </MealBuilderProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

describe('All Pages Rendering', () => {
  it('renders HomePage without crashing', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText(/Ethiopian Nutrition/i)).toBeInTheDocument();
  });

  it('renders FoodsPage without crashing', async () => {
    renderWithProviders(<FoodsPage />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Foods' })).toBeInTheDocument();
    });
  });

  it('renders BuildMealPage without crashing', () => {
    renderWithProviders(<BuildMealPage />);
    expect(screen.getByRole('heading', { name: 'Build a Meal' })).toBeInTheDocument();
  });

  it('renders AuthPage without crashing', () => {
    renderWithProviders(<AuthPage />);
    expect(screen.getByText(/Sign in to access your saved meals/i)).toBeInTheDocument();
  });

  it('renders OnboardingPage without crashing', () => {
    renderWithProviders(<OnboardingPage />);
    expect(screen.getByText(/Your Body Metrics/i)).toBeInTheDocument();
  });

  it('renders YourMealPage without crashing', () => {
    renderWithProviders(<YourMealPage />);
    expect(screen.getByText(/Daily Nutrition Progress/i)).toBeInTheDocument();
  });

  it('renders ProfilePage without crashing', () => {
    renderWithProviders(<ProfilePage />);
    expect(screen.getByText(/Your Profile/i)).toBeInTheDocument();
  });
});
