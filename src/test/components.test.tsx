import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FoodCard from '../components/food/FoodCard';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import { MealBuilderProvider } from '../context/MealBuilderContext';
import type { FoodWithNutrition } from '../types';

const mockFood: FoodWithNutrition = {
  id: 'f101',
  slug: 'shiro',
  name: 'Shiro',
  name_amharic: 'ሽሮ',
  name_afaan_oromo: 'Ittoo Shiroo',
  description: 'Chickpea stew',
  food_group: 'Legumes & Pulses',
  image_url: null,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  food_nutrition: [
    {
      id: 'n101',
      food_id: 'f101',
      preparation_state: 'Cooked stew',
      calories_kcal: 138,
      protein_g: 5.8,
      carbohydrates_g: 16.2,
      fat_g: 5.5,
      fiber_g: 4.1,
      sodium_mg: 380,
      source_name: 'EPHI',
      source_reference: '',
      verification_status: 'verified',
      notes: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
};

describe('UI Component Suite', () => {
  it('renders FoodCard with name, local names, and per 100g qualifier', () => {
    render(
      <MemoryRouter>
        <MealBuilderProvider>
          <FoodCard food={mockFood} />
        </MealBuilderProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Shiro')).toBeInTheDocument();
    expect(screen.getByText('ሽሮ')).toBeInTheDocument();
    expect(screen.getByText('Ittoo Shiroo')).toBeInTheDocument();
    expect(screen.getByText(/Approximate, per 100 g/i)).toBeInTheDocument();
    expect(screen.getByText('138')).toBeInTheDocument(); // calories
    expect(screen.getByText('5.8g')).toBeInTheDocument(); // protein
  });

  it('renders EmptyState with action handler', () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        title="No results found"
        description="Try a different keyword."
        actionLabel="Reset Search"
        onAction={handleAction}
      />
    );

    expect(screen.getByText('No results found')).toBeInTheDocument();
    expect(screen.getByText('Try a different keyword.')).toBeInTheDocument();
    const btn = screen.getByText('Reset Search');
    fireEvent.click(btn);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('renders Button with variants and handles loading state', () => {
    const { rerender } = render(<Button variant="primary">Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();

    rerender(
      <Button variant="secondary" loading>
        Loading Button
      </Button>
    );
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });
});

