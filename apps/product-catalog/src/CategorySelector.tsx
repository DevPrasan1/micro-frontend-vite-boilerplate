import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useUIStore } from '@mfe/shared-store';

export default function CategorySelector() {
  const { theme } = useUIStore();
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ categoryName?: string }>();

  const activeCategory = params.categoryName || 'All';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await fetch('https://dummyjson.com/products/category-list');
        const data = await res.json();
        if (Array.isArray(data)) {
          setCategories(['All', ...data.sort()]);
        }
      } catch (err) {
        console.error('Failed to fetch categories list:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const formatCategoryName = (name: string) => {
    return name.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-2 px-4 py-2">
        {[1, 2, 3, 4, 5].map((idx) => (
          <div key={idx} className="h-8 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 pr-1  overflow-y-auto no-scrollbar scroll-smooth">
      {categories.map((category) => {
        const isActive = activeCategory === category;
        return (
          <button
            key={category}
            onClick={() => {
              if (navigate) {
                if (category === 'All') {
                  navigate('/');
                } else {
                  navigate(`/category/${category}`);
                }
              }
            }}
            className={`w-full text-left px-4 py-2 text-sm rounded-lg transition duration-150 flex items-center justify-between border-l-2 cursor-pointer font-medium ${
              isActive
                ? theme === 'dark'
                  ? 'bg-brand-950/40 text-brand-400 border-brand-500'
                  : 'bg-brand-50 text-brand-700 border-brand-500'
                : theme === 'dark'
                  ? 'border-transparent text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'
                  : 'border-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
          >
            <span>{formatCategoryName(category)}</span>
            {isActive && <span className="text-xs">●</span>}
          </button>
        );
      })}
    </div>
  );
}
