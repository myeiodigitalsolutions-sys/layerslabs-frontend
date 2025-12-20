import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Clock, Package, CheckCircle, 
  ChevronDown, ChevronUp, User, Phone, MapPin, Wallet 
} from 'lucide-react';
import { auth } from '../../firebase';
import { getIdToken, onAuthStateChanged } from 'firebase/auth';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const API_BASE = `${API_BASE_URL}`;
const ADMIN_EMAIL = 'myeiokln@gmail.com';

export default function RegularOrders() {
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [regularOrders, setRegularOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  async function getAuthHeaders() {
    if (!authUser) throw new Error('Not authenticated');
    const token = await getIdToken(authUser);
    return { Authorization: `Bearer ${token}` };
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setAuthUser(u);
      setAuthChecked(true);
    });
    return () => unsub();
  }, []);

  const fetchRegularOrders = async () => {
    setLoadingOrders(true);
    try {
      if (!authUser || authUser.email !== ADMIN_EMAIL) return;

      const headers = await getAuthHeaders();
      const res = await axios.get(`${API_BASE}/api/orders`, { headers });

      const normalized = (res.data || []).map(order => ({
        ...order,
        name: order.name || 'Anonymous',
        email: order.email || 'No email',
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

      setRegularOrders(normalized);
    } catch (err) {
      console.error('Error fetching regular orders:', err);
      setError('Failed to load regular orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (!authChecked) return;
    if (!authUser) {
      alert('Please login as admin');
      navigate('/', { replace: true });
      return;
    }
    if (authUser.email !== ADMIN_EMAIL) {
      alert('Unauthorized');
      navigate('/', { replace: true });
      return;
    }
    fetchRegularOrders();
  }, [authChecked, authUser, navigate]);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const headers = await getAuthHeaders();
      await axios.patch(`${API_BASE}/api/orders/${orderId}`, { status: newStatus }, { headers });
      alert('Order status updated successfully');
      fetchRegularOrders();
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update status');
    }
  };

  const toggleExpand = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'processing': return 'bg-blue-500/20 text-blue-400';
      case 'shipped': return 'bg-purple-500/20 text-purple-400';
      case 'delivered': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="p-2 rounded-xl bg-slate-800 border border-slate-600 hover:bg-slate-700 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
              Regular Orders Management
            </h1>
          </div>
        </header>

        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">{error}</div>}

        <div className="bg-slate-900/70 border border-slate-700 rounded-3xl p-6 md:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Regular Orders ({regularOrders.length})</h2>
            <button
              onClick={fetchRegularOrders}
              className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-600 hover:bg-slate-700"
            >
              Refresh
            </button>
          </div>

          {loadingOrders ? (
            <p className="text-slate-300">Loading orders...</p>
          ) : regularOrders.length === 0 ? (
            <p className="text-slate-400">No regular orders yet.</p>
          ) : (
            <div className="space-y-6">
              {regularOrders.map((o) => (
                <div key={o._id} className="bg-slate-800/60 border border-slate-700 rounded-lg overflow-hidden">
                  {/* Main Card */}
                  <div className="p-5 flex flex-col md:flex-row md:items-start gap-6">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:justify-between mb-4">
                        <div>
                          <div className="font-bold text-xl">{o.name}</div>
                          <div className="text-sm text-slate-400">{o.email}</div>
                          <div className="text-xs text-slate-500 mt-1">
                            Order ID: {o._id.slice(-8)}
                          </div>
                          <div className="text-xs text-slate-500">
                            Placed: {new Date(o.createdAt).toLocaleString()}
                          </div>
                        </div>

                        <div className="mt-4 md:mt-0 text-right">
                          <div className="text-2xl font-black text-white">₹{o.total}</div>
                          <div className="text-sm mt-2">
                            <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(o.status)}`}>
                              {o.status}
                            </span>
                          </div>
                          <div className="text-sm text-slate-400 mt-1 flex items-center justify-end gap-1">
                            <Wallet className="w-4 h-4" />
                            {o.payment === "COD" ? "Cash on Delivery" : "Online Paid"}
                          </div>
                        </div>
                      </div>

                      {/* Items Summary */}
                      <div className="mt-4">
                        <div className="text-sm font-medium text-slate-300 mb-2">
                          Items ({o.items.length})
                        </div>
                        <div className="space-y-1">
                          {o.items.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="text-sm text-slate-400">
                              • {item.name} × {item.qty} 
                              <span className="ml-2 text-slate-300">₹{item.price * item.qty}</span>
                            </div>
                          ))}
                          {o.items.length > 3 && (
                            <div className="text-sm text-slate-500">...and {o.items.length - 3} more</div>
                          )}
                        </div>
                      </div>

                      {/* Status Update */}
                      <div className="flex items-center gap-3 mt-5">
                        <span className="text-sm font-medium">Update Status:</span>
                        <select
                          value={o.status}
                          onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                          className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Delivery Details */}
                  <div className="border-t border-slate-700">
                    <button
                      onClick={() => toggleExpand(o._id)}
                      className="w-full px-5 py-3 flex items-center justify-between hover:bg-slate-700/30 transition"
                    >
                      <span className="font-medium">Delivery Address & Contact</span>
                      {expandedOrderId === o._id ? <ChevronUp /> : <ChevronDown />}
                    </button>

                    {expandedOrderId === o._id && (
                      <div className="px-5 pb-5 pt-2 space-y-4 text-sm">
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4 text-slate-400" />
                          <span>{o.name} • {o.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span>{o.phone}</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-slate-400 mt-1" />
                          <div>
                            <p>{o.address || 'No address provided'}</p>
                            <p className="text-slate-400">
                              {o.city}, {o.state} - {o.pincode}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}