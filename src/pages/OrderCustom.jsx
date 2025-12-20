import React, { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import modelPlaceholder from "../assets/3d-file-placeholder.png";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const API_BASE = `${API_BASE_URL}`;

export default function OrderCustom() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (!user) {
        setOrders([]);
        setLoading(false);
        return;
      }

      try {
        const token = await user.getIdToken();
        const res = await axios.get(`${API_BASE}/api/customized/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const sorted = [...res.data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setOrders(sorted);
      } catch (e) {
        alert("Failed to load custom orders");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const proceedToOrderPage = (order) => {
    if (order.price == null) {
      alert("Price not set by admin yet");
      return;
    }

    const pendingOrder = {
      type: "customized",
      customized: {
        customOrderId: order._id,
        price: order.price,
        material: order.material,
        height: order.height,
        length: order.length,
        notes: order.notes,
        images: order.images || [],
      },
    };

    localStorage.setItem("pendingOrder", JSON.stringify(pendingOrder));
    navigate("/order");
  };

  
const is3DModelFile = (path) => {
  const ext = path.split(".").pop().toLowerCase();
  return ["stl", "obj", "fbx", "step", "iges"].includes(ext);
};
  return (
    <>
      <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="pt-28 pb-16 bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-4xl font-black text-center mb-10">
            My Custom 3D Orders
          </h1>

          {!currentUser && (
            <div className="text-center py-20 bg-white rounded-2xl shadow">
              <p className="text-xl text-gray-600">
                Please login to view your custom orders
              </p>
            </div>
          )}

          {loading && (
            <div className="text-center py-20 text-xl text-gray-600">
              Loading orders...
            </div>
          )}

          {!loading && orders.length === 0 && currentUser && (
            <div className="text-center py-20 bg-white rounded-2xl shadow">
              <p className="text-xl text-gray-600 mb-6">
                No custom orders yet
              </p>
              <button
                onClick={() => navigate("/customized-3d")}
                className="px-10 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-bold"
              >
                Create Custom Request
              </button>
            </div>
          )}

          <div className="space-y-10">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl shadow-xl p-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                  
                  {/* IMAGES */}
                 <div>
  <p className="font-semibold mb-3">Reference Files</p>

  <div className="grid grid-cols-3 gap-4">
    {(order.images || []).slice(0, 6).map((file, i) => {
      const fileUrl = file.startsWith("http")
        ? file
        : `${API_BASE}${file}`;

      const is3D = is3DModelFile(file);

      return (
        <div
          key={i}
          className="relative h-32 w-full rounded-xl border overflow-hidden bg-gray-50"
        >
          <img
            src={is3D ? modelPlaceholder : fileUrl}
            alt=""
            className="h-full w-full object-cover"
          />

          {is3D && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold">
              3D MODEL
            </div>
          )}
        </div>
      );
    })}
  </div>
</div>
                  {/* DETAILS */}
                  <div className="space-y-4">
                    <p>
                      <strong>Material:</strong> {order.material}
                    </p>

                    <p>
                      <strong>Size:</strong>{" "}
                      {order.height}" × {order.length}"
                    </p>

                    <p>
                      <strong>Status:</strong>{" "}
                      <span className="px-3 py-1 rounded-full bg-gray-100">
                        {order.status}
                      </span>
                    </p>

                    {order.price != null ? (
                      <p className="text-3xl font-black text-green-600">
                        ₹{order.price}
                      </p>
                    ) : (
                      <p className="text-xl font-semibold text-orange-600">
                        Price pending
                      </p>
                    )}

                    {order.notes && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <strong>Notes:</strong>
                        <p className="text-gray-700 mt-1">
                          {order.notes}
                        </p>
                      </div>
                    )}

                  {order.paymentStatus === "completed" ? (
  <div className="w-full mt-4 py-4 rounded-xl text-center font-bold bg-green-100 text-green-700">
    Paid ({order.payment || "COD"})
  </div>
) : (
  <button
    disabled={order.price == null}
    onClick={() => proceedToOrderPage(order)}
    className={`w-full mt-4 py-4 rounded-xl text-xl font-bold ${
      order.price != null
        ? "bg-gradient-to-r from-red-600 to-pink-600 text-white"
        : "bg-gray-300 text-gray-500 cursor-not-allowed"
    }`}
  >
    Proceed to Order
  </button>
)}

                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
