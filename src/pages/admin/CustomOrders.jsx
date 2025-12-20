import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Download, ArrowLeft, CheckCircle, Clock, Package, 
  ChevronDown, ChevronUp, User, Phone, MapPin 
} from 'lucide-react';
import { auth } from '../../firebase';
import { getIdToken, onAuthStateChanged } from 'firebase/auth';
import modelPlaceholder from '../../assets/3d-file-placeholder.png';
import JSZip from 'jszip';          // ← NEW: for ZIP download
import { saveAs } from 'file-saver'; // ← NEW: to trigger download
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const API_BASE = `${API_BASE_URL}`;
const ADMIN_EMAIL = 'myeiokln@gmail.com';

export default function CustomOrders() {
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [customOrders, setCustomOrders] = useState([]);
  const [loadingCustoms, setLoadingCustoms] = useState(false);
  const [error, setError] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null); // for collapsible

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
        description: o.notes,
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
    fetchCustomOrders();
  }, [authChecked, authUser, navigate]);

  // Single file download (existing)
// Reliable single file download
// Single file download (still works great)
const handleDownloadImage = (imgUrl) => {
  const url = new URL(imgUrl);
  let filename = decodeURIComponent(url.pathname.split('/').pop().split('?')[0]);

  if (!filename.includes('.')) {
    filename = 'downloaded_file';
  }

  const a = document.createElement('a');
  a.href = imgUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

// ZIP Download – NOW WORKS because CORS is set!
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

      if (!response.ok) {
        console.warn(`Failed to fetch: ${imgUrl}`);
        continue;
      }

      const blob = await response.blob();

      // Extract original filename
      const url = new URL(imgUrl);
      let filename = decodeURIComponent(url.pathname.split('/').pop().split('?')[0]);
      if (!filename.includes('.')) {
        filename = `file_${i + 1}`;
      }

      folder.file(filename, blob);
      successCount++;
    }

    if (successCount === 0) throw new Error('No files downloaded');

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, `Custom_Order_${order._id.slice(-8)}.zip`);

    alert(`Successfully zipped ${successCount} file(s)!`);
  } catch (err) {
    console.error('ZIP creation failed:', err);
    alert('ZIP failed. Downloading files individually as fallback...');
    // Fallback to individual downloads
    order.images.forEach(imgUrl => handleDownloadImage(imgUrl));
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
    
    alert('Order updated successfully!\nUser notified via app + Email sent with status & delivery date.');
    fetchCustomOrders();
  } catch (err) {
    console.error(err);
    alert('Failed to update order or send email');
  }
};

  const toggleExpand = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'priced': return 'bg-blue-500/20 text-blue-400';
      case 'in_progress': return 'bg-purple-500/20 text-purple-400';
      case 'completed': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const is3DModelFile = (path) => {
    const ext = path.split('.').pop()?.toLowerCase();
    return ['stl', 'obj', 'fbx', 'step', 'iges'].includes(ext);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin')} className="p-2 rounded-xl bg-slate-800 border border-slate-600 hover:bg-slate-700">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
              Custom Orders Management
            </h1>
          </div>
        </header>

        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">{error}</div>}

        <div className="bg-slate-900/70 border border-slate-700 rounded-3xl p-6 md:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Customized Orders ({customOrders.length})</h2>
            <button onClick={fetchCustomOrders} className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-600 hover:bg-slate-700">
              Refresh
            </button>
          </div>

          {loadingCustoms ? (
            <p className="text-slate-300">Loading...</p>
          ) : customOrders.length === 0 ? (
            <p className="text-slate-400">No customized orders yet.</p>
          ) : (
            <div className="space-y-6">
              {customOrders.map((o) => (
                <div key={o._id} className="bg-slate-800/60 border border-slate-700 rounded-lg overflow-hidden">
                  {/* Main Row */}
                  <div className="p-5 flex flex-col md:flex-row md:items-start gap-6">
                    {/* Images */}
                    <div className="w-full md:w-40 flex-shrink-0">
                      <div className="grid grid-cols-2 gap-2">
                        {(o.images || []).slice(0, 4).map((img, idx) => {
                          const fileUrl = img.startsWith('http') ? img : `${API_BASE}${img}`;
                          const is3D = is3DModelFile(img);
                          return (
                            <div key={idx} className="relative w-full aspect-square rounded overflow-hidden border border-slate-600 bg-black">
                              <img
                                src={is3D ? modelPlaceholder : fileUrl}
                                alt={`Image ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              {is3D && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold">
                                  3D MODEL
                                </div>
                              )}
                              <button
                                onClick={() => handleDownloadImage(img)}
                                className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-slate-900/70 flex items-center justify-center border border-slate-600 hover:bg-slate-800"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Details & Actions */}
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:justify-between">
                        <div>
                          <div className="font-bold text-xl">{o.name}</div>
                          <div className="text-sm text-slate-400">{o.email}</div>
                          <div className="text-sm text-slate-300 mt-1">
                            Size: Height {o.height || '?'} in • Length {o.length || '?'} in
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            Submitted: {new Date(o.createdAt).toLocaleString()}
                          </div>
                          {o.description && (
                            <div className="mt-2 text-sm">
                              <span className="text-slate-300">Notes:</span>{' '}
                              <span className="text-slate-400">{o.description}</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 md:mt-0 text-right">
                          <div className="text-sm">
                            Status:{' '}
                            <span className={`ml-2 px-3 py-1 rounded-full text-xs ${getStatusColor(o.status)}`}>
                              {o.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            Expected: {o.expectedDelivery ? new Date(o.expectedDelivery).toLocaleDateString() : '—'}
                          </div>
                        </div>
                      </div>

                      {/* Price / Status / Download All */}
                      <div className="flex flex-wrap items-center gap-4 mt-5">
                        <input
                          type="number"
                          placeholder="Price ₹"
                          value={o.price ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomOrders(prev => prev.map(x =>
                              x._id === o._id ? { ...x, price: val ? Number(val) : null } : x
                            ));
                          }}
                          className="w-32 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm"
                        />

                        <input
                          type="date"
                          value={o.expectedDelivery ? new Date(o.expectedDelivery).toISOString().slice(0, 10) : ''}
                          onChange={(e) => {
                            setCustomOrders(prev => prev.map(x =>
                              x._id === o._id ? { ...x, expectedDelivery: e.target.value } : x
                            ));
                          }}
                          className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm"
                        />

                        <select
                          value={o.status}
                          onChange={(e) => {
                            setCustomOrders(prev => prev.map(x =>
                              x._id === o._id ? { ...x, status: e.target.value } : x
                            ));
                          }}
                          className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="priced">Priced</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>

                        {/* Dedicated Download All Button */}
                        <button
                          onClick={() => handleDownloadAll(o)}
                          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg font-medium flex items-center gap-2 hover:shadow-lg"
                        >
                          <Download className="w-4 h-4" />
                          Download All Files
                        </button>

                        <button
                          onClick={() => handleUpdateCustomOrder(o)}
                          className="px-5 py-2 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg font-medium hover:shadow-lg"
                        >
                          Save & Notify
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expandable User Details */}
                 {/* Expandable User Details */}
<div className="border-t border-slate-700">
  <button
    onClick={() => toggleExpand(o._id)}
    className="w-full px-5 py-3 flex items-center justify-between hover:bg-slate-700/30 transition"
  >
    <span className="font-medium">User Delivery & Payment Details</span>
    {expandedOrderId === o._id ? <ChevronUp /> : <ChevronDown />}
  </button>

  {expandedOrderId === o._id && (
    <div className="px-5 pb-5 pt-2 space-y-4 text-sm">
      {/* Name */}
      <div className="flex items-center gap-3">
        <User className="w-4 h-4 text-slate-400" />
        <span>{o.name}</span>
      </div>

      {/* Phone */}
      <div className="flex items-center gap-3">
        <Phone className="w-4 h-4 text-slate-400" />
        <span>{o.phone || 'Not provided'}</span>
      </div>

      {/* Address */}
      <div className="flex items-start gap-3">
        <MapPin className="w-4 h-4 text-slate-400 mt-1" />
        <div>
          <p>{o.address || 'No address provided'}</p>
          <p className="text-slate-400">
            {o.city}, {o.state} - {o.pincode}
          </p>
        </div>
      </div>

      {/* NEW: Payment Details */}
      <div className="mt-4 pt-4 border-t border-slate-600">
        <div className="font-medium text-slate-200 mb-2">Payment Information</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-slate-400">Method:</span>
            <span className="ml-2 font-semibold">
              {o.payment === "COD" ? "Cash on Delivery" : "Online Payment"}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Status:</span>
            <span className={`ml-2 font-semibold px-3 py-1 rounded-full text-xs ${
              o.paymentStatus === "completed"
                ? "bg-green-500/20 text-green-400"
                : "bg-yellow-500/20 text-yellow-400"
            }`}>
              {o.paymentStatus === "completed" ? "Paid" : "Pending"}
            </span>
          </div>
        </div>
        {o.price && (
          <div className="mt-3">
            <span className="text-slate-400">Amount:</span>
            <span className="ml-2 font-bold text-lg text-white">₹{o.price}</span>
          </div>
        )}
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