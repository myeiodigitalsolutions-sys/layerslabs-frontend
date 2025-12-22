// src/pages/admin/ContactMessages.jsx
import { useEffect, useState } from 'react';
import { Mail, Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

export default function ContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/contact`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      alert('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/admin')}
          className="mb-6 text-pink-400 hover:text-pink-300 transition"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent mb-8">
          Contact Messages
        </h1>

        {loading ? (
          <p className="text-center text-xl">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-slate-400 text-xl">No messages yet.</p>
        ) : (
          <div className="space-y-6">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className="bg-slate-900/70 border border-slate-700 rounded-3xl p-8 hover:border-slate-500 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <h3 className="text-2xl font-bold flex items-center gap-3">
                    <User className="w-6 h-6 text-pink-400" />
                    {msg.name}
                  </h3>
                  <span className="text-slate-400 flex items-center gap-2 mt-2 sm:mt-0">
                    <Calendar className="w-5 h-5" />
                    {formatDate(msg.createdAt)}
                  </span>
                </div>

                <div className="space-y-3 text-slate-300">
                  <p className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-pink-400" />
                    {msg.email}
                  </p>
                  <p className="font-semibold text-lg">{msg.subject}</p>
                  <p className="bg-slate-800/50 rounded-2xl p-5 leading-relaxed">
                    {msg.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}