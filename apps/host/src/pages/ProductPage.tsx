import React, { Suspense, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductStore, useUIStore } from '@mfe/shared-store';
import { Spinner, ProductCard } from '@mfe/shared-ui';
import { ErrorBoundary } from '../components/ErrorBoundary';

const PlayerApp = React.lazy(() => import('product_details/ProductDetailsApp'));
const CommunityApp = React.lazy(() => import('product_reviews/ProductReviewsApp'));

export default function ProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const { selectedProduct, setSelectedProduct } = useProductStore();
  const { theme } = useUIStore();
  const navigate = useNavigate();
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        try {
          const res = await fetch(`https://dummyjson.com/products/${productId}`);
          const data = await res.json();
          setSelectedProduct(data);
        } catch (err) {
          console.error('Failed to fetch selected product details:', err);
        }
      };
      fetchProduct();
    }
  }, [productId, setSelectedProduct]);

  useEffect(() => {
    if (selectedProduct) {
      const fetchRelated = async () => {
        try {
          const res = await fetch(`https://dummyjson.com/products/category/${selectedProduct.category}?limit=5`);
          const data = await res.json();
          const filtered = (data.products || []).filter((p: any) => p.id !== selectedProduct.id);
          setRelatedProducts(filtered.slice(0, 4));
        } catch (err) {
          console.error('Failed to fetch related products:', err);
        }
      };
      fetchRelated();
    }
  }, [selectedProduct]);

  if (!selectedProduct) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <ErrorBoundary>
            <Suspense
              fallback={
                <div
                  className={`w-full h-[480px] animate-pulse rounded-xl flex items-center justify-center border ${
                    theme === 'dark'
                      ? 'bg-zinc-900 border-zinc-800 text-zinc-500'
                      : 'bg-white border-zinc-200 text-zinc-400'
                  }`}
                >
                  Loading Product Details MFE...
                </div>
              }
            >
              <PlayerApp />
            </Suspense>
          </ErrorBoundary>
        </div>

        <div className="w-full lg:w-[400px] shrink-0">
          <ErrorBoundary>
            <Suspense
              fallback={
                <div
                  className={`w-full h-[300px] animate-pulse rounded-xl flex items-center justify-center border ${
                    theme === 'dark'
                      ? 'bg-zinc-900 border-zinc-800 text-zinc-500'
                      : 'bg-white border-zinc-200 text-zinc-400'
                  }`}
                >
                  Loading Product Reviews MFE...
                </div>
              }
            >
              <CommunityApp />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className={`border-t pt-8 ${theme === 'dark' ? 'border-zinc-850' : 'border-zinc-200'}`}>
          <h3 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-800'}`}>
            Customers Also Viewed
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={(p) => {
                  setSelectedProduct(p);
                  navigate(`/product/${p.id}`);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
