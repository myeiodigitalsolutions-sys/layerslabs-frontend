// src/components/Footer.jsx
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-white py-12 sm:py-16 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand & Description */}
          <div className="text-center md:text-left">
            <h2 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent mb-4">
              Layer Labs
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-xs mx-auto md:mx-0">
              Premium hand-painted 3D printed collectibles. Limited editions crafted for true legends.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold mb-5 text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-400 hover:text-pink-400 transition">Home</Link></li>
              <li><Link to="/customize" className="text-gray-400 hover:text-pink-400 transition">Customize 3D</Link></li>
              <li><Link to="/track-orders" className="text-gray-400 hover:text-pink-400 transition">Track Orders</Link></li>
              <li><Link to="/cart" className="text-gray-400 hover:text-pink-400 transition">Cart</Link></li>
              <li><Link to="/profile" className="text-gray-400 hover:text-pink-400 transition">My Profile</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold mb-5 text-white">Customer Care</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-pink-400 transition">Shipping Info</a></li>
              <li><a href="#" className="text-gray-400 hover:text-pink-400 transition">Returns & Refunds</a></li>
              <li><a href="#" className="text-gray-400 hover:text-pink-400 transition">Contact Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-pink-400 transition">FAQ</a></li>
              <li><a href="#" className="text-gray-400 hover:text-pink-400 transition">Terms of Service</a></li>
            </ul>
          </div>

          {/* Contact & Map Section */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold mb-5 text-white">Visit Us</h3>

            <div className="space-y-4 text-gray-400 text-sm">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <MapPin className="w-5 h-5 text-pink-400" />
                <span>1A/1-G9 Wavoo Centre
Madurai Road, Trunelveli-627001 India</span>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-3">
                <Phone className="w-5 h-5 text-pink-400" />
                <span>+91 9840624407</span>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-3">
                <Mail className="w-5 h-5 text-pink-400" />
                <span>myeiokln@gmail.com</span>
              </div>
            </div>

            {/* Google Maps Embed - Responsive */}
         <div className="mt-6 rounded-xl overflow-hidden shadow-2xl border border-gray-800">
  <iframe
    title="Layer Labs Location"
    width="100%"
    height="200"
    style={{ border: 0 }}
    allowFullScreen=""
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3945.6789012345!2d77.709123456789!3d8.7362107123456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2ef1c59ccb6beccd%3A0x2038d4e6efcf5778!2sE%20I%20O%20Digital%20Solutions!5e0!3m2!1sen!2sin!4v1737000000000"
  ></iframe>
</div>

            {/* Social Icons */}
            <div className="flex justify-center md:justify-start gap-4 mt-6">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Layer Labs • Handcrafted with passion for collectors • All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}