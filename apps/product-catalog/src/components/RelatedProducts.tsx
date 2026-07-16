import React, { useEffect, useState } from 'react';
import { useProductStore, useUIStore } from '@mfe/shared-store';
import { ProductCard } from '@mfe/shared-ui';
import { useNavigate } from 'react-router-dom';

export default function RelatedProducts() {
  const { selectedProduct, setSelectedProduct } = useProductStore();
  const { theme } = useUIStore();
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedProduct) {
      const fetchRelated = async () => {
        try {
          setLoading(true);
          const res = await fetch(`https://dummyjson.com/products/category/${selectedProduct.category}?limit=5`);
          const data = await res.json();
          const filtered = (data.products || []).filter((p: any) => p.id !== selectedProduct.id);
          setRelated(filtered.slice(0, 4));
        } catch (err) {
          console.error('Failed to fetch related products:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchRelated();
    }
  }, [selectedProduct]);

  if (!selectedProduct || loading || related.length === 0) return null;

  return (
    <div className={`border-t pt-8 ${theme === 'dark' ? 'border-zinc-850' : 'border-zinc-200'}`}>
      <h3 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-800'}`}>
        Customers Also Viewed
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {related.map((product) => (
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
  );
}
