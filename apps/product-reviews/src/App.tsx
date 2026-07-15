import React, { useState, useEffect } from 'react';
import { useAuthStore, useProductStore, useUIStore } from '@mfe/shared-store';
import { Button, ReviewCard } from '@mfe/shared-ui';
import { Comment } from '@mfe/shared-types';
import { db, collection, query, where, orderBy, onSnapshot, addDoc, deleteDoc, doc } from '@mfe/mock-api';

export default function App() {
  const { user } = useAuthStore();
  const { selectedProduct } = useProductStore();
  const { theme } = useUIStore();
  const [reviews, setReviews] = useState<Comment[]>([]);
  const [newReviewText, setNewReviewText] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  const productId = selectedProduct?.id || 0;

  useEffect(() => {
    if (productId === 0) {
      setReviews([]);
      return;
    }

    // Set up real-time listener from mock REST DB for this product ID reviews
    const q = query(collection(db, 'reviews'), where('productId', '==', productId), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      const list: Comment[] = [];
      snapshot.docs.forEach((doc: any) => {
        list.push(doc.data());
      });
      setReviews(list);
    });

    return () => unsubscribe();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim() || !user || productId === 0) return;

    try {
      await addDoc(collection(db, 'reviews'), {
        productId: productId,
        uid: user.uid,
        userName: user.displayName || user.email.split('@')[0],
        message: newReviewText.trim(),
        createdAt: new Date().toISOString(),
      });
      setNewReviewText('');
    } catch (err) {
      console.error('Failed to post review:', err);
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
  });

  if (productId === 0) {
    return (
      <div
        className={`p-6 rounded-xl border text-center text-zinc-500 ${
          theme === 'dark' ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200'
        }`}
      >
        Select a product to view reviews.
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col gap-6 p-6 rounded-xl border transition duration-200 ${
        theme === 'dark' ? 'bg-zinc-900/40 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-800'
      }`}
    >
      {/* Header */}
      <div
        className={`flex justify-between items-center pb-4 border-b ${
          theme === 'dark' ? 'border-zinc-800/80' : 'border-zinc-200'
        }`}
      >
        <h3 className={`text-base font-bold ${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}`}>
          Reviews & Ratings ({reviews.length})
        </h3>
        <select
          value={sortBy}
          onChange={(e: any) => setSortBy(e.target.value)}
          className={`border rounded px-2 py-1 text-xs focus:outline-none cursor-pointer ${
            theme === 'dark' ? 'bg-zinc-800 text-zinc-300 border-zinc-700' : 'bg-zinc-100 text-zinc-700 border-zinc-300'
          }`}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Input form */}
      {user ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <textarea
            value={newReviewText}
            onChange={(e) => setNewReviewText(e.target.value)}
            placeholder="Write a product review..."
            rows={3}
            className={`w-full p-3 rounded-lg border focus:outline-none focus:border-indigo-500 transition text-sm resize-none ${
              theme === 'dark'
                ? 'bg-zinc-850 text-zinc-150 placeholder-zinc-500 border-zinc-700'
                : 'bg-zinc-50 text-zinc-850 placeholder-zinc-400 border-zinc-250'
            }`}
          />
          <div className="flex justify-end">
            <Button variant="primary" type="submit" disabled={!newReviewText.trim()}>
              Submit Review
            </Button>
          </div>
        </form>
      ) : (
        <div
          className={`p-4 rounded-lg text-center text-xs border border-dashed ${
            theme === 'dark'
              ? 'bg-zinc-850/60 text-zinc-400 border-zinc-800'
              : 'bg-zinc-50 text-zinc-500 border-zinc-200'
          }`}
        >
          Please log in to leave a review.
        </div>
      )}

      {/* Review List */}
      <div className="flex flex-col gap-4 overflow-y-auto max-h-[400px] no-scrollbar">
        {sortedReviews.length > 0 ? (
          sortedReviews.map((review) => (
            <ReviewCard key={review.id} review={review} onDelete={handleDelete} currentUserId={user?.uid} />
          ))
        ) : (
          <div
            className={`text-center py-6 text-xs border border-dashed rounded-lg ${
              theme === 'dark' ? 'text-zinc-550 border-zinc-800' : 'text-zinc-450 border-zinc-200'
            }`}
          >
            No reviews yet. Be the first to review this product!
          </div>
        )}
      </div>
    </div>
  );
}
