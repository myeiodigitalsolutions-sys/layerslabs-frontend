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

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts(selectedCategory ? selectedCategory._id : '');
  }, [selectedCategory]);

  useEffect(() => {
    const catId = location?.state?.categoryId;

    if (!catId) return;

    if (!categories || categories.length === 0) return;

    const found = categories.find((c) => String(c._id) === String(catId));

    if (found) {
      selectCategory(found);
      navigate(location.pathname, { replace: true, state: {} });
    } else {
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
    setIsSidebarOpen(false);
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

      {/* Hero Section - Fixed Mobile Responsiveness */}
      <section className="pt-20 sm:pt-24 pb-16 sm:pb-24 md:pb-32 bg-gradient-to-br from-red-50 via-pink-50 to-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 mb-4 sm:mb-6 leading-tight">
            LEGENDS
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600">
              IN 3D
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-10 md:mb-12 max-w-4xl mx-auto font-light px-4">
            Premium hand-painted 3D printed collectibles • Limited editions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4">
            <button className="px-8 py-4 sm:px-10 sm:py-4 md:px-12 md:py-5 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold text-base sm:text-lg md:text-xl rounded-xl sm:rounded-2xl hover:shadow-2xl hover:scale-105 transition transform">
              Shop Collection
            </button>
            <button className="px-8 py-4 sm:px-10 sm:py-4 md:px-12 md:py-5 border-2 border-red-600 text-red-600 font-bold text-base sm:text-lg md:text-xl rounded-xl sm:rounded-2xl hover:bg-red-50 transition">
              Watch Showcase
            </button>
          </div>
        </div>
      </section>

      {/* Featured Products - Fixed Mobile Responsiveness */}
      <section className="py-12 sm:py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-gray-900 leading-tight">
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

            <div className="w-full sm:w-auto">
              {selectedCategory && (
                <button
                  onClick={() => selectCategory(null)}
                  className="text-sm sm:text-base px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg border-2 text-white font-semibold bg-gradient-to-r from-red-600 to-pink-600 hover:shadow-lg transition w-full sm:w-auto"
                >
                  Show All
                </button>
              )}
            </div>
          </div>

          {loadingProducts && (
            <p className="text-center text-gray-600 text-base sm:text-lg py-8">Loading products...</p>
          )}

          {error && (
            <p className="text-center text-red-500 text-base sm:text-lg mb-8">{error}</p>
          )}

          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
            {products.map((product) => {
              const image =
                product.images && product.images.length > 0
                  ? product.images[0]
                  : 'https://via.placeholder.com/600x400?text=No+Image';

              return (
                <div
                  key={product._id}
                  className="group relative bg-white/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-red-200"
                >
                  {product.tag && (
                    <div
                      className={`absolute top-3 left-3 sm:top-4 sm:left-4 z-10 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold text-white shadow-lg ${
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
                  <div className="relative overflow-hidden bg-gradient-to-br from-red-50 to-pink-50 p-4 sm:p-5 md:p-6">
                    <img
                      src={image}
                      alt={product.name}
                      className="w-full h-48 sm:h-56 md:h-64 lg:h-80 object-cover rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform duration-700 shadow-lg"
                    />
                  </div>

                  {/* CONTENT */}
                  <div className="p-4 sm:p-5 md:p-6 lg:p-8">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-2 min-h-[3.5rem] sm:min-h-0">
                      {product.name}
                    </h3>

                    <div className="flex items-center gap-1 sm:gap-2 mb-3 sm:mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 ${
                            i < Math.floor(product.rating || 0)
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-xs sm:text-sm text-gray-600 ml-1 sm:ml-2">
                        ({product.rating?.toFixed ? product.rating.toFixed(1) : product.rating || 0})
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2">
                      <span className="text-2xl sm:text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600">
                        Rs {product.price}
                      </span>
                      <Link to={`/product/${product._id}`} className="w-full sm:w-auto">
                        <button className="w-full sm:w-auto px-5 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold sm:font-bold text-sm sm:text-sm md:text-base rounded-full hover:shadow-xl hover:scale-105 transition">
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
            <p className="text-center text-gray-500 mt-8 text-base sm:text-lg">
              No products yet. Add some from the admin dashboard.
            </p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent mb-3 sm:mb-4">
            Layer Labs
          </h2>
          <p className="text-sm sm:text-base text-gray-400">© 2025 • Handcrafted with passion for collectors</p>
        </div>
      </footer>
    </>
  );
}