// src/pages/ContactPage.jsx

import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to send message');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-center mb-12 bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
          Contact Us
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12">
            <h2 className="text-3xl sm:text-4xl font-black mb-8">Get in Touch</h2>

            {success && (
              <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-xl">
                Thank you! Your message has been sent successfully.
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your Name" required className="w-full px-6 py-4 rounded-xl border border-gray-300 focus:border-pink-600 focus:outline-none transition" />
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Your Email" required className="w-full px-6 py-4 rounded-xl border border-gray-300 focus:border-pink-600 focus:outline-none transition" />
              <input type="text" name="subject" value={formData.subject} onChange={handleChange} placeholder="Subject" required className="w-full px-6 py-4 rounded-xl border border-gray-300 focus:border-pink-600 focus:outline-none transition" />
              <textarea name="message" value={formData.message} onChange={handleChange} rows="6" placeholder="Your Message" required className="w-full px-6 py-4 rounded-xl border border-gray-300 focus:border-pink-600 focus:outline-none transition resize-none"></textarea>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-gradient-to-r from-red-600 to-pink-600 text-white text-xl font-black rounded-2xl hover:shadow-2xl transition flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {loading ? 'Sending...' : 'Send Message'}
                <Send className="w-6 h-6" />
              </button>
            </form>
          </div>

          {/* Contact Info & Map */}
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black mb-8">Reach Out Directly</h2>
              <div className="space-y-6">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-gradient-to-r from-red-600 to-pink-600 rounded-full flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">Address</p>
                    <p className="text-gray-600">1A/1-G9 Wavoo Centre<br />Madurai Road, Tirunelveli-627001<br />India</p>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-gradient-to-r from-red-600 to-pink-600 rounded-full flex items-center justify-center">
                    <Phone className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">Phone</p>
                    <p className="text-gray-600">+91 9840624407</p>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-gradient-to-r from-red-600 to-pink-600 rounded-full flex items-center justify-center">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">Email</p>
                    <p className="text-gray-600">myeiokln@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <iframe
                title="Layer Labs Location"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3945.6789012345!2d77.709123456789!3d8.7362107123456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2ef1c59ccb6beccd%3A0x2038d4e6efcf5778!2sE%20I%20O%20Digital%20Solutions!5e0!3m2!1sen!2sin!4v1737000000000"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}