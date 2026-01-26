import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { getIdToken } from "firebase/auth";
import axios from "axios";
import {
  MapPin,
  Phone,
  User,
  CreditCard,
  Wallet,
  Edit2,
  Save,
} from "lucide-react";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const API = `${API_BASE_URL}`;

export default function OrderPage() {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [editing, setEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    state: "",
    city: "",
    pincode: "",
    payment: "COD",
  });

  const getOrderItems = () => {
    if (!order) return [];

    if (order.type === "product" && Array.isArray(order.product)) {
      return order.product.map(p => ({
        name: p.name,
        price: Number(p.price || 0),
        qty: Number(p.qty || 1),
        image: p.image
      }));
    }

    if (order.type === "customized" && order.customized) {
      return [{
        name: "Customized 3D Product",
        price: Number(order.customized.price || 0),
        qty: 1,
        image: order.customized.images?.[0]
          ? order.customized.images[0].startsWith("http")
            ? order.customized.images[0]
            : `${API_BASE_URL}${order.customized.images[0]}`
          : null

      }];
    }

    return [];
  };

  const items = getOrderItems();
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  useEffect(() => {
    const init = async () => {
      const pending = JSON.parse(localStorage.getItem("pendingOrder"));
      if (!pending) return navigate("/", { replace: true });
      setOrder(pending);

      const user = auth.currentUser;
      if (!user) return navigate("/", { replace: true });

      try {
        const token = await getIdToken(user);
        const res = await fetch(`${API}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          alert("Please complete your profile");
          navigate("/profile");
          return;
        }

        const { user: u } = await res.json();
        setProfile((p) => ({
          ...p,
          name: u.name,
          email: u.email,
          phone: u.phone,
          address: u.address,
          state: u.state,
          city: u.city,
          pincode: u.pincode,
        }));
      } catch {
        alert("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [navigate]);

  const saveProfileChanges = async () => {
    try {
      const token = await getIdToken(auth.currentUser);
      await axios.post(
        `${API}/api/users/profile`,
        {
          uid: auth.currentUser.uid,
          email: profile.email,
          name: profile.name,
          phone: profile.phone,
          address: profile.address,
          state: profile.state,
          city: profile.city,
          pincode: profile.pincode,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditing(false);
      alert("Details updated");
    } catch {
      alert("Failed to update details");
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const placeOrder = async () => {
    // Validate required fields before placing order
    const requiredFields = {
      phone: profile.phone,
      address: profile.address,
      city: profile.city,
      pincode: profile.pincode,
    };

    const missingFields = Object.keys(requiredFields).filter(
      (field) => !requiredFields[field]?.trim()
    );

    if (missingFields.length > 0) {
      const confirmUpdate = window.confirm(
        "Please complete your delivery details (Phone, Address, City, Pincode) to place the order.\n\nClick OK to go to your profile and update the details."
      );

      if (confirmUpdate) {
        navigate("/profile");
      }
      return; // Stop order placement
    }

    // If all fields are present, proceed with order
    setPlacing(true);
    try {
      const token = await getIdToken(auth.currentUser);

      if (profile.payment === "COD") {
        if (order.type === "customized") {
          // Existing COD flow for customized
          await axios.patch(
            `${API}/api/customized/${order.customized.customOrderId}/pay`,
            {
              payment: "COD",
              paymentStatus: "completed",
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          localStorage.removeItem("pendingOrder");
          alert("Custom order confirmed successfully");
          navigate("/order-custom");
        } else {
          // Existing COD flow for product
          const payload = {
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            address: profile.address,
            state: profile.state,
            city: profile.city,
            pincode: profile.pincode,
            payment: "COD",
            product: order.product,
          };
          await axios.post(`${API}/api/orders`, payload, {
            headers: { Authorization: `Bearer ${token}` },
          });
          localStorage.removeItem("pendingOrder");
          alert("Order placed successfully");
          navigate("/");
        }
      } else { // ONLINE payment
        let appOrderId;
        let createRazorpayUrl;
        let verifyUrl;

        if (order.type === "customized") {
          // For customized: Patch with pending (adapt your backend if needed)
          await axios.patch(
            `${API}/api/customized/${order.customized.customOrderId}/pay`,
            {
              payment: "ONLINE",
              paymentStatus: "pending",
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          appOrderId = order.customized.customOrderId; // Assuming this is the ID
          createRazorpayUrl = `${API}/api/customized/create-razorpay/${appOrderId}`; // You'll need to add this route in customized backend
          verifyUrl = `${API}/api/customized/verify-payment/${appOrderId}`; // Same
        } else {
          // For product: Create order with pending
          const payload = {
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            address: profile.address,
            state: profile.state,
            city: profile.city,
            pincode: profile.pincode,
            payment: "ONLINE",
            product: order.product,
          };
          const res = await axios.post(`${API}/api/orders`, payload, {
            headers: { Authorization: `Bearer ${token}` },
          });
          appOrderId = res.data._id;
          createRazorpayUrl = `${API}/api/orders/create-razorpay/${appOrderId}`;
          verifyUrl = `${API}/api/orders/verify-payment/${appOrderId}`;
        }

        // Create Razorpay order
        const rpRes = await axios.post(createRazorpayUrl, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { razorpayOrderId, key, amount, currency, name, email, phone } = rpRes.data;

        // Load Razorpay SDK
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error("Razorpay SDK failed to load.");
        }

        // Open Razorpay checkout
        const options = {
          key,
          amount,
          currency,
          name: "Your Company Name", // Customize
          description: "Order Payment",
          image: "https://your-company-logo-url", // Optional
          order_id: razorpayOrderId,
          handler: async function (response) {
            try {
              const verifyRes = await axios.post(verifyUrl, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }, {
                headers: { Authorization: `Bearer ${token}` },
              });

              if (verifyRes.data.success) {
                localStorage.removeItem("pendingOrder");
                alert("Payment successful! Order confirmed.");
                navigate(order.type === "customized" ? "/order-custom" : "/");
              } else {
                alert("Payment verification failed.");
              }
            } catch (err) {
              alert("Verification error: " + err.message);
            }
          },
          prefill: {
            name,
            email,
            contact: phone,
          },
          theme: {
            color: "#F37254", // Customize to match your brand
          },
          modal: {
            ondismiss: function () {
              alert("Payment modal closed. Order remains pending.");
            },
          },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to place order or initiate payment. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (loading || !order) {
    return (
      <div className="pt-32 text-center text-lg text-gray-600">
        Loading order details...
      </div>
    );
  }

  return (
    <section className="pt-32 pb-24 bg-gradient-to-br from-red-50 via-pink-50 to-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* ORDER SUMMARY */}
        <div className="bg-white/80 rounded-3xl shadow-2xl p-8 border">
          <h2 className="text-3xl font-black mb-6">Order Summary</h2>

          {items.length === 0 ? (
            <p className="text-gray-500">No items found</p>
          ) : (
            <div className="space-y-6">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-6 items-start">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-32 h-32 rounded-2xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold">{item.name}</h3>
                    <p className="text-gray-600">Qty: {item.qty}</p>
                    <p className="text-xl font-black text-red-600">
                      Rs {item.price * item.qty}
                    </p>

                    {/* Display customization data if present */}
                    {((order.product?.[idx]?.customNames && order.product[idx].customNames.length > 0) || order.product?.[idx]?.customImage || order.product?.[idx]?.selectedProductType) && (
                      <div className="mt-3 p-3 bg-pink-50 rounded-xl border border-pink-200">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Customization:</p>

                        {/* Product Type */}
                        {order.product[idx].selectedProductType && (
                          <div className="mb-2 p-2 bg-white rounded-lg">
                            <p className="text-sm text-gray-800">
                              <span className="font-medium">Type:</span> {order.product[idx].selectedProductType.label}
                            </p>
                            <p className="text-xs text-gray-600">
                              Base: Rs {order.product[idx].basePrice} + Rs {order.product[idx].selectedProductType.additionalPrice} = Rs {item.price}
                            </p>
                          </div>
                        )}

                        {order.product[idx].customNames && order.product[idx].customNames.length > 0 && (
                          <div className="space-y-1 mb-2">
                            {order.product[idx].customNames.map((name, nameIdx) => (
                              <p key={nameIdx} className="text-sm text-gray-800">
                                <span className="font-medium">Field {nameIdx + 1}:</span> {name}
                              </p>
                            ))}
                          </div>
                        )}
                        {order.product[idx].customImage && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-700 mb-1">Custom Image:</p>
                            <img
                              src={order.product[idx].customImage}
                              alt="Custom"
                              className="w-20 h-20 object-cover rounded-lg border border-pink-300"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t text-right">
                <p className="text-lg font-semibold">
                  Total: <span className="text-red-600 font-black">Rs {total}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* DELIVERY DETAILS */}
        <div className="bg-white/80 rounded-3xl shadow-2xl p-10 border">
          {/* <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black">Delivery Details</h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 text-red-600 font-semibold"
              >
                <Edit2 size={18} /> Change
              </button>
            )}
          </div> */}

          {!editing ? (
            <div className="space-y-4">
              <div className="flex gap-3">
                <User className="text-red-600" />
                <div>
                  <p className="font-semibold">{profile.name}</p>
                  <p className="text-sm text-gray-500">{profile.email}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Phone className="text-red-600" />
                <p>{profile.phone}</p>
              </div>

              <div className="flex gap-3">
                <MapPin className="text-red-600" />
                <p>
                  {profile.address}, {profile.city}, {profile.state} –{" "}
                  {profile.pincode}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {["name", "phone", "address", "city", "pincode"].map((f) => (
                <input
                  key={f}
                  value={profile[f]}
                  onChange={(e) =>
                    setProfile({ ...profile, [f]: e.target.value })
                  }
                  placeholder={f}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              ))}

              <button
                onClick={saveProfileChanges}
                className="mt-3 px-6 py-2 bg-green-600 text-white rounded-xl flex items-center gap-2"
              >
                <Save size={18} /> Save Changes
              </button>
            </div>
          )}

          {/* PAYMENT */}
          <div className="mt-8">
            <p className="font-semibold mb-3">Payment Method</p>
            <div className="flex gap-4">
              <button
                onClick={() => setProfile({ ...profile, payment: "COD" })}
                className={`flex-1 p-4 rounded-2xl border ${profile.payment === "COD" && "border-red-600 bg-red-50"
                  }`}
              >
                <Wallet /> COD
              </button>
              <button
                onClick={() => setProfile({ ...profile, payment: "ONLINE" })}
                className={`flex-1 p-4 rounded-2xl border ${profile.payment === "ONLINE" && "border-red-600 bg-red-50"
                  }`}
              >
                <CreditCard /> Online
              </button>
            </div>
          </div>

          <button
            onClick={placeOrder}
            disabled={placing}
            className="w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-pink-600 text-white text-xl font-black"
          >
            {placing ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </div>
    </section>
  );
}