// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './index.css';

// Components
import App from './App';
import ProductPage from './pages/ProductPage';
import ProfilePage from './pages/Profile';
import Customized3DPage from './pages/Customized3D';
import TrackOrders from './pages/TrackOrders';
import OrderPage from './pages/OrderPage';
import OrderCustom from './pages/OrderCustom';
import CartPage from './pages/CartPage';
import Footer from './components/Footer';  // <-- Add this import

// Add these imports if not already there
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';


//policy pages
import PrivacyPolicyPage from'./pages/policy/PrivacyPolicy';
import TermsAndConditionsPage from './pages/policy/TermsAndConditionsPage';
import FAQsPage from './pages/policy/faqs';
import ShippingPolicyPage from './pages/policy/Shippingpolicy';


// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import Products from './pages/admin/Products';
import RegularOrders from './pages/admin/RegularOrders';
import CustomOrders from './pages/admin/CustomOrders';
  import ContactMessages from './pages/admin/ContactMessages';

// Layout Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// ScrollToTop Component (smooth scroll on route change)
function ScrollToTop() {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [pathname]);

  return null;
}

// Main Layout for Public Pages (includes Navbar + Sidebar)
function PublicLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <>
  <ScrollToTop />
      <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main>{children}</main>
      <Footer />  {/* <-- Footer added here */}
    </>
  );
}

// Admin Layout (NO Navbar/Sidebar)
function AdminLayout({ children }) {
  return (
    <>
      <ScrollToTop />
      {children}
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES - With Navbar & Sidebar */}
        <Route path="/" element={<PublicLayout><App /></PublicLayout>} />
        <Route path="/product/:id" element={<PublicLayout><ProductPage /></PublicLayout>} />
        <Route path="/profile" element={<PublicLayout><ProfilePage /></PublicLayout>} />
        <Route path="/customize" element={<PublicLayout><Customized3DPage /></PublicLayout>} />
        <Route path="/order" element={<PublicLayout><OrderPage /></PublicLayout>} />
        <Route path="/order-custom" element={<PublicLayout><OrderCustom /></PublicLayout>} />
        <Route path="/track-orders" element={<PublicLayout><TrackOrders /></PublicLayout>} />
        <Route path="/cart" element={<PublicLayout><CartPage /></PublicLayout>} />
<Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
<Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />

<Route path="/privacy" element={<PublicLayout><PrivacyPolicyPage /></PublicLayout>} />
<Route path="/terms" element={<PublicLayout><TermsAndConditionsPage /></PublicLayout>} />
<Route path="/faqs" element={<PublicLayout><FAQsPage /></PublicLayout>} />
<Route path="/shipping" element={<PublicLayout><ShippingPolicyPage /></PublicLayout>} />

        {/* ADMIN ROUTES - No Navbar/Sidebar */}
        <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
        <Route path="/admin/products" element={<AdminLayout><Products /></AdminLayout>} />
        <Route path="/admin/regular-orders" element={<AdminLayout><RegularOrders /></AdminLayout>} />
        <Route path="/admin/custom-orders" element={<AdminLayout><CustomOrders /></AdminLayout>} />
      
<Route path="/admin/contact-messages" element={<AdminLayout><ContactMessages /></AdminLayout>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);