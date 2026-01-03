import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, Layers, Mail } from 'lucide-react';
import { auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const ADMIN_EMAIL = 'myeiokln@gmail.com';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setAuthUser(u);
      setAuthChecked(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    if (!authUser) {
      alert('Please login as admin to view dashboard.');
      navigate('/', { replace: true });
      return;
    }
    if (authUser.email !== ADMIN_EMAIL) {
      alert('You are not authorized to view the admin dashboard.');
      navigate('/', { replace: true });
      return;
    }
  }, [authChecked, authUser, navigate]);

  const dashboardCards = [
    {
      title: 'Products',
      description: 'Manage your product catalog',
      icon: Package,
      gradient: 'from-blue-500 to-cyan-500',
      path: '/admin/products',
    },
    {
      title: 'Regular Orders',
      description: 'View and manage regular orders',
      icon: ShoppingCart,
      gradient: 'from-purple-500 to-pink-500',
      path: '/admin/regular-orders',
    },
    {
      title: 'Custom Orders',
      description: 'Handle customized order requests',
      icon: Layers,
      gradient: 'from-orange-500 to-red-500',
      path: '/admin/custom-orders',
    },
    {
      title: 'Contact Messages',
      description: 'View messages from customers',
      icon: Mail,
      gradient: 'from-green-500 to-teal-500',
      path: '/admin/contact-messages',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Admin Dashboard
          </h1>
          <p className="text-xl text-gray-600">URS Printly Management Portal</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {dashboardCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.path}
                onClick={() => navigate(card.path)}
                className="group relative bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>

                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.gradient} p-4 flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  <h2 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                    {card.title}
                  </h2>

                  <p className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                    {card.description}
                  </p>
                </div>

                {/* Subtle shine effect on hover */}
                <div className="absolute inset-0 translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 -skew-x-12 transition-transform duration-700"></div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}