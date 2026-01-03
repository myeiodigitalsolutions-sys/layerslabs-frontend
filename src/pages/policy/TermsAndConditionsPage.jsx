import { Mail, Phone, MapPin } from 'lucide-react';

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="text-center py-16 sm:py-24">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            Terms & Conditions
          </h1>
          <p className="text-xl sm:text-2xl text-gray-700 max-w-4xl mx-auto">
            Please read these terms carefully before purchasing from Layer Labs.
          </p>
        </section>

        {/* Main Content Section */}
        <section className="py-16 bg-white rounded-3xl shadow-2xl px-8 sm:px-12">
          <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
            <p className="text-lg leading-relaxed">
              By accessing our website and placing an order, you agree to these Terms & Conditions.
            </p>

            <h2 className="text-3xl font-bold mt-12">Products</h2>
            <p>All products are limited-edition 3D printed and hand-painted collectibles. Slight variations may occur due to the handmade nature.</p>

            <h2 className="text-3xl font-bold mt-12">Orders & Payment</h2>
            <p>Orders are binding once payment is received. We accept major payment methods via secure gateways.</p>

            <h2 className="text-3xl font-bold mt-12">Intellectual Property</h2>
            <p>Products may be based on original designs. You may not reproduce or resell without permission.</p>

            <h2 className="text-3xl font-bold mt-12">Returns & Refunds</h2>
            <p>Defective items may be returned within 14 days for replacement or refund. Custom orders are non-refundable.</p>

            <h2 className="text-3xl font-bold mt-12">Limitation of Liability</h2>
            <p>We are not liable for damages beyond the product price.</p>

            <h2 className="text-3xl font-bold mt-12">Governing Law</h2>
            <p>These terms are governed by the laws of India.</p>

            <h2 className="text-3xl font-bold mt-12">Contact Us</h2>
            <div className="flex items-center gap-4 mt-4">
              <Mail className="w-6 h-6 text-pink-600" />
              <p>myeiokln@gmail.com</p>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <Phone className="w-6 h-6 text-pink-600" />
              <p>+91 9840624407</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}