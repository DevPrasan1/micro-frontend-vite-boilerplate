import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProductStore, useUIStore } from '@mfe/shared-store';
import { ProductCard, Tabs, Spinner, Search } from '@mfe/shared-ui';
import { Product } from '@mfe/shared-types';

export default function App() {
  const navigate = useNavigate();
  const params = useParams<{ categoryName?: string }>();

  const { setSelectedProduct, activeCategory: storeCategory, setActiveCategory } = useProductStore();
  const activeCategory = params.categoryName || storeCategory || 'All';
  const { searchQuery } = useUIStore();
  const [localSearch, setLocalSearch] = useState('');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Detect standalone mode
  const isStandalone = typeof window !== 'undefined' && window.location.port !== '5005';
  const activeSearch = isStandalone ? localSearch : searchQuery;

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch('https://dummyjson.com/products?limit=100');
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter Categories dynamically
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category))).sort()];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = activeSearch
      ? product.title.toLowerCase().includes(activeSearch.toLowerCase()) ||
        product.description.toLowerCase().includes(activeSearch.toLowerCase()) ||
        product.brand.toLowerCase().includes(activeSearch.toLowerCase())
      : true;

    const matchesCategory = activeCategory === 'All' ? true : product.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  // Reset page number on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, activeSearch]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    if (navigate) {
      navigate(`/product/${product.id}`);
    }
  };

  // Pagination bounds
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col gap-6">
      {/* Filters Bar (Only show in standalone mode) */}
      {isStandalone && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex-1 min-w-0 overflow-x-auto no-scrollbar scroll-smooth">
            <Tabs
              tabs={categories.map((c) => ({ id: c, label: c.toUpperCase() }))}
              activeTab={activeCategory}
              onChange={setActiveCategory}
              className="flex-nowrap border-b-0 whitespace-nowrap overflow-x-auto"
            />
          </div>
          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <div className="w-full sm:w-64">
              <Search placeholder="Search products..." onChange={(e) => setLocalSearch(e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center p-12">
          <Spinner />
        </div>
      ) : paginatedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {paginatedProducts.map((product) => (
            <ProductCard key={product.id} product={product} onClick={handleProductClick} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-zinc-500 border border-zinc-200 dark:border-zinc-800 border-dashed rounded-xl">
          No products match your filters.
        </div>
      )}

      {/* Pagination Bar */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 bg-white dark:bg-zinc-900/40 px-6 py-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition"
          >
            ← Previous
          </button>

          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 text-center">
            Page <span className="text-zinc-800 dark:text-zinc-200">{currentPage}</span> of{' '}
            <span className="text-zinc-800 dark:text-zinc-200">{totalPages}</span>
            <span className="hidden sm:inline"> ({filteredProducts.length} items total)</span>
          </span>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
