// src/App.jsx
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import { Link } from 'react-router-dom';
import { Star, Loader2, Filter, X, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import banner1 from './assets/banner1.jpg';
import banner2 from './assets/banner2.jpg';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryError, setCategoryError] = useState('');

  // Filter states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [selectedRating, setSelectedRating] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const featuredSectionRef = useRef(null);
  const showcaseSectionRef = useRef(null);

  // Banner carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const banners = [banner1, banner2];

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/categories`);
      const data = res.data;
      setMainCategories(data.mainCategories || []);
      setCategories(data.allCategories || []);
    } catch (err) {
      console.error('Error fetching categories', err);
      setCategories([]);
      setMainCategories([]);
    }
  };

  // Handle category navigation from Navbar
  useEffect(() => {
    const state = location.state;

    if (state?.categoryId !== undefined) {
      if (state.categoryId === null) {
        setSelectedCategory(null);
        setCategoryError('');
        navigate("/", { replace: true, state: {} });
        return;
      }

      const foundCat = mainCategories.find(c => c._id === state.categoryId);
      if (foundCat) {
        setSelectedCategory(foundCat);
        setCategoryError('');
      } else if (state.categoryName) {
        setSelectedCategory({ _id: state.categoryId, name: state.categoryName });
      }

      navigate("/", { replace: true, state: {} });
    }
  }, [location.state, mainCategories, navigate]);

  // Fetch all products
  useEffect(() => {
    fetchAllProducts();
  }, []);

  const fetchAllProducts = async () => {
    setLoadingProducts(true);
    setError('');
    setCategoryError('');
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products`);
      const prods = res.data || [];
      setProducts(prods);
      setFilteredProducts(prods);

      // Calculate price range
      if (prods.length > 0) {
        const prices = prods.map(p => p.price);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        setMinPrice(Math.floor(min));
        setMaxPrice(Math.ceil(max));
        setPriceRange([Math.floor(min), Math.ceil(max)]);
      }
    } catch (err) {
      console.error('Error fetching products', err);
      setError('Failed to load products. Please try again later.');
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Apply filters whenever filter state changes
  useEffect(() => {
    let filtered = [...products];

    // Category filter (from navbar)
    if (selectedCategory) {
      filtered = filtered.filter(p =>
        p.category?._id === selectedCategory._id ||
        p.subcategory?.parent?.toString() === selectedCategory._id
      );
    }

    // Subcategory filter
    if (selectedSubcategories.length > 0) {
      filtered = filtered.filter(p =>
        p.subcategory && selectedSubcategories.includes(p.subcategory._id)
      );
    }

    // Price range
    filtered = filtered.filter(p =>
      p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Rating filter
    if (selectedRating !== null) {
      filtered = filtered.filter(p => Math.floor(p.rating || 0) >= selectedRating);
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, selectedSubcategories, priceRange, selectedRating]);

  const clearFilters = () => {
    setSelectedSubcategories([]);
    setPriceRange([minPrice, maxPrice]);
    setSelectedRating(null);
    setIsFilterOpen(false);
  };

  // Banner carousel functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Auto-slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const scrollToFeatured = () => {
    featuredSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToShowcase = () => {
    showcaseSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <Navbar onOpenSidebar={() => setIsSidebarOpen(true)} />
      <Sidebar open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Category Error Alert */}
      {categoryError && (
        <div className="fixed top-16 left-0 right-0 z-50 animate-fade-in">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-4 rounded-r-lg shadow-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-medium">{categoryError}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section with Banner Carousel */}
      <section className="relative pt-20 sm:pt-24 pb-12 sm:pb-16 md:pb-20 overflow-hidden">
        {/* Banner Carousel Background */}
        <div className="absolute inset-0 z-0">
          {banners.map((banner, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
            >
              <img
                src={banner}
                alt={`Banner ${index + 1}`}
                className="w-full h-full object-cover object-center"
              />
              {/* Overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60"></div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-2 sm:p-3 md:p-4 rounded-full transition-all duration-300 hover:scale-110 group"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 group-hover:scale-110 transition-transform" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-2 sm:p-3 md:p-4 rounded-full transition-all duration-300 hover:scale-110 group"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 group-hover:scale-110 transition-transform" />
        </button>

        {/* Dot Indicators */}
        <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2 sm:gap-3">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${index === currentSlide
                ? 'w-8 sm:w-10 md:w-12 h-2 sm:h-2.5 md:h-3 bg-white'
                : 'w-2 sm:w-2.5 md:w-3 h-2 sm:h-2.5 md:h-3 bg-white/50 hover:bg-white/75'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white mb-4 sm:mb-6 leading-tight drop-shadow-2xl">
            LEGENDS
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400 drop-shadow-lg">
              IN 3D
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white mb-8 sm:mb-10 md:mb-12 max-w-4xl mx-auto font-light px-4 drop-shadow-lg">
            Premium hand-painted 3D printed collectibles • Limited editions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4">
            <button onClick={scrollToFeatured} className="px-8 py-4 sm:px-10 sm:py-4 md:px-12 md:py-5 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold text-base sm:text-lg md:text-xl rounded-xl sm:rounded-2xl hover:shadow-2xl hover:scale-105 transition transform">
              Shop Collection
            </button>
            <button onClick={scrollToShowcase} className="px-8 py-4 sm:px-10 sm:py-4 md:px-12 md:py-5 border-2 border-white text-white font-bold text-base sm:text-lg md:text-xl rounded-xl sm:rounded-2xl hover:bg-white/10 backdrop-blur-sm transition">
              Watch Showcase
            </button>
          </div>
        </div>
      </section>

      {/* Banner Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-r from-red-600 via-pink-600 to-red-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center text-white">
            <div className="p-4 sm:p-6">
              <div className="text-3xl sm:text-4xl md:text-5xl font-black mb-2">100+</div>
              <div className="text-sm sm:text-base md:text-lg font-medium opacity-90">Unique Collectibles</div>
            </div>
            <div className="p-4 sm:p-6 border-t sm:border-t-0 sm:border-l sm:border-r border-white/30">
              <div className="text-3xl sm:text-4xl md:text-5xl font-black mb-2">Hand-Painted</div>
              <div className="text-sm sm:text-base md:text-lg font-medium opacity-90">Premium Quality</div>
            </div>
            <div className="p-4 sm:p-6 border-t sm:border-t-0 border-white/30">
              <div className="text-3xl sm:text-4xl md:text-5xl font-black mb-2">Limited</div>
              <div className="text-sm sm:text-base md:text-lg font-medium opacity-90">Edition Pieces</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section ref={featuredSectionRef} className="py-12 sm:py-16 md:py-24 bg-white">
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

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {(selectedSubcategories.length > 0 || selectedRating !== null || priceRange[0] !== minPrice || priceRange[1] !== maxPrice) && (
                <button
                  onClick={clearFilters}
                  className="text-sm px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              {selectedCategory && (
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setCategoryError('');
                    navigate("/", { replace: true });
                  }}
                  className="text-sm px-4 py-2 border-2 border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition"
                >
                  Show All
                </button>
              )}
            </div>
          </div>

          {/* Loading */}
          {loadingProducts && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center gap-3 mb-4">
                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                <span className="text-lg font-medium text-gray-700">
                  Loading products...
                </span>
              </div>
            </div>
          )}

          {/* Error */}
          {!loadingProducts && error && (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
                <p className="text-red-700 font-medium mb-2">{error}</p>
                <button
                  onClick={fetchAllProducts}
                  className="text-sm px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Products Grid */}
          {!loadingProducts && !error && filteredProducts.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {filteredProducts.map((product) => {
                const image = product.images && product.images.length > 0
                  ? product.images[0]
                  : 'https://via.placeholder.com/600x400?text=No+Image';

                return (
                  <div key={product._id} className="group relative bg-white/70 backdrop-blur-xl rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-red-200">
                    {product.tag && (
                      <div className={`absolute top-2 left-2 sm:top-3 sm:left-3 z-10 px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-bold text-white shadow-lg ${product.tag === 'Sale' ? 'bg-gradient-to-r from-red-500 to-pink-600' :
                        product.tag === 'New' ? 'bg-gradient-to-r from-emerald-500 to-teal-600' :
                          product.tag === 'Best Seller' ? 'bg-gradient-to-r from-yellow-500 to-orange-600' :
                            'bg-gradient-to-r from-red-600 to-pink-600'
                        }`}>
                        {product.tag}
                      </div>
                    )}
                    <div className="relative overflow-hidden bg-gradient-to-br from-red-50 to-pink-50 aspect-square">
                      <img src={image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <div className="p-3 sm:p-4 md:p-4">
                      <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-0.5 sm:gap-1 mb-2 sm:mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${i < Math.floor(product.rating || 0) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                        ))}
                        <span className="text-xs text-gray-600 ml-1">({product.rating?.toFixed ? product.rating.toFixed(1) : product.rating || 0})</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-lg sm:text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600">
                          Rs {product.price}
                        </span>
                        <Link to={`/product/${product._id}`} className="w-full">
                          <button className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold text-xs sm:text-sm rounded-full hover:shadow-xl hover:scale-105 transition">
                            View Details
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!loadingProducts && !error && filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 max-w-md mx-auto">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p className="text-gray-600 text-lg mb-4">
                  No products match your filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="text-sm px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Filter Drawer (Mobile & Desktop) */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsFilterOpen(false)} />
          <div className="relative ml-auto w-full max-w-md bg-white shadow-2xl h-full overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">Filters</h3>
              <button onClick={() => setIsFilterOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Categories with Subcategories */}
              {mainCategories.length > 0 && (
                <div>
                  <h4 className="font-semibold text-lg mb-5">Categories</h4>
                  <div className="space-y-6">
                    {mainCategories.map((mainCat) => (
                      <div key={mainCat._id} className="space-y-3">
                        {/* Main Category Name */}
                        <div className="font-medium text-gray-900 text-base pl-1">
                          {mainCat.name}
                        </div>

                        {/* Subcategories */}
                        {(mainCat.subcategories || []).length > 0 ? (
                          <div className="space-y-2 pl-4">
                            {mainCat.subcategories.map((sub) => (
                              <label key={sub._id} className="flex items-center gap-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedSubcategories.includes(sub._id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedSubcategories([...selectedSubcategories, sub._id]);
                                    } else {
                                      setSelectedSubcategories(selectedSubcategories.filter(id => id !== sub._id));
                                    }
                                  }}
                                  className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                                />
                                <span className="text-gray-700">{sub.name}</span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 pl-4">No subcategories</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div>
                <h4 className="font-semibold text-lg mb-4">Price Range</h4>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Rs {priceRange[0]}</span>
                    <span>Rs {priceRange[1]}</span>
                  </div>
                  <input
                    type="range"
                    min={minPrice}
                    max={maxPrice}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                  <input
                    type="range"
                    min={minPrice}
                    max={maxPrice}
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                </div>
              </div>

              {/* Rating */}
              <div>
                <h4 className="font-semibold text-lg mb-4">Minimum Rating</h4>
                <div className="space-y-3">
                  {[4, 3, 2, 1].map(rating => (
                    <label key={rating} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="rating"
                        checked={selectedRating === rating}
                        onChange={() => setSelectedRating(rating)}
                        className="w-5 h-5 text-red-600"
                      />
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                        <span className="text-gray-700 ml-1">& Up</span>
                      </div>
                    </label>
                  ))}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      checked={selectedRating === null}
                      onChange={() => setSelectedRating(null)}
                      className="w-5 h-5 text-red-600"
                    />
                    <span className="text-gray-700">Any Rating</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
              <button
                onClick={clearFilters}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Showcase Section */}
      <section ref={showcaseSectionRef} className="py-12 sm:py-16 md:py-24 bg-gradient-to-br from-red-50 via-pink-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-gray-900 mb-4 sm:mb-6 leading-tight">
            Watch Our{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600">
              Showcase
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-12 max-w-3xl mx-auto">
            See our collectibles come to life with detailed 360° views and behind-the-scenes creation process
          </p>
          <div className="aspect-video bg-gray-900 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl max-w-5xl mx-auto">
            <div className="w-full h-full flex items-center justify-center text-white text-lg sm:text-xl">
              Video Showcase Coming Soon
            </div>
          </div>
        </div>
      </section>
    </>
  );
}