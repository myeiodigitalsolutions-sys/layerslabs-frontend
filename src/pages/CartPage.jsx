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
  const [currentUser, setCurrentUser] = useState(auth.currentUser); // track user

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

  // Listen to auth changes → refetch cart when user logs in/restores
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
      <div className="pt-32 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-red-600"></div>
        <p className="mt-4 text-xl">Loading your cart...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="pt-32 text-center">
        <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
        <p className="text-2xl mb-6">Please login to view your cart</p>
        <button
          onClick={() => navigate('/')}
          className="px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl text-lg font-semibold"
        >
          Go Home
        </button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="pt-32 text-center">
        <ShoppingBag className="w-32 h-32 text-gray-300 mx-auto mb-8" />
        <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">Add some amazing products!</p>
        <button
          onClick={() => navigate('/')}
          className="px-10 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white text-xl rounded-2xl hover:shadow-xl"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-black text-center mb-12 bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
          Your Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item) => (
              <div key={item.productId} className="bg-white rounded-3xl shadow-xl p-6 flex gap-6 hover:shadow-2xl transition">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-32 h-32 rounded-2xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-2xl font-bold">{item.name}</h3>
                  <p className="text-2xl font-bold text-red-600 mt-2">₹{item.price}</p>
                </div>
                <div className="flex flex-col justify-between items-end">
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-red-500 hover:text-red-700 transition"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                  <div className="flex items-center gap-4 bg-gray-100 rounded-2xl px-4 py-2 mt-4">
                    <button onClick={() => updateQty(item.productId, item.qty - 1)}>
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="text-xl font-bold w-12 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.productId, item.qty + 1)}>
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 h-fit">
            <h2 className="text-3xl font-black mb-8">Order Summary</h2>
            <div className="space-y-4 text-lg">
              <div className="flex justify-between">
                <span>Subtotal ({cart.length} items)</span>
                <span className="font-bold">₹{total}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600 font-bold">FREE</span>
              </div>
              <div className="border-t pt-4 flex justify-between text-2xl font-black">
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
              className="w-full mt-8 py-6 bg-gradient-to-r from-red-600 to-pink-600 text-white text-2xl font-black rounded-2xl hover:shadow-2xl transition"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}