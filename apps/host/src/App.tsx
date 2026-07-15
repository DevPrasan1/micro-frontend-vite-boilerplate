import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { useAuthStore, usePlayerStore, useUIStore } from '@mfe/shared-store';
import { Button, Avatar, Search, Spinner } from '@mfe/shared-ui';
import { YT_CHANNELS } from '@mfe/shared-utils';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from '@mfe/firebase';

// Lazy load Remotes
const VideoBrowserApp = React.lazy(() => import('video_browser/VideoBrowserApp'));
const PlayerApp = React.lazy(() => import('player/PlayerApp'));
const CommunityApp = React.lazy(() => import('community/CommunityApp'));

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: any, errorInfo: any) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-zinc-950/80 rounded-xl border border-zinc-800 text-center m-6 min-h-[400px]">
          <h2 className="text-xl font-bold text-zinc-100 mb-2">MFE Load Error</h2>
          <p className="text-zinc-400 text-sm max-w-sm mb-6">
            Something went wrong while rendering this micro-frontend component.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition font-medium text-sm shadow-md"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Watch Page component within host that orchestrates Player and Community MFEs
function WatchPage() {
  const { channelId } = useParams<{ channelId: string }>();
  const { selectedChannel, setSelectedChannel } = usePlayerStore();

  useEffect(() => {
    if (!selectedChannel && channelId) {
      const found = YT_CHANNELS.find((c: any) => c.id === channelId);
      if (found) {
        setSelectedChannel(found);
      } else {
        setSelectedChannel({
          id: channelId,
          name: `Live Channel #${channelId}`,
          url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
          category: 'Entertainment',
        });
      }
    }
  }, [channelId, selectedChannel, setSelectedChannel]);

  if (!selectedChannel) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6">
      <div className="flex-1 min-w-0">
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="h-[480px] bg-zinc-900 animate-pulse rounded-xl flex items-center justify-center text-zinc-500">
                Loading Player MFE...
              </div>
            }
          >
            <PlayerApp />
          </Suspense>
        </ErrorBoundary>

        <div className="mt-4">
          <h1 className="text-2xl font-bold text-zinc-100">{selectedChannel.name}</h1>
          <p className="text-zinc-400 text-sm mt-1">{selectedChannel.category}</p>
        </div>
      </div>

      <div className="w-full lg:w-[400px] shrink-0">
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="h-[300px] bg-zinc-900 animate-pulse rounded-xl flex items-center justify-center text-zinc-500">
                Loading Community MFE...
              </div>
            }
          >
            <CommunityApp />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}

function MainLayout() {
  const { theme, sidebarOpen, toggleSidebar, setSearchQuery } = useUIStore();
  const { user, setUser, setLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Firebase User',
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || undefined,
          createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  return (
    <div
      className={`h-screen flex flex-col ${theme === 'dark' ? 'bg-background text-zinc-100' : 'bg-white text-zinc-900'}`}
    >
      {/* Header */}
      <header className="h-16 border-b border-zinc-800 px-6 flex items-center justify-between shrink-0 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button onClick={toggleSidebar} className="text-zinc-400 hover:text-zinc-100 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link to="/" className="flex items-center gap-2.5 text-xl font-extrabold tracking-wider text-zinc-100">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
              </svg>
            </div>
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              MFE Boilerplate
            </span>
          </Link>
        </div>

        <div className="w-96 max-w-full hidden md:block">
          <Search placeholder="Search by name or country..." onSearch={setSearchQuery} />
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Avatar name={user.displayName} src={user.photoURL} />
              <span className="text-sm font-medium hidden sm:inline">{user.displayName}</span>
            </div>
          ) : (
            <Button onClick={() => navigate('/login')}>Sign In</Button>
          )}
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'} shrink-0 border-r border-zinc-800 transition-all duration-300 flex flex-col bg-zinc-950/40`}
        >
          <nav className="p-4 flex flex-col gap-2">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition font-medium"
            >
              <span>🏠</span> Home
            </Link>
            <Link
              to="/profile"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition font-medium"
            >
              <span>👤</span> Profile
            </Link>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route
              path="/"
              element={
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4">Discover Live Streams</h2>
                  <ErrorBoundary>
                    <Suspense
                      fallback={
                        <div className="flex justify-center p-12">
                          <Spinner />
                        </div>
                      }
                    >
                      <VideoBrowserApp />
                    </Suspense>
                  </ErrorBoundary>
                </div>
              }
            />
            <Route path="/watch/:channelId" element={<WatchPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/profile"
              element={
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4">Profile</h2>
                  {user ? (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md">
                      <div className="flex items-center gap-4">
                        <Avatar name={user.displayName} src={user.photoURL} className="w-16 h-16 text-xl" />
                        <div>
                          <h3 className="font-semibold text-lg">{user.displayName}</h3>
                          <p className="text-zinc-400 text-sm">{user.email}</p>
                        </div>
                      </div>
                      <Button
                        variant="danger"
                        className="mt-6 w-full"
                        onClick={async () => {
                          try {
                            await signOut(auth);
                            setUser(null);
                            navigate('/');
                          } catch (err) {
                            console.error('Sign out failed:', err);
                          }
                        }}
                      >
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <p className="text-zinc-400">Please sign in to view your profile.</p>
                  )}
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google sign-in failed');
    }
  };

  return (
    <div className="flex items-center justify-center p-12">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-zinc-100 mb-2">
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </h2>
        <p className="text-zinc-400 text-sm text-center mb-6">
          {isSignUp ? 'Join community and sync favorites' : 'Sign in to sync your comments and favorites'}
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg p-3 mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <Button type="submit" className="w-full mt-2">
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-zinc-900 px-2 text-zinc-500">Or continue with</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button variant="secondary" className="w-full" onClick={handleGoogleSignIn}>
            Sign In with Google
          </Button>

          <button
            className="text-xs text-zinc-500 hover:text-zinc-300 underline transition cursor-pointer text-center"
            onClick={() => {
              setUser({
                uid: 'demo-user-123',
                displayName: 'Demo User',
                email: 'demo@streamhub.io',
                createdAt: new Date().toISOString(),
              });
              navigate('/');
            }}
          >
            Continue as Guest (Demo Account)
          </button>
        </div>

        <p className="text-xs text-center text-zinc-500 mt-6">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-indigo-400 hover:text-indigo-300 font-medium underline"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
}
