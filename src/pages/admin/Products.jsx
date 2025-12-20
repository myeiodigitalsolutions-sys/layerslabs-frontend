import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Trash2, Edit2, PlusCircle, X, ArrowLeft } from 'lucide-react';
import { auth } from '../../firebase';
import { getIdToken, onAuthStateChanged } from 'firebase/auth';

const API_BASE = process.env.REACT_APP_API_BASE_URL;
const ADMIN_EMAIL = 'myeiokln@gmail.com';

export default function Products() {
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    price: '',
    rating: '',
    reviews: '',
    tag: '',
    description: '',
    features: '',
    category: '',
  });
  const [existingImages, setExistingImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [catForm, setCatForm] = useState({ name: '', slug: '', description: '' });
  const [filterCategory, setFilterCategory] = useState('');

  async function getAuthHeaders() {
    const user = authUser;
    if (!user) {
      throw new Error('Not authenticated. Please login as admin.');
    }
    const token = await getIdToken(user);
    return { Authorization: `Bearer ${token}` };
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setAuthUser(u);
      setAuthChecked(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    if (!authUser) {
      alert('Please login as admin to view dashboard.');
      navigate('/', { replace: true });
      return;
    }
    if (authUser.email !== ADMIN_EMAIL) {
      alert('You are not authorized to view the admin dashboard.');
      navigate('/', { replace: true });
      return;
    }
  }, [authChecked, authUser, navigate]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/categories`);
      setCategories(res.data || []);
    } catch (err) {
      console.error('Error fetching categories', err);
    }
  };

  const fetchProducts = async (category = '') => {
    setLoading(true);
    setError('');
    try {
      const url = category ? `${API_BASE}/api/products?category=${category}` : `${API_BASE}/api/products`;
      const res = await axios.get(url);
      setProducts(res.data || []);
    } catch (err) {
      console.error('Error fetching products', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchProducts(filterCategory);
  }, [filterCategory]);

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: '',
      price: '',
      rating: '',
      reviews: '',
      tag: '',
      description: '',
      features: '',
      category: '',
    });
    setExistingImages([]);
    setSelectedFiles([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

const handleFileChange = (e) => {
  const files = Array.from(e.target.files || []);
  const readers = [];

  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSelectedFiles((prev) => [...prev, ev.target.result]); // base64 string
    };
    reader.readAsDataURL(file);
  });
};

  const handleRemoveExistingImage = (urlToRemove) => {
    setExistingImages((prev) => prev.filter((url) => url !== urlToRemove));
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name || '',
      price: product.price || '',
      rating: product.rating || '',
      reviews: product.reviews || '',
      tag: product.tag || '',
      description: product.description || '',
      features: (product.features || []).join(', '),
      category: product.category?._id || product.category || '',
    });
    setExistingImages(product.images || []);
    setSelectedFiles([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      const headers = await getAuthHeaders();
      await axios.delete(`${API_BASE}/api/products/${id}`, { headers });
      setSuccessMsg('Product deleted');
      fetchProducts(filterCategory);
    } catch (err) {
      console.error('Delete error', err);
      setError('Failed to delete product');
    }
  };

  // In handleSubmit – modify formData
const handleSubmit = async (e) => {
  e.preventDefault();
  setSaving(true);
  setError('');
  setSuccessMsg('');
  try {
    const headers = await getAuthHeaders();

    const data = {
      name: form.name,
      price: form.price,
      rating: form.rating,
      reviews: form.reviews,
      tag: form.tag,
      description: form.description,
      features: form.features,
      category: form.category || '',
      existingImages: existingImages, // array of URLs
      images: selectedFiles, // array of base64 strings
    };

    if (editingId) {
      await axios.put(`${API_BASE}/api/products/${editingId}`, data, {
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
      setSuccessMsg('Product updated');
    } else {
      await axios.post(`${API_BASE}/api/products`, data, {
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
      setSuccessMsg('Product created');
    }

    resetForm();
    fetchProducts(filterCategory);
  } catch (err) {
    console.error('Save error', err);
    setError('Failed to save product: ' + (err.response?.data?.message || err.message));
  } finally {
    setSaving(false);
  }
};


  const handleCatChange = (e) => {
    const { name, value } = e.target;
    setCatForm((p) => ({ ...p, [name]: value }));
  };

  const handleCatSubmit = async (e) => {
    e.preventDefault();
    if (!catForm.name) return setError('Category name required');
    try {
      const headers = await getAuthHeaders();
      const res = await axios.post(`${API_BASE}/api/categories`, catForm, { headers });
      setSuccessMsg(`Category "${res.data.name}" created`);
      setCatForm({ name: '', slug: '', description: '' });
      fetchCategories();
    } catch (err) {
      console.error('Category create error', err);
      setError(err?.response?.data?.message || 'Failed to create category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category? Products in it will become uncategorized.')) return;
    try {
      const headers = await getAuthHeaders();
      await axios.delete(`${API_BASE}/api/categories/${id}`, { headers });
      setSuccessMsg('Category deleted');
      fetchCategories();
      fetchProducts(filterCategory);
    } catch (err) {
      console.error('Delete category error', err);
      setError('Failed to delete category');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="p-2 rounded-xl bg-slate-800 border border-slate-600 hover:bg-slate-700 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
              Products Management
            </h1>
          </div>
        </header>

        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">{error}</div>}
        {successMsg && <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">{successMsg}</div>}

        <div className="bg-slate-900/70 border border-slate-700 rounded-3xl p-6 md:p-8 mb-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Categories</h2>
            <p className="text-sm text-slate-400">Create and manage categories</p>
          </div>

          <form onSubmit={handleCatSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <input
              name="name"
              value={catForm.name}
              onChange={handleCatChange}
              required
              placeholder="Category name (e.g. Heroes)"
              className="rounded-xl bg-slate-800/70 border border-slate-600 px-3 py-2 text-sm"
            />
            <input
              name="slug"
              value={catForm.slug}
              onChange={handleCatChange}
              placeholder="Slug (optional)"
              className="rounded-xl bg-slate-800/70 border border-slate-600 px-3 py-2 text-sm"
            />
            <div className="flex gap-3">
              <button type="submit" className="px-4 py-2 rounded-2xl bg-gradient-to-r from-red-600 to-pink-600 font-semibold">
                Create
              </button>
              <button
                type="button"
                onClick={() => setCatForm({ name: '', slug: '', description: '' })}
                className="px-4 py-2 rounded-2xl border border-slate-600"
              >
                Reset
              </button>
            </div>
          </form>

          <div className="flex flex-wrap gap-2">
            {categories.length === 0 ? (
              <p className="text-slate-400">No categories yet</p>
            ) : (
              categories.map((c) => (
                <div key={c._id} className="bg-slate-800/60 px-3 py-1 rounded-full flex items-center gap-2">
                  <span className="text-sm">{c.name}</span>
                  <button
                    onClick={() => handleDeleteCategory(c._id)}
                    className="w-6 h-6 rounded-full bg-red-700/80 hover:bg-red-600 flex items-center justify-center"
                    title="Delete category"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-700 rounded-3xl p-6 md:p-8 mb-10 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {editingId ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-full border border-slate-600 hover:border-slate-300 transition"
            >
              <PlusCircle className="w-4 h-4" />
              New
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
            encType="multipart/form-data"
          >
            <div className="space-y-1">
              <label className="text-sm text-slate-300">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full rounded-xl bg-slate-800/70 border border-slate-600 px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-slate-300">Price (Rs)</label>
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full rounded-xl bg-slate-800/70 border border-slate-600 px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-slate-300">Rating</label>
              <input
                name="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={form.rating}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-800/70 border border-slate-600 px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-slate-300">Reviews Count</label>
              <input
                name="reviews"
                type="number"
                min="0"
                value={form.reviews}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-800/70 border border-slate-600 px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-slate-300">Tag</label>
              <input
                name="tag"
                value={form.tag}
                onChange={handleChange}
                placeholder="New, Sale, Best Seller..."
                className="w-full rounded-xl bg-slate-800/70 border border-slate-600 px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-slate-300">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-800/70 border border-slate-600 px-3 py-2 text-sm"
              >
                <option value="">— Uncategorised —</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-sm text-slate-300">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-xl bg-slate-800/70 border border-slate-600 px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-sm text-slate-300">Features (comma separated)</label>
              <input
                name="features"
                value={form.features}
                onChange={handleChange}
                placeholder="Height: 12 inches, Hand-painted, Limited edition..."
                className="w-full rounded-xl bg-slate-800/70 border border-slate-600 px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm text-slate-300">Product Images (you can select multiple)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-slate-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-500"
              />

              {existingImages.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-slate-400 mb-1">Existing images (first one will show in Featured section):</p>
                  <div className="flex flex-wrap gap-3">
                    {existingImages.map((url) => (
                      <div
                        key={url}
                        className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-600"
                      >
                        <img
                          src={url}
                          alt="Existing"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(url)}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-xs"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

    {selectedFiles.length > 0 && (
  <div className="mt-3">
    <p className="text-xs text-slate-400 mb-1">New images to upload:</p>
    <div className="flex flex-wrap gap-3">
      {selectedFiles.map((base64, index) => (
        <div key={index} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-600">
          <img src={base64} alt="Preview" className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  </div>
)}
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-pink-600 font-semibold text-sm hover:shadow-xl hover:scale-105 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving
                  ? editingId
                    ? 'Updating...'
                    : 'Creating...'
                  : editingId
                  ? 'Update Product'
                  : 'Create Product'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-slate-900/70 border border-slate-700 rounded-3xl p-6 md:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">All Products ({products.length})</h2>
            <div className="flex items-center gap-3">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="rounded-xl bg-slate-800/70 border border-slate-600 px-3 py-2 text-sm"
              >
                <option value="">— All categories —</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => { setFilterCategory(''); fetchProducts(''); }}
                className="px-3 py-2 rounded-xl border border-slate-600"
              >
                Reset
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-slate-300">Loading...</p>
          ) : products.length === 0 ? (
            <p className="text-slate-400">No products yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-slate-700 text-slate-300">
                  <tr>
                    <th className="text-left py-2 pr-4">Name</th>
                    <th className="text-left py-2 pr-4">Price</th>
                    <th className="text-left py-2 pr-4">Rating</th>
                    <th className="text-left py-2 pr-4">Category</th>
                    <th className="text-left py-2 pr-4">Tag</th>
                    <th className="text-right py-2 pl-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id} className="border-b border-slate-800">
                      <td className="py-2 pr-4">{p.name}</td>
                      <td className="py-2 pr-4">Rs {p.price}</td>
                      <td className="py-2 pr-4">{p.rating || 0}</td>
                      <td className="py-2 pr-4">{p.category?.name || '—'}</td>
                      <td className="py-2 pr-4">{p.tag}</td>
                      <td className="py-2 pl-4 text-right">
                        <button
                          onClick={() => handleEdit(p)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 mr-2 hover:bg-slate-700"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-700/80 hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}