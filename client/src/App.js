import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import ScrollToTop from './components/Common/ScrollToTop';
import QuickEnquiry from './components/Contact/QuickEnquiry';
import FloatingContact from './components/Common/FloatingContact';
import ConsultationPopup from './components/Common/ConsultationPopup';
import Loader from './components/Common/Loader';
import ProtectedRoute from './components/Common/ProtectedRoute';

// Route-level code splitting — each page is its own chunk
const Home         = lazy(() => import('./pages/Home'));
const AboutPage    = lazy(() => import('./pages/AboutPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));
const BlogPage     = lazy(() => import('./pages/BlogPage'));
const BlogDetail   = lazy(() => import('./pages/BlogDetail'));
const ContactPage  = lazy(() => import('./pages/ContactPage'));
const LoginPage          = lazy(() => import('./pages/LoginPage'));
const AdminBlogPage      = lazy(() => import('./pages/AdminBlogPage'));
const AdminServicesPage  = lazy(() => import('./pages/AdminServicesPage'));
const AdminEnquiriesPage = lazy(() => import('./pages/AdminEnquiriesPage'));
const NewsPage           = lazy(() => import('./pages/NewsPage'));
const NewsDetail         = lazy(() => import('./pages/NewsDetail'));
const NewsletterPage     = lazy(() => import('./pages/NewsletterPage'));
const AdminNewsPage         = lazy(() => import('./pages/AdminNewsPage'));
const AdminNewsletterPage   = lazy(() => import('./pages/AdminNewsletterPage'));
const NewsletterDetail      = lazy(() => import('./pages/NewsletterDetail'));
const NotFound           = lazy(() => import('./pages/NotFound'));

function Layout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      <ScrollToTop />
      {!isAdmin && <Navbar />}
      <main>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/"            element={<Home />} />
            <Route path="/about-us"    element={<AboutPage />} />
            <Route path="/services"    element={<ServicesPage />} />
            <Route path="/services/:slug" element={<ServiceDetail />} />
            <Route path="/blog"        element={<BlogPage />} />
            <Route path="/blog/:slug"  element={<BlogDetail />} />
            <Route path="/contact-us"  element={<ContactPage />} />
            <Route path="/admin/login"     element={<LoginPage />} />
            <Route path="/admin/enquiries" element={<ProtectedRoute><AdminEnquiriesPage /></ProtectedRoute>} />
            <Route path="/admin/services"  element={<ProtectedRoute><AdminServicesPage /></ProtectedRoute>} />
            <Route path="/admin/blogs"     element={<ProtectedRoute><AdminBlogPage /></ProtectedRoute>} />
            <Route path="/news"             element={<NewsPage />} />
            <Route path="/news/:slug"       element={<NewsDetail />} />
            <Route path="/newsletter"       element={<NewsletterPage />} />
            <Route path="/newsletter/:id"   element={<NewsletterDetail />} />
            <Route path="/admin/news"       element={<ProtectedRoute><AdminNewsPage /></ProtectedRoute>} />
            <Route path="/admin/newsletters" element={<ProtectedRoute><AdminNewsletterPage /></ProtectedRoute>} />
            <Route path="*"            element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <QuickEnquiry />}
      {!isAdmin && <FloatingContact />}
      {!isAdmin && <ConsultationPopup />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Layout />
      </Router>
    </AuthProvider>
  );
}

export default App;
