import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { useAuthStore, useProductStore, useCartStore, useUIStore } from '@mfe/shared-store';
import { Button, Avatar, Search, Spinner, Dropdown, ProductCard } from '@mfe/shared-ui';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from '@mfe/mock-api';

// Error Boundary for dynamic remote loads
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-950/80 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center m-6 min-h-[400px]">
          <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">MFE Load Error</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-sm mb-6">
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

// Lazy load Remotes
const VideoBrowserApp = React.lazy(() => import('product_catalog/ProductCatalogApp'));
const PlayerApp = React.lazy(() => import('product_details/ProductDetailsApp'));
const CommunityApp = React.lazy(() => import('product_reviews/ProductReviewsApp'));
const CategorySelectorApp = React.lazy(() => import('product_catalog/CategorySelector'));

// Product Detail Page container
function ProductPage() {
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
                  className={`h-[480px] animate-pulse rounded-xl flex items-center justify-center border ${
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
                  className={`h-[300px] animate-pulse rounded-xl flex items-center justify-center border ${
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

function MainLayout() {
  const { theme, toggleTheme, sidebarOpen, toggleSidebar, setSearchQuery } = useUIStore();
  const { user, setUser, setLoading } = useAuthStore();
  const { cartItems, clearCart, removeFromCart } = useCartStore();
  const navigate = useNavigate();

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (mockUser: any) => {
      if (mockUser) {
        setUser({
          uid: mockUser.uid,
          displayName: mockUser.displayName,
          email: mockUser.email || '',
          photoURL: mockUser.photoURL || undefined,
          createdAt: new Date().toISOString(),
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      const body = document.body;
      if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
        body.classList.add('dark');
        body.classList.remove('light');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
        body.classList.add('light');
        body.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    }
  }, [theme]);

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    alert(`Checkout Completed Successfully!\nTotal Paid: $${totalPrice.toFixed(2)}`);
    clearCart();
  };

  return (
    <div
      className={`h-screen flex flex-col ${theme === 'dark' ? 'bg-background text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`}
    >
      {/* Header */}
      <header
        className={`h-16 border-b px-6 flex items-center justify-between shrink-0 sticky top-0 z-40 backdrop-blur-md ${
          theme === 'dark' ? 'border-zinc-800 bg-zinc-950/80' : 'border-zinc-200 bg-white/80'
        }`}
      >
        <div className="flex items-center gap-4">
          <button onClick={toggleSidebar} className="text-zinc-400 hover:text-zinc-100 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link to="/" className="flex items-center gap-2.5 text-xl font-extrabold tracking-wider">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </div>
            <span className={`bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent`}>
              MFE Shop
            </span>
          </Link>
        </div>

        <div className="w-96 max-w-full hidden md:block">
          <Search placeholder="Search catalog brand or name..." onSearch={setSearchQuery} />
        </div>

        <div className="flex items-center gap-4">
          {/* Cart Dropdown */}
          <Dropdown
            label={
              <div className="flex items-center gap-2 relative">
                <span>🛒</span>
                <span className="hidden sm:inline font-medium text-sm">Cart</span>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-3 bg-indigo-600 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </div>
            }
          >
            <div className="p-4 w-72 flex flex-col gap-3 text-zinc-150">
              <h4 className="font-bold text-sm border-b border-zinc-800 pb-2 flex justify-between items-center">
                <span>Shopping Cart</span>
                <span className="text-zinc-500 text-xs font-normal">({totalItems} items)</span>
              </h4>
              {cartItems.length > 0 ? (
                <>
                  <div className="flex flex-col gap-3 max-h-48 overflow-y-auto no-scrollbar">
                    {cartItems.map((item) => (
                      <div key={item.product.id} className="flex justify-between items-center gap-2 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={item.product.thumbnail}
                            alt=""
                            className="w-8 h-8 rounded bg-zinc-950 object-cover shrink-0"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold truncate">{item.product.title}</span>
                            <span className="text-[10px] text-zinc-500">Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold text-indigo-400">${item.product.price * item.quantity}</span>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-red-500 hover:text-red-400 transition"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-zinc-800 pt-2 flex justify-between items-center font-bold text-sm">
                    <span>Total Price:</span>
                    <span className="text-indigo-400">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button variant="primary" className="flex-1 py-2 text-xs font-bold" onClick={handleCheckout}>
                      Checkout
                    </Button>
                    <Button variant="secondary" className="py-2 px-3 text-xs" onClick={clearCart}>
                      Clear
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-zinc-500 text-xs">Your cart is empty.</div>
              )}
            </div>
          </Dropdown>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg text-lg transition ${
              theme === 'dark' ? 'hover:bg-zinc-900 text-amber-400' : 'hover:bg-zinc-150 text-indigo-600'
            }`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {user ? (
            <Link
              to="/profile"
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition duration-150"
              title="Profile Settings"
            >
              <Avatar name={user.displayName} src={user.photoURL} />
              <span className="text-sm font-medium hidden sm:inline">{user.displayName}</span>
            </Link>
          ) : (
            <Button onClick={() => navigate('/login')}>Sign In</Button>
          )}
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'} shrink-0 border-r transition-all duration-300 flex flex-col ${
            theme === 'dark' ? 'border-zinc-800 bg-zinc-950/40 text-zinc-300' : 'border-zinc-200 bg-white text-zinc-700'
          }`}
        >
          {/* <nav className="p-4 flex flex-col gap-2">
            <Link
              to="/"
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition font-medium ${
                theme === 'dark'
                  ? 'text-zinc-300 hover:bg-zinc-850 hover:text-zinc-150'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
              }`}
            >
              <span>🏠</span> Home Catalog
            </Link>
          </nav> */}
          <div
            className={`border-t p-4 flex-1 flex flex-col min-h-0 ${theme === 'dark' ? 'border-zinc-800' : 'border-zinc-200'}`}
          >
            <ErrorBoundary>
              <Suspense fallback={<div className="text-xs text-zinc-500 px-4">Loading categories...</div>}>
                <CategorySelectorApp />
              </Suspense>
            </ErrorBoundary>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route
              path="/"
              element={
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4">Discover Products</h2>
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
            <Route
              path="/category/:categoryName"
              element={
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4">Discover Products</h2>
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
            <Route path="/product/:productId" element={<ProductPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/profile"
              element={
                <div className="p-6">
                  <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-800'}`}>
                    Profile Settings
                  </h2>
                  {user ? (
                    <div
                      className={`p-6 rounded-xl border max-w-md ${
                        theme === 'dark'
                          ? 'bg-zinc-900 border-zinc-800 text-zinc-100'
                          : 'bg-white border-zinc-200 text-zinc-850'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <Avatar name={user.displayName} src={user.photoURL} className="w-16 h-16 text-xl" />
                        <div>
                          <h3 className="font-semibold text-lg">{user.displayName}</h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                            {user.email}
                          </p>
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
                    <p className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}>
                      Please sign in to view your profile settings.
                    </p>
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
  const { theme } = useUIStore();
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
      <div
        className={`p-8 max-w-md w-full border rounded-xl shadow-sm dark:shadow-2xl transition duration-200 ${
          theme === 'dark' ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-800'
        }`}
      >
        <h2 className={`text-2xl font-bold text-center mb-2 ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-800'}`}>
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </h2>
        <p className={`text-sm text-center mb-6 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-550'}`}>
          {isSignUp ? 'Join community and sync orders' : 'Sign in to access your profile settings'}
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg p-3 mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              className={`block text-xs font-semibold mb-1.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-550'}`}
            >
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition border ${
                theme === 'dark'
                  ? 'bg-zinc-950 border-zinc-800 text-zinc-100 placeholder-zinc-550'
                  : 'bg-zinc-50 border-zinc-250 text-zinc-800 placeholder-zinc-400'
              }`}
            />
          </div>

          <div>
            <label
              className={`block text-xs font-semibold mb-1.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-550'}`}
            >
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition border ${
                theme === 'dark'
                  ? 'bg-zinc-950 border-zinc-800 text-zinc-100 placeholder-zinc-550'
                  : 'bg-zinc-50 border-zinc-250 text-zinc-800 placeholder-zinc-400'
              }`}
            />
          </div>

          <Button type="submit" className="w-full mt-2">
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className={`w-full border-t ${theme === 'dark' ? 'border-zinc-800' : 'border-zinc-200'}`}></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className={`px-2 ${theme === 'dark' ? 'bg-zinc-900 text-zinc-500' : 'bg-white text-zinc-400'}`}>
              Or continue with
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button variant="secondary" className="w-full" onClick={handleGoogleSignIn}>
            Sign In with Google
          </Button>
        </div>

        <p className="text-xs text-center text-zinc-500 mt-6">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-indigo-650 dark:text-indigo-400 hover:underline font-medium"
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
