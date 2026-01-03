// src/pages/admin/ContactMessages.jsx
import { useEffect, useState } from 'react';
import { Mail, Calendar, User, Search, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

export default function ContactMessages() {
  const [messages, setMessages] = useState([]);
  const [displayMessages, setDisplayMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/contact`);
      if (res.ok) {
        const data = await res.json();
        // Sort by newest first
        const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setMessages(sorted);
        setDisplayMessages(sorted);
      } else {
        alert('Failed to load messages');
      }
    } catch (err) {
      console.error(err);
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
      minute: '2-digit',
    });
  };

  // Real-time Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setDisplayMessages(messages);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = messages.filter(msg =>
      msg.name.toLowerCase().includes(query) ||
      msg.email.toLowerCase().includes(query) ||
      msg.subject.toLowerCase().includes(query) ||
      msg.message.toLowerCase().includes(query)
    );

    setDisplayMessages(filtered);
  }, [searchQuery, messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="p-3 rounded-xl bg-white shadow-md hover:shadow-lg transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Contact Messages
            </h1>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, subject, or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-800 placeholder-gray-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            )}
          </div>
        </header>

        {/* Loading / Empty States */}
        {loading ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600">Loading messages...</p>
          </div>
        ) : displayMessages.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500">
              {searchQuery ? 'No messages found matching your search.' : 'No contact messages yet.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {displayMessages.map((msg) => (
              <div
                key={msg._id}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-8">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
                        {msg.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                          {msg.name}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                          <Mail className="w-4 h-4" />
                          {msg.email}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 sm:mt-0 text-sm text-gray-500 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(msg.createdAt)}
                    </div>
                  </div>

                  {/* Subject */}
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">
                    {msg.subject}
                  </h4>

                  {/* Message Body */}
                  <div className="bg-gray-50 rounded-xl p-6 text-gray-700 leading-relaxed">
                    {msg.message}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}