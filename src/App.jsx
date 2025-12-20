// src/App.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';


const API_BASE_URL = process.env.REACT_APP_API_BASE_URL 

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  // 1) If navigate('/', { state: { categoryId } }) was used,
  // scroll to the section (existing logic) — keep it.
  useEffect(() => {
    const catId = location?.state?.categoryId;
    if (catId) {
      const el = document.getElementById(`category-${catId}`);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
      }
    }
  }, [location]);

  // 2) Fetch categories once
  useEffect(() => {
    fetchCategories();
  }, []);

  // 3) Fetch products whenever selectedCategory changes
  useEffect(() => {
    fetchProducts(selectedCategory ? selectedCategory._id : '');
  }, [selectedCategory]);

  // 4) IMPORTANT: react to location.state.categoryId being present.
  // Once categories are loaded we try to find a matching category and select it.
  // After we set it, clear the location.state so this runs only once.
  useEffect(() => {
    const catId = location?.state?.categoryId;

    // If there's no categoryId passed in location state, do nothing.
    if (!catId) return;

    // If categories haven't loaded yet, wait — this effect re-runs when `categories` updates.
    if (!categories || categories.length === 0) return;

    // Try find the category
    const found = categories.find((c) => String(c._id) === String(catId));

    if (found) {
      // selectCategory will set state and trigger product fetch
      selectCategory(found);

      // Clear the location state so this doesn't repeat when the route re-renders.
      // Use replace so history isn't cluttered.
      navigate(location.pathname, { replace: true, state: {} });
    } else {
      // If not found, still clear state to avoid repeated attempts
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.state?.categoryId, categories]);

  const fetchCategories = async () => {
    try {
       const res = await axios.get(`${API_BASE_URL}/api/categories`);
      setCategories(res.data || []);
    } catch (err) {
      console.error('Error fetching categories', err);
    }
  };

  const fetchProducts = async (categoryId = '') => {
    setLoadingProducts(true);
    setError('');
    try {
      const url = categoryId
        ? `${API_BASE_URL}/api/products?category=${categoryId}`
      : `${API_BASE_URL}/api/products`;
      const res = await axios.get(url);
      setProducts(res.data || []);
    } catch (err) {
      console.error('Error fetching products', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoadingProducts(false);
    }
  };

  const selectCategory = (cat) => {
    setSelectedCategory(cat || null);
    setIsSidebarOpen(false); // close mobile sidebar when selecting
    // optional scroll to product listing top for better UX
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <>
      <Navbar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={selectCategory}
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />

      <Sidebar
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={selectCategory}
      />

      {/* Hero Section */}
      <section className="pt-24 pb-32 bg-gradient-to-br from-red-50 via-pink-50 to-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-6xl md:text-8xl font-black text-gray-900 mb-6">
            LEGENDS
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600">
              IN 3D
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto font-light">
            Premium hand-painted 3D printed collectibles • Limited editions
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="px-12 py-5 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold text-xl rounded-2xl hover:shadow-2xl hover:scale-105 transition transform">
              Shop Collection
            </button>
            <button className="px-12 py-5 border-2 border-red-600 text-red-600 font-bold text-xl rounded-2xl hover:bg-red-50 transition">
              Watch Showcase
            </button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-5xl md:text-7xl font-black text-gray-900">
              {selectedCategory ? (
                <>
                  {selectedCategory.name}{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600">
                    Collection
                  </span>
                </>
              ) : (
                <>
                  Featured{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600">
                    Collectibles
                  </span>
                </>
              )}
            </h2>

            <div>
              {selectedCategory && (
                <button
                  onClick={() => selectCategory(null)}
                  className="text-sm px-3 py-2 rounded-lg border bg-gradient-to-r from-red-600 to-pink-600"
                >
                  Show all
                </button>
              )}
            </div>
          </div>

          {loadingProducts && (
            <p className="text-center text-gray-600 text-lg">Loading products...</p>
          )}

          {error && (
            <p className="text-center text-red-500 text-lg mb-8">{error}</p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 md:gap-10">
            {products.map((product) => {
              const image =
                product.images && product.images.length > 0
                  ? product.images[0]
                  : 'https://via.placeholder.com/600x400?text=No+Image';

              return (
                <div
                  key={product._id}
                  className="group relative bg-white/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl overflow-hidden shadow-md sm:shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-red-200"
                >
                  {product.tag && (
                    <div
                      className={`absolute top-3 left-3 sm:top-4 sm:left-4 z-10 px-3 sm:px-4 py-1 rounded-full text-[10px] sm:text-xs font-bold text-white shadow-lg ${
                        product.tag === 'Sale'
                          ? 'bg-gradient-to-r from-red-500 to-pink-600'
                          : product.tag === 'New'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                          : product.tag === 'Best Seller'
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-600'
                          : 'bg-gradient-to-r from-red-600 to-pink-600'
                      }`}
                    >
                      {product.tag}
                    </div>
                  )}

                  {/* IMAGE */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-red-50 to-pink-50 p-3 sm:p-4 md:p-6">
                    <img
                      src={image}
                      alt={product.name}
                      className="w-full h-44 sm:h-56 md:h-72 lg:h-80 object-cover rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform duration-700 shadow-lg"
                    />
                  </div>

                  {/* CONTENT */}
                  <div className="p-4 sm:p-6 md:p-8">
                    <h3 className="text-base sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 truncate">
                      {product.name}
                    </h3>

                    <div className="flex items-center gap-1 sm:gap-2 mb-3 sm:mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 ${
                            i < Math.floor(product.rating || 0)
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-[11px] sm:text-xs md:text-sm text-gray-600 ml-1 sm:ml-2">
                        ({product.rating?.toFixed ? product.rating.toFixed(1) : product.rating || 0})
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-2xl sm:text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600">
                        Rs {product.price}
                      </span>
                      <Link to={`/product/${product._id}`} className="flex-shrink-0">
                        <button className="px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold sm:font-bold text-xs sm:text-sm md:text-base rounded-full hover:shadow-xl hover:scale-105 transition">
                          View Details
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {!loadingProducts && products.length === 0 && !error && (
            <p className="text-center text-gray-500 mt-8">
              No products yet. Add some from the admin dashboard.
            </p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-black bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Layer Labs
          </h2>
          <p className="text-gray-400">© 2025 • Handcrafted with passion for collectors</p>
        </div>
      </footer>
    </>
  );
}
