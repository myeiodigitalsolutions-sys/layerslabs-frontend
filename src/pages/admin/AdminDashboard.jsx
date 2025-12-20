import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, Layers } from 'lucide-react';
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
      gradient: 'from-blue-600 to-cyan-600',
      path: '/admin/products',
    },
    {
      title: 'Regular Orders',
      description: 'View and manage regular orders',
      icon: ShoppingCart,
      gradient: 'from-purple-600 to-pink-600',
      path: '/admin/regular-orders',
    },
    {
      title: 'Custom Orders',
      description: 'Handle customized order requests',
      icon: Layers,
      gradient: 'from-red-600 to-orange-600',
      path: '/admin/custom-orders',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Admin Dashboard
          </h1>
          <p className="text-slate-400 text-lg">Layer Labs Management Portal</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dashboardCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.path}
                onClick={() => navigate(card.path)}
                className="group relative bg-slate-900/70 border border-slate-700 rounded-3xl p-8 hover:border-slate-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-300`}></div>
                
                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-red-400 group-hover:to-pink-400 transition-all duration-300">
                    {card.title}
                  </h2>
                  
                  <p className="text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                    {card.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}