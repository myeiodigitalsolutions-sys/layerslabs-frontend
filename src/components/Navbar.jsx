// src/components/Navbar.jsx
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, ChevronDown, User, Bell, Package, Search, X } from "lucide-react";
import PropTypes from "prop-types";
import { auth, googleProvider } from "../firebase";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  getIdToken,
} from "firebase/auth";

import logo from "../assets/logo.jpeg"; // Update path if needed

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const MY_ADMIN_EMAIL = "myeiokln@gmail.com";

export default function Navbar({ onOpenSidebar = () => {} }) {
  const [categories, setCategories] = useState([]);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const categoriesRef = useRef(null);

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 250);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [authMenuOpen, setAuthMenuOpen] = useState(false);
  const [showLoginPanel, setShowLoginPanel] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/categories/main`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        } else if (data && data.mainCategories) {
          setCategories(data.mainCategories);
        } else {
          setCategories([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load categories:", err);
        setCategories([]);
      });
  }, []);

  async function loadNotifications(userObj) {
    if (!userObj) return;
    try {
      const token = await getIdToken(userObj);
      const res = await fetch(`${API_BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const arr = Array.isArray(data) ? data : data.notifications || [];
        setNotifications(arr);
        setUnreadCount(arr.filter((n) => !n.read).length);
      }
    } catch (err) {
      console.error("loadNotifications error", err);
    }
  }

  useEffect(() => {
    function handleDocClick(e) {
      if (categoriesRef.current && !categoriesRef.current.contains(e.target)) {
        setCategoryOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (!e.target.closest(".auth-area")) {
        setAuthMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleDocClick);
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, []);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 1) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const q = encodeURIComponent(debouncedQuery);
    fetch(`${API_BASE_URL}/api/products/search?q=${q}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        setSuggestions(Array.isArray(data) ? data : []);
        setShowSuggestions(true);
      })
      .catch((err) => {
        if (err.name !== "AbortError") console.error("search error", err);
      });
    return () => controller.abort();
  }, [debouncedQuery]);

  function handleSelectSuggestion(product) {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setSearchOpen(false);
    navigate(`/product/${product._id}`);
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(
        u
          ? { uid: u.uid, displayName: u.displayName, email: u.email, photoURL: u.photoURL }
          : null
      );
      if (u) loadNotifications(u);
    });
    return () => unsub();
  }, []);

  async function handleGoogleLogin() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await getIdToken(result.user);
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
      setShowLoginPanel(false);
      setAuthMenuOpen(true);
      if (result.user?.email === MY_ADMIN_EMAIL) {
        navigate("/admin");
        return;
      }
      loadNotifications(result.user);
    } catch (err) {
      console.error("Google login error:", err);
      alert("Login failed.");
    }
  }

  async function handleLogout() {
    try {
      await signOut(auth);
      setAuthMenuOpen(false);
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  async function markAllNotificationsRead() {
    if (!user) return;
    try {
      const token = await getIdToken(auth.currentUser);
      const res = await fetch(`${API_BASE_URL}/api/notifications/mark-all-read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      if (res.ok) {
        await loadNotifications(auth.currentUser);
      }
    } catch (err) {
      console.error("markAllNotificationsRead error", err);
    }
  }

  function goToCategory(category) {
    if (!category || !category._id) return;

    navigate("/", {
      state: {
        categoryId: category._id,
        categoryName: category.name
      },
      replace: false
    });

    setCategoryOpen(false);
  }

  return (
    <nav className="fixed top-0 w-full bg-white/50 backdrop-blur-md z-40 border-b border-gray-200/50 shadow-sm">
      <div className="w-full">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
          <div className="h-16 md:h-20 flex items-center justify-between">

            {/* LEFT: Menu + Logo */}
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <button
                onClick={onOpenSidebar}
                className="p-2 rounded-md text-gray-700 hover:bg-gray-100 lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Logo + Brand */}
              <Link to="/" className="flex items-center gap-3 md:gap-5">
                {/* Much larger logo on desktop */}
                <img 
                  src={logo} 
                  alt="URS Printly Logo" 
                  className="h-10  w-10 md:h-20 md:w-20 object-contain transition-all"
                />
                <div className="hidden sm:flex flex-col">
                  <span className="text-lg md:text-2xl font-black bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent leading-none">
                    URS Printly
                  </span>
                  <span className="text-xs text-gray-600 font-medium -mt-1">
                    3D Printing Solutions
                  </span>
                </div>
                {/* Show only logo on very small screens */}
                <span className="sm:hidden text-lg font-black bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  URS Printly
                </span>
              </Link>
            </div>

            {/* CENTER: Desktop Links */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 font-medium hover:text-red-600 transition">
                Home
              </Link>
              <div ref={categoriesRef} className="relative">
                <button
                  onClick={() => setCategoryOpen((s) => !s)}
                  className="flex items-center gap-2 text-gray-700 font-medium hover:text-red-600 transition"
                >
                  Categories <ChevronDown className="w-4 h-4" />
                </button>
                {categoryOpen && categories.length > 0 && (
                  <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-48 bg-white shadow-xl rounded-xl border border-gray-100 py-3 z-50">
                    <button
                      onClick={() => {
                        navigate("/", { state: { categoryId: null }, replace: true });
                        setCategoryOpen(false);
                      }}
                      className="w-full text-left px-5 py-2.5 hover:bg-gray-50 text-gray-700 font-medium"
                    >
                      All Categories
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat._id}
                        onClick={() => goToCategory(cat)}
                        className="w-full text-left px-5 py-2.5 hover:bg-gray-50 text-gray-700"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Link to="/customize" className="text-gray-700 font-medium hover:text-red-600 transition">
                Customize 3D
              </Link>
              <Link to="/about" className="text-gray-700 font-medium hover:text-red-600 transition">
                About us
              </Link>
              <Link to="/contact" className="text-gray-700 font-medium hover:text-red-600 transition">
                Contact
              </Link>
            </div>

            {/* RIGHT: Icons & Auth */}
            <div className="flex items-center gap-3 md:gap-4">
              {/* Mobile Search Toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-md hover:bg-gray-100 lg:hidden"
              >
                {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </button>

              {/* Desktop Search */}
              <div ref={searchRef} className="hidden lg:block relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => suggestions.length && setShowSuggestions(true)}
                  placeholder="Search products..."
                  className="w-64 pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-300 text-sm"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                {showSuggestions && suggestions.length > 0 && (
                  <ul className="absolute top-full mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl max-h-72 overflow-auto z-50">
                    {suggestions.map((p) => (
                      <li
                        key={p._id}
                        onMouseDown={() => handleSelectSuggestion(p)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                      >
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xs">No</div>
                        )}
                        <span className="text-sm text-gray-800">{p.name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Cart */}
              <Link to="/cart" className="p-2 rounded-md hover:bg-gray-100">
                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
              </Link>

              {/* Notifications */}
              <div ref={notifRef} className="relative">
                <button
                  onClick={async () => {
                    setNotifOpen((s) => !s);
                    if (!notifOpen && user) await loadNotifications(auth.currentUser);
                  }}
                  className="p-2 rounded-md hover:bg-gray-100 relative"
                >
                  <Bell className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-white shadow-2xl rounded-xl border border-gray-100 z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-semibold">Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={markAllNotificationsRead} className="text-xs text-red-600 hover:underline">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No notifications</p>
                      ) : (
                        notifications.map((n) => (
                          <div key={n._id} className={`p-4 border-b border-gray-50 ${!n.read ? 'bg-red-50' : ''}`}>
                            <p className="font-medium text-sm">{n.title}</p>
                            <p className="text-xs text-gray-600 mt-1">{n.message}</p>
                            <p className="text-xs text-gray-400 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User/Auth */}
              <div className="relative auth-area">
                {!user ? (
                  <button
                    onClick={() => setShowLoginPanel((s) => !s)}
                    className="hidden sm:block px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition"
                  >
                    Login
                  </button>
                ) : (
                  <button
                    onClick={() => setAuthMenuOpen((s) => !s)}
                    className="p-1 rounded-full hover:bg-gray-100 transition"
                  >
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt="Profile" 
                        className="w-9 h-9 rounded-full object-cover border-2 border-gray-200" 
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center border-2 border-gray-200">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                  </button>
                )}

                {/* Login Dropdown */}
                {showLoginPanel && !user && (
                  <div className="absolute right-0 mt-3 w-56 bg-white shadow-xl rounded-xl border border-gray-100 p-4 z-50">
                    <button
                      onClick={handleGoogleLogin}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                    >
                      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                      <span className="text-sm font-medium">Continue with Google</span>
                    </button>
                  </div>
                )}

                {/* User Menu */}
                {authMenuOpen && user && (
                  <div className="absolute right-0 mt-3 w-56 bg-white shadow-xl rounded-xl border border-gray-100 py-2 z-50">
                    <button
                      onClick={() => { setAuthMenuOpen(false); navigate("/profile"); }}
                      className="w-full px-5 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
                    >
                      <User className="w-5 h-5" />
                      <span>Profile</span>
                    </button>
                    <button
                      onClick={() => { setAuthMenuOpen(false); navigate("/track-orders"); }}
                      className="w-full px-5 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
                    >
                      <Package className="w-5 h-5 text-red-600" />
                      <span>Track Orders</span>
                    </button>
                    <hr className="my-2 border-gray-200" />
                    <button
                      onClick={handleLogout}
                      className="w-full px-5 py-3 text-left hover:bg-gray-50 text-red-600 flex items-center gap-3"
                    >
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Search Bar (expanded) */}
          {searchOpen && (
            <div ref={searchRef} className="lg:hidden pb-4 px-4 -mx-4 bg-white border-t border-gray-100">
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-300 text-base"
                  autoFocus
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <ul className="mt-3 bg-white rounded-xl shadow-xl border border-gray-100 max-h-64 overflow-y-auto">
                  {suggestions.map((p) => (
                    <li
                      key={p._id}
                      onMouseDown={() => handleSelectSuggestion(p)}
                      className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                    >
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.name} className="w-12 h-12 rounded object-cover" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs">No</div>
                      )}
                      <span className="font-medium">{p.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

Navbar.propTypes = {
  onOpenSidebar: PropTypes.func,
};