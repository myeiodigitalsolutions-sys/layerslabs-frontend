import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Download, ArrowLeft, ChevronDown, ChevronUp,
  User, Phone, MapPin, Package, Clock
} from 'lucide-react';
import { auth } from '../../firebase';
import { getIdToken, onAuthStateChanged } from 'firebase/auth';
import modelPlaceholder from '../../assets/3d-file-placeholder.png';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const API_BASE = process.env.REACT_APP_API_BASE_URL;
const ADMIN_EMAIL = 'myeiokln@gmail.com';

export default function CustomOrders() {
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [customOrders, setCustomOrders] = useState([]);
  const [loadingCustoms, setLoadingCustoms] = useState(false);
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

  const fetchCustomOrders = async () => {
    setLoadingCustoms(true);
    setError('');
    try {
      if (!authUser || authUser.email !== ADMIN_EMAIL) return;
      const headers = await getAuthHeaders();
      const res = await axios.get(`${API_BASE}/api/customized`, { headers });

      const normalized = (res.data || []).map(o => ({
        ...o,
        images: o.images || [],
        height: o.height,
        length: o.length,
        price: o.price ?? null,
        material: o.material,
        description: o.notes || '',
        name: o.name || 'Anonymous',
        email: o.email || 'No email provided',
        phone: o.phone || 'Not provided',
        address: o.address || '',
        city: o.city || '',
        state: o.state || '',
        pincode: o.pincode || '',
        payment: o.payment || "COD",
        paymentStatus: o.paymentStatus || "pending",
        status: o.status || "pending",
      }));

      setCustomOrders(normalized);
    } catch (err) {
      console.error('Error fetching custom orders:', err);
      setError('Failed to load customized orders');
    } finally {
      setLoadingCustoms(false);
    }
  };

  useEffect(() => {
    if (!authChecked) return;
    if (!authUser || authUser.email !== ADMIN_EMAIL) {
      alert('Unauthorized access.');
      navigate('/', { replace: true });
      return;
    }
    fetchCustomOrders();
  }, [authChecked, authUser, navigate]);

  const handleDownloadImage = (imgUrl) => {
    const url = new URL(imgUrl);
    let filename = decodeURIComponent(url.pathname.split('/').pop().split('?')[0]);
    if (!filename.includes('.')) filename = 'downloaded_file';

    const a = document.createElement('a');
    a.href = imgUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadAll = async (order) => {
    if (!order.images || order.images.length === 0) {
      alert('No files to download');
      return;
    }

    const zip = new JSZip();
    const folder = zip.folder(`Custom_Order_${order._id.slice(-8)}`);
    let successCount = 0;

    try {
      for (let i = 0; i < order.images.length; i++) {
        const imgUrl = order.images[i];
        const response = await fetch(imgUrl, { mode: 'cors' });
        if (!response.ok) continue;

        const blob = await response.blob();
        const url = new URL(imgUrl);
        let filename = decodeURIComponent(url.pathname.split('/').pop().split('?')[0]);
        if (!filename.includes('.')) filename = `file_${i + 1}`;

        folder.file(filename, blob);
        successCount++;
      }

      if (successCount === 0) throw new Error('No files downloaded');
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `Custom_Order_${order._id.slice(-8)}.zip`);
      alert(`Successfully downloaded ${successCount} file(s) as ZIP!`);
    } catch (err) {
      console.error('ZIP failed:', err);
      alert('ZIP failed. Downloading individually...');
      order.images.forEach(handleDownloadImage);
    }
  };

  const handleUpdateCustomOrder = async (o) => {
    try {
      const headers = await getAuthHeaders();
      const send = {
        price: o.price || null,
        expectedDelivery: o.expectedDelivery || null,
        status: o.status
      };
      await axios.patch(`${API_BASE}/api/customized/${o._id}`, send, { headers });
      alert('Order updated & customer notified!');
      fetchCustomOrders();
    } catch (err) {
      console.error(err);
      alert('Failed to update order');
    }
  };

  const toggleExpand = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'priced': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const is3DModelFile = (path) => {
    const ext = path.split('.').pop()?.toLowerCase();
    return ['stl', 'obj', 'fbx', 'step', 'iges'].includes(ext);
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
              Custom Orders Management
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
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              Customized Orders ({customOrders.length})
            </h2>
            <button
              onClick={fetchCustomOrders}
              className="px-6 py-3 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition"
            >
              Refresh
            </button>
          </div>

          {loadingCustoms ? (
            <p className="text-center text-gray-600 py-12">Loading orders...</p>
          ) : customOrders.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No customized orders yet.</p>
          ) : (
            <div className="space-y-8">
              {customOrders.map((o) => {
                const fileUrl = (img) => img.startsWith('http') ? img : `${API_BASE}${img}`;

                return (
                  <div key={o._id} className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
                    {/* Main Content */}
                    <div className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Images Grid */}
                        <div className="lg:col-span-1">
                          <h3 className="text-sm font-semibold text-gray-600 mb-3">Uploaded Files</h3>
                          <div className="grid grid-cols-2 gap-4">
                            {(o.images || []).slice(0, 4).map((img, idx) => {
                              const is3D = is3DModelFile(img);
                              return (
                                <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-300 bg-white">
                                  <img
                                    src={is3D ? modelPlaceholder : fileUrl(img)}
                                    alt={`Upload ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                  {is3D && (
                                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                      <span className="text-white font-bold text-sm">3D MODEL</span>
                                    </div>
                                  )}
                                  <button
                                    onClick={() => handleDownloadImage(img)}
                                    className="absolute bottom-2 right-2 p-2 bg-white/90 rounded-lg shadow hover:bg-white transition opacity-0 group-hover:opacity-100"
                                  >
                                    <Download className="w-4 h-4 text-gray-700" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                          {o.images.length > 4 && (
                            <p className="text-sm text-gray-500 mt-2 text-center">+{o.images.length - 4} more files</p>
                          )}
                        </div>

                        {/* Details & Actions */}
                        <div className="lg:col-span-2 space-y-6">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{o.name}</h3>
                              <p className="text-gray-600">{o.email}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                Submitted: {new Date(o.createdAt).toLocaleString()}
                              </p>
                              {o.description && (
                                <p className="mt-3 text-gray-700">
                                  <span className="font-medium">Notes:</span> {o.description}
                                </p>
                              )}
                              <p className="mt-2 text-gray-700">
                                <span className="font-medium">Size:</span> Height {o.height || '?'} in • Length {o.length || '?'} in
                              </p>
                            </div>

                            <div className="text-right">
                              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                <Package className="w-4 h-4" />
                                {o.status.replace('_', ' ').toUpperCase()}
                              </div>
                              <p className="text-sm text-gray-600 mt-2">
                                Expected: {o.expectedDelivery ? new Date(o.expectedDelivery).toLocaleDateString() : 'Not set'}
                              </p>
                            </div>
                          </div>

                          {/* Admin Controls */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                              <input
                                type="number"
                                placeholder="Enter price"
                                value={o.price ?? ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCustomOrders(prev => prev.map(x =>
                                    x._id === o._id ? { ...x, price: val ? Number(val) : null } : x
                                  ));
                                }}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery</label>
                              <input
                                type="date"
                                value={o.expectedDelivery ? new Date(o.expectedDelivery).toISOString().slice(0, 10) : ''}
                                onChange={(e) => {
                                  setCustomOrders(prev => prev.map(x =>
                                    x._id === o._id ? { ...x, expectedDelivery: e.target.value } : x
                                  ));
                                }}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                              <select
                                value={o.status}
                                onChange={(e) => {
                                  setCustomOrders(prev => prev.map(x =>
                                    x._id === o._id ? { ...x, status: e.target.value } : x
                                  ));
                                }}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                              >
                                <option value="pending">Pending</option>
                                <option value="priced">Priced</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                              </select>
                            </div>

                            <div className="flex flex-col justify-end gap-3">
                              <button
                                onClick={() => handleDownloadAll(o)}
                                className="w-full px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-xl hover:shadow-lg transition flex items-center justify-center gap-2"
                              >
                                <Download className="w-4 h-4" />
                                Download All
                              </button>

                              <button
                                onClick={() => handleUpdateCustomOrder(o)}
                                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg transition"
                              >
                                Save & Notify
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Section: User & Payment Details */}
                    <div className="border-t border-gray-200 bg-gray-100/50">
                      <button
                        onClick={() => toggleExpand(o._id)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-200 transition"
                      >
                        <span className="font-semibold text-gray-800">View Delivery & Payment Details</span>
                        {expandedOrderId === o._id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>

                      {expandedOrderId === o._id && (
                        <div className="px-6 pb-6 pt-2 grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <User className="w-5 h-5 text-gray-500" />
                              <div>
                                <p className="font-medium">{o.name}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <Phone className="w-5 h-5 text-gray-500" />
                              <span>{o.phone || 'Not provided'}</span>
                            </div>

                            <div className="flex items-start gap-3">
                              <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                              <div>
                                <p>{o.address || 'No address provided'}</p>
                                <p className="text-sm text-gray-600">
                                  {o.city}, {o.state} - {o.pincode}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4 pt-4 md:pt-0 md:border-t-0 md:border-l border-t border-gray-300 md:pl-6">
                            <h4 className="font-semibold text-gray-800">Payment Information</h4>
                            <div className="grid grid-cols-1 gap-3 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Method:</span>
                                <span className="font-medium">
                                  {o.payment === "COD" ? "Cash on Delivery" : "Online Payment"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Status:</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  o.paymentStatus === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}>
                                  {o.paymentStatus === "completed" ? "Paid" : "Pending"}
                                </span>
                              </div>
                              {o.price && (
                                <div className="flex justify-between pt-3 border-t border-gray-300">
                                  <span className="text-gray-600">Total Amount:</span>
                                  <span className="text-xl font-bold text-purple-700">₹{o.price}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}