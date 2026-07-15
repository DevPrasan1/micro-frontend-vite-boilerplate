import React, { useState, useEffect } from 'react';
import { useAuthStore, usePlayerStore } from '@mfe/shared-store';
import { Button, CommentCard } from '@mfe/shared-ui';
import { Comment } from '@mfe/shared-types';
import { db, collection, query, where, orderBy, onSnapshot, addDoc, deleteDoc, doc } from '@mfe/firebase';

export default function App() {
  const { user } = useAuthStore();
  const { selectedChannel } = usePlayerStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  const channelId = selectedChannel?.id || 'default';

  useEffect(() => {
    if (!channelId) return;

    // Listen to comments from Firestore for this video/channel
    const q = query(collection(db, 'comments'), where('channelId', '==', channelId), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Comment[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            channelId: data.channelId,
            uid: data.uid,
            userName: data.userName,
            message: data.message,
            createdAt: data.createdAt,
          });
        });
        setComments(list);
      },
      (error) => {
        console.error('Firestore loading error:', error);
      }
    );

    return () => unsubscribe();
  }, [channelId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    try {
      await addDoc(collection(db, 'comments'), {
        channelId,
        uid: user?.uid || 'anonymous',
        userName: user?.displayName || 'Anonymous Viewer',
        message: newCommentText,
        createdAt: new Date().toISOString(),
      });
      setNewCommentText('');
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleDeleteComment = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'comments', id));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const sortedComments = [...comments].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 flex flex-col gap-6 text-zinc-100 h-[600px] overflow-hidden">
      <div className="flex justify-between items-center shrink-0">
        <h3 className="text-lg font-bold">Community Chat ({comments.length})</h3>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
          className="bg-zinc-800 text-zinc-300 border border-zinc-700 rounded px-2 py-1 text-xs focus:outline-none"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Add Comment Box */}
      <form onSubmit={handleAddComment} className="flex gap-2 shrink-0">
        <input
          type="text"
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder={user ? 'Add a public comment...' : 'Sign in to join the conversation...'}
          disabled={!user}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition disabled:opacity-50"
        />
        <Button type="submit" disabled={!user || !newCommentText.trim()}>
          Post
        </Button>
      </form>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-2 custom-scrollbar">
        {sortedComments.length > 0 ? (
          sortedComments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} onDelete={handleDeleteComment} currentUserId={user?.uid} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-2">
            <span>💬</span>
            <p className="text-xs">No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  );
}
