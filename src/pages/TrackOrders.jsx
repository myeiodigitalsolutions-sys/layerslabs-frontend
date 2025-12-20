// src/pages/TrackOrders.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Package, Truck, CheckCircle, Clock, MapPin, Wallet, User, Phone,
  ArrowLeft 
} from 'lucide-react';
import { auth } from '../firebase';
import { onAuthStateChanged, getIdToken } from 'firebase/auth';


const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const API_BASE = `${API_BASE_URL}`;

export default function TrackOrders() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyOrders = async (firebaseUser) => {
    if (!firebaseUser) return;

    try {
      const token = await getIdToken(firebaseUser);
      const headers = {
        Authorization: `Bearer ${token}`
      };

      const res = await axios.get(`${API_BASE}/api/orders/my`, { headers });
      
      const normalized = (res.data || []).map(order => ({
        ...order,
        name: order.name || 'You',
        phone: order.phone || 'Not provided',
        address: order.address || '',
        city: order.city || '',
        state: order.state || '',
        pincode: order.pincode || '',
        payment: order.payment || 'COD',
        status: order.status || 'pending',
        items: order.product?.items || [],
        total: order.product?.total || 0,
      }));

      setOrders(normalized);
    } catch (err) {
      console.error('Error fetching orders:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        navigate('/login');
      } else {
        setError('Failed to load your orders. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        // Not logged in
        navigate('/login', { replace: true });
        return;
      }

      setUser(firebaseUser);
      setLoading(true);
      setError('');
      fetchMyOrders(firebaseUser); // Now safely pass the user
    });

    return () => unsub();
  }, [navigate]);

  const getStatusStep = (status) => {
    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    return Math.max(steps.indexOf(status) + 1, 1);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5" />;
      case 'processing': return <Package className="w-5 h-5" />;
      case 'shipped': return <Truck className="w-5 h-5" />;
      case 'delivered': return <CheckCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-400';
      case 'processing': return 'text-blue-400';
      case 'shipped': return 'text-purple-400';
      case 'delivered': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-white flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-white pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition"
          >
            <ArrowLeft className="w-6 h-6 text-red-600" />
          </button>
          <h1 className="text-4xl font-black bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            Track Your Orders
          </h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <p className="text-xl text-gray-600">No orders yet.</p>
            <p className="text-gray-500 mt-2">Your placed orders will appear here.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 px-8 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-full font-semibold hover:shadow-lg"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => {
              const currentStep = getStatusStep(order.status);

              return (
                <div key={order._id} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                  <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                      <div>
                        <p className="text-sm opacity-90">Order ID</p>
                        <p className="text-xl font-bold">#{order._id.slice(-8).toUpperCase()}</p>
                      </div>
                      <div className="mt-3 sm:mt-0 text-right">
                        <p className="text-sm opacity-90">Placed on</p>
                        <p className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="mt-3 sm:mt-0 text-right">
                        <p className="text-3xl font-black">₹{order.total}</p>
                        <p className="text-sm opacity-90 flex items-center justify-end gap-1 mt-1">
                          <Wallet className="w-4 h-4" />
                          {order.payment === "COD" ? "Cash on Delivery" : "Paid Online"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border-b">
                    <div className="flex items-center justify-between relative">
                      {['Pending', 'Processing', 'Shipped', 'Delivered'].map((step, idx) => (
                        <div key={step} className="flex flex-col items-center z-10">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all
                            ${idx + 1 <= currentStep ? 'bg-white text-red-600 shadow-lg scale-110' : 'bg-gray-200 text-gray-500'}
                          `}>
                            {idx + 1 <= currentStep ? getStatusIcon(order.status) : <Clock className="w-5 h-5" />}
                          </div>
                          <p className={`text-xs mt-2 font-medium ${idx + 1 <= currentStep ? 'text-red-600' : 'text-gray-500'}`}>
                            {step}
                          </p>
                        </div>
                      ))}
                      <div className="absolute top-6 left-12 right-12 h-1 bg-gray-300">
                        <div className="h-full bg-gradient-to-r from-red-600 to-pink-600 transition-all" style={{ width: `${(currentStep - 1) * 33.33}%` }} />
                      </div>
                    </div>
                    <p className="text-center mt-6 text-lg font-semibold capitalize">
                      Current Status: <span className={getStatusColor(order.status)}>{order.status.replace('_', ' ')}</span>
                    </p>
                  </div>

                  <div className="p-6 bg-gray-50">
                    <h3 className="font-bold text-lg mb-4">Items ({order.items.length})</h3>
                    <div className="space-y-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 bg-white p-4 rounded-xl shadow">
                          {item.image ? (
                            <img 
                              src={item.image.startsWith('http') ? item.image : `${API_BASE}${item.image}`} 
                              alt={item.name} 
                              className="w-16 h-16 rounded-lg object-cover" 
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded-lg" />
                          )}
                          <div className="flex-1">
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-gray-600">Qty: {item.qty}</p>
                          </div>
                          <p className="font-bold">₹{item.price * item.qty}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-red-600" />
                      Delivery Address
                    </h3>
                    <div className="bg-gray-50 p-5 rounded-xl space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-gray-600" />
                        <span className="font-medium">{order.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-600" />
                        <span>{order.phone}</span>
                      </div>
                      <div className="ml-8">
                        <p>{order.address}</p>
                        <p className="text-gray-600">
                          {order.city}, {order.state} - {order.pincode}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}