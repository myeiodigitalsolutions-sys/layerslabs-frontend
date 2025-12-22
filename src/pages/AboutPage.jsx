import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="text-center py-16 sm:py-24">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            About Layer Labs
          </h1>
          <p className="text-xl sm:text-2xl text-gray-700 max-w-4xl mx-auto">
            Crafting premium 3D printed collectibles with passion, precision, and innovation.
          </p>
        </section>

        {/* Story Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-4xl sm:text-5xl font-black mb-6">Our Story</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Founded in 2025, Layer Labs began as a dream to bring legendary characters to life through the magic of 3D printing and hand-painting artistry.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              What started as a small workshop has grown into a dedicated team of designers, engineers, and artists obsessed with creating limited-edition collectibles that collectors truly cherish.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Every piece is meticulously crafted — from digital sculpting to final hand-painting — ensuring unmatched quality and detail.
            </p>
          </div>
          <div className="order-first lg:order-last">
            <img
              src="https://via.placeholder.com/800x600?text=Layer+Labs+Workshop"
              alt="Layer Labs workshop"
              className="rounded-3xl shadow-2xl w-full object-cover"
            />
          </div>
        </section>

        {/* Mission & Values */}
        <section className="py-16 bg-white rounded-3xl shadow-2xl px-8 sm:px-12">
          <h2 className="text-4xl sm:text-5xl font-black text-center mb-12">Our Mission & Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-red-600 to-pink-600 rounded-full flex items-center justify-center">
                <span className="text-3xl font-black text-white">1</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Quality First</h3>
              <p className="text-gray-600">Premium materials and expert craftsmanship in every collectible.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-red-600 to-pink-600 rounded-full flex items-center justify-center">
                <span className="text-3xl font-black text-white">2</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Limited Editions</h3>
              <p className="text-gray-600">Exclusive drops that make every piece truly special.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-red-600 to-pink-600 rounded-full flex items-center justify-center">
                <span className="text-3xl font-black text-white">3</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Collector Focused</h3>
              <p className="text-gray-600">Built by collectors, for collectors — with passion at heart.</p>
            </div>
          </div>
        </section>

        {/* Location Section */}
        <section className="mt-20">
          <h2 className="text-4xl sm:text-5xl font-black text-center mb-12">Visit Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="w-8 h-8 text-pink-600 flex-shrink-0" />
                 <div>
                    <p className="font-semibold text-lg">Address</p>
                    <p className="text-gray-600">1A/1-G9 Wavoo Centre<br />Madurai Road, Trunelveli-627001<br />India</p>
                  </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="w-8 h-8 text-pink-600 flex-shrink-0" />
                <p className="text-lg">+91 9840624407</p>
              </div>
              <div className="flex items-start gap-4">
                <Mail className="w-8 h-8 text-pink-600 flex-shrink-0" />
                <p className="text-lg">myeiokln@gmail.com</p>
              </div>
              <div className="flex items-start gap-4">
                <Clock className="w-8 h-8 text-pink-600 flex-shrink-0" />
                <p className="text-lg">Mon - Sat: 10AM - 7PM<br />Sunday: Closed</p>
              </div>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              {/* Replace with your actual embed URL */}
              <iframe
                title="Layer Labs Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3945.6789012345!2d77.709123456789!3d8.7362107123456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2ef1c59ccb6beccd%3A0x2038d4e6efcf5778!2sE%20I%20O%20Digital%20Solutions!5e0!3m2!1sen!2sin!4v1737000000000"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}