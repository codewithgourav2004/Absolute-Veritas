import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  {
    label: 'Enquiries',
    path: '/admin/enquiries',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: 'Services',
    path: '/admin/services',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    label: 'Blog Posts',
    path: '/admin/blogs',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    label: 'News',
    path: '/admin/news',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6" />
      </svg>
    ),
  },
  {
    label: 'Newsletters',
    path: '/admin/newsletters',
    search: 'tab=newsletters',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: 'News Articles',
    path: '/admin/newsletters',
    search: 'tab=news',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6" />
      </svg>
    ),
  },
  {
    label: 'Subscribers',
    path: '/admin/newsletters',
    search: 'tab=subscribers',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const AdminLayout = ({ children, title, action }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isNavActive = (item) => {
    if (location.pathname !== item.path) return false;
    if (!item.search) return true;
    return location.search.includes(item.search.split('=')[1]);
  };

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-pearl flex flex-col">
      {/* Top bar */}
      <div className="bg-indigo text-white px-4 md:px-6 h-14 flex items-center justify-between shadow-lg flex-shrink-0 z-30 relative">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden text-white/70 hover:text-white mr-1"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-display font-black text-lg">
            Absolute <span className="text-crimson">Veritas</span>
          </span>
          <span className="text-white/40 text-sm hidden sm:inline">/ Admin</span>
        </div>
        <div className="flex items-center gap-5">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/50 hover:text-white text-sm hidden sm:block transition-colors"
          >
            View Site ↗
          </a>
          <button
            onClick={handleLogout}
            className="text-white/50 hover:text-crimson text-sm transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed md:static top-14 bottom-0 left-0 z-50 md:z-auto
            w-56 bg-white border-r border-gray-200 flex flex-col
            transition-transform duration-200 md:translate-x-0
            ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
          `}
        >
          <nav className="flex-1 py-3">
            {NAV.map((item) => {
              const active = isNavActive(item);
              const href = item.search ? `${item.path}?${item.search}` : item.path;
              return (
                <Link
                  key={item.label}
                  to={href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-5 py-3 text-sm font-semibold transition-colors border-r-2 ${
                    active
                      ? 'text-crimson bg-red-50 border-crimson'
                      : 'text-steel hover:bg-gray-50 hover:text-indigo border-transparent'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            {(title || action) && (
              <div className="flex items-center justify-between mb-7">
                {title && (
                  <h1 className="font-display font-bold text-indigo text-3xl">{title}</h1>
                )}
                {action}
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
