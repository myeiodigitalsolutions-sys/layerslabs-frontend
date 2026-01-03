import { Mail, Phone, MapPin } from 'lucide-react';

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="text-center py-16 sm:py-24">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            Shipping Policy
          </h1>
          <p className="text-xl sm:text-2xl text-gray-700 max-w-4xl mx-auto">
            Details on how we ship your premium collectibles.
          </p>
        </section>

        {/* Main Content Section */}
        <section className="py-16 bg-white rounded-3xl shadow-2xl px-8 sm:px-12">
          <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
            <h2 className="text-3xl font-bold mt-12">Processing Time</h2>
            <p>Orders are processed within 3-7 business days. Custom or limited-edition items may take longer.</p>

            <h2 className="text-3xl font-bold mt-12">Shipping Methods & Times (India)</h2>
            <p>We ship via reliable couriers like DTDC, Delhivery, or India Post. Standard delivery: 5-10 business days.</p>

            <h2 className="text-3xl font-bold mt-12">Shipping Costs</h2>
            <p>Calculated at checkout based on weight and location. Free shipping on orders over ₹2000 (India only).</p>

            <h2 className="text-3xl font-bold mt-12">International Shipping</h2>
            <p>Currently limited. Contact us for availability. Customs duties are buyer's responsibility.</p>

            <h2 className="text-3xl font-bold mt-12">Tracking</h2>
            <p>You'll receive a tracking number once shipped.</p>

            <h2 className="text-3xl font-bold mt-12">Lost or Damaged Shipments</h2>
            <p>Contact us immediately. We'll assist with claims.</p>

            <h2 className="text-3xl font-bold mt-12">Contact Us</h2>
            <div className="flex items-center gap-4 mt-4">
              <Mail className="w-6 h-6 text-pink-600" />
              <p>myeiokln@gmail.com</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}