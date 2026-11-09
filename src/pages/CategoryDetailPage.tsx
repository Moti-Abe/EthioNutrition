import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Search, X } from 'lucide-react';
import { fetchCategoryBySlug } from '../services/categories';
import { fetchFoods } from '../services/foods';
import FoodCard from '../components/food/FoodCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

export default function CategoryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data: category, isLoading: loadingCategory, isError: categoryError } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => fetchCategoryBySlug(slug!),
    enabled: !!slug,
  });

  const { data: foodsData, isLoading: loadingFoods } = useQuery({
    queryKey: ['category-foods', category?.id, search],
    queryFn: () =>
      fetchFoods({
        categoryIds: category ? [category.id] : [],
        search,
        pageSize: 48,
        sortBy: 'name',
        sortDir: 'asc',
      }),
    enabled: !!category?.id,
  });

  const foods = foodsData?.foods ?? [];
  const total = foodsData?.total ?? 0;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearch('');
  };

  if (loadingCategory) {
    return (
      <div style={{ padding: '4rem 1rem', display: 'flex', justifyContent: 'center' }}>
        <LoadingSpinner size="lg" label="Loading category…" />
      </div>
    );
  }

  if (categoryError || !category) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <EmptyState
          title="Category not found"
          description="The category you requested does not exist or has been removed."
          action={
            <Link
              to="/categories"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '0.5rem 1rem',
                backgroundColor: '#17422E',
                color: '#ffffff',
                borderRadius: 8,
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: '0.9rem',
              }}
            >
              <ArrowLeft size={16} /> Back to Categories
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Back button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/categories"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: '#17422E',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 500,
          }}
          className="hover:text-[#C46A3F]"
        >
          <ArrowLeft size={16} /> All Categories
        </Link>
      </div>

      {/* Header Banner */}
      <div
        style={{
          backgroundColor: '#EFEADC',
          borderRadius: 14,
          padding: '2rem',
          border: '1px solid #DCD5C4',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span
            style={{
              padding: '2px 10px',
              borderRadius: 999,
              backgroundColor: '#17422E',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {category.category_type || 'Category'}
          </span>
          <span style={{ fontSize: '0.85rem', color: '#4A5B50' }}>
            {total} {total === 1 ? 'food' : 'foods'}
          </span>
        </div>

        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
            fontWeight: 600,
            color: '#17422E',
            margin: '0.25rem 0 0.5rem',
          }}
        >
          {category.name}
        </h1>

        {category.description && (
          <p
            style={{
              color: '#4A5B50',
              fontSize: '1rem',
              maxWidth: 700,
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            {category.description}
          </p>
        )}
      </div>

      {/* Search within category */}
      <div style={{ marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', maxWidth: 440 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#4A5B50',
              }}
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={`Search within ${category.name}…`}
              style={{
                width: '100%',
                padding: '0.65rem 2.2rem 0.65rem 2.2rem',
                borderRadius: 8,
                border: '1px solid #DCD5C4',
                backgroundColor: '#ffffff',
                color: '#17422E',
                fontSize: '0.9rem',
                fontFamily: "'Inter', sans-serif",
              }}
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#4A5B50',
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            type="submit"
            style={{
              padding: '0.65rem 1.25rem',
              backgroundColor: '#17422E',
              color: '#ffffff',
              borderRadius: 8,
              border: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            Search
          </button>
        </form>
      </div>

      {/* Foods Grid */}
      {loadingFoods ? (
        <LoadingSpinner />
      ) : foods.length === 0 ? (
        <EmptyState
          title="No foods found"
          description={
            search
              ? `No foods matching "${search}" were found in this category.`
              : 'There are currently no foods associated with this category.'
          }
          actionLabel={search ? 'Clear search' : undefined}
          onAction={search ? handleClearSearch : undefined}
        />
      ) : (
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
      )}
    </div>
  );
}

