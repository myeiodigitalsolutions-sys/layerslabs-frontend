import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, getIdToken } from "firebase/auth";

const TAMILNADU_CITIES = [
  "Chennai",
  "Coimbatore",
  "Madurai",
  "Tiruchirappalli",
  "Salem",
  "Tirunelveli",
  "Thoothukudi",
  "Erode",
  "Vellore",
  "Thanjavur",
  "Dindigul",
  "Karur",
  "Nagercoil",
];
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    address: "",
    state: "Tamil Nadu",
    city: "",
    pincode: "",
    phone: "",
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        navigate("/", { replace: true });
        return;
      }

      setUser(u);
      setForm((s) => ({ ...s, name: u.displayName || s.name }));

      try {
        const token = await getIdToken(u);
        const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          const p = data.user;
          if (p) {
            setForm({
              name: p.name || u.displayName || "",
              address: p.address || "",
              state: p.state || "Tamil Nadu",
              city: p.city || "",
              pincode: p.pincode || "",
              phone: p.phone || "",
            });
          }
        }
      } catch (err) {
        console.error("Profile load error", err);
      }
    });

    return () => unsub();
  }, [navigate]);

  async function handleSave(e) {
    e.preventDefault();
    if (!user) return;

    const { name, address, city, pincode, phone } = form;
    if (!name || !address || !city || !pincode || !phone) {
      return alert("Please fill all required fields");
    }

    setSaving(true);
    try {
      const token = await getIdToken(user);
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          ...form,
        }),
      });

      if (response.ok) {
        alert("Profile saved successfully!");
        navigate("/");
      } else {
        alert("Failed to save profile. Please try again.");
      }
    } catch (err) {
      alert("Network error. Please check your connection.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-white pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-gray-600 mt-3 text-lg">Update your personal information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Gradient Top Bar */}
          <div className="bg-gradient-to-r from-red-600 to-pink-600 h-32 relative">
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
              <div className="w-32 h-32 rounded-full border-8 border-white shadow-xl overflow-hidden bg-gray-200">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-400 to-pink-400 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">
                      {form.name.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="pt-20 pb-10 px-8 md:px-16">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
              {form.name || "Welcome!"}
            </h2>
            <p className="text-center text-gray-500 mb-10">{user?.email}</p>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-red-200 focus:border-red-500 transition text-black text-lg"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Address *
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-red-200 focus:border-red-500 transition text-black text-lg resize-none"
                  placeholder="House no., street, landmark..."
                />
              </div>

              {/* State (Fixed) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  State
                </label>
                <div className="w-full px-5 py-4 rounded-xl bg-gray-100 border border-gray-300 text-black text-lg">
                  Tamil Nadu
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City *
                </label>
                <select
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-red-200 focus:border-red-500 transition text-black text-lg bg-white"
                >
                  <option value="">Select your city</option>
                  {TAMILNADU_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pincode & Phone - Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    pattern="[0-9]{6}"
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "") })}
                    className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-red-200 focus:border-red-500 transition text-black text-lg"
                    placeholder="600001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    pattern="[0-9]{10}"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
                    className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-red-200 focus:border-red-500 transition text-black text-lg"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-5 px-8 bg-gradient-to-r from-red-600 to-pink-600 text-white text-xl font-bold rounded-2xl hover:shadow-2xl transform hover:scale-105 transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving Profile..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="flex-1 py-5 px-8 bg-white border-2 border-gray-300 text-gray-800 text-xl font-bold rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}