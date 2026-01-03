import { Mail, Phone, MapPin } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="text-center py-16 sm:py-24">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-xl sm:text-2xl text-gray-700 max-w-4xl mx-auto">
            Your privacy is important to us at Layer Labs.
          </p>
        </section>

        {/* Main Content Section */}
        <section className="py-16 bg-white rounded-3xl shadow-2xl px-8 sm:px-12">
          <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
            <p className="text-lg leading-relaxed">
              Layer Labs ("we", "us", or "our") operates the website for our 3D printed collectibles. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase.
            </p>

            <h2 className="text-3xl font-bold mt-12">Information We Collect</h2>
            <p>We may collect the following types of information:</p>
            <ul className="list-disc pl-8 space-y-2">
              <li>Personal details such as name, email address, shipping address, and phone number when you place an order.</li>
              <li>Payment information (processed securely by third-party payment gateways; we do not store full card details).</li>
              <li>Automatically collected data like IP address, browser type, and browsing behavior via cookies and analytics tools.</li>
            </ul>

            <h2 className="text-3xl font-bold mt-12">How We Use Your Information</h2>
            <p>Your information is used to:</p>
            <ul className="list-disc pl-8 space-y-2">
              <li>Process and fulfill orders, including shipping and customer support.</li>
              <li>Communicate with you about orders, updates, and promotions (you can opt out anytime).</li>
              <li>Improve our website and products.</li>
              <li>Comply with legal obligations.</li>
            </ul>

            <h2 className="text-3xl font-bold mt-12">Sharing Your Information</h2>
            <p>We do not sell your personal information. We may share it with:</p>
            <ul className="list-disc pl-8 space-y-2">
              <li>Shipping partners to deliver your orders.</li>
              <li>Payment processors for secure transactions.</li>
              <li>Legal authorities if required by law.</li>
            </ul>

            <h2 className="text-3xl font-bold mt-12">Data Security</h2>
            <p>We implement reasonable security measures to protect your data, but no method is 100% secure.</p>

            <h2 className="text-3xl font-bold mt-12">Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal information. Contact us to exercise these rights.</p>

            <h2 className="text-3xl font-bold mt-12">Changes to This Policy</h2>
            <p>We may update this policy from time to time. Changes will be posted here with an updated effective date.</p>

            <h2 className="text-3xl font-bold mt-12">Contact Us</h2>
            <p>If you have questions, contact us at:</p>
            <div className="flex items-center gap-4 mt-4">
              <Mail className="w-6 h-6 text-pink-600" />
              <p>myeiokln@gmail.com</p>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <Phone className="w-6 h-6 text-pink-600" />
              <p>+91 9840624407</p>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <MapPin className="w-6 h-6 text-pink-600" />
              <p>1A/1-G9 Wavoo Centre, Madurai Road, Tirunelveli-627001, India</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}