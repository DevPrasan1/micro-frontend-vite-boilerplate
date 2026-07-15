import React from 'react';
import { Channel, Comment } from '@streamhub/shared-types';

export * from './Button';
export * from './Card';
export * from './Badge';
export * from './Avatar';

// --- Search Input Component ---
export interface SearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
}
export const Search: React.FC<SearchProps> = ({ className = '', onSearch, ...props }) => {
  return (
    <div className="relative">
      <input
        type="text"
        className={`w-full bg-zinc-800 text-zinc-100 placeholder-zinc-400 px-4 py-2 pl-10 rounded-lg border border-zinc-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition ${className}`}
        onChange={(e) => onSearch?.(e.target.value)}
        {...props}
      />
      <div className="absolute left-3 top-2.5 text-zinc-400">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>
  );
};

// --- Dropdown Component ---
export interface DropdownProps {
  label: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}
export const Dropdown: React.FC<DropdownProps> = ({ label, children, className = '' }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div className={`relative inline-block text-left ${className}`}>
      <button onClick={() => setIsOpen(!isOpen)} className="bg-zinc-800 text-zinc-100 px-4 py-2 rounded-lg border border-zinc-700 hover:bg-zinc-700 transition">
        {label}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-zinc-900 border border-zinc-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1" onClick={() => setIsOpen(false)}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Tabs Component ---
export interface TabsProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}
export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div className={`flex border-b border-zinc-800 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2 font-medium text-sm border-b-2 -mb-[2px] transition ${
            activeTab === tab.id
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

// --- Tooltip Component ---
export interface TooltipProps {
  content: string;
  children: React.ReactElement;
  className?: string;
}
export const Tooltip: React.FC<TooltipProps> = ({ content, children, className = '' }) => {
  return (
    <div className={`group relative inline-block ${className}`}>
      {children}
      <div className="opacity-0 group-hover:opacity-100 transition duration-200 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-950 text-xs text-zinc-100 rounded shadow-md whitespace-nowrap pointer-events-none z-50 border border-zinc-800">
        {content}
      </div>
    </div>
  );
};

// --- Modal Component ---
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full p-6 shadow-2xl relative z-10 text-zinc-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-100 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// --- Spinner Component ---
export const Spinner: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-spin rounded-full h-8 w-8 border-2 border-zinc-700 border-t-indigo-500 ${className}`}></div>
  );
};

// --- VideoCard Component ---
export interface VideoCardProps {
  channel: Channel;
  onClick?: (channel: Channel) => void;
  className?: string;
}
export const VideoCard: React.FC<VideoCardProps> = ({ channel, onClick, className = '' }) => {
  return (
    <div
      onClick={() => onClick?.(channel)}
      className={`bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-md cursor-pointer hover:scale-[1.02] transition duration-200 flex flex-col group ${className}`}
    >
      <div className="relative aspect-video bg-zinc-950 flex items-center justify-center overflow-hidden">
        {channel.logo ? (
          <img src={channel.logo} alt={channel.name} className="object-cover w-full h-full group-hover:scale-105 transition duration-300" />
        ) : (
          <span className="text-4xl text-zinc-700">📺</span>
        )}
      </div>
      <div className="p-4 flex gap-3 flex-1">
        <div className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
          {channel.name[0]}
        </div>
        <div className="flex flex-col min-w-0">
          <h4 className="font-semibold text-sm text-zinc-100 truncate group-hover:text-indigo-400 transition">
            {channel.name}
          </h4>
          <p className="text-zinc-400 text-xs mt-1 truncate">
            {channel.category || 'Live Stream'}
          </p>
        </div>
      </div>
    </div>
  );
};

// --- CommentCard Component ---
export interface CommentCardProps {
  comment: Comment;
  onDelete?: (id: string) => void;
  currentUserId?: string;
  className?: string;
}
export const CommentCard: React.FC<CommentCardProps> = ({ comment, onDelete, currentUserId, className = '' }) => {
  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex gap-3 ${className}`}>
      <div className="w-8 h-8 rounded-full bg-zinc-700 text-zinc-200 flex items-center justify-center font-semibold text-sm shrink-0">
        {comment.userName ? comment.userName[0].toUpperCase() : '?'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <span className="font-medium text-sm text-zinc-100">{comment.userName}</span>
          {currentUserId === comment.uid && onDelete && (
            <button onClick={() => onDelete(comment.id)} className="text-zinc-500 hover:text-red-400 transition text-xs">
              Delete
            </button>
          )}
        </div>
        <p className="text-zinc-300 text-sm mt-1 leading-relaxed">{comment.message}</p>
      </div>
    </div>
  );
};
