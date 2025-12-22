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

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Debounce hook
function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const MY_ADMIN_EMAIL = "myeiokln@gmail.com";

export default function Navbar({
  onOpenSidebar = () => {},
}) {
  const [categories, setCategories] = useState([]);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const categoriesRef = useRef(null);

  // SEARCH
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 250);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false); // New state for mobile search
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // AUTH
  const [user, setUser] = useState(null);
  const [authMenuOpen, setAuthMenuOpen] = useState(false);
  const [showLoginPanel, setShowLoginPanel] = useState(false);

  // NOTIFICATIONS
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  // Fetch categories
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/categories`)
      .then((res) => res.json())
      .then((data) => {
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Failed to load categories:", err));
  }, [location.pathname]);

  // Load notifications
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

  // Click outside handler
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

  // Search suggestions
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

  // Auth listener
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

  async function markNotificationRead(token, id) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (res.ok) {
        await loadNotifications(auth.currentUser);
      }
    } catch (err) {
      console.error("markNotificationRead error", err);
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

  function goToCategory(c) {
    if (c) {
      navigate("/", { state: { categoryId: c._id, categorySlug: c.slug || c.name } });
    } else {
      navigate("/", { state: { categoryId: null } });
    }
    setCategoryOpen(false);
  }

  return (
    <nav className="fixed top-0 w-full bg-white/50 backdrop-blur-md z-40 border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 md:h-20 flex items-center justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={onOpenSidebar}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 md:hidden"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <Link to="/" className="text-lg sm:text-xl md:text-2xl font-black bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent whitespace-nowrap">
              Layer Labs
            </Link>
          </div>

          {/* CENTER - Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-6">
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

              {categoryOpen && (
                <div className="absolute mt-3 w-48 bg-white shadow-lg rounded-xl border border-gray-100 py-2 z-50">
                  <button
                    onClick={() => goToCategory(null)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium"
                  >
                    All
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c._id}
                      onClick={() => goToCategory(c)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700"
                    >
                      {c.name}
                    </button>
                  ))}
                  {categories.length === 0 && (
                    <div className="px-4 py-2 text-sm text-gray-500">Loading categories...</div>
                  )}
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

          {/* RIGHT */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Desktop Search - Always visible on desktop */}
            <div ref={searchRef} className="hidden md:block relative w-64">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                  if (suggestions.length) setShowSuggestions(true);
                }}
                placeholder="Search..."
                className="w-full px-3 py-2 rounded-lg border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-300 text-black placeholder-gray-400 text-sm"
              />

              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 rounded-lg shadow-lg max-h-64 overflow-auto z-50">
                  {suggestions.map((p) => (
                    <li
                      key={p._id}
                      onMouseDown={() => handleSelectSuggestion(p)}
                      className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50"
                    >
                      {p.images && p.images[0] ? (
                        <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-md object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-500">No</div>
                      )}
                      <div className="text-sm text-black">{p.name}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Mobile Search Icon - Only visible on mobile */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 rounded-md hover:bg-gray-100"
              aria-label="Search"
            >
              {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>

            <Link to="/cart" className="flex items-center gap-1 md:gap-2 p-2 md:p-0 rounded-md hover:bg-gray-100 md:hover:bg-transparent">
              <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
              <span className="hidden lg:block">Cart</span>
            </Link>

            {/* Notifications */}
            <div ref={notifRef} className="relative">
              <button
                onClick={async () => {
                  setNotifOpen((s) => !s);
                  if (!notifOpen && user) await loadNotifications(auth.currentUser);
                }}
                className="relative p-2 rounded-md hover:bg-gray-100"
                title="Notifications"
              >
                <Bell className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white shadow-lg border border-gray-100 rounded-lg z-50 p-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold">Notifications</div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="text-xs text-gray-500">No notifications</div>
                  ) : (
                    <ul className="max-h-64 overflow-auto space-y-2">
                      {notifications.map((n) => (
                        <li key={n._id} className={`p-2 rounded-md ${n.read ? "bg-gray-50" : "bg-red-50"}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-sm font-medium">{n.title}</div>
                              <div className="text-xs text-gray-600">{n.message}</div>
                              <div className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* AUTH */}
            <div className="relative auth-area">
              {!user ? (
                <>
                  <button
                    onClick={() => setShowLoginPanel((s) => !s)}
                    className="px-2 md:px-3 py-1.5 md:py-2 text-sm rounded-md border border-gray-200 hover:bg-gray-50 text-red-600"
                  >
                    Login
                  </button>

                  {showLoginPanel && (
                    <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg border border-gray-100 rounded-lg z-50 p-3">
                      <button
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-md border hover:bg-gray-50"
                      >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="google" className="w-5 h-5" />
                        <span className="text-sm text-blue-800">Continue with Google</span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => setAuthMenuOpen((s) => !s)}
                    className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-50"
                  >
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || "user"} className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                  </button>

                  {authMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg border border-gray-100 rounded-lg z-50 py-2">
                      <button
                        onClick={() => {
                          setAuthMenuOpen(false);
                          navigate("/profile");
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3"
                      >
                        <User className="w-5 h-5" />
                        Profile
                      </button>

                      <button
                        onClick={() => {
                          setAuthMenuOpen(false);
                          navigate("/track-orders");
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3"
                      >
                        <Package className="w-5 h-5 text-red-600" />
                        Track Orders
                      </button>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600 flex items-center gap-3"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar - Expands below navbar when icon clicked */}
        {searchOpen && (
          <div ref={searchRef} className="md:hidden pb-4 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (suggestions.length) setShowSuggestions(true);
              }}
              placeholder="Search products..."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-300 text-black placeholder-gray-400 text-sm"
              autoFocus
            />

            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 rounded-lg shadow-lg max-h-64 overflow-auto z-50">
                {suggestions.map((p) => (
                  <li
                    key={p._id}
                    onMouseDown={() => handleSelectSuggestion(p)}
                    className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50"
                  >
                    {p.images && p.images[0] ? (
                      <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-md object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-500">No</div>
                    )}
                    <div className="text-sm text-black">{p.name}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

Navbar.propTypes = {
  onOpenSidebar: PropTypes.func,
};