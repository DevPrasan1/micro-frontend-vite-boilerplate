import React, { Suspense, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProductStore, useUIStore } from '@mfe/shared-store';
import { Spinner } from '@mfe/shared-ui';
import { ErrorBoundary } from '../components/ErrorBoundary';

const ProductDetailsApp = React.lazy(() => import('product_details/ProductDetailsApp'));
const ProductReviewsApp = React.lazy(() => import('product_reviews/ProductReviewsApp'));
const RelatedProductsApp = React.lazy(() => import('product_catalog/RelatedProducts'));

export default function ProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const { selectedProduct, setSelectedProduct } = useProductStore();
  const { theme } = useUIStore();

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
              <ProductDetailsApp />
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
              <ProductReviewsApp />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>

      {/* Related Products Section */}
      <ErrorBoundary>
        <Suspense
          fallback={
            <div className="h-[200px] animate-pulse bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-400">
              Loading Related Products...
            </div>
          }
        >
          <RelatedProductsApp />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
