// src/components/Sidebar.jsx
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ChevronDown, Package, User as UserIcon, LogOut, LogIn } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged, getIdToken } from 'firebase/auth';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function Sidebar({
  open = false,
  onClose = () => {},
}) {
  const sheetRef = useRef(null);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Fetch categories inside Sidebar
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/categories`)
      .then(res => res.json())
      .then(data => {
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error("Failed to load categories in sidebar:", err));
  }, []);

  // Auth state listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u ? {
        uid: u.uid,
        displayName: u.displayName,
        email: u.email,
        photoURL: u.photoURL
      } : null);
    });
    return () => unsub();
  }, []);

  // Google Login
  async function handleGoogleLogin() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await getIdToken(result.user);

      // Sync user to backend
      await fetch(`${API_BASE_URL}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          uid: result.user.uid,
          name: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
        }),
      });

      onClose(); // close sidebar after login
    } catch (err) {
      console.error("Login failed:", err);
      alert("Login failed. Please try again.");
    }
  }

  // Logout
  async function handleLogout() {
    try {
      await signOut(auth);
      onClose();
      navigate('/');
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  // Navigate to category on home
  function goToCategory(c) {
    if (c) {
      navigate('/', { state: { categoryId: c._id, categorySlug: c.slug || c.name } });
    } else {
      navigate('/', { state: { categoryId: null } });
    }
    onClose();
  }

  return (
    <div className={`fixed inset-0 z-50 md:hidden ${open ? 'pointer-events-auto' : 'pointer-events-none'}`} aria-hidden={!open}>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <aside
        ref={sheetRef}
        className={`fixed inset-y-0 left-0 w-80 max-w-[92vw] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out
                    ${open ? 'translate-x-0' : '-translate-x-full'} overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between z-10">
          <Link to="/" onClick={onClose} className="text-2xl font-black bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            Layer Labs
          </Link>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Close">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-5 py-6 space-y-4">
          <ul className="space-y-2">
            <li>
              <Link
                to="/"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 font-medium text-gray-900"
              >
                Home
              </Link>
            </li>

            {/* Categories Dropdown */}
            <li>
              <button
                onClick={() => setCategoriesOpen(s => !s)}
                className="flex items-center justify-between w-full px-4 py-3 rounded-lg hover:bg-gray-100 font-medium text-gray-900"
              >
                <span>Categories</span>
                <ChevronDown className={`w-5 h-5 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              {categoriesOpen && (
                <div className="mt-2 ml-6 space-y-1">
                  <button
                    onClick={() => goToCategory(null)}
                    className="block w-full text-left px-4 py-2 rounded-lg hover:bg-red-50 text-gray-700 font-medium"
                  >
                    All Products
                  </button>
                  {categories.length === 0 ? (
                    <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
                  ) : (
                    categories.map((c) => (
                      <button
                        key={c._id}
                        onClick={() => goToCategory(c)}
                        className="block w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
                      >
                        {c.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </li>

            <li>
              <Link to="/heroes" onClick={onClose} className="block px-4 py-3 rounded-lg hover:bg-gray-100 font-medium text-gray-900">
                Heroes
              </Link>
            </li>
            <li>
              <Link to="/villains" onClick={onClose} className="block px-4 py-3 rounded-lg hover:bg-gray-100 font-medium text-gray-900">
                Villains
              </Link>
            </li>
            <li>
              <Link to="/customize" onClick={onClose} className="block px-4 py-3 rounded-lg hover:bg-gray-100 font-medium text-gray-900">
                Customize 3D
              </Link>
            </li>
            <li>
              <Link to="/contact" onClick={onClose} className="block px-4 py-3 rounded-lg hover:bg-gray-100 font-medium text-gray-900">
                Contact
              </Link>
            </li>
          </ul>

          {/* User Section */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            {!user ? (
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
              >
                <LogIn className="w-5 h-5" />
                Login with Google
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-4">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{user.displayName || "User"}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-900 font-medium"
                  >
                    <UserIcon className="w-5 h-5" />
                    My Profile
                  </button>

                  <button
                    onClick={() => {
                      navigate('/track-orders');
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-900 font-medium"
                  >
                    <Package className="w-5 h-5 text-red-600" />
                    Track Orders
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 font-medium"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="px-5 py-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">© 2025 Layer Labs. All rights reserved.</p>
        </div>
      </aside>
    </div>
  );
}