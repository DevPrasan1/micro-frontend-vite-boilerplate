import React, { useState } from 'react';
import { useProductStore, useCartStore, useUIStore } from '@mfe/shared-store';
import { Button } from '@mfe/shared-ui';

export default function App() {
  const { selectedProduct } = useProductStore();
  const { addToCart } = useCartStore();
  const { theme } = useUIStore();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!selectedProduct) {
    return (
      <div className="aspect-video bg-white dark:bg-zinc-950 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 text-zinc-500">
        No product selected
      </div>
    );
  }

  const images =
    selectedProduct.images && selectedProduct.images.length > 0 ? selectedProduct.images : [selectedProduct.thumbnail];

  return (
    <div
      className={`flex flex-col md:flex-row gap-6 p-6 rounded-xl border shadow-sm dark:shadow-2xl transition duration-200 ${
        theme === 'dark' ? 'bg-zinc-900/60 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-250 text-zinc-800'
      }`}
    >
      {/* Product Image Gallery */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="relative aspect-square w-full max-w-md mx-auto bg-zinc-50 dark:bg-zinc-950 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-850 flex items-center justify-center">
          <img
            src={images[activeImageIndex] || selectedProduct.thumbnail}
            alt={selectedProduct.title}
            className="object-contain w-full h-full max-h-[300px]"
          />
          {selectedProduct.discountPercentage && (
            <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">
              -{selectedProduct.discountPercentage}% OFF
            </div>
          )}
        </div>

        {/* Thumbnails Row */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar justify-center py-2">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setActiveImageIndex(index)}
                className={`w-12 h-12 rounded-lg border-2 overflow-hidden bg-zinc-50 dark:bg-zinc-950 shrink-0 transition ${
                  activeImageIndex === index
                    ? 'border-indigo-500'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <img src={img} alt="" className="object-cover w-full h-full" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-widest font-semibold text-zinc-500">
            {selectedProduct.brand || 'Generic'} • {selectedProduct.category}
          </span>
          <h2 className={`text-2xl font-bold mt-2 ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-850'}`}>
            {selectedProduct.title}
          </h2>

          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1">
              <span className="text-amber-400">★</span>
              <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-750'}`}>
                {selectedProduct.rating}
              </span>
            </div>
            <span className="text-zinc-300 dark:text-zinc-500">|</span>
            <span className={`text-xs font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-550'}`}>
              Stock: {selectedProduct.stock} left
            </span>
          </div>

          <p className={`text-sm mt-4 leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
            {selectedProduct.description}
          </p>
        </div>

        <div
          className={`flex flex-col gap-4 mt-6 pt-6 border-t ${
            theme === 'dark' ? 'border-zinc-800/80' : 'border-zinc-200'
          }`}
        >
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-indigo-650 dark:text-indigo-400">
              ${selectedProduct.price}
            </span>
            {selectedProduct.discountPercentage && (
              <span className="text-sm text-zinc-450 dark:text-zinc-500 line-through">
                ${Math.round(selectedProduct.price / (1 - selectedProduct.discountPercentage / 100))}
              </span>
            )}
          </div>

          <Button
            variant="primary"
            onClick={() => addToCart(selectedProduct)}
            className="w-full flex items-center justify-center gap-2 py-3 shadow-lg"
          >
            <span>🛒</span> Add to Shopping Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
