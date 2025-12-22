import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { auth } from '../firebase';
import { getIdToken, onAuthStateChanged } from 'firebase/auth';


const API_BASE = process.env.REACT_APP_API_BASE_URL;

export default function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  const fetchCart = async (user) => {
    if (!user) {
      setCart([]);
      setLoading(false);
      return;
    }

    try {
      const token = await getIdToken(user);
      const res = await fetch(`${API_BASE}/api/cart/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      } else {
        console.error("Failed to fetch cart:", res.status);
        setCart([]);
      }
    } catch (err) {
      console.error("Cart fetch error:", err);
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(true);
      fetchCart(user);
    });

    return () => unsub();
  }, []);

  const updateQty = async (productId, newQty) => {
    if (newQty < 1) return removeItem(productId);
    if (!currentUser) return;

    try {
      const token = await getIdToken(currentUser);
      await fetch(`${API_BASE}/api/cart/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, qty: newQty }),
      });
      setCart(prev => prev.map(item =>
        item.productId === productId ? { ...item, qty: newQty } : item
      ));
    } catch (err) {
      alert("Failed to update quantity");
    }
  };

  const removeItem = async (productId) => {
    if (!currentUser) return;

    try {
      const token = await getIdToken(currentUser);
      await fetch(`${API_BASE}/api/cart/remove`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });
      setCart(prev => prev.filter(item => item.productId !== productId));
    } catch (err) {
      alert("Failed to remove item");
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (loading) {
    return (
      <div className="pt-24 md:pt-32 px-4 text-center min-h-screen flex flex-col items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-t-4 border-red-600"></div>
        <p className="mt-4 text-lg md:text-xl">Loading your cart...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="pt-24 md:pt-32 px-4 text-center min-h-screen flex flex-col items-center justify-center">
        <ShoppingBag className="w-16 h-16 md:w-24 md:h-24 text-gray-300 mx-auto mb-4 md:mb-6" />
        <p className="text-xl md:text-2xl mb-4 md:mb-6">Please login to view your cart</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl text-base md:text-lg font-semibold hover:shadow-xl transition"
        >
          Go Home
        </button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="pt-24 md:pt-32 px-4 text-center min-h-screen flex flex-col items-center justify-center">
        <ShoppingBag className="w-20 h-20 md:w-32 md:h-32 text-gray-300 mx-auto mb-6 md:mb-8" />
        <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-6 md:mb-8 text-base md:text-lg">Add some amazing products!</p>
        <button
          onClick={() => navigate('/')}
          className="px-8 py-3 md:px-10 md:py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white text-lg md:text-xl rounded-xl md:rounded-2xl hover:shadow-xl transition"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 pt-20 md:pt-24 pb-8 md:pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-center mb-6 md:mb-12 bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
          Your Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {cart.map((item) => (
              <div 
                key={item.productId} 
                className="bg-white rounded-2xl md:rounded-3xl shadow-lg md:shadow-xl p-4 md:p-6 hover:shadow-2xl transition"
              >
                {/* Mobile Layout */}
                <div className="flex flex-col sm:hidden gap-4">
                  <div className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold truncate">{item.name}</h3>
                      <p className="text-xl font-bold text-red-600 mt-1">₹{item.price}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-red-500 hover:text-red-700 transition self-start"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-3 py-2">
                      <button 
                        onClick={() => updateQty(item.productId, item.qty - 1)}
                        className="hover:text-red-600 transition"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-lg font-bold w-8 text-center">{item.qty}</span>
                      <button 
                        onClick={() => updateQty(item.productId, item.qty + 1)}
                        className="hover:text-red-600 transition"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Subtotal</p>
                      <p className="text-lg font-bold text-red-600">₹{item.price * item.qty}</p>
                    </div>
                  </div>
                </div>

                {/* Tablet & Desktop Layout */}
                <div className="hidden sm:flex gap-4 md:gap-6">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-xl md:rounded-2xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl md:text-2xl font-bold">{item.name}</h3>
                    <p className="text-xl md:text-2xl font-bold text-red-600 mt-2">₹{item.price}</p>
                  </div>
                  <div className="flex flex-col justify-between items-end">
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-red-500 hover:text-red-700 transition"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                    <div className="flex items-center gap-3 md:gap-4 bg-gray-100 rounded-xl md:rounded-2xl px-3 md:px-4 py-2 mt-4">
                      <button 
                        onClick={() => updateQty(item.productId, item.qty - 1)}
                        className="hover:text-red-600 transition"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                      <span className="text-lg md:text-xl font-bold w-8 md:w-12 text-center">{item.qty}</span>
                      <button 
                        onClick={() => updateQty(item.productId, item.qty + 1)}
                        className="hover:text-red-600 transition"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl p-6 md:p-8 h-fit sticky top-24">
            <h2 className="text-2xl md:text-3xl font-black mb-6 md:mb-8">Order Summary</h2>
            <div className="space-y-3 md:space-y-4 text-base md:text-lg">
              <div className="flex justify-between">
                <span>Subtotal ({cart.length} item{cart.length !== 1 ? 's' : ''})</span>
                <span className="font-bold">₹{total}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600 font-bold">FREE</span>
              </div>
              <div className="border-t pt-3 md:pt-4 flex justify-between text-xl md:text-2xl font-black">
                <span>Total</span>
                <span className="text-red-600">₹{total}</span>
              </div>
            </div>
            <button
              onClick={() => {
                const pendingOrder = {
                  type: "product",
                  product: cart.map(item => ({
                    productId: item.productId,
                    name: item.name,
                    price: item.price,
                    qty: item.qty,
                    image: item.image
                  }))
                };
                localStorage.setItem("pendingOrder", JSON.stringify(pendingOrder));
                navigate("/order");
              }}
              className="w-full mt-6 md:mt-8 py-4 md:py-6 bg-gradient-to-r from-red-600 to-pink-600 text-white text-lg md:text-2xl font-black rounded-xl md:rounded-2xl hover:shadow-2xl transition"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}