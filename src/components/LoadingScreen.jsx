// src/components/LoadingScreen.jsx
import { Package, Loader2 } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-red-50 via-pink-50 to-white flex items-center justify-center z-[9999]">
      <div className="text-center space-y-8">
        {/* Animated 3D box + spinner */}
        <div className="relative inline-block">
          <Package className="w-32 h-32 text-red-600 animate-bounce" />
          <Loader2 className="w-20 h-20 text-pink-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
        </div>

        {/* Brand name */}
        <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
          Layer Labs
        </h1>

        {/* Cute message */}
        <p className="text-2xl md:text-3xl font-medium text-gray-700">
          Bringing your collectibles to life...
        </p>

        {/* Animated progress bar */}
        <div className="w-80 h-3 bg-gray-200 rounded-full mx-auto overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-red-600 to-pink-600 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}