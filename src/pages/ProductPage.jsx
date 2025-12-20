// src/pages/ProductPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShoppingCart,
  Truck,
  Shield,
  Check,
  Star,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import axios from 'axios';

import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { getIdToken } from "firebase/auth";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // UI state for navbar/sidebar integration
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${API_BASE_URL}/api/products/${id}`);
        const p = res.data;
        setProduct(p);
        if (p.images && p.images.length > 0) {
          setSelectedImage(p.images[0]);
        } else {
          setSelectedImage('https://via.placeholder.com/1200x1200?text=No+Image');
        }
      } catch (err) {
        console.error('Error fetching product', err);
        setError('Failed to load product. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/categories`)
      .then(res => setCategories(res.data || []))
      .catch(err => console.warn('Could not load categories', err));
  }, []);

  const nextImage = () => {
    if (!product || !product.images || product.images.length === 0) return;
    const current = product.images.indexOf(selectedImage);
    const nextIndex = (current + 1) % product.images.length;
    setSelectedImage(product.images[nextIndex]);
  };

  const prevImage = () => {
    if (!product || !product.images || product.images.length === 0) return;
    const current = product.images.indexOf(selectedImage);
    const prevIndex = (current - 1 + product.images.length) % product.images.length;
    setSelectedImage(product.images[prevIndex]);
  };

  const handleBuyNow = () => {
    const pendingOrder = {
      type: "product",
      product: [
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          qty: quantity,
          image: selectedImage
        }
      ]
    };

    localStorage.setItem("pendingOrder", JSON.stringify(pendingOrder));
    navigate("/order");
  };

  const handleAddToCart = async () => {
    if (!auth.currentUser) {
      alert("Please login to add items to cart");
      return;
    }

    try {
      const token = await getIdToken(auth.currentUser);
      await fetch(`${API_BASE_URL}/api/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product._id,
          name: product.name,
          price: product.price,
          image: selectedImage,
          qty: quantity,
        }),
      });

      alert(`Added ${quantity} × ${product.name} to cart!`);
    } catch (err) {
      alert("Failed to add to cart. Please try again.");
    }
  };

  const handleOpenSidebar = () => setSidebarOpen(true);
  const handleCloseSidebar = () => setSidebarOpen(false);
  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
  };

  if (loading || !product) {
    return (
      <>
        <Navbar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          onOpenSidebar={handleOpenSidebar}
        />
        <Sidebar
          open={sidebarOpen}
          onClose={handleCloseSidebar}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(c) => { handleSelectCategory(c); handleCloseSidebar(); }}
        />

        <section className="pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 md:pb-24 bg-gradient-to-br from-red-50 via-pink-50 to-white min-h-screen flex items-center justify-center px-4">
          <p className="text-base sm:text-lg text-gray-700">
            {error ? error : 'Loading product...'}
          </p>
        </section>
      </>
    );
  }

  return (
    <>
      <Navbar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        onOpenSidebar={handleOpenSidebar}
      />
      <Sidebar
        open={sidebarOpen}
        onClose={handleCloseSidebar}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(c) => { handleSelectCategory(c); handleCloseSidebar(); }}
      />

      {/* Main Product Section */}
      <section className="pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 md:pb-24 bg-gradient-to-br from-red-50 via-pink-50 to-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Back Button */}
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 mb-6 sm:mb-8 font-medium text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> Back to Collection
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
            {/* Left: Image Gallery */}
            <div className="space-y-4 sm:space-y-6">
              {/* Main Image with Navigation */}
              <div className="relative group rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl bg-white">
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full aspect-square object-cover"
                />
                {/* Navigation Arrows */}
                <button
                  onClick={prevImage}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur p-2 sm:p-3 rounded-full shadow-lg hover:bg-white transition opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur p-2 sm:p-3 rounded-full shadow-lg hover:bg-white transition opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                {product.tag && (
                  <div
                    className={`absolute top-3 left-3 sm:top-6 sm:left-6 px-4 py-1.5 sm:px-6 sm:py-2 rounded-full text-white font-bold text-xs sm:text-sm shadow-lg ${
                      product.tag === 'Best Seller'
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-600'
                        : product.tag === 'New'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                        : 'bg-gradient-to-r from-red-600 to-pink-600'
                    }`}
                  >
                    {product.tag}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-4 gap-2 sm:gap-4">
                {(product.images || []).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`aspect-square rounded-lg sm:rounded-2xl overflow-hidden border-2 sm:border-4 transition-all ${
                      selectedImage === img
                        ? 'border-red-500 shadow-lg'
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Product Info */}
            <div className="flex flex-col justify-center">
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl sm:shadow-2xl border border-gray-100">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 sm:mb-6 leading-tight">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="flex text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 ${
                          i < Math.floor(product.rating || 0)
                            ? 'fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm sm:text-base md:text-lg text-gray-600 font-medium">
                    {product.rating || 0} ({product.reviews || 0} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600 mb-6 sm:mb-8">
                  Rs {product.price}
                </div>

                {/* Description */}
                <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed mb-6 sm:mb-8 md:mb-10">
                  {product.description}
                </p>

                {/* Features */}
                <div className="space-y-3 sm:space-y-4 md:space-y-5 mb-8 sm:mb-10 md:mb-12">
                  {(product.features || []).map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 sm:gap-4">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br from-red-100 to-pink-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-red-600" />
                      </div>
                      <span className="text-sm sm:text-base md:text-lg text-gray-800">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center gap-4 sm:gap-6 mb-6 sm:mb-8 md:mb-10">
                  <div className="flex items-center bg-gray-100 rounded-xl sm:rounded-2xl">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-3 sm:px-5 sm:py-3 md:px-6 md:py-4 text-gray-600 hover:text-gray-900 transition text-lg sm:text-xl"
                    >
                      −
                    </button>
                    <span className="px-6 py-3 sm:px-8 sm:py-3 md:px-10 md:py-4 font-bold text-lg sm:text-xl text-gray-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-3 sm:px-5 sm:py-3 md:px-6 md:py-4 text-gray-600 hover:text-gray-900 transition text-lg sm:text-xl"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <button
                    onClick={handleBuyNow}
                    className="w-full sm:w-auto px-8 py-4 sm:px-10 sm:py-5 md:px-12 md:py-6 bg-gradient-to-r from-red-600 to-pink-600 text-white font-black text-base sm:text-lg md:text-xl rounded-xl sm:rounded-2xl hover:shadow-2xl hover:scale-105 transition transform shadow-xl"
                  >
                    Buy Now
                  </button>
                  <button
                    onClick={handleAddToCart}
                    className="w-full sm:w-auto px-8 py-4 sm:px-10 sm:py-5 md:px-12 md:py-6 border-2 sm:border-3 md:border-4 border-red-600 text-red-600 font-black text-base sm:text-lg md:text-xl rounded-xl sm:rounded-2xl hover:bg-red-50 transition"
                  >
                    Add to Cart
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-center gap-6 sm:gap-8 md:gap-12 mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-8 md:pt-10 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <Truck className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-red-600 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-gray-900 text-sm sm:text-base">Free Shipping</p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        On orders over Rs 150
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-red-600 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-gray-900 text-sm sm:text-base">100% Authentic</p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Certified collectible
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent mb-3 sm:mb-4">
            Layer Labs
          </h2>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg">
            © 2025 • Crafted for True Collectors
          </p>
        </div>
      </footer>
    </>
  );
}