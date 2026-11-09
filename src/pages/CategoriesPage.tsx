import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Info } from 'lucide-react';
import { fetchCategories, countFoodsInCategory } from '../services/categories';
import { fetchFoods } from '../services/foods';
import FoodCard from '../components/food/FoodCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import type { Category } from '../types';

const CATEGORY_DESCRIPTIONS: Record<string, { emoji: string; color: string }> = {
  'weight-gain': { emoji: '💪', color: '#17422E' },
  'high-protein': { emoji: '🥩', color: '#C46A3F' },
  'weight-loss': { emoji: '🥗', color: '#2d7a4f' },
};

export default function CategoriesPage() {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const { data: categories = [], isLoading: loadingCats } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const { data: foodData, isLoading: loadingFoods } = useQuery({
    queryKey: ['foods-by-categories', selectedCategoryIds, search],
    queryFn: () =>
      fetchFoods({
        categoryIds: selectedCategoryIds,
        search,
        page: 1,
        pageSize: 48,
        sortBy: 'name',
        sortDir: 'asc',
      }),
    enabled: selectedCategoryIds.length > 0,
  });

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectedCategories = categories.filter((c) => selectedCategoryIds.includes(c.id));
  const foods = foodData?.foods ?? [];
  const total = foodData?.total ?? 0;

  if (loadingCats) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="mb-8">
        <h1
          style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
            fontWeight: 600,
            color: '#17422E',
            marginBottom: '8px',
          }}
        >
          Explore Categories
        </h1>
        <p style={{ color: '#4A5B50', fontSize: '15px' }}>
          Browse foods by nutritional profile. Select multiple categories to find foods that match all criteria.
        </p>
      </div>

      {/* AND logic info */}
      {selectedCategoryIds.length > 1 && (
        <div
          style={{
            background: '#EFEADC',
            border: '1px solid #DCD5C4',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: '#4A5B50',
          }}
        >
          <Info size={14} color="#C46A3F" />
          Showing foods in <strong style={{ color: '#17422E' }}>all</strong> selected categories (AND logic).
        </div>
      )}

      {/* Category cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        {categories.map((cat) => {
          const meta = CATEGORY_DESCRIPTIONS[cat.slug] ?? { emoji: '📊', color: '#17422E' };
          const isSelected = selectedCategoryIds.includes(cat.id);
          return (
            <CategoryCard
              key={cat.id}
              category={cat}
              emoji={meta.emoji}
              accentColor={meta.color}
              isSelected={isSelected}
              onToggle={() => toggleCategory(cat.id)}
            />
          );
        })}
      </div>

      {/* Selected filter chips + clear */}
      {selectedCategoryIds.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', color: '#4A5B50' }}>Filtered by:</span>
          {selectedCategories.map((cat) => (
            <span
              key={cat.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: '#17422E',
                color: 'white',
                borderRadius: '999px',
                padding: '4px 12px',
                fontSize: '13px',
              }}
            >
              {cat.name}
              <button
                onClick={() => toggleCategory(cat.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'rgba(255,255,255,0.7)', padding: 0 }}
              >
                <X size={12} />
              </button>
            </span>
          ))}
          <button
            onClick={() => setSelectedCategoryIds([])}
            style={{ color: '#C46A3F', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Clear all
          </button>
        </div>
      )}

      {/* Search within filtered results */}
      {selectedCategoryIds.length > 0 && (
        <div style={{ marginBottom: '20px', position: 'relative', maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Search within results…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #DCD5C4',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#17422E',
              background: 'white',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#4A5B50' }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {selectedCategoryIds.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px',
            background: 'white',
            border: '1px solid #DCD5C4',
            borderRadius: '12px',
            color: '#4A5B50',
          }}
        >
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>☝️</div>
          <p style={{ fontSize: '15px' }}>Select one or more categories above to browse foods.</p>
        </div>
      ) : loadingFoods ? (
        <LoadingSpinner />
      ) : foods.length === 0 ? (
        <EmptyState
          title="No foods match all selected categories"
          description="Try selecting fewer categories, or clear the selection to start over."
          actionLabel="Clear selection"
          onAction={() => setSelectedCategoryIds([])}
        />
      ) : (
        <>
          <p style={{ color: '#4A5B50', fontSize: '14px', marginBottom: '16px' }}>
            {total} food{total !== 1 ? 's' : ''} found
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            {foods.map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CategoryCard({
  category,
  emoji,
  accentColor,
  isSelected,
  onToggle,
}: {
  category: Category;
  emoji: string;
  accentColor: string;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const { data: count } = useQuery({
    queryKey: ['categoryCount', category.id],
    queryFn: () => countFoodsInCategory(category.id),
  });

  return (
    <button
      onClick={onToggle}
      style={{
        background: isSelected ? accentColor : 'white',
        border: `2px solid ${isSelected ? accentColor : '#DCD5C4'}`,
        borderRadius: '12px',
        padding: '20px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 150ms',
        width: '100%',
      }}
    >
      <div style={{ fontSize: '28px', marginBottom: '10px' }}>{emoji}</div>
      <h3
        style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: '1rem',
          fontWeight: 600,
          color: isSelected ? 'white' : '#17422E',
          marginBottom: '6px',
        }}
      >
        {category.name}
      </h3>
      <p style={{ fontSize: '12px', color: isSelected ? 'rgba(255,255,255,0.8)' : '#4A5B50', lineHeight: 1.5, marginBottom: '10px' }}>
        {category.description}
      </p>
      {count !== undefined && (
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: isSelected ? 'rgba(255,255,255,0.7)' : '#4A5B50',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {count} foods
        </span>
      )}
    </button>
  );
}
