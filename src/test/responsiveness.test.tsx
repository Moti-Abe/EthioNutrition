import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import { MealBuilderProvider } from '../context/MealBuilderContext';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/HomePage';
import FoodsPage from '../pages/FoodsPage';
import BuildMealPage from '../pages/BuildMealPage';
import YourMealPage from '../pages/YourMealPage';

function renderAppWithRoute(initialRoute = '/') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MealBuilderProvider>
          <MemoryRouter initialEntries={[initialRoute]}>
            <MainLayout />
          </MemoryRouter>
        </MealBuilderProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function setViewportWidth(width: number) {
  window.innerWidth = width;
  window.dispatchEvent(new Event('resize'));
}

describe('Responsive Navigation & Viewport Testing', () => {
  const VIEWPORT_WIDTHS = [320, 360, 375, 390, 414, 480, 768, 1024, 1280, 1440];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    setViewportWidth(1024);
  });

  it('verifies all specified breakpoints resize without throwing errors', () => {
    VIEWPORT_WIDTHS.forEach((width) => {
      expect(() => setViewportWidth(width)).not.toThrow();
      expect(window.innerWidth).toBe(width);
    });
  });

  it('renders desktop navigation bar and logo on large screens (>= 768px)', () => {
    setViewportWidth(1280);
    renderAppWithRoute('/');

    expect(screen.getAllByText('EthioNutrition')[0]).toBeInTheDocument();
    const foodsLinks = screen.getAllByRole('link', { name: /^Foods$/i });
    expect(foodsLinks.length).toBeGreaterThanOrEqual(1);

    const hamburger = screen.getByRole('button', { name: /Open navigation menu/i });
    expect(hamburger).toBeInTheDocument();
    // Hamburger button container has className 'md:hidden'
    expect(hamburger.parentElement).toHaveClass('md:hidden');
  });

  it('toggles mobile menu dropdown when hamburger button is clicked', async () => {
    setViewportWidth(375);
    renderAppWithRoute('/');

    const hamburger = screen.getByRole('button', { name: /Open navigation menu/i });
    expect(hamburger).toBeInTheDocument();

    // Click hamburger to open
    fireEvent.click(hamburger);

    // Verify close icon and aria-label
    expect(screen.getByRole('button', { name: /Close navigation menu/i })).toBeInTheDocument();

    // Verify mobile navigation links exist in the dropdown
    const navDropdown = screen.getByRole('navigation', { name: /Mobile Navigation/i });
    expect(navDropdown).toBeInTheDocument();
    expect(navDropdown).toHaveTextContent('Foods');
    expect(navDropdown).toHaveTextContent('Build Meal');
    expect(navDropdown).toHaveTextContent('Your Meals');

    // Click a navigation link inside mobile dropdown to close menu
    const foodsLink = screen.getAllByRole('link', { name: 'Foods' }).find((link) =>
      navDropdown.contains(link)
    );
    expect(foodsLink).toBeDefined();
    if (foodsLink) {
      fireEvent.click(foodsLink);
    }

    // Dropdown should now be closed
    await waitFor(() => {
      expect(screen.queryByRole('navigation', { name: /Mobile Navigation/i })).not.toBeInTheDocument();
    });
  });

  it('closes mobile menu when Escape key is pressed', async () => {
    setViewportWidth(320);
    renderAppWithRoute('/');

    const hamburger = screen.getByRole('button', { name: /Open navigation menu/i });
    fireEvent.click(hamburger);

    expect(screen.getByRole('navigation', { name: /Mobile Navigation/i })).toBeInTheDocument();

    // Press Escape
    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('navigation', { name: /Mobile Navigation/i })).not.toBeInTheDocument();
    });
  });

  it('closes mobile menu on outside click', async () => {
    setViewportWidth(390);
    renderAppWithRoute('/');

    const hamburger = screen.getByRole('button', { name: /Open navigation menu/i });
    fireEvent.click(hamburger);

    expect(screen.getByRole('navigation', { name: /Mobile Navigation/i })).toBeInTheDocument();

    // Click outside
    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByRole('navigation', { name: /Mobile Navigation/i })).not.toBeInTheDocument();
    });
  });

  it('renders HomePage hero and actions cleanly across mobile and desktop viewports', () => {
    [320, 375, 768, 1440].forEach((width) => {
      setViewportWidth(width);
      const queryClient = new QueryClient();
      const { unmount } = render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HomePage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      expect(screen.getByText(/Know What You Eat/i)).toBeInTheDocument();
      expect(screen.getAllByRole('link', { name: /Explore Foods/i })[0]).toBeInTheDocument();
      expect(screen.getAllByRole('link', { name: /Build a Meal/i })[0]).toBeInTheDocument();
      unmount();
    });
  });

  it('renders FoodsPage controls and cards at narrow mobile width (320px)', async () => {
    setViewportWidth(320);
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <FoodsPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByRole('heading', { name: 'Foods' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search foods/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Filters/i })).toBeInTheDocument();
  });

  it('renders BuildMealPage layout cleanly at narrow mobile width (320px)', () => {
    setViewportWidth(320);
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MealBuilderProvider>
            <MemoryRouter>
              <BuildMealPage />
            </MemoryRouter>
          </MealBuilderProvider>
        </AuthProvider>
      </QueryClientProvider>
    );

    expect(screen.getByRole('heading', { name: 'Build a Meal' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e\.g\. Injera, Shiro/i)).toBeInTheDocument();
  });

  it('renders YourMealPage date navigation and macro cards at 375px', () => {
    setViewportWidth(375);
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MemoryRouter>
            <YourMealPage />
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>
    );

    expect(screen.getByRole('heading', { name: 'Daily Nutrition Progress' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Previous Day/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next Day/i })).toBeInTheDocument();
  });
});

