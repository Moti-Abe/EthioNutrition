import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, X, Check, RotateCcw } from 'lucide-react';
import { fetchFoods, fetchFoodGroups } from '../services/foods';
import { fetchCategories } from '../services/categories';
import FoodCard from '../components/food/FoodCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import type { FoodFilters } from '../types';

const PAGE_SIZE = 24;

export default function FoodsPage() {
  const [filters, setFilters] = useState<FoodFilters>({
    search: '',
    categoryIds: [],
    foodGroup: '',
    preparationState: '',
    sortBy: 'name',
    sortDir: 'asc',
    page: 1,
    pageSize: PAGE_SIZE,
  });
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(true);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['foods', filters],
    queryFn: () => fetchFoods(filters),
  });

  const { data: foodGroups = [] } = useQuery({
    queryKey: ['foodGroups'],
    queryFn: fetchFoodGroups,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['filterCategories'],
    queryFn: fetchCategories,
  });

  const foods = data?.foods ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const selectedCategoryIds = filters.categoryIds ?? [];
  const activeCategories = categories.filter((c) => selectedCategoryIds.includes(c.id));
  const hasActiveFilters = Boolean(
    filters.search || filters.foodGroup || selectedCategoryIds.length > 0
  );
  const activeFilterCount =
    (filters.foodGroup ? 1 : 0) +
    selectedCategoryIds.length +
    (filters.search ? 1 : 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, search: searchInput, page: 1 }));
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setFilters((f) => ({ ...f, search: '', page: 1 }));
  };

  const updateFilter = <K extends keyof FoodFilters>(key: K, value: FoodFilters[K]) => {
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));
  };

  const toggleCategory = (categoryId: string) => {
    const current = filters.categoryIds ?? [];
    const next = current.includes(categoryId)
      ? current.filter((id) => id !== categoryId)
      : [...current, categoryId];
    updateFilter('categoryIds', next);
  };

  const handleClearAllFilters = () => {
    setSearchInput('');
    setFilters((f) => ({
      ...f,
      search: '',
      foodGroup: '',
      categoryIds: [],
      page: 1,
    }));
  };

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
          Foods
        </h1>
        <p style={{ color: '#4A5B50', fontSize: '15px' }}>
          Browse {total > 0 ? `${total} foods` : 'foods'} with accurate nutritional information per 100 g.
        </p>
      </div>

      {/* Search + Filter controls bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearch} style={{ flex: '1', minWidth: '240px', position: 'relative' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#4A5B50',
            }}
          />
          <input
            type="text"
            placeholder="Search foods, e.g. injera, shiro, lentils…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 36px 10px 36px',
              border: '1px solid #DCD5C4',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#17422E',
              background: 'white',
              outline: 'none',
            }}
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#4A5B50',
              }}
              aria-label="Clear search text"
            >
              <X size={15} />
            </button>
          )}
        </form>

        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 16px',
            border: '1px solid #DCD5C4',
            borderRadius: '8px',
            background: showFilters ? '#17422E' : 'white',
            color: showFilters ? 'white' : '#17422E',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            transition: 'all 150ms ease',
          }}
        >
          <SlidersHorizontal size={15} />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span
              style={{
                backgroundColor: showFilters ? 'rgba(255,255,255,0.25)' : '#C46A3F',
                color: '#ffffff',
                borderRadius: '999px',
                padding: '1px 7px',
                fontSize: '11px',
                fontWeight: 700,
                marginLeft: '2px',
              }}
            >
              {activeFilterCount}
            </span>
          )}
        </button>

        <select
          value={`${filters.sortBy}:${filters.sortDir}`}
          onChange={(e) => {
            const [sortBy, sortDir] = e.target.value.split(':') as [
              FoodFilters['sortBy'],
              FoodFilters['sortDir']
            ];
            setFilters((f) => ({ ...f, sortBy, sortDir, page: 1 }));
          }}
          style={{
            padding: '10px 12px',
            border: '1px solid #DCD5C4',
            borderRadius: '8px',
            background: 'white',
            color: '#17422E',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          <option value="name:asc">Name A–Z</option>
          <option value="name:desc">Name Z–A</option>
        </select>
      </div>

      {/* Expandable filters panel */}
      {showFilters && (
        <div
          style={{
            background: 'white',
            border: '1px solid #DCD5C4',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: '0 2px 8px rgba(23,66,46,0.04)',
          }}
        >
          {/* Section 1: Food Group */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '10px',
              }}
            >
              <label
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#17422E',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Food Group
              </label>
              {filters.foodGroup && (
                <button
                  type="button"
                  onClick={() => updateFilter('foodGroup', '')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#C46A3F',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Clear Group
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => updateFilter('foodGroup', '')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  border: '1px solid',
                  borderColor: filters.foodGroup === '' ? '#17422E' : '#DCD5C4',
                  background: filters.foodGroup === '' ? '#17422E' : 'white',
                  color: filters.foodGroup === '' ? 'white' : '#4A5B50',
                  fontSize: '13px',
                  fontWeight: filters.foodGroup === '' ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
              >
                All
              </button>
              {foodGroups.map((group) => {
                const isSelected = filters.foodGroup === group;
                return (
                  <button
                    key={group}
                    type="button"
                    onClick={() => updateFilter('foodGroup', isSelected ? '' : group)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '999px',
                      border: '1px solid',
                      borderColor: isSelected ? '#17422E' : '#DCD5C4',
                      background: isSelected ? '#17422E' : 'white',
                      color: isSelected ? 'white' : '#4A5B50',
                      fontSize: '13px',
                      fontWeight: isSelected ? 600 : 500,
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                      transition: 'all 150ms ease',
                    }}
                  >
                    {group}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Food Categories (Multi-Select with OR logic) */}
          <div
            style={{
              paddingTop: '16px',
              borderTop: '1px solid #EFEADC',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '6px',
                flexWrap: 'wrap',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <label
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#17422E',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  Categories
                </label>
                <span
                  style={{
                    fontSize: '11px',
                    color: '#4A5B50',
                    backgroundColor: '#F7F4EC',
                    border: '1px solid #DCD5C4',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontWeight: 500,
                  }}
                >
                  Multi-select (OR logic)
                </span>
              </div>

              {selectedCategoryIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => updateFilter('categoryIds', [])}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#C46A3F',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Clear Categories ({selectedCategoryIds.length})
                </button>
              )}
            </div>

            <p style={{ fontSize: '12px', color: '#4A5B50', margin: '0 0 10px 0' }}>
              Select one or multiple categories to show foods matching any of your selections.
            </p>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {categories.map((cat) => {
                const isSelected = selectedCategoryIds.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 15px',
                      borderRadius: '999px',
                      border: '1px solid',
                      borderColor: isSelected ? '#17422E' : '#DCD5C4',
                      background: isSelected ? '#17422E' : '#ffffff',
                      color: isSelected ? '#ffffff' : '#17422E',
                      fontSize: '13px',
                      fontWeight: isSelected ? 600 : 500,
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                      boxShadow: isSelected ? '0 2px 6px rgba(23,66,46,0.18)' : 'none',
                    }}
                  >
                    {isSelected ? (
                      <Check size={13} strokeWidth={2.5} />
                    ) : (
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: '#DCD5C4',
                        }}
                      />
                    )}
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Active filter summary & counter bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#17422E',
              backgroundColor: '#EFEADC',
              padding: '4px 10px',
              borderRadius: '6px',
            }}
          >
            {total} {total === 1 ? 'food' : 'foods'} found
          </span>

          {hasActiveFilters && (
            <>
              {filters.search && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: '#ffffff',
                    border: '1px solid #DCD5C4',
                    borderRadius: '999px',
                    padding: '3px 10px',
                    fontSize: '12px',
                    color: '#17422E',
                  }}
                >
                  <span>Search: "{filters.search}"</span>
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      color: '#4A5B50',
                      padding: 0,
                    }}
                    aria-label="Remove search filter"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              {filters.foodGroup && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: '#ffffff',
                    border: '1px solid #DCD5C4',
                    borderRadius: '999px',
                    padding: '3px 10px',
                    fontSize: '12px',
                    color: '#17422E',
                  }}
                >
                  <span>Group: {filters.foodGroup}</span>
                  <button
                    type="button"
                    onClick={() => updateFilter('foodGroup', '')}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      color: '#4A5B50',
                      padding: 0,
                    }}
                    aria-label="Remove food group filter"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              {activeCategories.map((cat) => (
                <span
                  key={cat.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: '#EFEADC',
                    border: '1px solid #DCD5C4',
                    borderRadius: '999px',
                    padding: '3px 10px',
                    fontSize: '12px',
                    color: '#17422E',
                    fontWeight: 500,
                  }}
                >
                  <span>{cat.name}</span>
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      color: '#4A5B50',
                      padding: 0,
                    }}
                    aria-label={`Remove category ${cat.name}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}

              <button
                type="button"
                onClick={handleClearAllFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#C46A3F',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 6px',
                }}
              >
                <RotateCcw size={12} /> Clear all filters
              </button>
            </>
          )}
        </div>
      </div>

      {/* Results grid */}
      {isLoading ? (
        <LoadingSpinner />
      ) : isError ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#b03535' }}>
          Failed to load foods. Please check your connection and try again.
        </div>
      ) : foods.length === 0 ? (
        <EmptyState
          title="No foods match your selected filters"
          description="Try selecting different categories, changing the food group, or clearing your search term."
          actionLabel="Clear all filters"
          onAction={handleClearAllFilters}
        />
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px',
              marginBottom: '32px',
            }}
          >
            {foods.map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <button
                type="button"
                onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
                disabled={(filters.page ?? 1) <= 1}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #DCD5C4',
                  borderRadius: '6px',
                  background: 'white',
                  cursor: (filters.page ?? 1) <= 1 ? 'not-allowed' : 'pointer',
                  opacity: (filters.page ?? 1) <= 1 ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: '14px', color: '#4A5B50', padding: '0 12px' }}>
                Page {filters.page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
                disabled={(filters.page ?? 1) >= totalPages}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #DCD5C4',
                  borderRadius: '6px',
                  background: 'white',
                  cursor: (filters.page ?? 1) >= totalPages ? 'not-allowed' : 'pointer',
                  opacity: (filters.page ?? 1) >= totalPages ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
