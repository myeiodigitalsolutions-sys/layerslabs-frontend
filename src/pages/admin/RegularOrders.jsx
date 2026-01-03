import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, Wallet, User, Phone, MapPin,
  Package, ChevronDown, ChevronUp, Search
} from 'lucide-react';
import { auth } from '../../firebase';
import { getIdToken, onAuthStateChanged } from 'firebase/auth';

const API_BASE = process.env.REACT_APP_API_BASE_URL;
const ADMIN_EMAIL = 'myeiokln@gmail.com';

export default function RegularOrders() {
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [regularOrders, setRegularOrders] = useState([]);
  const [displayOrders, setDisplayOrders] = useState([]); // Filtered orders for display
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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
    setError('');
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
        total: order.product?.total || order.total || 0,
      }));

      setRegularOrders(normalized);
      setDisplayOrders(normalized); // Initial display
    } catch (err) {
      console.error('Error fetching regular orders:', err);
      setError('Failed to load regular orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (!authChecked) return;
    if (!authUser || authUser.email !== ADMIN_EMAIL) {
      alert('Unauthorized access.');
      navigate('/', { replace: true });
      return;
    }
    fetchRegularOrders();
  }, [authChecked, authUser, navigate]);

  // Real-time Search Filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setDisplayOrders(regularOrders);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = regularOrders.filter(order =>
      order.name.toLowerCase().includes(query) ||
      order.email.toLowerCase().includes(query) ||
      order.phone.includes(query) ||
      order._id.toLowerCase().includes(query) ||
      order.city.toLowerCase().includes(query) ||
      order.state.toLowerCase().includes(query) ||
      order.pincode.includes(query)
    );

    setDisplayOrders(filtered);
  }, [searchQuery, regularOrders]);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const headers = await getAuthHeaders();
      await axios.patch(`${API_BASE}/api/orders/${orderId}`, { status: newStatus }, { headers });
      alert('Order status updated successfully!');
      fetchRegularOrders();
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update status');
    }
  };

  const toggleExpand = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="p-3 rounded-xl bg-white shadow-md hover:shadow-lg transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Regular Orders Management
            </h1>
          </div>
        </header>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* Orders List */}
        <section className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              Regular Orders ({displayOrders.length})
              {searchQuery && <span className="text-sm font-normal text-gray-500 ml-2">— Search results</span>}
            </h2>

            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              {/* Search Input */}
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone, order ID, city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-800 placeholder-gray-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>

              <button
                onClick={fetchRegularOrders}
                className="px-6 py-4 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition"
              >
                Refresh Orders
              </button>
            </div>
          </div>

          {loadingOrders ? (
            <p className="text-center text-gray-600 py-12">Loading orders...</p>
          ) : displayOrders.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-gray-500">
                {searchQuery ? 'No orders found matching your search.' : 'No regular orders yet.'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {displayOrders.map((o) => (
                <div key={o._id} className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
                  {/* Main Order Card */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Customer & Order Info */}
                      <div className="lg:col-span-2 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{o.name}</h3>
                            <p className="text-gray-600">{o.email}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Order ID: <span className="font-mono">{o._id.slice(-8)}</span>
                            </p>
                            <p className="text-sm text-gray-500">
                              Placed on: {new Date(o.createdAt).toLocaleString()}
                            </p>
                          </div>

                          <div className="text-right">
                            <div className="text-3xl font-black text-purple-700">₹{o.total}</div>
                            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold">
                              <Package className="w-4 h-4" />
                              <span className={getStatusBadge(o.status)}>
                                {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center justify-end gap-2 text-sm text-gray-600">
                              <Wallet className="w-4 h-4" />
                              {o.payment === "COD" ? "Cash on Delivery" : "Paid Online"}
                            </div>
                          </div>
                        </div>

                        {/* Ordered Items */}
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-3">
                            Items ({o.items.length})
                          </h4>
                          <div className="space-y-2 bg-white rounded-xl p-4 border border-gray-200">
                            {o.items.slice(0, 5).map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span className="text-gray-700">
                                  {item.name} × {item.qty}
                                </span>
                                <span className="font-medium text-gray-900">
                                  ₹{item.price * item.qty}
                                </span>
                              </div>
                            ))}
                            {o.items.length > 5 && (
                              <p className="text-sm text-gray-500 text-center pt-2">
                                ...and {o.items.length - 5} more items
                              </p>
                            )}
                            <div className="border-t border-gray-300 pt-3 mt-3 flex justify-between font-bold text-gray-900">
                              <span>Total</span>
                              <span>₹{o.total}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status Update Control */}
                        <div className="flex items-center gap-4">
                          <label className="font-medium text-gray-700">Update Status:</label>
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                            className="px-5 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Delivery Details */}
                  <div className="border-t border-gray-200 bg-gray-100/50">
                    <button
                      onClick={() => toggleExpand(o._id)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-200 transition font-medium text-gray-800"
                    >
                      <span>View Delivery Address & Contact</span>
                      {expandedOrderId === o._id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>

                    {expandedOrderId === o._id && (
                      <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-700">
                        <div className="space-y-5">
                          <div className="flex items-center gap-4">
                            <User className="w-5 h-5 text-gray-500" />
                            <div>
                              <p className="font-medium">{o.name}</p>
                              <p className="text-sm text-gray-600">{o.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <Phone className="w-5 h-5 text-gray-500" />
                            <span>{o.phone}</span>
                          </div>

                          <div className="flex items-start gap-4">
                            <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                            <div>
                              <p className="font-medium">{o.address || 'No address provided'}</p>
                              <p className="text-sm text-gray-600">
                                {o.city}, {o.state} - {o.pincode}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}