import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { auth } from "../firebase";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const API_BASE = `${API_BASE_URL}`;

const MATERIALS = [
  "Resin",
  "PLA Plastic",
  "ABS Plastic",
  "Wood Filament",
  "Metal Composite",
  "Flexible TPU",
];

export default function Customized3DPage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("design");
  const [files, setFiles] = useState([]); // Still File objects for display
  const [height, setHeight] = useState("");
  const [length, setLength] = useState("");
  const [material, setMaterial] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  async function getToken() {
    if (!auth.currentUser) return null;
    return await auth.currentUser.getIdToken();
  }

  const handleFiles = (e) => {
    const selectedFiles = Array.from(e.target.files);

    let allowedExtensions =
      mode === "design"
        ? ["jpg", "jpeg", "png"]
        : ["stl", "obj", "fbx", "step", "iges"];

    const MAX_SIZE = 100 * 1024 * 1024;

    const filtered = selectedFiles.filter((file) => {
      const ext = file.name.split(".").pop().toLowerCase();
      if (!allowedExtensions.includes(ext)) return false;
      if (file.size > MAX_SIZE) {
        alert(`${file.name} is larger than 100MB`);
        return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      alert(
        mode === "design"
          ? "Only image files are allowed"
          : "Only 3D model files (.stl, .obj, .fbx, etc.) are allowed"
      );
      return;
    }

    setFiles(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!auth.currentUser) return alert("Please login first");
    if (files.length === 0) return alert("Please upload files");
    if (!material) return alert("Please select material");
    if (!height || !length) return alert("Please enter dimensions");

    setLoading(true);

    try {
      const token = await getToken();

      // Read files as base64
      const imageData = await Promise.all(
        files.map(
          (file) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (ev) => {
                resolve({
                  originalName: file.name,
                  base64: ev.target.result,
                });
              };
              reader.onerror = reject;
              reader.readAsDataURL(file);
            })
        )
      );

      const data = {
        height,
        length,
        material,
        notes,
        images: imageData, // [{originalName, base64}]
        orderType: mode, // If needed, though backend doesn't use it
      };

      await axios.post(`${API_BASE}/api/customized`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      alert("Custom request submitted successfully");
      navigate("/order-custom");
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar onOpenSidebar={() => setIsSidebarOpen(true)} />
      <Sidebar open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="pt-28 pb-16 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8">

            <h1 className="text-4xl font-black text-center mb-10">
              Custom 3D Services
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div
                onClick={() => {
                  setMode("design");
                  setFiles([]);
                }}
                className={`cursor-pointer p-8 rounded-2xl border-2 ${
                  mode === "design"
                    ? "border-red-600 bg-red-50"
                    : "border-gray-200"
                }`}
              >
                <h2 className="text-2xl font-bold mb-2">
                  3D Design + Printing
                </h2>
                <p className="text-gray-600">
                  Upload reference images. We design & print for you.
                </p>
              </div>

              <div
                onClick={() => {
                  setMode("print");
                  setFiles([]);
                }}
                className={`cursor-pointer p-8 rounded-2xl border-2 ${
                  mode === "print"
                    ? "border-red-600 bg-red-50"
                    : "border-gray-200"
                }`}
              >
                <h2 className="text-2xl font-bold mb-2">
                  Just Printing
                </h2>
                <p className="text-gray-600">
                  Upload your 3D files (.stl, .obj, .fbx)
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

              <div>
                <label className="block text-lg font-semibold mb-2">
                  Upload Files
                </label>
                <input
                  key={mode}
                  type="file"
                  multiple
                  onChange={handleFiles}
                  accept={
                    mode === "design"
                      ? ".jpg,.jpeg,.png"
                      : ".stl,.obj,.fbx,.step,.iges"
                  }
                  className="w-full"
                />

                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((f, i) => (
                      <div
                        key={i}
                        className="p-3 border rounded-lg text-sm"
                      >
                        {f.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-lg font-semibold mb-2">
                  Select Material
                </label>
                <select
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg"
                >
                  <option value="">-- Choose Material --</option>
                  {MATERIALS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  type="number"
                  placeholder="Height (inches)"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Length (inches)"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg"
                />
              </div>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Additional notes"
                className="w-full px-4 py-3 border rounded-lg"
              />

              <div className="flex flex-col items-center gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-12 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white text-xl font-bold rounded-xl"
                >
                  {loading ? "Submitting..." : "Submit Request"}
                </button>

                {/* ✅ NEW BUTTON */}
                <button
                  type="button"
                  onClick={() => navigate("/order-custom")}
                  className="px-10 py-3 border-2 border-red-600 text-red-600 text-lg font-bold rounded-xl hover:bg-red-50"
                >
                  View Custom Orders
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>
    </>
  );
}