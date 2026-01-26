import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Trash2, Edit2, PlusCircle, X, ArrowLeft, ChevronDown,
  ChevronUp, ChevronRight, ChevronLeft, GripVertical, Save,
  MoveUp, MoveDown, List
} from 'lucide-react';
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
    subcategory: '',
    customNameFields: [],
    allowCustomImage: false,
    productTypes: [],
  });
  const [existingImages, setExistingImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Category management
  const [catForm, setCatForm] = useState({
    name: '',
    slug: '',
    description: '',
    isMain: true,
    order: 0,
    subcategories: [{ name: '', slug: '', description: '' }]
  });
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isReordering, setIsReordering] = useState(false);
  const [tempCategories, setTempCategories] = useState([]);
  const dragItem = useRef();
  const dragOverItem = useRef();

  // Filters
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSubcategory, setFilterSubcategory] = useState('');

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
      setCategories(res.data.mainCategories || []);
    } catch (err) {
      console.error('Error fetching categories', err);
    }
  };

  const fetchSubcategories = async (parentId) => {
    if (!parentId) return [];
    try {
      const res = await axios.get(`${API_BASE}/api/categories/sub/${parentId}`);
      return res.data || [];
    } catch (err) {
      console.error('Error fetching subcategories', err);
      return [];
    }
  };

  const fetchProducts = async (category = '', subcategory = '') => {
    setLoading(true);
    setError('');
    try {
      let url = `${API_BASE}/api/products`;
      const params = new URLSearchParams();

      if (subcategory) {
        params.append('subcategory', subcategory);
      } else if (category) {
        params.append('category', category);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

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
    fetchProducts(filterCategory, filterSubcategory);
  }, [filterCategory, filterSubcategory]);

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
      subcategory: '',
      customNameFields: [],
      allowCustomImage: false,
      productTypes: [],
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
        setSelectedFiles((prev) => [...prev, ev.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveExistingImage = (urlToRemove) => {
    setExistingImages((prev) => prev.filter((url) => url !== urlToRemove));
  };

  const handleRemoveNewImage = (indexToRemove) => {
    setSelectedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const moveExistingImageUp = (index) => {
    if (index === 0) return;
    const updated = [...existingImages];
    [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
    setExistingImages(updated);
  };

  const moveExistingImageDown = (index) => {
    if (index === existingImages.length - 1) return;
    const updated = [...existingImages];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setExistingImages(updated);
  };

  const moveNewImageUp = (index) => {
    if (index === 0) return;
    const updated = [...selectedFiles];
    [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
    setSelectedFiles(updated);
  };

  const moveNewImageDown = (index) => {
    if (index === selectedFiles.length - 1) return;
    const updated = [...selectedFiles];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setSelectedFiles(updated);
  };

  const handleEdit = async (product) => {
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
      subcategory: product.subcategory?._id || product.subcategory || '',
      customNameFields: Array.isArray(product.customNameFields) ? product.customNameFields : [],
      allowCustomImage: product.allowCustomImage || false,
      productTypes: Array.isArray(product.productTypes) ? product.productTypes : [],
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
      fetchProducts(filterCategory, filterSubcategory);
    } catch (err) {
      console.error('Delete error', err);
      setError('Failed to delete product');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');

    // Validate custom name fields
    if (form.customNameFields && form.customNameFields.length > 0) {
      for (let i = 0; i < form.customNameFields.length; i++) {
        const field = form.customNameFields[i];
        if (!field.label || !field.label.trim()) {
          setError(`Custom field ${i + 1}: Label is required`);
          setSaving(false);
          return;
        }
        if (!field.maxLength || field.maxLength < 1 || field.maxLength > 100) {
          setError(`Custom field ${i + 1} (${field.label}): Character limit is required (1-100)`);
          setSaving(false);
          return;
        }
      }
    }

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
        subcategory: form.subcategory || '',
        existingImages: existingImages,
        images: selectedFiles,
        customNameFields: form.customNameFields,
        allowCustomImage: form.allowCustomImage,
        productTypes: form.productTypes,
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
      fetchProducts(filterCategory, filterSubcategory);
    } catch (err) {
      console.error('Save error', err);
      setError('Failed to save product: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  // Custom Name Fields Management
  const addCustomNameField = () => {
    setForm(prev => ({
      ...prev,
      customNameFields: [...prev.customNameFields, { label: '', placeholder: '', maxLength: '' }]
    }));
  };

  const removeCustomNameField = (index) => {
    setForm(prev => ({
      ...prev,
      customNameFields: prev.customNameFields.filter((_, i) => i !== index)
    }));
  };

  const updateCustomNameField = (index, field, value) => {
    setForm(prev => {
      const updated = [...prev.customNameFields];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, customNameFields: updated };
    });
  };

  const moveCustomNameFieldUp = (index) => {
    if (index === 0) return;
    setForm(prev => {
      const updated = [...prev.customNameFields];
      [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
      return { ...prev, customNameFields: updated };
    });
  };

  const moveCustomNameFieldDown = (index) => {
    if (index === form.customNameFields.length - 1) return;
    setForm(prev => {
      const updated = [...prev.customNameFields];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      return { ...prev, customNameFields: updated };
    });
  };

  // Product Types Management
  const addProductType = () => {
    setForm(prev => ({
      ...prev,
      productTypes: [...prev.productTypes, { label: '', additionalPrice: '' }]
    }));
  };

  const removeProductType = (index) => {
    setForm(prev => ({
      ...prev,
      productTypes: prev.productTypes.filter((_, i) => i !== index)
    }));
  };

  const updateProductType = (index, field, value) => {
    setForm(prev => {
      const updated = [...prev.productTypes];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, productTypes: updated };
    });
  };

  const moveProductTypeUp = (index) => {
    if (index === 0) return;
    setForm(prev => {
      const updated = [...prev.productTypes];
      [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
      return { ...prev, productTypes: updated };
    });
  };

  const moveProductTypeDown = (index) => {
    if (index === form.productTypes.length - 1) return;
    setForm(prev => {
      const updated = [...prev.productTypes];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      return { ...prev, productTypes: updated };
    });
  };

  // Category form handlers
  const handleCatChange = (e) => {
    const { name, value } = e.target;
    setCatForm((p) => ({
      ...p,
      [name]: value
    }));
  };

  const handleSubcatChange = (index, field, value) => {
    const updatedSubs = [...catForm.subcategories];
    updatedSubs[index] = { ...updatedSubs[index], [field]: value };
    setCatForm(p => ({ ...p, subcategories: updatedSubs }));
  };

  const addSubcategory = () => {
    setCatForm(p => ({
      ...p,
      subcategories: [...p.subcategories, { name: '', slug: '', description: '' }]
    }));
  };

  const removeSubcategory = (index) => {
    const updatedSubs = catForm.subcategories.filter((_, i) => i !== index);
    setCatForm(p => ({ ...p, subcategories: updatedSubs }));
  };

  const handleCatSubmit = async (e) => {
    e.preventDefault();
    if (!catForm.name) return setError('Category name required');
    try {
      const headers = await getAuthHeaders();

      // Prepare category data
      const categoryData = {
        name: catForm.name,
        slug: catForm.slug || catForm.name.toLowerCase().replace(/\s+/g, '-'),
        description: catForm.description,
        isMain: catForm.isMain,
        order: catForm.order || 0,
        subcategories: catForm.isMain ? catForm.subcategories.filter(sub => sub.name.trim()) : []
      };

      const res = await axios.post(`${API_BASE}/api/categories`, categoryData, { headers });
      setSuccessMsg(`Category "${res.data.name}" created with ${categoryData.subcategories.length} subcategories`);
      resetCatForm();
      setShowCategoryForm(false);
      fetchCategories();
    } catch (err) {
      console.error('Category create error', err);
      setError(err?.response?.data?.message || 'Failed to create category');
    }
  };

  const resetCatForm = () => {
    setCatForm({
      name: '',
      slug: '',
      description: '',
      isMain: true,
      order: 0,
      subcategories: [{ name: '', slug: '', description: '' }]
    });
    setEditingCategory(null);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category._id);
    setCatForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      isMain: category.isMain,
      order: category.order || 0,
      subcategories: category.subcategories?.map(sub => ({
        name: sub.name,
        slug: sub.slug,
        description: sub.description || ''
      })) || [{ name: '', slug: '', description: '' }]
    });
    setShowCategoryForm(true);
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!catForm.name) return setError('Category name required');
    try {
      const headers = await getAuthHeaders();
      const categoryData = {
        name: catForm.name,
        slug: catForm.slug,
        description: catForm.description,
        isMain: catForm.isMain,
        order: catForm.order || 0,
        // Include subcategories when updating
        subcategories: catForm.isMain ? catForm.subcategories.filter(sub => sub.name.trim()) : []
      };

      await axios.put(`${API_BASE}/api/categories/${editingCategory}`, categoryData, { headers });
      setSuccessMsg(`Category "${catForm.name}" updated with ${categoryData.subcategories.length} subcategories`);
      resetCatForm();
      setShowCategoryForm(false);
      fetchCategories();
    } catch (err) {
      console.error('Category update error', err);
      setError(err?.response?.data?.message || 'Failed to update category');
    }
  };



  const handleAddSubcategory = async (parentCategoryId) => {
    const subName = prompt('Enter subcategory name:');
    if (!subName) return;

    try {
      const headers = await getAuthHeaders();
      const subcategoryData = {
        name: subName,
        isMain: false,
        parent: parentCategoryId
      };

      await axios.post(`${API_BASE}/api/categories/sub`, subcategoryData, { headers });
      setSuccessMsg(`Subcategory "${subName}" added`);
      fetchCategories();
    } catch (err) {
      console.error('Add subcategory error', err);
      setError(err?.response?.data?.message || 'Failed to add subcategory');
    }
  };

  // Handle delete main category
  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      const headers = await getAuthHeaders();
      await axios.delete(`${API_BASE}/api/categories/${id}`, { headers });
      setSuccessMsg('Category deleted');
      fetchCategories();
      fetchProducts(filterCategory, filterSubcategory);
    } catch (err) {
      console.error('Delete category error', err);
      setError(err?.response?.data?.message || 'Failed to delete category');
    }
  };

  // Handle delete subcategory
  const handleDeleteSubcategory = async (subcategoryId, name, parentCategoryId) => {
    if (!window.confirm(`Delete subcategory "${name}"?`)) return;
    try {
      const headers = await getAuthHeaders();
      await axios.delete(`${API_BASE}/api/categories/${subcategoryId}`, { headers });
      setSuccessMsg('Subcategory deleted');
      fetchCategories();
      fetchProducts(filterCategory, filterSubcategory);
    } catch (err) {
      console.error('Delete subcategory error', err);
      setError(err?.response?.data?.message || 'Failed to delete subcategory');
    }
  };

  // Reordering functions
  const startReordering = () => {
    setTempCategories([...categories]);
    setIsReordering(true);
  };

  const saveReordering = async () => {
    try {
      const headers = await getAuthHeaders();
      const categoriesToUpdate = tempCategories.map((cat, index) => ({
        _id: cat._id,
        order: index
      }));

      // Also update subcategory orders
      const allUpdates = [];
      tempCategories.forEach((cat, catIndex) => {
        allUpdates.push({ _id: cat._id, order: catIndex });
        if (cat.subcategories?.length > 0) {
          cat.subcategories.forEach((sub, subIndex) => {
            allUpdates.push({
              _id: sub._id,
              subcategoryOrder: subIndex
            });
          });
        }
      });

      await axios.put(`${API_BASE}/api/categories/update-order/bulk`,
        { categories: allUpdates },
        { headers }
      );

      setSuccessMsg('Category order updated');
      setIsReordering(false);
      fetchCategories();
    } catch (err) {
      console.error('Error saving order', err);
      setError('Failed to save category order');
    }
  };

  const cancelReordering = () => {
    setIsReordering(false);
    setTempCategories([]);
  };

  const dragStart = (e, position) => {
    dragItem.current = position;
  };

  const dragEnter = (e, position) => {
    dragOverItem.current = position;
  };

  const drop = (e) => {
    const copyListItems = [...tempCategories];
    const dragItemContent = copyListItems[dragItem.current];
    copyListItems.splice(dragItem.current, 1);
    copyListItems.splice(dragOverItem.current, 0, dragItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setTempCategories(copyListItems);
  };

  const moveCategoryUp = (index) => {
    if (index === 0) return;
    const updated = [...tempCategories];
    [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
    setTempCategories(updated);
  };

  const moveCategoryDown = (index) => {
    if (index === tempCategories.length - 1) return;
    const updated = [...tempCategories];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setTempCategories(updated);
  };

  const getAllSubcategories = () => {
    const allSubs = [];
    categories.forEach(cat => {
      if (cat.subcategories?.length > 0) {
        allSubs.push(...cat.subcategories);
      }
    });
    return allSubs;
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

        {/* Categories Section */}
        <div className="bg-slate-900/70 border border-slate-700 rounded-3xl p-6 md:p-8 mb-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Categories & Subcategories</h2>
            <div className="flex items-center gap-2">
              {!isReordering ? (
                <>
                  <button
                    onClick={() => setShowCategoryForm(!showCategoryForm)}
                    className="flex items-center gap-2 text-sm px-4 py-2 rounded-full bg-gradient-to-r from-red-600 to-pink-600 font-semibold"
                  >
                    {showCategoryForm ? <ChevronUp className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                    {showCategoryForm ? 'Hide Form' : 'New Category'}
                  </button>
                  <button
                    onClick={startReordering}
                    className="flex items-center gap-2 text-sm px-4 py-2 rounded-full border border-slate-600 font-semibold"
                  >
                    <List className="w-4 h-4" />
                    Reorder
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={saveReordering}
                    className="flex items-center gap-2 text-sm px-4 py-2 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 font-semibold"
                  >
                    <Save className="w-4 h-4" />
                    Save Order
                  </button>
                  <button
                    onClick={cancelReordering}
                    className="flex items-center gap-2 text-sm px-4 py-2 rounded-full border border-slate-600 font-semibold"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          {showCategoryForm && (
            <form onSubmit={editingCategory ? handleUpdateCategory : handleCatSubmit} className="mb-6 p-4 bg-slate-800/50 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-300">Name *</label>
                  <input
                    name="name"
                    value={catForm.name}
                    onChange={handleCatChange}
                    required
                    placeholder="Category name"
                    className="w-full rounded-xl bg-slate-800/70 border border-slate-600 px-3 py-2 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-300">Slug</label>
                  <input
                    name="slug"
                    value={catForm.slug}
                    onChange={handleCatChange}
                    placeholder="category-slug"
                    className="w-full rounded-xl bg-slate-800/70 border border-slate-600 px-3 py-2 text-sm"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm text-slate-300">Description</label>
                  <textarea
                    name="description"
                    value={catForm.description}
                    onChange={handleCatChange}
                    placeholder="Category description"
                    rows={2}
                    className="w-full rounded-xl bg-slate-800/70 border border-slate-600 px-3 py-2 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-300">Order</label>
                  <input
                    type="number"
                    name="order"
                    value={catForm.order}
                    onChange={handleCatChange}
                    min="0"
                    className="w-full rounded-xl bg-slate-800/70 border border-slate-600 px-3 py-2 text-sm"
                  />
                </div>

                {!editingCategory && (
                  <div className="space-y-2">
                    <label className="text-sm text-slate-300">Type</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="isMain"
                          checked={catForm.isMain}
                          onChange={() => setCatForm(p => ({ ...p, isMain: true }))}
                          className="text-red-600"
                        />
                        <span>Main Category</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="isMain"
                          checked={!catForm.isMain}
                          onChange={() => setCatForm(p => ({ ...p, isMain: false, subcategories: [] }))}
                          className="text-red-600"
                        />
                        <span>Subcategory</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Subcategories for new main category */}
              {catForm.isMain && !editingCategory && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-slate-300">Subcategories</label>
                    <button
                      type="button"
                      onClick={addSubcategory}
                      className="text-sm px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600"
                    >
                      + Add Subcategory
                    </button>
                  </div>

                  <div className="space-y-3">
                    {catForm.subcategories.map((sub, index) => (
                      <div key={index} className="p-3 bg-slate-800/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-400">Subcategory {index + 1}</span>
                          {catForm.subcategories.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSubcategory(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={sub.name}
                            onChange={(e) => handleSubcatChange(index, 'name', e.target.value)}
                            placeholder="Subcategory name"
                            className="rounded-lg bg-slate-800/50 border border-slate-600 px-3 py-2 text-sm"
                          />
                          <input
                            type="text"
                            value={sub.slug}
                            onChange={(e) => handleSubcatChange(index, 'slug', e.target.value)}
                            placeholder="sub-slug"
                            className="rounded-lg bg-slate-800/50 border border-slate-600 px-3 py-2 text-sm"
                          />
                          <input
                            type="text"
                            value={sub.description}
                            onChange={(e) => handleSubcatChange(index, 'description', e.target.value)}
                            placeholder="Description"
                            className="rounded-lg bg-slate-800/50 border border-slate-600 px-3 py-2 text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button type="submit" className="px-6 py-2 rounded-2xl bg-gradient-to-r from-red-600 to-pink-600 font-semibold">
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetCatForm();
                    setShowCategoryForm(false);
                  }}
                  className="px-6 py-2 rounded-2xl border border-slate-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Display Categories Hierarchy */}
          <div className="space-y-4">
            {isReordering ? (
              // Reordering view
              tempCategories.length === 0 ? (
                <p className="text-slate-400">No categories to reorder</p>
              ) : (
                <div className="space-y-2">
                  {tempCategories.map((cat, index) => (
                    <div
                      key={cat._id}
                      className="bg-slate-800/60 rounded-xl p-4 cursor-move"
                      draggable
                      onDragStart={(e) => dragStart(e, index)}
                      onDragEnter={(e) => dragEnter(e, index)}
                      onDragEnd={drop}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <GripVertical className="w-5 h-5 text-slate-500" />
                          <span className="font-bold text-lg">{cat.name}</span>
                          <span className="text-xs px-2 py-1 bg-red-600/20 text-red-300 rounded-full">
                            Main Category
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => moveCategoryUp(index)}
                            disabled={index === 0}
                            className="p-1 rounded-md bg-slate-700 disabled:opacity-30"
                          >
                            <MoveUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => moveCategoryDown(index)}
                            disabled={index === tempCategories.length - 1}
                            className="p-1 rounded-md bg-slate-700 disabled:opacity-30"
                          >
                            <MoveDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {cat.subcategories?.length > 0 && (
                        <div className="ml-10 mt-3 space-y-2">
                          {cat.subcategories.map((sub, subIndex) => (
                            <div key={sub._id} className="bg-slate-700/40 px-3 py-2 rounded-lg flex items-center gap-2">
                              <GripVertical className="w-4 h-4 text-slate-500" />
                              <span className="text-sm">{sub.name}</span>
                              <span className="text-xs px-2 py-0.5 bg-slate-600/50 rounded-full ml-auto">
                                Subcategory
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            ) : (
              // Normal view
              categories.length === 0 ? (
                <p className="text-slate-400">No categories yet</p>
              ) : (
                categories.map((cat) => {
                  return (
                    <div key={cat._id} className="bg-slate-800/60 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-lg">{cat.name}</span>
                          <span className="text-xs px-2 py-1 bg-red-600/20 text-red-300 rounded-full">
                            Order: {cat.order || 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditCategory(cat)}
                            className="w-7 h-7 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center"
                            title="Edit category"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat._id, cat.name)}
                            className="w-7 h-7 rounded-full bg-red-700/80 hover:bg-red-600 flex items-center justify-center"
                            title="Delete category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {cat.subcategories?.length > 0 ? (
                        <div className="ml-6 mt-3 space-y-2">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-slate-400">Subcategories:</p>
                            <button
                              onClick={() => handleAddSubcategory(cat._id)}
                              className="text-xs px-2 py-1 rounded-lg bg-slate-700 hover:bg-slate-600"
                            >
                              + Add Subcategory
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {cat.subcategories.map((sub) => (
                              <div key={sub._id} className="bg-slate-700/60 px-3 py-1.5 rounded-full flex items-center gap-2">
                                <span className="text-sm">{sub.name}</span>
                                <span className="text-xs text-slate-400">({sub.order || 0})</span>
                                <button
                                  onClick={() => handleDeleteSubcategory(sub._id, sub.name, cat._id)}
                                  className="w-5 h-5 rounded-full bg-red-700/80 hover:bg-red-600 flex items-center justify-center ml-1"
                                  title="Delete subcategory"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="ml-6 mt-3">
                          <button
                            onClick={() => handleAddSubcategory(cat._id)}
                            className="text-sm px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600"
                          >
                            + Add Subcategory
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )
            )}
          </div>
        </div>

        {/* Product Form */}
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
              <label className="text-sm text-slate-300">Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full rounded-xl bg-slate-800/70 border border-slate-600 px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-slate-300">Price (Rs) *</label>
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
                <option value="">— Select Category —</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-slate-300">Subcategory</label>
              <select
                name="subcategory"
                value={form.subcategory}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-800/70 border border-slate-600 px-3 py-2 text-sm"
              >
                <option value="">— Select Subcategory —</option>
                {form.category ? (
                  categories.find(c => c._id === form.category)?.subcategories?.map((sc) => (
                    <option key={sc._id} value={sc._id}>
                      {sc.name}
                    </option>
                  )) || []
                ) : getAllSubcategories().map((sc) => (
                  <option key={sc._id} value={sc._id}>
                    {sc.name} ({categories.find(c => c._id === sc.parent)?.name})
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
                  <p className="text-xs text-slate-400 mb-2">Existing images (drag to reorder):</p>
                  <div className="flex flex-wrap gap-3">
                    {existingImages.map((url, index) => (
                      <div
                        key={url}
                        className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-slate-600 bg-slate-800"
                      >
                        <img
                          src={url}
                          alt="Existing"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(url)}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-xs shadow-lg z-10"
                          title="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-1 bg-black/60 p-1">
                          <button
                            type="button"
                            onClick={() => moveExistingImageUp(index)}
                            disabled={index === 0}
                            className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move left"
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                          <span className="text-xs text-white font-semibold">{index + 1}</span>
                          <button
                            type="button"
                            onClick={() => moveExistingImageDown(index)}
                            disabled={index === existingImages.length - 1}
                            className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move right"
                          >
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedFiles.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-slate-400 mb-2">New images to upload (drag to reorder):</p>
                  <div className="flex flex-wrap gap-3">
                    {selectedFiles.map((base64, index) => (
                      <div key={index} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-emerald-600 bg-slate-800">
                        <img src={base64} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveNewImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-xs shadow-lg z-10"
                          title="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-1 bg-black/60 p-1">
                          <button
                            type="button"
                            onClick={() => moveNewImageUp(index)}
                            disabled={index === 0}
                            className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move left"
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                          <span className="text-xs text-white font-semibold">{index + 1}</span>
                          <button
                            type="button"
                            onClick={() => moveNewImageDown(index)}
                            disabled={index === selectedFiles.length - 1}
                            className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move right"
                          >
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Customization Options */}
            <div className="md:col-span-2 space-y-3 p-4 bg-slate-800/30 rounded-xl border border-slate-600">
              <h3 className="text-sm font-semibold text-slate-200 mb-2">Product Customization Options</h3>
              <p className="text-xs text-slate-400 mb-3">Enable these options if customers can personalize this product</p>

              {/* Custom Name Fields */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-300">Custom Name Fields</label>
                  <button
                    type="button"
                    onClick={addCustomNameField}
                    className="text-xs px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold"
                  >
                    + Add Field
                  </button>
                </div>

                {form.customNameFields.length > 0 && (
                  <div className="space-y-2">
                    {form.customNameFields.map((field, index) => (
                      <div key={index} className="p-3 bg-slate-800/50 rounded-lg border border-slate-600">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-slate-400">Field {index + 1}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveCustomNameFieldUp(index)}
                              disabled={index === 0}
                              className="p-1 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move up"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveCustomNameFieldDown(index)}
                              disabled={index === form.customNameFields.length - 1}
                              className="p-1 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move down"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeCustomNameField(index)}
                              className="p-1 rounded bg-red-600 hover:bg-red-500 text-white"
                              title="Remove field"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => updateCustomNameField(index, 'label', e.target.value)}
                            placeholder="Field label (e.g., First Name)"
                            className="rounded-lg bg-slate-800/70 border border-slate-600 px-3 py-2 text-sm"
                          />
                          <input
                            type="text"
                            value={field.placeholder}
                            onChange={(e) => updateCustomNameField(index, 'placeholder', e.target.value)}
                            placeholder="Placeholder text (optional)"
                            className="rounded-lg bg-slate-800/70 border border-slate-600 px-3 py-2 text-sm"
                          />
                          <input
                            type="number"
                            value={field.maxLength || ''}
                            onChange={(e) => updateCustomNameField(index, 'maxLength', parseInt(e.target.value) || '')}
                            placeholder="Max characters (required)"
                            min="1"
                            max="100"
                            required
                            className="rounded-lg bg-slate-800/70 border border-slate-600 px-3 py-2 text-sm"
                            title="Maximum character limit (1-100) - Required"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Types/Variants */}
              <div className="space-y-3 pt-4 border-t border-slate-600">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-300">Product Types/Variants</label>
                  <button
                    type="button"
                    onClick={addProductType}
                    className="text-xs px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold"
                  >
                    + Add Type
                  </button>
                </div>
                <p className="text-xs text-slate-400">Add different types/variants of this product with additional pricing (e.g., Size, Material, etc.)</p>

                {form.productTypes.length > 0 && (
                  <div className="space-y-2">
                    {form.productTypes.map((type, index) => (
                      <div key={index} className="p-3 bg-slate-800/50 rounded-lg border border-slate-600">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-slate-400">Type {index + 1}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveProductTypeUp(index)}
                              disabled={index === 0}
                              className="p-1 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move up"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveProductTypeDown(index)}
                              disabled={index === form.productTypes.length - 1}
                              className="p-1 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move down"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeProductType(index)}
                              className="p-1 rounded bg-red-600 hover:bg-red-500 text-white"
                              title="Remove type"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={type.label}
                            onChange={(e) => updateProductType(index, 'label', e.target.value)}
                            placeholder="Type label (e.g., Large Size, Premium Material)"
                            className="rounded-lg bg-slate-800/70 border border-slate-600 px-3 py-2 text-sm"
                          />
                          <input
                            type="number"
                            value={type.additionalPrice || ''}
                            onChange={(e) => updateProductType(index, 'additionalPrice', parseFloat(e.target.value) || 0)}
                            placeholder="Additional price (e.g., 50)"
                            min="0"
                            step="0.01"
                            className="rounded-lg bg-slate-800/70 border border-slate-600 px-3 py-2 text-sm"
                          />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Final price will be: Base Price (Rs {form.price || 0}) + Additional Price (Rs {type.additionalPrice || 0}) = Rs {(parseFloat(form.price) || 0) + (parseFloat(type.additionalPrice) || 0)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Image */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="allowCustomImage"
                  checked={form.allowCustomImage}
                  onChange={(e) => setForm(prev => ({ ...prev, allowCustomImage: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-600 text-red-600 focus:ring-red-500 focus:ring-offset-slate-900"
                />
                <label htmlFor="allowCustomImage" className="text-sm text-slate-300 cursor-pointer">
                  Allow customers to upload custom image
                </label>
              </div>
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

        {/* Products List */}
        <div className="bg-slate-900/70 border border-slate-700 rounded-3xl p-6 md:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">All Products ({products.length})</h2>
            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setFilterSubcategory('');
                }}
                className="rounded-xl bg-slate-800/70 border border-slate-600 px-3 py-2 text-sm"
              >
                <option value="">— All categories —</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {filterCategory && (
                <select
                  value={filterSubcategory}
                  onChange={(e) => setFilterSubcategory(e.target.value)}
                  className="rounded-xl bg-slate-800/70 border border-slate-600 px-3 py-2 text-sm"
                >
                  <option value="">— All subcategories —</option>
                  {categories.find(c => c._id === filterCategory)?.subcategories?.map((sc) => (
                    <option key={sc._id} value={sc._id}>
                      {sc.name}
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={() => {
                  setFilterCategory('');
                  setFilterSubcategory('');
                  fetchProducts();
                }}
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
                    <th className="text-left py-2 pr-4">Category</th>
                    <th className="text-left py-2 pr-4">Subcategory</th>
                    <th className="text-left py-2 pr-4">Tag</th>
                    <th className="text-right py-2 pl-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id} className="border-b border-slate-800">
                      <td className="py-2 pr-4">{p.name}</td>
                      <td className="py-2 pr-4">Rs {p.price}</td>
                      <td className="py-2 pr-4">{p.category?.name || '—'}</td>
                      <td className="py-2 pr-4">{p.subcategory?.name || '—'}</td>
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