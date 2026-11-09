import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { MealBuilderProvider } from './context/MealBuilderContext';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import FoodsPage from './pages/FoodsPage';
import FoodDetailPage from './pages/FoodDetailPage';
import CategoriesPage from './pages/CategoriesPage';
import CategoryDetailPage from './pages/CategoryDetailPage';
import BuildMealPage from './pages/BuildMealPage';
import YourMealPage from './pages/YourMealPage';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import ProfilePage from './pages/ProfilePage';
import RequireAuth from './components/auth/RequireAuth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MealBuilderProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/foods" element={<FoodsPage />} />
                <Route path="/foods/:slug" element={<FoodDetailPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/categories/:slug" element={<CategoryDetailPage />} />
                <Route path="/build" element={<BuildMealPage />} />
                <Route
                  path="/meal"
                  element={
                    <RequireAuth>
                      <YourMealPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <RequireAuth>
                      <ProfilePage />
                    </RequireAuth>
                  }
                />
              </Route>
              <Route path="/auth" element={<AuthPage />} />
              <Route
                path="/onboarding"
                element={
                  <RequireAuth>
                    <OnboardingPage />
                  </RequireAuth>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </MealBuilderProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
